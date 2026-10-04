import { expect, test } from '@playwright/test';

const ORIGIN = 'https://www.thegoldenhurricast.com';

const PAGES = [
	{ path: '/', h1: 'The Golden Hurricast' },
	{ path: '/podcast/', h1: 'The Golden Hurricast' },
	{ path: '/blog/', h1: 'Our Blog' },
	{ path: '/about/', h1: 'About Us' },
	{ path: '/support/', h1: 'Support Us' },
	{ path: '/tags/', h1: 'Tags' },
	{ path: '/tags/football/', h1: 'Posts about football' },
	{ path: '/tags/golden%20hurristats/', h1: 'Posts about golden hurristats' },
	{ path: '/a-spartan-recap/', h1: 'Golden Hurristats: A Spartan Recap' },
	{ path: "/we're-on-patreon/", h1: "We're on Patreon!" }
];

for (const { path, h1 } of PAGES) {
	test(`${path} renders`, async ({ page }) => {
		const response = await page.goto(path);

		expect(response?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(h1);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			new URL(path, ORIGIN).href
		);
	});
}

test('old Gatsby URLs redirect to their replacements', async ({ request }) => {
	for (const [path, location] of [
		['/merch-success', '/merch/'],
		['/merch-success/', '/merch/'],
		['/patreon.png', '/blog_images/patreon/patreon-tiers.png'],
		['/apple-touch-icon.webp', '/apple-touch-icon.png'],
		['/icons/icon-192x192.png?v=25536b73763a79fd4857f010bced2939', '/apple-touch-icon.png']
	]) {
		const response = await request.get(path, { maxRedirects: 0 });
		expect(response.status(), path).toBe(301);
		expect(response.headers().location, path).toBe(location);
	}
});

test('unknown URLs are a 404', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist/');

	expect(response?.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('Page not found');
});

test('the blog lists every post and links to tags', async ({ page }) => {
	await page.goto('/blog/');

	await expect(page.getByRole('article')).toHaveCount(19);
	await page.getByRole('link', { name: 'browse posts by tag' }).click();
	await expect(page).toHaveURL('/tags/');

	await page.getByRole('link', { name: 'golden hurristats', exact: true }).click();
	await expect(page).toHaveURL('/tags/golden%20hurristats/');
	await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2);
});

test('the sitemap lists canonical pages, tags and posts', async ({ request }) => {
	const response = await request.get('/sitemap.xml');
	const body = await response.text();

	expect(response.status()).toBe(200);
	expect(body).toContain(`<loc>${ORIGIN}/podcast/</loc>`);
	expect(body).toContain(`<loc>${ORIGIN}/tags/golden%20hurristats/</loc>`);
	expect(body).toContain(`<loc>${ORIGIN}/a-spartan-recap/</loc><lastmod>2019-09-13</lastmod>`);
	expect(body).not.toContain('question-received');
	expect(body.match(/<url>/g)).toHaveLength(42);
});

test.describe('at phone width', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the nav menu opens and navigates', async ({ page }) => {
		await page.goto('/');

		const podcastLink = page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
			name: 'Podcast'
		});
		await expect(podcastLink).toBeHidden();

		await page.getByRole('button', { name: 'Menu' }).click();
		await expect(podcastLink).toBeVisible();

		await podcastLink.click();
		await expect(page).toHaveURL('/podcast/');
		await expect(podcastLink).toBeHidden();
	});

	test('pages do not scroll sideways', async ({ page }) => {
		for (const path of ['/', '/podcast/', '/blog/', '/about/', '/support/', '/tags/']) {
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow, path).toBe(0);
		}
	});
});
