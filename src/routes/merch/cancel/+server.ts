/**
 * Stripe Checkout's back link (`cancel_url`) lands here with the order id: release the stock
 * that checkout was holding, then return to the merch page. Without this, the units would stay
 * reserved until the Checkout Session expires (about half an hour).
 *
 * Leaving Checkout with the browser's back button doesn't come here; that reservation is
 * released when the session expires.
 */
import { ApiError, cancelCheckout, describeError } from '#lib/server/hurricast-api.js';
import type { RequestHandler } from './$types';

export const prerender = false;
export const trailingSlash = 'always';

/** Order ids are KSUIDs. */
const ORDER_ID = /^[0-9A-Za-z]{27}$/;

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	const orderId = url.searchParams.get('order') ?? '';

	if (ORDER_ID.test(orderId)) {
		try {
			await cancelCheckout(orderId, getClientAddress());
		} catch (error) {
			// The customer is on their way back to the merch page either way; if this failed,
			// the reservation is released when the Checkout Session expires.
			if (!(error instanceof ApiError && error.status === 404)) {
				console.error('Releasing a checkout failed:', describeError(error));
			}
		}
	}

	return new Response(null, {
		status: 303,
		headers: { location: '/merch/', 'cache-control': 'no-store' }
	});
};
