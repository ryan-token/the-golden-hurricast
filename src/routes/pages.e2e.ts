import { expect, test } from '@playwright/test';

const ORIGIN = 'https://www.thegoldenhurricast.com';

// Pages built from the podcast feed need it to be reachable, as they do in production.
const PAGES = [
	{ path: '/', h1: 'Golden Hurricane talk, every week since 2018.' },
	{ path: '/podcast/', h1: 'The podcast' },
	{ path: '/podcast/episodes/', h1: 'Every episode' },
	{ path: '/podcast/episodes/1-1-stay-golden/', h1: 'Stay Golden' },
	{ path: '/podcast/guests/', h1: 'Every guest we’ve ever had' },
	{ path: '/blog/', h1: 'Hurc’s Corner' },
	{ path: '/about/', h1: 'Two alums, one time zone away.' },
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
		['/support/', '/about/#support'],
		['/patreon.png', '/blog_images/patreon/patreon-tiers.png'],
		['/apple-touch-icon.webp', '/apple-touch-icon.png'],
		['/icons/icon-192x192.png?v=25536b73763a79fd4857f010bced2939', '/apple-touch-icon.png']
	]) {
		const response = await request.get(path, { maxRedirects: 0 });
		expect(response.status(), path).toBe(301);
		expect(response.headers().location, path).toBe(location);
	}
});

test('searching the episode archive filters as you type, keeps the URL in step and survives Back', async ({
	page
}) => {
	const search = page.getByRole('searchbox', { name: 'Search episodes' });
	const results = page.getByRole('main').getByRole('article');
	const heading = page.locator('h1');
	const backToArchive = page.getByRole('main').getByRole('link', { name: 'All episodes' });

	await page.goto('/podcast/episodes/');
	await search.pressSequentially('stay golden');
	await expect(search).toHaveValue('stay golden');
	await expect(page).toHaveURL('/podcast/episodes/?q=stay%20golden');
	await expect(results).toHaveCount(1);

	// The filtered URL works on its own, without JavaScript's help.
	await page.reload();
	await expect(results).toHaveCount(1);

	/** Waits for the page swap to finish (the URL changes first), as a person would. */
	const expectSearchRestored = async () => {
		await expect(heading).toHaveText('Every episode');
		await expect(page).toHaveURL('/podcast/episodes/?q=stay%20golden');
		await expect(search).toHaveValue('stay golden');
		await expect(results).toHaveCount(1);
	};
	const openResult = async () => {
		await results.getByRole('link').click();
		await expect(heading).toHaveText('Stay Golden');
	};

	// Back from an episode returns to the search, not the whole archive: with the browser's
	// Back button, the episode page's "All episodes" link, or that link after moving on to
	// another episode.
	await openResult();
	await page.goBack();
	await expectSearchRestored();

	await openResult();
	await backToArchive.click();
	await expectSearchRestored();

	await openResult();
	await page.getByRole('link', { name: /^Next/ }).click();
	await expect(heading).not.toHaveText('Stay Golden');
	await backToArchive.click();
	await expectSearchRestored();
});

for (const path of ['/podcast/', '/podcast/guests/']) {
	test(`${path} opens a headliner's sheet from their card`, async ({ page }) => {
		await page.goto(path);
		await page.getByRole('button', { name: 'Tre Lamb' }).click();

		const sheet = page.getByRole('dialog', { name: 'Tre Lamb' });
		await expect(sheet).toBeVisible();
		await sheet.getByRole('button', { name: 'Close' }).click();
		await expect(sheet).toBeHidden();
	});
}

for (const path of ['/podcast/', '/about/']) {
	test(`${path} offers a review on Apple Podcasts or Spotify`, async ({ page }) => {
		await page.goto(path);
		await page.getByRole('button', { name: /Leave a 5-star review/ }).click();

		const sheet = page.getByRole('dialog', { name: 'Leave us a 5-star review' });
		await expect(sheet.getByRole('link', { name: /Apple Podcasts/ })).toHaveAttribute(
			'href',
			/id1435008302\?see-all=reviews$/
		);
		await expect(sheet.getByRole('link', { name: /Spotify/ })).toHaveAttribute(
			'href',
			'https://open.spotify.com/show/16ik0AuBrpVBfWn73jlJio'
		);
	});
}

test('an episode whose title changed redirects to its current page', async ({ request }) => {
	const response = await request.get('/podcast/episodes/1-1-an-old-title/', { maxRedirects: 0 });
	expect(response.status()).toBe(301);
	expect(response.headers().location).toBe('/podcast/episodes/1-1-stay-golden/');
});

test("Checkout's back link always returns to the merch page, uncached", async ({ request }) => {
	// A malformed id, then a well-formed one whose release fails (the API isn't reachable here).
	for (const order of ['not-an-order', '3KGArskmb8VMn5UJADJjr80ZAvT']) {
		const response = await request.get(`/merch/cancel/?order=${order}`, { maxRedirects: 0 });
		expect(response.status(), order).toBe(303);
		expect(response.headers().location).toBe('/merch/');
		expect(response.headers()['cache-control']).toBe('no-store');
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

test('the sitemap lists canonical pages, episodes, tags and posts', async ({ request }) => {
	const response = await request.get('/sitemap.xml');
	const body = await response.text();

	expect(response.status()).toBe(200);
	expect(body).toContain(`<loc>${ORIGIN}/podcast/</loc>`);
	expect(body).toContain(
		`<loc>${ORIGIN}/podcast/episodes/1-1-stay-golden/</loc><lastmod>2018-08-29</lastmod>`
	);
	expect(body).toContain(`<loc>${ORIGIN}/tags/golden%20hurristats/</loc>`);
	expect(body).toContain(`<loc>${ORIGIN}/a-spartan-recap/</loc><lastmod>2019-09-13</lastmod>`);
	expect(body).not.toContain('question-received');
	expect(body).not.toContain('/support/');
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
});

// The narrowest phones still in use. Long episode titles and links are what tend to push a
// layout wider than the screen, so the pages with the longest ones are listed.
test.describe('at the narrowest phone width', () => {
	test.use({ viewport: { width: 320, height: 640 } });

	const overflow = (element: Element) => element.scrollWidth - element.clientWidth;

	test('pages do not scroll sideways', async ({ page }) => {
		for (const path of [
			'/',
			'/podcast/',
			'/podcast/episodes/',
			'/podcast/episodes/9-6-three-rounds-of-drano/',
			'/podcast/episodes/7-16-tu-head-football-coach-tre-lamb-joins-the-podcast/',
			'/podcast/guests/',
			'/merch/',
			'/blog/',
			'/about/',
			'/tags/'
		]) {
			await page.goto(path);
			expect(await page.locator('html').evaluate(overflow), path).toBe(0);
		}
	});

	test('sheets do not scroll sideways', async ({ page }) => {
		for (const path of ['/podcast/', '/merch/']) {
			await page.goto(path);
			for (const sheet of await page.locator('dialog').all()) {
				await sheet.evaluate((dialog: HTMLDialogElement) => dialog.showModal());
				const id = await sheet.getAttribute('id');
				expect(await sheet.evaluate(overflow), `${path} #${id}`).toBe(0);
				await sheet.evaluate((dialog: HTMLDialogElement) => dialog.close());
			}
		}
	});
});
