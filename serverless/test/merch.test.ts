import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInventory, getInventory } from '../src/data/inventory.ts';
import { getOrder, listOrders } from '../src/data/orders.ts';
import { ddb } from '../src/data/table.ts';
import { HttpError } from '../src/lib/errors.ts';
import { clearCatalogCache, getCatalog, MAX_PER_ORDER } from '../src/merch/catalog.ts';
import { cancelCheckout, createCheckout } from '../src/merch/checkout.ts';
import { reconcileCheckoutSession } from '../src/merch/reconcile.ts';
import { sweepReservations } from '../src/merch/sweep.ts';
import { FakeStripe } from './fake-stripe.ts';
import { createTestTable, deleteTestTable } from './table.ts';

const SHIRT = {
	id: 'prod_shirtL',
	name: 'Hurricast T-Shirt (large)',
	sortNumber: 12,
	price: { id: 'price_shirt', unitAmount: 2700 }
};
const MUG = {
	id: 'prod_mug',
	name: 'Hurricast Mug',
	sortNumber: 20,
	price: { id: 'price_mug', unitAmount: 2000 }
};
const ORIGIN = 'https://www.thegoldenhurricast.com';

let table: string;
let stripe: FakeStripe;

beforeEach(async () => {
	table = await createTestTable();
	clearCatalogCache();
	stripe = new FakeStripe([SHIRT, MUG]);
	await createInventory({ productId: SHIRT.id, name: SHIRT.name, available: 3 });
	await createInventory({ productId: MUG.id, name: MUG.name, available: 20 });
});

afterEach(async () => {
	vi.restoreAllMocks();
	await deleteTestTable(table);
});

/**
 * Makes the next `count` transactions fail the way real DynamoDB does when another
 * transaction is writing the same item (DynamoDB Local serializes them, so never does).
 */
function collideNextTransactions(count: number) {
	const send = ddb.send.bind(ddb);
	let remaining = count;
	vi.spyOn(ddb, 'send').mockImplementation(((command: Parameters<typeof send>[0]) => {
		if (command instanceof TransactWriteCommand && remaining-- > 0) {
			return Promise.reject(
				new TransactionCanceledException({
					message: 'Transaction cancelled',
					$metadata: {},
					CancellationReasons: [{ Code: 'None' }, { Code: 'TransactionConflict' }]
				})
			);
		}
		return send(command);
	}) as typeof ddb.send);
}

const stock = async (productId: string) => {
	const { available, reserved, sold } = (await getInventory(productId))!;
	return { available, reserved, sold };
};

const checkout = (quantity: number, productId = SHIRT.id, now?: Date) =>
	createCheckout(stripe.client, { productId, quantity, origin: ORIGIN }, now);

describe('catalog', () => {
	it('lists tracked, sellable products with live stock in sort order', async () => {
		stripe.catalog.set('prod_untracked', {
			id: 'prod_untracked',
			name: 'Not in inventory',
			price: { id: 'price_x', unitAmount: 100 }
		});
		stripe.catalog.set('prod_noprice', { id: 'prod_noprice', name: 'No price' });
		await createInventory({ productId: 'prod_noprice', name: 'No price', available: 5 });

		const catalog = await getCatalog(stripe.client);

		expect(catalog).toEqual([
			{
				id: SHIRT.id,
				name: SHIRT.name,
				image: expect.any(String),
				unitAmount: 2700,
				currency: 'usd',
				available: 3,
				maxQuantity: 3
			},
			expect.objectContaining({ id: MUG.id, available: 20, maxQuantity: MAX_PER_ORDER })
		]);
	});
});

describe('createCheckout', () => {
	it('reserves stock and creates a Checkout Session priced on the server', async () => {
		const now = new Date('2026-10-04T12:00:00Z');
		const result = await checkout(2, SHIRT.id, now);

		expect(result.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
		expect(await stock(SHIRT.id)).toEqual({ available: 1, reserved: 2, sold: 0 });

		const session = stripe.onlySession;
		expect(session.params).toMatchObject({
			mode: 'payment',
			line_items: [{ price: 'price_shirt', quantity: 2 }],
			shipping_address_collection: { allowed_countries: ['US'] },
			allow_promotion_codes: true,
			client_reference_id: result.orderId,
			metadata: { orderId: result.orderId },
			success_url: `${ORIGIN}/merch/success/?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${ORIGIN}/merch/cancel/?order=${result.orderId}`
		});
		// Stripe requires at least 30 minutes.
		expect(session.expires_at - now.getTime() / 1000).toBeGreaterThanOrEqual(30 * 60);

		const order = await getOrder(result.orderId);
		expect(order).toMatchObject({
			status: 'RESERVED',
			checkoutSessionId: session.id,
			items: [{ productId: SHIRT.id, priceId: 'price_shirt', quantity: 2, unitAmount: 2700 }]
		});
	});

	it('refuses to oversell and leaves stock untouched', async () => {
		await expect(checkout(4)).rejects.toMatchObject({
			status: 409,
			code: 'insufficient_stock',
			message: 'Only 3 left'
		});
		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
		expect(stripe.createCalls).toBe(0);
	});

	it('sells exactly the units available when customers race for them', async () => {
		const results = await Promise.allSettled(Array.from({ length: 8 }, () => checkout(1)));

		expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(3);
		for (const failure of results.filter((r) => r.status === 'rejected')) {
			expect((failure as PromiseRejectedResult).reason).toBeInstanceOf(HttpError);
		}
		expect(await stock(SHIRT.id)).toEqual({ available: 0, reserved: 3, sold: 0 });
	});

	it('retries a reservation that collided with another checkout for the same product', async () => {
		collideNextTransactions(2);
		await checkout(1);
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 1, sold: 0 });
	});

	it('releases the reservation if Stripe fails', async () => {
		stripe.failNextCreate = true;
		await expect(checkout(2)).rejects.toMatchObject({ status: 502, code: 'checkout_unavailable' });

		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
		const [order] = await listOrders();
		expect(order?.status).toBe('CANCELED');
	});
});

describe('cancelCheckout', () => {
	it('releases the reservation at once when the customer backs out, however often it runs', async () => {
		const { orderId } = await checkout(2);

		await cancelCheckout(stripe.client, orderId);
		await cancelCheckout(stripe.client, orderId);

		expect(stripe.onlySession.status).toBe('expired');
		expect((await getOrder(orderId))?.status).toBe('EXPIRED');
		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
	});

	it('never cancels a checkout that was just paid', async () => {
		const { orderId } = await checkout(1);
		stripe.pay(stripe.onlySession.id);

		await cancelCheckout(stripe.client, orderId);

		expect((await getOrder(orderId))?.status).toBe('PAID');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 0, sold: 1 });
	});
});

describe('reconcileCheckoutSession', () => {
	it('fulfills a paid order exactly once, however many times it runs', async () => {
		const { orderId } = await checkout(2);
		const sessionId = stripe.onlySession.id;
		stripe.pay(sessionId);

		// Webhook retries, success page and sweeper all at once.
		await Promise.all(
			Array.from({ length: 6 }, () => reconcileCheckoutSession(stripe.client, sessionId))
		);

		expect(await stock(SHIRT.id)).toEqual({ available: 1, reserved: 0, sold: 2 });
		expect(await getOrder(orderId)).toMatchObject({
			status: 'PAID',
			amountTotal: 5400,
			paymentIntentId: `pi_${sessionId}`,
			livemode: false
		});
		expect((await getOrder(orderId))?.flags).toBeUndefined();
	});

	it('fulfills a paid order whose transaction collided with a concurrent one', async () => {
		const { orderId } = await checkout(1);
		stripe.pay(stripe.onlySession.id);

		collideNextTransactions(1);
		await reconcileCheckoutSession(stripe.client, stripe.onlySession.id);

		expect((await getOrder(orderId))?.status).toBe('PAID');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 0, sold: 1 });
	});

	it('releases stock when the checkout expires', async () => {
		const { orderId } = await checkout(2);
		stripe.expire(stripe.onlySession.id);

		await reconcileCheckoutSession(stripe.client, stripe.onlySession.id);
		await reconcileCheckoutSession(stripe.client, stripe.onlySession.id);

		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
		expect((await getOrder(orderId))?.status).toBe('EXPIRED');
	});

	it('does nothing while the checkout is still open', async () => {
		const { orderId } = await checkout(1);
		await reconcileCheckoutSession(stripe.client, stripe.onlySession.id);
		expect((await getOrder(orderId))?.status).toBe('RESERVED');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 1, sold: 0 });
	});

	it('holds stock through a delayed payment, then sells it', async () => {
		const { orderId } = await checkout(1);
		const sessionId = stripe.onlySession.id;

		stripe.completeWithDelayedPayment(sessionId);
		await reconcileCheckoutSession(stripe.client, sessionId);
		expect((await getOrder(orderId))?.status).toBe('PROCESSING');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 1, sold: 0 });

		stripe.settleDelayedPayment(sessionId, true);
		await reconcileCheckoutSession(stripe.client, sessionId);
		expect((await getOrder(orderId))?.status).toBe('PAID');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 0, sold: 1 });
	});

	it('releases stock when a delayed payment fails', async () => {
		const { orderId } = await checkout(1);
		const sessionId = stripe.onlySession.id;

		stripe.completeWithDelayedPayment(sessionId);
		await reconcileCheckoutSession(stripe.client, sessionId);
		stripe.settleDelayedPayment(sessionId, false);
		await reconcileCheckoutSession(stripe.client, sessionId);

		expect((await getOrder(orderId))?.status).toBe('FAILED');
		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
	});

	it('honors a payment that lands after the reservation was released, and flags it', async () => {
		const { orderId } = await checkout(1);
		const sessionId = stripe.onlySession.id;
		stripe.expire(sessionId);
		await reconcileCheckoutSession(stripe.client, sessionId);

		stripe.pay(sessionId);
		await reconcileCheckoutSession(stripe.client, sessionId);

		const order = await getOrder(orderId);
		expect(order?.status).toBe('PAID');
		expect(order?.flags).toEqual(['oversold']);
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 0, sold: 1 });
	});

	it('ignores sessions this system did not create', async () => {
		const session = await stripe.client.checkout.sessions.create({
			mode: 'payment',
			line_items: []
		});
		expect(await reconcileCheckoutSession(stripe.client, session.id)).toBeUndefined();
	});
});

describe('sweepReservations', () => {
	const later = (minutes: number) => new Date(Date.now() + minutes * 60_000);

	it('expires checkouts Stripe left open and releases their stock', async () => {
		const { orderId } = await checkout(2);

		expect(await sweepReservations(stripe.client, later(45))).toEqual({ checked: 1, failed: 0 });

		expect(stripe.onlySession.status).toBe('expired');
		expect((await getOrder(orderId))?.status).toBe('EXPIRED');
		expect(await stock(SHIRT.id)).toEqual({ available: 3, reserved: 0, sold: 0 });
	});

	it('fulfills a paid order whose webhook never arrived', async () => {
		const { orderId } = await checkout(1);
		stripe.pay(stripe.onlySession.id);

		await sweepReservations(stripe.client, later(45));

		expect((await getOrder(orderId))?.status).toBe('PAID');
		expect(await stock(SHIRT.id)).toEqual({ available: 2, reserved: 0, sold: 1 });
	});

	it('keeps holding stock for a pending delayed payment and checks again later', async () => {
		const { orderId } = await checkout(1);
		stripe.completeWithDelayedPayment(stripe.onlySession.id);

		await sweepReservations(stripe.client, later(45));
		expect((await getOrder(orderId))?.status).toBe('PROCESSING');

		// Not due again until the next day.
		expect((await sweepReservations(stripe.client, later(60))).checked).toBe(0);
		expect((await sweepReservations(stripe.client, later(60 * 26))).checked).toBe(1);
	});
});
