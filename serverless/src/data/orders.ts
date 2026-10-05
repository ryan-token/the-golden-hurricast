/**
 * Orders. An order is created (status RESERVED) in the same transaction that reserves its
 * stock, before the Stripe Checkout Session exists. From there it moves through:
 *
 *   RESERVED ──▶ PAID                       payment succeeded
 *      │  └────▶ PROCESSING ──▶ PAID         delayed payment method (e.g. bank debit)
 *      │                   └──▶ FAILED       delayed payment failed
 *      ├──────▶ EXPIRED                      checkout expired / abandoned
 *      └──────▶ CANCELED                     we couldn't create the checkout
 *
 * Every transition is one DynamoDB transaction that (1) updates the order on the condition
 * that it is still in the status we read — optimistic concurrency, so concurrent webhooks,
 * success-page loads and sweeps can't apply the same transition twice — and (2) adjusts the
 * inventory counters to match.
 *
 * Orders that hold stock (RESERVED, PROCESSING) are in the sparse GSI1, sorted by when the
 * sweeper should re-check them.
 */
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { setTimeout as sleep } from 'node:timers/promises';
import {
	GetCommand,
	paginateQuery,
	QueryCommand,
	TransactWriteCommand,
	UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import {
	commitReservedSale,
	commitUnreservedSale,
	releaseStock,
	reserveStock
} from './inventory.ts';
import { ddb, keys, ORDERS_GSI2PK, RESERVATIONS_GSI1PK, tableName } from './table.ts';
import type { TransactItem } from './table.ts';

export type OrderStatus = 'RESERVED' | 'PROCESSING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CANCELED';

/** Whether an order in `status` has its units held in `Reserved`. */
export const holdsStock = (status: OrderStatus) => status === 'RESERVED' || status === 'PROCESSING';

export interface OrderItem {
	productId: string;
	priceId: string;
	name: string;
	quantity: number;
	/** Price per unit in the currency's minor unit. */
	unitAmount: number;
}

export interface Order {
	orderId: string;
	status: OrderStatus;
	items: OrderItem[];
	currency: string;
	createdAt: string;
	updatedAt: string;
	/** When the sweeper should next re-check this order (only while it holds stock). */
	releaseAfter?: string;
	checkoutSessionId?: string;
	/** Present once paid. */
	paidAt?: string;
	amountTotal?: number;
	paymentIntentId?: string;
	livemode?: boolean;
	/** Problems that need a human, e.g. `oversold`. */
	flags?: string[];
}

export class InsufficientStockError extends Error {
	readonly productId: string;

	constructor(productId: string) {
		super(`Not enough stock for ${productId}`);
		this.name = 'InsufficientStockError';
		this.productId = productId;
	}
}

// ---------------------------------------------------------------------------------------
// Mapping between application objects and DynamoDB items

function toItems(items: OrderItem[]) {
	return items.map((item) => ({
		ProductId: item.productId,
		PriceId: item.priceId,
		Name: item.name,
		Quantity: item.quantity,
		UnitAmount: item.unitAmount
	}));
}

export function orderFromItem(item: Record<string, unknown>): Order {
	return {
		orderId: item.OrderId as string,
		status: item.Status as OrderStatus,
		items: (item.Items as Record<string, unknown>[]).map((line) => ({
			productId: line.ProductId as string,
			priceId: line.PriceId as string,
			name: line.Name as string,
			quantity: line.Quantity as number,
			unitAmount: line.UnitAmount as number
		})),
		currency: item.Currency as string,
		createdAt: item.CreatedAt as string,
		updatedAt: item.UpdatedAt as string,
		releaseAfter: item.ReleaseAfter as string | undefined,
		checkoutSessionId: item.CheckoutSessionId as string | undefined,
		paidAt: item.PaidAt as string | undefined,
		amountTotal: item.AmountTotal as number | undefined,
		paymentIntentId: item.PaymentIntentId as string | undefined,
		livemode: item.Livemode as boolean | undefined,
		flags: item.Flags ? [...(item.Flags as Set<string>)] : undefined
	};
}

/**
 * True when DynamoDB canceled a transaction because another one was writing the same item
 * (e.g. two checkouts for one product). Nothing was written, and AWS SDKs don't retry these.
 */
function isTransactionConflict(error: unknown): boolean {
	return (
		error instanceof TransactionCanceledException &&
		(error.CancellationReasons ?? []).some((reason) => reason.Code === 'TransactionConflict')
	);
}

const gsi1 = (releaseAfter: string, orderId: string) => ({
	GSI1PK: RESERVATIONS_GSI1PK,
	GSI1SK: `${releaseAfter}#${orderId}`
});

// ---------------------------------------------------------------------------------------
// Access patterns

/**
 * Creates a RESERVED order and reserves its stock, atomically. Throws
 * `InsufficientStockError` if any item doesn't have enough available units.
 */
export async function createReservedOrder(input: {
	orderId: string;
	items: OrderItem[];
	currency: string;
	releaseAfter: string;
}): Promise<Order> {
	const now = new Date().toISOString();
	const order: Order = {
		orderId: input.orderId,
		status: 'RESERVED',
		items: input.items,
		currency: input.currency,
		createdAt: now,
		updatedAt: now,
		releaseAfter: input.releaseAfter
	};

	const transactItems: TransactItem[] = [
		{
			Put: {
				TableName: tableName(),
				Item: {
					...keys.order(order.orderId),
					...gsi1(input.releaseAfter, order.orderId),
					GSI2PK: ORDERS_GSI2PK,
					GSI2SK: order.orderId,
					Type: 'Order',
					OrderId: order.orderId,
					Status: order.status,
					Items: toItems(order.items),
					Currency: order.currency,
					CreatedAt: now,
					UpdatedAt: now,
					ReleaseAfter: input.releaseAfter
				},
				ConditionExpression: 'attribute_not_exists(PK)'
			}
		},
		...input.items.map((item) => reserveStock(item.productId, item.quantity))
	];

	for (let attempt = 1; ; attempt++) {
		try {
			await ddb.send(new TransactWriteCommand({ TransactItems: transactItems }));
			return order;
		} catch (error) {
			if (error instanceof TransactionCanceledException) {
				// Reasons line up with TransactItems; index 0 is the order itself.
				const failed = error.CancellationReasons?.findIndex(
					(reason, index) => index > 0 && reason.Code === 'ConditionalCheckFailed'
				);
				if (failed !== undefined && failed > 0) {
					throw new InsufficientStockError(input.items[failed - 1]!.productId);
				}
			}
			// Customers checking out the same product at once contend for its inventory item.
			if (isTransactionConflict(error) && attempt < 4) {
				await sleep(Math.random() * 50 * attempt);
				continue;
			}
			throw error;
		}
	}
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
	const result = await ddb.send(
		new GetCommand({ TableName: tableName(), Key: keys.order(orderId), ConsistentRead: true })
	);
	return result.Item ? orderFromItem(result.Item) : undefined;
}

/** Records the Checkout Session created for a RESERVED order. */
export async function attachCheckoutSession(
	orderId: string,
	checkoutSessionId: string,
	releaseAfter: string
): Promise<void> {
	await ddb.send(
		new UpdateCommand({
			TableName: tableName(),
			Key: keys.order(orderId),
			UpdateExpression:
				'SET CheckoutSessionId = :sid, ReleaseAfter = :ra, GSI1SK = :gsi1sk, UpdatedAt = :now',
			ConditionExpression: '#status = :reserved',
			ExpressionAttributeNames: { '#status': 'Status' },
			ExpressionAttributeValues: {
				':sid': checkoutSessionId,
				':ra': releaseAfter,
				':gsi1sk': gsi1(releaseAfter, orderId).GSI1SK,
				':reserved': 'RESERVED',
				':now': new Date().toISOString()
			}
		})
	);
}

/** Pushes back the next sweeper check for an order that still holds stock. */
export async function deferRelease(order: Order, releaseAfter: string): Promise<void> {
	await ddb.send(
		new UpdateCommand({
			TableName: tableName(),
			Key: keys.order(order.orderId),
			UpdateExpression: 'SET ReleaseAfter = :ra, GSI1SK = :gsi1sk, UpdatedAt = :now',
			ConditionExpression: '#status = :status',
			ExpressionAttributeNames: { '#status': 'Status' },
			ExpressionAttributeValues: {
				':ra': releaseAfter,
				':gsi1sk': gsi1(releaseAfter, order.orderId).GSI1SK,
				':status': order.status,
				':now': new Date().toISOString()
			}
		})
	);
}

export interface PaymentDetails {
	paidAt: string;
	amountTotal: number;
	currency: string;
	paymentIntentId?: string;
	livemode: boolean;
	checkoutSessionId: string;
	/** Problems spotted while reconciling, e.g. line items that don't match the order. */
	flags?: string[];
}

export type Transition =
	| { to: 'PROCESSING'; releaseAfter: string }
	| { to: 'PAID'; payment: PaymentDetails }
	| { to: 'EXPIRED' | 'FAILED' | 'CANCELED' };

/**
 * Moves `order` (as last read) to a new status and adjusts stock to match, atomically.
 * Returns the updated order, or `undefined` if the order changed underneath us or a
 * concurrent transaction got in the way — callers should re-read it and decide again.
 */
export async function transitionOrder(
	order: Order,
	transition: Transition
): Promise<Order | undefined> {
	const now = new Date().toISOString();
	const heldStock = holdsStock(order.status);

	const names: Record<string, string> = { '#status': 'Status' };
	const values: Record<string, unknown> = {
		':from': order.status,
		':to': transition.to,
		':now': now
	};
	const set = ['#status = :to', 'UpdatedAt = :now'];
	const remove: string[] = [];
	const add: string[] = [];
	let stock: TransactItem[] = [];
	const flags = new Set<string>();

	switch (transition.to) {
		case 'PROCESSING': {
			if (order.status !== 'RESERVED') throw new Error(`Can't process a ${order.status} order`);
			set.push('ReleaseAfter = :ra', 'GSI1SK = :gsi1sk');
			values[':ra'] = transition.releaseAfter;
			values[':gsi1sk'] = gsi1(transition.releaseAfter, order.orderId).GSI1SK;
			break;
		}
		case 'PAID': {
			if (order.status === 'PAID') return order;
			const { payment } = transition;
			set.push(
				'PaidAt = :paidAt',
				'AmountTotal = :amount',
				'Currency = :currency',
				'Livemode = :livemode',
				'CheckoutSessionId = :sid'
			);
			Object.assign(values, {
				':paidAt': payment.paidAt,
				':amount': payment.amountTotal,
				':currency': payment.currency,
				':livemode': payment.livemode,
				':sid': payment.checkoutSessionId
			});
			if (payment.paymentIntentId) {
				set.push('PaymentIntentId = :pi');
				values[':pi'] = payment.paymentIntentId;
			}
			remove.push('ReleaseAfter', 'GSI1PK', 'GSI1SK');
			payment.flags?.forEach((flag) => flags.add(flag));

			if (heldStock) {
				stock = order.items.map((item) => commitReservedSale(item.productId, item.quantity));
			} else {
				// Paid after we released the stock: honor it, and flag it for a human.
				flags.add('oversold');
				stock = order.items.map((item) => commitUnreservedSale(item.productId, item.quantity));
			}
			break;
		}
		case 'EXPIRED':
		case 'FAILED':
		case 'CANCELED': {
			if (!heldStock) throw new Error(`Can't move a ${order.status} order to ${transition.to}`);
			remove.push('ReleaseAfter', 'GSI1PK', 'GSI1SK');
			stock = order.items.map((item) => releaseStock(item.productId, item.quantity));
			break;
		}
	}

	if (flags.size > 0) {
		add.push('Flags :flags');
		values[':flags'] = flags;
	}

	const updateExpression = [
		`SET ${set.join(', ')}`,
		remove.length > 0 ? `REMOVE ${remove.join(', ')}` : '',
		add.length > 0 ? `ADD ${add.join(', ')}` : ''
	]
		.filter(Boolean)
		.join(' ');

	try {
		await ddb.send(
			new TransactWriteCommand({
				TransactItems: [
					{
						Update: {
							TableName: tableName(),
							Key: keys.order(order.orderId),
							UpdateExpression: updateExpression,
							ConditionExpression: '#status = :from',
							ExpressionAttributeNames: names,
							ExpressionAttributeValues: values
						}
					},
					...stock
				]
			})
		);
	} catch (error) {
		if (
			(error instanceof TransactionCanceledException &&
				error.CancellationReasons?.[0]?.Code === 'ConditionalCheckFailed') ||
			isTransactionConflict(error)
		) {
			return undefined;
		}
		throw error;
	}

	return (await getOrder(order.orderId))!;
}

/** Orders holding stock whose next check is due, oldest first. */
export async function listDueReservations(now = new Date()): Promise<Order[]> {
	const orders: Order[] = [];
	for await (const page of paginateQuery(
		{ client: ddb },
		{
			TableName: tableName(),
			IndexName: 'GSI1',
			KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK < :now',
			ExpressionAttributeValues: { ':pk': RESERVATIONS_GSI1PK, ':now': now.toISOString() }
		}
	)) {
		orders.push(...(page.Items ?? []).map(orderFromItem));
	}
	return orders;
}

/** Most recent orders first. */
export async function listOrders(limit = 25): Promise<Order[]> {
	const page = await ddb.send(
		new QueryCommand({
			TableName: tableName(),
			IndexName: 'GSI2',
			KeyConditionExpression: 'GSI2PK = :pk',
			ExpressionAttributeValues: { ':pk': ORDERS_GSI2PK },
			ScanIndexForward: false,
			Limit: limit
		})
	);
	return (page.Items ?? []).map(orderFromItem);
}
