import { describe, expect, it } from 'vitest';
import { getPost, getPostSummaries, getTags } from './posts.js';

describe('posts', () => {
	it('loads every post newest first, at its historical URL', async () => {
		const posts = await getPostSummaries();

		expect(posts).toHaveLength(19);
		expect(posts[0]).toMatchObject({
			slug: "we're-on-patreon",
			path: "/we're-on-patreon/",
			published: '2024-12-12'
		});
		expect(posts.at(-1)?.slug).toBe('a-spartan-recap');

		const dates = posts.map(({ published }) => published);
		expect(dates).toEqual(dates.toSorted().reverse());
		for (const post of posts) expect(post.path).toBe(`/${post.slug}/`);

		// Slugs with an apostrophe must still resolve.
		expect((await getPost("we're-on-patreon"))?.title).toBe("We're on Patreon!");
	});

	it('groups posts by tag, tags alphabetical and posts newest first', async () => {
		const tags = await getTags();
		const names = [...tags.keys()];

		expect(names).toEqual(names.toSorted((a, b) => a.localeCompare(b)));
		expect(tags.get('golden hurristats')?.map(({ slug }) => slug)).toEqual([
			'through-the-bye-week',
			'a-spartan-recap'
		]);
	});
});
