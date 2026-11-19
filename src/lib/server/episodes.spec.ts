import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Episode } from '#lib/episodes.js';
import { parseFeed, parseTitle, resolveAppearances, slugify } from './episodes.js';

// Real titles from the feed: each numbering style it has used since 2018.
describe('parseTitle', () => {
	test.each([
		[
			'9-6: Three Rounds of Drano (Arkansas Recap & North Texas Preview ft. JD Davis from the North Texas Eagle)',
			{
				season: 9,
				number: 6,
				title: 'Three Rounds of Drano',
				subtitle: 'Arkansas Recap & North Texas Preview',
				guest: { name: 'JD Davis', outlet: 'the North Texas Eagle' }
			}
		],
		['3-21 (Bonus): The Jeremie Poplin Show', { season: 3, number: 21, bonus: true }],
		['2-13 Part 1: The Sad Football One', { number: 13, title: 'Part 1: The Sad Football One' }],
		['4-27.5: Special WNIT Mini-Sode!', { season: 4, number: 27.5 }],
		['Season 2 Episode 1: 2 Golden 2 Hurricast', { season: 2, number: 1 }],
		[
			'8-6: Party Like It’s ‘51 (OSU Recap ft. Phillip Slavin & Tulane Preview ft. Jack Chasanoff)',
			{
				subtitle: 'OSU Recap & Tulane Preview',
				guest: { name: 'Phillip Slavin & Jack Chasanoff' }
			}
		],
		[
			'5-13: Our #MontyWatch is Ended (ft. John Tranchina & Cayden McFarland)',
			{ subtitle: undefined, guest: { name: 'John Tranchina & Cayden McFarland' } }
		]
	])('%s', (raw, expected) => {
		expect(parseTitle(raw, '2026-01-01')).toMatchObject(expected);
	});

	test('bare numbers mean Season 1, but only for Season 1’s dates', () => {
		expect(parseTitle('12: Back to Reality', '2018-11-13')).toMatchObject({
			season: 1,
			number: 12,
			title: 'Back to Reality'
		});
		expect(parseTitle('12: Back to Reality', '2024-01-01')).toMatchObject({
			season: undefined,
			title: '12: Back to Reality'
		});
	});
});

test('slugs keep half-episode numbers but drop other punctuation', () => {
	expect(slugify([4, 27.5, false, 'Special WNIT Mini-Sode!'])).toBe(
		'4-27.5-special-wnit-mini-sode'
	);
	expect(slugify([3, 4, false, 'J.J.’s No Sports Zone'])).toBe('3-4-jjs-no-sports-zone');
});

test('parseFeed builds stable, unique slugs and cleans up show notes', () => {
	const item = (title: string, notes: string, pubDate = 'Tue, 29 Sep 2026 17:26:56 GMT') => `
		<item>
			<title><![CDATA[${title}]]></title>
			<description><![CDATA[${notes}]]></description>
			<pubDate>${pubDate}</pubDate>
			<enclosure url="https://anchor.fm/s/1/podcast/play/2/a.mp3" length="1" type="audio/mpeg"/>
			<itunes:duration>01:49:09</itunes:duration>
		</item>`;
	const xml = `<rss><channel>
		${item('9-6: Same Title', '<p>Hi.We recap <a href="https://example.com">A&amp;M</a>.</p><p><br></p><script>alert(1)</script><p>3:20 - Arkansas Recap</p>')}
		${item('9-6: Same Title', '<p>Again.</p>', 'Wed, 23 Sep 2026 00:02:00 GMT')}
	</channel></rss>`;

	const [first, second] = parseFeed(xml);

	expect(first).toMatchObject({
		published: '2026-09-29',
		duration: 6549,
		summary: 'Hi. We recap A&M. 3:20 - Arkansas Recap'
	});
	// The older episode keeps the plain slug. It went out the evening of Sep 22, Central Time.
	expect(first.slug).toBe('9-6-same-title-2026-09-29');
	expect(second).toMatchObject({ slug: '9-6-same-title', published: '2026-09-22' });
	expect(first.notes).toBe(
		'<p>Hi. We recap <a href="https://example.com" target="_blank" rel="noopener noreferrer">A&#x26;M</a>.</p>' +
			'<p><button type="button" data-seek="200">3:20</button> - Arkansas Recap</p>'
	);
});

test('guest appearances come back newest first, whatever order they are listed in', () => {
	const episode = (season: number, number: number, published: string) =>
		({ slug: `${season}-${number}`, season, number, bonus: false, published }) as Episode;
	const episodes = [
		episode(8, 10, '2025-10-21'),
		episode(6, 8, '2023-10-26'),
		episode(4, 29, '2022-04-15')
	];

	expect(resolveAppearances(episodes, ['4-29', '8-10', '6-8']).map(({ slug }) => slug)).toEqual([
		'8-10',
		'6-8',
		'4-29'
	]);
});

describe('getEpisodes', () => {
	// Netlify keeps the function alive for promises passed to waitUntil, and freezes it otherwise.
	const waitUntil = vi.hoisted(() => vi.fn<(promise: Promise<unknown>) => void>());
	vi.mock('$app/server', () => ({
		getRequestEvent: () => ({ platform: { context: { waitUntil } } })
	}));
	const settleBackgroundWork = () => Promise.all(waitUntil.mock.calls.map(([promise]) => promise));

	const feed = (title: string) => `<rss><channel><item>
		<title><![CDATA[${title}]]></title>
		<description><![CDATA[<p>Notes.</p>]]></description>
		<pubDate>Fri, 30 Oct 2026 18:57:27 GMT</pubDate>
		<enclosure url="https://anchor.fm/s/1/podcast/play/2/a.mp3" length="1" type="audio/mpeg"/>
	</item></channel></rss>`;
	const serve = (response: () => Response) => {
		const fetch = vi.fn(async () => response());
		vi.stubGlobal('fetch', fetch);
		return fetch;
	};

	beforeEach(() => {
		vi.resetModules();
		waitUntil.mockClear();
		vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	test('every feed fetch sends credentials never sent before, so the CDN can’t answer from a stale copy', async () => {
		const { getEpisodes } = await import('./episodes.js');
		const fetch = serve(() => new Response(feed('9-9: Old')));
		await getEpisodes();
		vi.advanceTimersByTime(6 * 60_000);
		await getEpisodes();

		const sent = fetch.mock.calls.map((call) =>
			new Headers((call as unknown as [string, RequestInit])[1].headers).get('authorization')
		);
		expect(sent).toHaveLength(2);
		expect(sent[0]).toMatch(/^Basic /);
		expect(sent[0]).not.toBe(sent[1]);
	});

	test('once the cache expires, the next request gets the new episode', async () => {
		const { getEpisodes } = await import('./episodes.js');
		serve(() => new Response(feed('9-9: Old')));
		await getEpisodes();

		vi.advanceTimersByTime(6 * 60_000);
		serve(() => new Response(feed('9-10: New')));
		expect((await getEpisodes())[0].title).toBe('New');
	});

	test('a slow feed gets the old copy, and the new episode loads behind it', async () => {
		const { getEpisodes } = await import('./episodes.js');
		serve(() => new Response(feed('9-9: Old')));
		await getEpisodes();

		vi.advanceTimersByTime(6 * 60_000);
		let respond!: () => void;
		vi.stubGlobal(
			'fetch',
			() => new Promise((resolve) => (respond = () => resolve(new Response(feed('9-10: New')))))
		);
		const request = getEpisodes();
		await vi.advanceTimersByTimeAsync(2_000);
		expect((await request)[0].title).toBe('Old');
		expect(waitUntil).toHaveBeenCalledOnce();

		respond();
		await settleBackgroundWork();
		expect((await getEpisodes())[0].title).toBe('New');
	});

	test('a feed outage keeps serving the last copy, and retries every few minutes rather than every request', async () => {
		const { getEpisodes } = await import('./episodes.js');
		serve(() => new Response(feed('9-9: Old')));
		await getEpisodes();

		vi.advanceTimersByTime(6 * 60_000);
		const fetch = serve(() => new Response('', { status: 503 }));
		await getEpisodes();
		await settleBackgroundWork();
		expect((await getEpisodes())[0].title).toBe('Old');
		expect(fetch).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(6 * 60_000);
		await getEpisodes();
		expect(fetch).toHaveBeenCalledTimes(2);
	});
});
