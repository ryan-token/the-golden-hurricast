/**
 * Called by the Hurricast API whenever stock or a product listing changes: purges the cached
 * merch page so the next visitor sees what's for sale now (see `#lib/server/merch-cache.ts`).
 */
import { isFromHurricastApi } from '#lib/server/hurricast-api.js';
import { purgeMerchPage } from '#lib/server/merch-cache.js';
import type { RequestHandler } from './$types';

export const prerender = false;

// Like the rest of the site, `/api/merch/purge/` (not `/api/merch/purge`) is the canonical URL.
export const trailingSlash = 'always';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!isFromHurricastApi(request)) return new Response(null, { status: 401 });

	// Netlify's CDN only exists on Netlify (not in `vite dev`/`preview`), so there's nothing to purge.
	if (platform) await purgeMerchPage();
	return new Response(null, { status: 204 });
};
