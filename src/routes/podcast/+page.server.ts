import { FEATURED_GUESTS } from '#lib/guests.js';
import { cacheEpisodePage, getEpisodes, resolveAppearances } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const episodes = await getEpisodes();
	cacheEpisodePage(setHeaders);

	return {
		count: episodes.length,
		latest: episodes.slice(0, 6),
		appearances: Object.fromEntries(
			FEATURED_GUESTS.map((guest) => [guest.slug, resolveAppearances(episodes, guest.appearances)])
		)
	};
};
