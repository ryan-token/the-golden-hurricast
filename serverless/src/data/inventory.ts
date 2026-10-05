/**
 * Inventory: one item per Stripe product we sell, all in the `INVENTORY` partition so the
 * whole catalog's stock is a single strongly consistent Query.
 *
 * Counters (`Available + Reserved` = units on hand):
 * - `Available` — can be bought right now
 * - `Reserved`  — held by open checkouts
 * - `Sold`      — sold through this system (lifetime)
 *
 * DynamoDB conditions can't do arithmetic, so `Available` is stored explicitly and every
 * write keeps the counters consistent inside a transaction.
 */
import { GetCommand, paginateQuery, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, INVENTORY_PK, keys, tableName } from './table.ts';
import type { TransactItem } from './table.ts';

export interface Inventory {
	productId: string;
	/** Product name, for humans browsing the table. Stripe is the source of truth. */
	name: string;
	available: number;
	reserved: number;
	sold: number;
	updatedAt: string;
}

function fromItem(item: Record<string, unknown>): Inventory {
	return {
		productId: item.ProductId as string,
		name: item.Name as string,
		available: item.Available as number,
		reserved: item.Reserved as number,
		sold: item.Sold as number,
		updatedAt: item.UpdatedAt as string
	};
}

/** Stock for every tracked product, keyed by Stripe product id. */
export async function listInventory(): Promise<Map<string, Inventory>> {
	const items: Inventory[] = [];
	for await (const page of paginateQuery(
		{ client: ddb },
		{
			TableName: tableName(),
			KeyConditionExpression: 'PK = :pk',
			ExpressionAttributeValues: { ':pk': INVENTORY_PK },
			ConsistentRead: true
		}
	)) {
		items.push(...(page.Items ?? []).map(fromItem));
	}

	return new Map(items.map((item) => [item.productId, item]));
}

export async function getInventory(productId: string): Promise<Inventory | undefined> {
	const result = await ddb.send(
		new GetCommand({ TableName: tableName(), Key: keys.inventory(productId), ConsistentRead: true })
	);
	return result.Item ? fromItem(result.Item) : undefined;
}

/** Starts tracking a product. Fails if it's already tracked. */
export async function createInventory(input: {
	productId: string;
	name: string;
	available: number;
}): Promise<void> {
	await ddb.send(
		new PutCommand({
			TableName: tableName(),
			Item: {
				...keys.inventory(input.productId),
				Type: 'Inventory',
				ProductId: input.productId,
				Name: input.name,
				Available: input.available,
				Reserved: 0,
				Sold: 0,
				UpdatedAt: new Date().toISOString()
			},
			ConditionExpression: 'attribute_not_exists(PK)'
		})
	);
}

/**
 * Adds (or, with a negative `delta`, removes) available units — e.g. after a restock or
 * a physical count. Never lets `Available` go below zero.
 */
export async function adjustAvailable(productId: string, delta: number): Promise<Inventory> {
	const result = await ddb.send(
		new UpdateCommand({
			TableName: tableName(),
			Key: keys.inventory(productId),
			UpdateExpression: 'ADD Available :delta SET UpdatedAt = :now',
			ConditionExpression: 'attribute_exists(PK) AND Available >= :min',
			ExpressionAttributeValues: {
				':delta': delta,
				':min': Math.max(0, -delta),
				':now': new Date().toISOString()
			},
			ReturnValues: 'ALL_NEW'
		})
	);
	return fromItem(result.Attributes!);
}

// ---------------------------------------------------------------------------------------
// Transaction building blocks, used by `orders.ts` so stock and order state change atomically.

function update(
	productId: string,
	expression: string,
	values: Record<string, unknown>,
	condition = 'attribute_exists(PK)'
): TransactItem {
	return {
		Update: {
			TableName: tableName(),
			Key: keys.inventory(productId),
			UpdateExpression: `${expression}, UpdatedAt = :now`,
			ConditionExpression: condition,
			ExpressionAttributeValues: { ...values, ':now': new Date().toISOString() }
		}
	};
}

/** Moves units from Available to Reserved, only if enough are available. */
export const reserveStock = (productId: string, quantity: number) =>
	update(
		productId,
		'SET Available = Available - :q, Reserved = Reserved + :q',
		{ ':q': quantity },
		'attribute_exists(PK) AND Available >= :q'
	);

/** Returns reserved units to Available (checkout expired, failed or was abandoned). */
export const releaseStock = (productId: string, quantity: number) =>
	update(productId, 'SET Available = Available + :q, Reserved = Reserved - :q', { ':q': quantity });

/** Converts reserved units into a sale. */
export const commitReservedSale = (productId: string, quantity: number) =>
	update(productId, 'SET Reserved = Reserved - :q, Sold = Sold + :q', { ':q': quantity });

/**
 * Records a sale whose reservation was already released (a payment that succeeded after
 * we gave up on it). Takes the units straight from Available, even if that oversells —
 * the customer has paid, so the order must be honored and flagged for a human.
 */
export const commitUnreservedSale = (productId: string, quantity: number) =>
	update(productId, 'SET Available = Available - :q, Sold = Sold + :q', { ':q': quantity });
