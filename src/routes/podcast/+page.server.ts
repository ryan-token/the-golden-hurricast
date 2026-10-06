import { FEATURED_GUESTS } from '#lib/guests.js';
import {
	cacheEpisodePage,
	getEpisodes,
	getLatestEpisodes,
	resolveAppearances
} from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [episodes, latest] = await Promise.all([getEpisodes(), getLatestEpisodes()]);
	cacheEpisodePage(setHeaders);

	return {
		count: episodes.length,
		latest,
		appearances: Object.fromEntries(
			FEATURED_GUESTS.map((guest) => [guest.slug, resolveAppearances(episodes, guest.appearances)])
		)
	};
};
