import { reconcileCheckoutSession } from '../merch/reconcile.ts';
import { getStripe } from '../merch/stripe.ts';
import { consumeRateLimit } from '../data/rate-limits.ts';
import { assertWithinRateLimit, HttpError, json, siteHandler } from '../lib/http.ts';

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{1,200}$/;

/**
 * GET /checkout/sessions/{sessionId} — for the success page. Reconciles the order with
 * Stripe first (fulfillment doesn't wait on the webhook), then returns a summary with no
 * customer details. Checkout Session ids are unguessable, and only our own site sees them.
 */
export const handler = siteHandler(async (event, { clientId }) => {
	const sessionId = event.pathParameters?.sessionId ?? '';
	if (!SESSION_ID.test(sessionId)) {
		throw new HttpError(400, 'invalid_session', 'Invalid Checkout Session id');
	}

	// Each lookup is a Stripe API call; don't let anyone spend our Stripe rate limit.
	assertWithinRateLimit(
		await consumeRateLimit({
			action: 'checkout-session',
			subject: clientId,
			limit: 30,
			windowSeconds: 600
		}),
		'Too many requests. Please try again later.'
	);

	const order = await reconcileCheckoutSession(await getStripe(), sessionId).catch(
		(error: unknown) => {
			if ((error as { type?: string }).type === 'StripeInvalidRequestError') return undefined;
			throw error;
		}
	);
	if (!order) throw new HttpError(404, 'order_not_found', 'Order not found');

	const items = order.items.map((item) => ({
		name: item.name,
		quantity: item.quantity,
		amountTotal: item.unitAmount * item.quantity
	}));

	return json(200, {
		orderId: order.orderId,
		status: order.status.toLowerCase(),
		items,
		amountTotal: order.amountTotal ?? items.reduce((sum, item) => sum + item.amountTotal, 0),
		currency: order.currency
	});
});
