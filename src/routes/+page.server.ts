import { cacheEpisodePage, getEpisodes } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

// Rendered on request (and cached by the CDN) so the latest episode is always current.
export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [latest, ...older] = await getEpisodes();
	cacheEpisodePage(setHeaders);

	return {
		latest,
		thisSeason: older.filter((episode) => episode.season === latest.season).slice(0, 5)
	};
};
