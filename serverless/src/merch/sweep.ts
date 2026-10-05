/**
 * The safety net behind the webhook. Runs on a schedule and re-checks every order that
 * still holds stock past its `releaseAfter` time: expires checkouts Stripe hasn't, catches
 * events we missed, and releases reservations whose checkout was never created.
 */
import type Stripe from 'stripe';
import {
	deferRelease,
	getOrder,
	holdsStock,
	listDueReservations,
	transitionOrder
} from '../data/orders.ts';
import type { Order } from '../data/orders.ts';
import { log } from '../lib/log.ts';
import { reconcileCheckoutSession, retrieveCheckoutSession } from './reconcile.ts';
import { PROCESSING_RECHECK_MS, SWEEP_INTERVAL_MS } from './schedule.ts';

export interface SweepResult {
	checked: number;
	failed: number;
}

export async function sweepReservations(stripe: Stripe, now = new Date()): Promise<SweepResult> {
	const due = await listDueReservations(now);
	let failed = 0;

	for (const order of due) {
		try {
			await sweepOrder(stripe, order, now);
		} catch (error) {
			failed++;
			log.error('Failed to sweep order', { orderId: order.orderId }, error);
		}
	}

	if (due.length > 0) log.info('Swept reservations', { checked: due.length, failed });
	return { checked: due.length, failed };
}

async function sweepOrder(stripe: Stripe, order: Order, now: Date) {
	if (!order.checkoutSessionId) {
		// The reservation was made but the checkout never got created (e.g. a crash).
		const result = await transitionOrder(order, { to: 'CANCELED' });
		log.warn('Canceled reservation without a Checkout Session', {
			orderId: order.orderId,
			canceled: Boolean(result)
		});
		return;
	}

	const session = await retrieveCheckoutSession(stripe, order.checkoutSessionId);
	if (session.status === 'open') {
		// Past its expiry but still open (shouldn't happen): close it so it can't be paid.
		await stripe.checkout.sessions.expire(session.id).catch((error: unknown) => {
			// It may have just completed or expired; reconciling below handles either.
			log.warn('Could not expire Checkout Session', { sessionId: session.id }, error);
		});
	}

	const reconciled = await reconcileCheckoutSession(stripe, order.checkoutSessionId, now);
	const latest = reconciled ?? (await getOrder(order.orderId));

	// Still holding stock (e.g. a delayed payment still pending): check again later.
	if (latest && holdsStock(latest.status)) {
		const delay = latest.status === 'PROCESSING' ? PROCESSING_RECHECK_MS : SWEEP_INTERVAL_MS;
		await deferRelease(latest, new Date(now.getTime() + delay).toISOString());
	}
}
