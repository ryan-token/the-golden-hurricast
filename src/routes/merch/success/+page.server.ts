import { redirect } from '@sveltejs/kit';
import { ApiError, describeError, getOrderForCheckoutSession } from '#lib/server/hurricast-api.js';
import type { OrderSummary } from '#lib/server/hurricast-api.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

/**
 * Stripe sends the customer here after checkout with `?session_id=…`. Loading the order
 * also reconciles it with Stripe, so fulfillment never waits on the webhook.
 */
export const load: PageServerLoad = async ({ url, setHeaders, getClientAddress }) => {
	setHeaders({ 'cache-control': 'private, no-store' });

	const sessionId = url.searchParams.get('session_id');
	if (!sessionId) redirect(303, '/merch/');

	let order: OrderSummary | undefined;
	// A bad or unknown session id: don't thank the visitor for an order that doesn't exist.
	let notFound = false;
	try {
		order = await getOrderForCheckoutSession(sessionId, getClientAddress());
	} catch (error) {
		if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
			notFound = true;
		} else if (!(error instanceof ApiError && error.status === 429)) {
			// Outages and misconfiguration (e.g. a wrong API key) — the order itself may be fine.
			console.error('Order lookup failed:', describeError(error));
		}
	}

	return { order, notFound };
};
