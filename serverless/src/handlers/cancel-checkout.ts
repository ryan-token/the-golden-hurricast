import { cancelCheckout } from '../merch/checkout.ts';
import { getStripe } from '../merch/stripe.ts';
import { HttpError } from '../lib/errors.ts';
import { json, siteHandler } from '../lib/http.ts';

/** Order ids are KSUIDs. */
const ORDER_ID = /^[0-9A-Za-z]{27}$/;

/**
 * POST /checkout/{orderId}/cancel — the customer backed out of Stripe Checkout: release
 * their reservation now. Order ids are unguessable and only reach the customer's own browser
 * (in Checkout's back link), so only they can cancel their checkout.
 */
export const handler = siteHandler(async (event) => {
	const orderId = event.pathParameters?.orderId ?? '';
	if (!ORDER_ID.test(orderId)) throw new HttpError(400, 'invalid_order', 'Invalid order id');

	const order = await cancelCheckout(await getStripe(), orderId);
	if (!order) throw new HttpError(404, 'order_not_found', 'Order not found');

	return json(200, { orderId, status: order.status.toLowerCase() });
});
