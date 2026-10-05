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

const TOKEN = /^[A-Za-z0-9_-]{1,256}$/;

/** Photos of the products we sell, remembered briefly so stray requests don't each call the API. */
let catalogPhotos: { urls: Set<string>; expires: number } | undefined;

async function isCatalogPhoto(url: string): Promise<boolean> {
	if (!catalogPhotos || catalogPhotos.expires < Date.now()) {
		const products = await getCatalog();
		catalogPhotos = {
			urls: new Set(products.flatMap((product) => (product.image ? [product.image] : []))),
			expires: Date.now() + 60_000
		};
	}
	return catalogPhotos.urls.has(url);
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	const source = `${STRIPE_FILE_LINK}${params.token}`;

	// Only photos of products we sell, so this can't be used to re-host anyone else's files.
	// Runs once per photo: after that the CDN serves it.
	if (!TOKEN.test(params.token) || !(await isCatalogPhoto(source))) error(404, 'Not found');

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
