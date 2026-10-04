import { getPostSummaries } from '#lib/server/posts.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [latestPost] = await getPostSummaries();
	return { latestPost };
};
