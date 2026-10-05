/**
 * Product photos hosted by Stripe (`https://files.stripe.com/links/<token>`), served from our
 * own domain so the Netlify Image CDN can cache them. Stripe sends `Cache-Control: no-store`,
 * which the Image CDN honours for remote images, so it would otherwise re-download and resize
 * every photo on every visit. A Stripe file link always points at the same file (a new photo
 * gets a new link), so the response can be cached for good.
 */
import { error } from '@sveltejs/kit';
import { getCatalog } from '#lib/server/hurricast-api.js';
import { STRIPE_FILE_LINK } from '#lib/images.js';
import type { RequestHandler } from './$types';

export const prerender = false;

// An image, not a page: `/merch/photos/<token>`.
export const trailingSlash = 'never';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const source = `${STRIPE_FILE_LINK}${params.token}`;

	// Only photos of products we sell, so this can't be used to re-host anyone else's files.
	// Runs once per photo: after that the CDN serves it.
	const products = await getCatalog();
	if (!products.some((product) => product.image === source)) error(404, 'Not found');

	const response = await fetch(source);
	const type = response.headers.get('content-type') ?? '';
	if (!response.ok || !type.startsWith('image/')) error(502, 'Photo unavailable');

	return new Response(response.body, {
		headers: {
			'content-type': type,
			'cache-control': 'public, max-age=31536000, immutable',
			'netlify-cdn-cache-control': 'public, max-age=31536000, immutable, durable'
		}
	});
};
