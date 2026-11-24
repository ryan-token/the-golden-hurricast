/**
 * CDN caching for the merch page. It's served from Netlify's shared (durable) cache, so a
 * visitor almost never waits on the Hurricast API. When stock or a listing changes, the API
 * asks us to purge it (`/api/merch/purge/`), so the cache can be kept for a long time without
 * showing stale stock. The short `s-maxage` only matters if a purge is ever lost, and for deploy
 * previews, which the dev API doesn't purge.
 */
import { purgeCache } from '@netlify/cache';

const MERCH_CACHE_TAG = 'merch';

export function cacheMerchPage(setHeaders: (headers: Record<string, string>) => void) {
	setHeaders({
		'cache-control': 'public, max-age=0, must-revalidate',
		'netlify-cdn-cache-control': 'public, durable, s-maxage=300, stale-while-revalidate=604800',
		'netlify-cache-tag': MERCH_CACHE_TAG
	});
}

/**
 * Drops every cached copy of the merch page, on every deploy. Only works inside a Netlify
 * Function, which provides the site and the purge token.
 */
export function purgeMerchPage(): Promise<void> {
	return purgeCache({ tags: [MERCH_CACHE_TAG] });
}
