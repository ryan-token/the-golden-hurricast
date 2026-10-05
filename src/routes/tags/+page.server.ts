import { getTags } from '#lib/server/posts.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	tags: [...(await getTags()).keys()]
});
