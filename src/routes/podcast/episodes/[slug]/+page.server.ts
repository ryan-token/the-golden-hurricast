import { error, redirect } from '@sveltejs/kit';
import { episodePath } from '#lib/episodes.js';
import { cacheEpisodePage, findRenamedEpisode, getEpisode } from '#lib/server/episodes.js';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const found = await getEpisode(params.slug);
	if (!found) {
		const renamed = await findRenamedEpisode(params.slug);
		if (renamed) redirect(301, episodePath(renamed));
		error(404, 'Episode not found');
	}

	cacheEpisodePage(setHeaders);
	return found;
};
