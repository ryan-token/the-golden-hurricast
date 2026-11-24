import { requireEnv } from './env.ts';
import { getSecret } from './secrets.ts';
import { SITE_API_KEY_PARAM } from './site-auth.ts';

/**
 * Asks the website to purge its CDN copies of the merch pages, so the next visitor sees
 * current stock and prices (the site's `/api/merch/purge/` route). The site caches those
 * pages for a long time precisely because this tells it when they change.
 *
 * Authenticated with the same shared key the site sends us. Safe to repeat.
 */
export async function purgeSiteMerchCache(siteUrl: string): Promise<void> {
	const response = await fetch(new URL('/api/merch/purge/', siteUrl), {
		method: 'POST',
		headers: {
			'x-api-key': await getSecret(requireEnv(SITE_API_KEY_PARAM)),
			// SvelteKit treats a POST without a JSON body as a form submission and, without a
			// same-site Origin, rejects it as cross-site (403).
			'content-type': 'application/json'
		},
		body: '{}',
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) throw new Error(`Site cache purge responded ${response.status}`);
}
