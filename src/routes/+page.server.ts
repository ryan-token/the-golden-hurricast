import { cacheEpisodePage, getLatestEpisodes } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

// Rendered on request (and cached by the CDN) so the latest episode is always current.
export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const recent = await getLatestEpisodes();
	cacheEpisodePage(setHeaders);

	return { latest: recent[0], recent };
};
