import { cacheEpisodePage, getEpisodes } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const episodes = await getEpisodes();
	cacheEpisodePage(setHeaders);
	return { episodes };
};
