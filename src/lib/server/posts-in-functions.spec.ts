import { expect, test, vi } from 'vitest';

// In the Netlify Function, `static/` isn't on disk, so reading an image's size throws. Listings
// (the server-rendered sitemap) must not need it.
vi.mock('image-size/fromFile', () => ({
	imageSizeFromFile: () => Promise.reject(new Error('ENOENT: static/ is not deployed'))
}));

test('post listings work without the static files that rendering reads', async () => {
	const { getPostSummaries, getTags } = await import('./posts.js');

	expect((await getPostSummaries()).length).toBeGreaterThan(0);
	expect((await getTags()).size).toBeGreaterThan(0);
});
