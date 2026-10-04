import { error } from '@sveltejs/kit';
import { getPost, getPostSummaries } from '#lib/server/posts.js';
import type { EntryGenerator, PageServerLoad } from './$types';

// Posts live at the site root (e.g. /a-spartan-recap/), as they always have.
export const entries: EntryGenerator = async () =>
	(await getPostSummaries()).map(({ slug }) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);
	if (!post) error(404, 'Post not found');

	// Summaries are newest first: the "previous" post is the next-oldest one.
	const summaries = await getPostSummaries();
	const index = summaries.findIndex(({ slug }) => slug === post.slug);

	return {
		post,
		previous: summaries[index + 1],
		next: summaries[index - 1]
	};
};
