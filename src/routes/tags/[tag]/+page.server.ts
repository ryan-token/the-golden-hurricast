import { error } from '@sveltejs/kit';
import { getTags } from '#lib/server/posts.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () =>
	[...(await getTags()).keys()].map((tag) => ({ tag }));

export const load: PageServerLoad = async ({ params }) => {
	const posts = (await getTags()).get(params.tag);
	if (!posts) error(404, 'Tag not found');

	return { tag: params.tag, posts };
};
