/**
 * Order fulfillment, per https://docs.stripe.com/checkout/fulfillment: one function that
 * brings an order in line with its Checkout Session. It's called by the webhook (every
 * `checkout.session.*` event), by the success page, and by the sweeper — so it must be
 * safe to run any number of times, concurrently, for the same session.
 *
 * It always re-reads the session from Stripe rather than trusting the caller, and every
 * change is a conditional transaction (see data/orders.ts), so duplicates are no-ops.
 */
import { setTimeout as sleep } from 'node:timers/promises';
import type Stripe from 'stripe';
import { getOrder, transitionOrder } from '../data/orders.ts';
import type { Order, Transition } from '../data/orders.ts';
import { log } from '../lib/log.ts';

/** How long a delayed payment (e.g. bank debit) may stay pending before we re-check it. */
const PROCESSING_RECHECK_MS = 24 * 60 * 60 * 1000;

export async function retrieveCheckoutSession(stripe: Stripe, sessionId: string) {
	return stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items', 'payment_intent']
	});
}

/**
 * Reconciles the order behind `sessionId`. Returns the up-to-date order, or `undefined` if
 * the session wasn't created by this system (e.g. a legacy or dashboard-created session).
 */
export async function reconcileCheckoutSession(
	stripe: Stripe,
	sessionId: string,
	now = new Date()
): Promise<Order | undefined> {
	const session = await retrieveCheckoutSession(stripe, sessionId);

	const orderId = session.metadata?.orderId;
	if (!orderId) {
		log.info('Ignoring Checkout Session without an orderId', { sessionId });
		return undefined;
	}

	let order = await getOrder(orderId);
	if (!order) {
		log.error('Checkout Session refers to an unknown order', undefined, { sessionId, orderId });
		return undefined;
	}
	if (order.checkoutSessionId && order.checkoutSessionId !== session.id) {
		log.error('Checkout Session does not match the order', undefined, { sessionId, orderId });
		return order;
	}

	// Optimistic concurrency: if another invocation changed the order first (or its
	// transaction collided with ours), re-read and decide again. This settles quickly.
	for (let attempt = 0; attempt < 5; attempt++) {
		const transition = decideTransition(order, session, now);
		if (!transition) return order;

		const updated = await transitionOrder(order, transition);
		if (updated) {
			log.info('Order updated', { orderId, from: order.status, to: updated.status, sessionId });
			return updated;
		}

		await sleep(Math.random() * 50 * (attempt + 1));
		order = await getOrder(orderId);
		if (!order) throw new Error(`Order ${orderId} disappeared`);
	}

	throw new Error(`Order ${orderId} is changing too quickly to reconcile`);
}

/** What should happen to `order` given the current state of its Checkout Session. */
export function decideTransition(
	order: Order,
	session: Stripe.Checkout.Session,
	now: Date
): Transition | undefined {
	if (order.status === 'PAID') return undefined;

	if (session.status === 'complete') {
		if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
			return { to: 'PAID', payment: paymentDetails(order, session, now) };
		}

		// Completed but unpaid: a delayed payment method. The PaymentIntent tells us how it went.
		const paymentIntent = session.payment_intent;
		const piStatus = typeof paymentIntent === 'object' ? paymentIntent?.status : undefined;
		const holdsStock = order.status === 'RESERVED' || order.status === 'PROCESSING';

		if ((piStatus === 'requires_payment_method' || piStatus === 'canceled') && holdsStock) {
			return { to: 'FAILED' };
		}
		if (order.status === 'RESERVED') {
			return {
				to: 'PROCESSING',
				releaseAfter: new Date(now.getTime() + PROCESSING_RECHECK_MS).toISOString()
			};
		}
		return undefined;
	}

	if (session.status === 'expired' && order.status === 'RESERVED') {
		return { to: 'EXPIRED' };
	}

	return undefined;
}

function paymentDetails(order: Order, session: Stripe.Checkout.Session, now: Date) {
	const flags: string[] = [];

	// We created the session with fixed line items, so they must match the order exactly.
	const lines = session.line_items?.data ?? [];
	const matches =
		lines.length === order.items.length &&
		order.items.every((item) =>
			lines.some((line) => line.price?.id === item.priceId && line.quantity === item.quantity)
		);
	if (!matches) {
		log.error('Checkout line items do not match the order', undefined, {
			orderId: order.orderId,
			sessionId: session.id
		});
		flags.push('line_items_mismatch');
	}

	const paymentIntent = session.payment_intent;
	return {
		paidAt: now.toISOString(),
		amountTotal: session.amount_total ?? 0,
		currency: session.currency ?? order.currency,
		paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id,
		livemode: session.livemode,
		checkoutSessionId: session.id,
		flags
	};
}
