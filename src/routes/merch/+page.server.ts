import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { ApiError, createCheckout, describeError, getCatalog } from '#lib/server/hurricast-api.js';
import type { Product } from '#lib/server/hurricast-api.js';
import type { Actions, PageServerLoad } from './$types';

// Rendered per request so prices and stock are live; the CDN may serve it for a few seconds.
export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders, platform }) => {
	// Netlify's Image CDN is only there when running on Netlify (not in `vite dev`/`preview`).
	const useImageCdn = platform !== undefined;

	let products: Product[];
	try {
		products = await getCatalog();
	} catch (error) {
		// Show the page (with an "unavailable" note) rather than an error, and don't cache it.
		console.error('Failed to load the merch catalog:', describeError(error));
		setHeaders({ 'cache-control': 'no-store' });
		return { products: [], useImageCdn };
	}

	setHeaders({
		'cache-control': 'public, max-age=0, must-revalidate',
		// Netlify's CDN: serve from cache for 30s, then refresh in the background.
		'netlify-cdn-cache-control': 'public, s-maxage=30, stale-while-revalidate=120'
	});

	return { products, useImageCdn };
};

const CheckoutForm = v.object({
	productId: v.pipe(v.string(), v.regex(/^prod_[A-Za-z0-9]{1,64}$/)),
	quantity: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1), v.maxValue(10))
});

export const actions: Actions = {
	/** Reserve stock and send the customer to Stripe Checkout. */
	checkout: async ({ request, url, getClientAddress }) => {
		const result = v.safeParse(CheckoutForm, Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, {
				productId: undefined,
				message: 'Please choose a quantity and try again.'
			});
		}
		const { productId, quantity } = result.output;

		let checkoutUrl: string;
		try {
			({ url: checkoutUrl } = await createCheckout(
				{ productId, quantity, origin: url.origin },
				getClientAddress()
			));
		} catch (error) {
			if (error instanceof ApiError && error.status < 500) {
				return fail(error.status, { productId, message: error.message });
			}
			console.error('Checkout failed:', describeError(error));
			return fail(502, {
				productId,
				message: "We couldn't start checkout. Please try again in a moment."
			});
		}

		// Only ever redirect to Stripe's hosted checkout page.
		redirect(303, checkoutUrl, { external: ['https://checkout.stripe.com'] });
	}
};
