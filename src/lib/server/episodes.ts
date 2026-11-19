/**
 * Episodes come from the show's public RSS feed on Spotify for Creators. Pages that list them
 * are server-rendered and cached by the CDN (see `cacheEpisodePage`), so a new episode shows up
 * within minutes without a rebuild.
 */
import { getRequestEvent } from '$app/server';
import { XMLParser } from 'fast-xml-parser';
import type { Element, Root } from 'hast';
import rehypeParse from 'rehype-parse';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import * as v from 'valibot';
import type { Episode } from '#lib/episodes.js';
import { LINKS } from '#lib/site.js';

const ItemSchema = v.object({
	title: v.string(),
	description: v.optional(v.string(), ''),
	pubDate: v.string(),
	enclosure: v.object({ '@_url': v.pipe(v.string(), v.url()) }),
	'itunes:duration': v.optional(v.string(), '0')
});

const FeedSchema = v.object({
	rss: v.object({ channel: v.object({ item: v.array(v.unknown()) }) })
});

export type EpisodeWithNotes = Episode & { notes: string };

/** What the numbering prefix of a title tells us. Exported for tests. */
export function parseTitle(raw: string, published: string) {
	let title = raw.trim();
	let season: number | undefined;
	let number: number | undefined;
	let bonus = false;
	let part: string | undefined;

	const numbered =
		/^(\d+)-(\d+(?:\.\d+)?)(\s*\(Bonus\))?(?:\s+Part\s+(\d+))?:\s*/i.exec(title) ??
		/^Season (\d+) Episode (\d+)()():\s*/i.exec(title);
	// Season 1 titles were just "12: Back to Reality".
	const seasonOne = published < '2019-06-01' ? /^(\d+):\s*/.exec(title) : null;

	if (numbered) {
		[season, number] = [Number(numbered[1]), Number(numbered[2])];
		bonus = Boolean(numbered[3]);
		part = numbered[4];
		title = title.slice(numbered[0].length);
	} else if (seasonOne) {
		[season, number] = [1, Number(seasonOne[1])];
		title = title.slice(seasonOne[0].length);
	}
	if (part) title = `Part ${part}: ${title}`;

	let subtitle: string | undefined;
	let guest: Episode['guest'];
	const paren = /\s*\(([^()]+)\)$/.exec(title);
	if (paren) {
		title = title.slice(0, paren.index);
		// "Recap ft. A & Preview ft. B": each credit runs to the last "&" before the next "ft.".
		const [lead, ...credits] = paren[1].split(/\s*\bft\.?\s+/i);
		const names: string[] = [];
		const rest = [lead];
		credits.forEach((credit, index) => {
			const cut = index < credits.length - 1 ? credit.lastIndexOf(' & ') : -1;
			names.push(cut === -1 ? credit : credit.slice(0, cut));
			if (cut !== -1) rest.push(credit.slice(cut + 3));
		});
		subtitle = rest.join(' & ').replace(/^[\s&,+]+|[\s&,+]+$/g, '') || undefined;
		if (names.length) {
			const [name, outlet] = names.join(' & ').split(/\s+(?:from|of)\s+/);
			guest = { name: name.trim(), ...(outlet && { outlet: outlet.trim() }) };
		}
	}

	return { season, number, bonus, title: title.trim(), subtitle, guest };
}

/** URL slugs: "9-6-three-rounds-of-drano". Exported for tests. */
export function slugify(parts: (string | number | undefined | false)[]): string {
	return (
		parts
			.filter((part) => part !== undefined && part !== false)
			.join(' ')
			.normalize('NFKD')
			.toLowerCase()
			// Keep the point in half episodes ("4-27.5"); drop other points and apostrophes ("J.J.’s").
			.replace(/(\d)\.(?=\d)/g, '$1~')
			.replace(/['’.]/g, '')
			.replace(/[^a-z0-9~]+/g, '-')
			.replace(/~/g, '.')
			.replace(/(^-|-$)/g, '')
	);
}

/** The show notes as plain text, for summaries and meta descriptions. */
function toText(html: string): string {
	return html
		.replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

/** "1:05:53" in seconds. */
function parseDuration(value: string): number {
	return value.split(':').reduce((total, part) => total * 60 + Number(part), 0) || 0;
}

const MISSING_SPACE = /([a-z][.!?])(?=[A-Z])/g;
const CHAPTER = /^((?:\d{1,2}:)?\d{1,2}:\d{2})\b/;

/**
 * Tidies Spotify's show notes: off-site links open in a new tab, empty paragraphs go, missing
 * spaces between sentences come back, and chapter timestamps ("3:20 - Arkansas Recap") become
 * buttons that seek the player (see the episode page).
 */
function rehypeTidyNotes() {
	return (tree: Root) => {
		visit(tree, 'text', (node) => {
			node.value = node.value.replace(MISSING_SPACE, '$1 ');
		});

		visit(tree, 'element', (node: Element, index, parent) => {
			if (node.tagName === 'a') {
				node.properties.target = '_blank';
				node.properties.rel = ['noopener', 'noreferrer'];
			}
			if (node.tagName !== 'p' || !parent || index === undefined) return;

			const empty = node.children.every(
				(child) =>
					(child.type === 'text' && !child.value.trim()) ||
					(child.type === 'element' && child.tagName === 'br')
			);
			if (empty) {
				parent.children.splice(index, 1);
				return index;
			}

			const [first] = node.children;
			const chapter = first?.type === 'text' ? CHAPTER.exec(first.value.trimStart()) : null;
			if (first?.type === 'text' && chapter) {
				first.value = first.value.trimStart().slice(chapter[1].length);
				node.children.unshift({
					type: 'element',
					tagName: 'button',
					properties: { type: 'button', dataSeek: parseDuration(chapter[1]) },
					children: [{ type: 'text', value: chapter[1] }]
				});
			}
		});
	};
}

const notesProcessor = unified()
	.use(rehypeParse, { fragment: true })
	.use(rehypeSanitize)
	.use(rehypeTidyNotes)
	.use(rehypeStringify);

/** The show talks in Central Time: an episode out on a Tuesday evening is Tuesday's. */
const PUBLISHED_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' });

/** Parses the feed into episodes, newest first. Exported for tests. */
export function parseFeed(xml: string): EpisodeWithNotes[] {
	const parser = new XMLParser({
		ignoreAttributes: false,
		parseTagValue: false,
		isArray: (name) => name === 'item'
	});
	const feed = v.parse(FeedSchema, parser.parse(xml));
	const slugs = new Set<string>();

	// Slugs are handed out oldest first, so an episode's address never changes when a later
	// one repeats its title: the newcomer gets the date on the end.
	return feed.rss.channel.item
		.toReversed()
		.map((raw) => {
			const item = v.parse(ItemSchema, raw);
			const published = PUBLISHED_DATE.format(new Date(item.pubDate));
			const parsed = parseTitle(item.title, published);
			// Spotify sprinkles invisible word joiners through its show notes.
			const description = item.description.replace(/⁠/g, '');

			let slug = slugify([parsed.season, parsed.number, parsed.bonus && 'bonus', parsed.title]);
			if (slugs.has(slug)) slug = `${slug}-${published}`;
			slugs.add(slug);

			const notes = String(notesProcessor.processSync(description));
			return {
				...parsed,
				slug,
				published,
				duration: parseDuration(item['itunes:duration']),
				summary: truncate(toText(notes), 280),
				audio: item.enclosure['@_url'],
				notes
			};
		})
		.reverse();
}

const CACHE_MS = 5 * 60_000;
/** How long a request waits for a refresh before settling for the stale copy. */
const REFRESH_WAIT_MS = 2_000;
let cached: { at: number; episodes: EpisodeWithNotes[] } | undefined;
/** The fetch in flight, shared by every request that arrives while it runs. */
let loading: Promise<EpisodeWithNotes[]> | undefined;
/** A refresh of an expired copy, settled either way: it never rejects. */
let refreshing: Promise<void> | undefined;

async function fetchFeed(): Promise<EpisodeWithNotes[]> {
	// Well inside the function's own time limit, so a hung feed fails before the request does.
	const signal = AbortSignal.timeout(6_000);
	// The feed's CDN (Fastly) caches it for up to a week and relies on a purge when an episode is
	// published. Nodes that miss the purge serve the old feed for hours. The feed varies on
	// Authorization (which the origin ignores), so a value never sent before skips the CDN's
	// copy. A fixed value wouldn't: Fastly caches it as a copy of its own.
	const authorization = `Basic ${btoa(`:${crypto.randomUUID()}`)}`;
	let response = await fetch(LINKS.rss, { headers: { authorization }, signal });
	// Should the origin ever start checking credentials, the CDN's copy beats no feed at all.
	if (response.status === 401 || response.status === 403) {
		await response.body?.cancel();
		response = await fetch(LINKS.rss, { signal });
	}
	if (!response.ok) throw new Error(`Podcast feed responded ${response.status}`);
	return parseFeed(await response.text());
}

function refresh(): Promise<EpisodeWithNotes[]> {
	loading ??= fetchFeed()
		.then((episodes) => {
			cached = { at: Date.now(), episodes };
			return episodes;
		})
		.finally(() => (loading = undefined));
	return loading;
}

/**
 * Every episode with its show notes, newest first. Cached for a few minutes per instance; once
 * that's up, requests wait briefly for a fresh copy, and get the old one if the feed is slow.
 *
 * Why wait: Netlify's CDN keeps each rendered page for 10 minutes (`cacheEpisodePage`) and
 * serves its stale page while it re-renders. Answering that re-render with a stale copy from
 * here would store it for another 10, stacking the two delays.
 */
async function loadAll(): Promise<EpisodeWithNotes[]> {
	// The first load has nothing to fall back on. If it fails, the next request tries again.
	if (!cached) return refresh();

	if (!refreshing && Date.now() - cached.at >= CACHE_MS) {
		const stale = cached;
		refreshing = refresh()
			.then(
				() => {},
				(error: unknown) => {
					console.error('Failed to refresh the podcast feed:', error);
					// Restarting the clock on the stale copy means a feed outage costs one fetch
					// every few minutes, rather than one per request.
					if (cached === stale) cached = { ...stale, at: Date.now() };
				}
			)
			.finally(() => (refreshing = undefined));
		// Netlify freezes the function as soon as it responds. Without this, a refresh that
		// outlasts the wait never finishes, and the instance serves its old copy for as long as
		// it stays warm.
		getRequestEvent().platform?.context.waitUntil(refreshing);
	}
	if (refreshing) {
		let timer: ReturnType<typeof setTimeout> | undefined;
		await Promise.race([
			refreshing,
			new Promise((resolve) => (timer = setTimeout(resolve, REFRESH_WAIT_MS)))
		]);
		clearTimeout(timer);
	}
	return cached.episodes;
}

const withoutNotes = ({ notes, ...episode }: EpisodeWithNotes): Episode => episode;

/** Every episode, newest first, without show notes (they're only needed on episode pages). */
export async function getEpisodes(): Promise<Episode[]> {
	return (await loadAll()).map(withoutNotes);
}

/** The handful of newest episodes the home and podcast pages lead with. */
export async function getLatestEpisodes(): Promise<Episode[]> {
	return (await getEpisodes()).slice(0, 5);
}

export async function getEpisode(slug: string) {
	const all = await loadAll();
	const index = all.findIndex((episode) => episode.slug === slug);
	if (index === -1) return undefined;

	const episode = all[index];
	return {
		episode,
		// The list is newest first: "previous" is the next-oldest episode.
		previous: all[index + 1] && withoutNotes(all[index + 1]),
		next: all[index - 1] && withoutNotes(all[index - 1]),
		sameSeason: all
			.filter((other) => other.season === episode.season && other.slug !== slug)
			.slice(0, 4)
			.map(withoutNotes)
	};
}

/** The numbering at the start of a slug: "9-6-", "3-21-bonus-" or "2-13-part-1-". */
const SLUG_NUMBERING = /^\d+-\d+(?:\.\d+)?-(?:bonus-)?(?:part-\d+-)?/;

/**
 * An episode whose title has changed keeps its old links working: "9-6-old-title" finds 9-6.
 * Returns the current slug, if any.
 */
export async function findRenamedEpisode(slug: string): Promise<string | undefined> {
	const numbering = SLUG_NUMBERING.exec(slug)?.[0];
	if (!numbering) return undefined;
	return (await loadAll()).find((episode) => SLUG_NUMBERING.exec(episode.slug)?.[0] === numbering)
		?.slug;
}

/** CDN caching for pages built from the feed: fresh for 10 minutes, then refreshed in the background. */
export function cacheEpisodePage(setHeaders: (headers: Record<string, string>) => void) {
	setHeaders({
		'cache-control': 'public, max-age=0, must-revalidate',
		'netlify-cdn-cache-control': 'public, durable, s-maxage=600, stale-while-revalidate=604800'
	});
}

/**
 * The episodes a guest appeared on (see `#lib/guests.ts` for the reference format), newest
 * first, whatever order they're listed in.
 */
export function resolveAppearances(episodes: Episode[], refs: string[]): Episode[] {
	const found = refs.flatMap((ref) => {
		const matches = episodes.filter(
			({ slug, season, number, bonus }) =>
				ref === slug || ref === `${season}-${number}${bonus ? 'b' : ''}`
		);
		if (matches.length !== 1) {
			console.warn(
				matches.length
					? `The guest appearance "${ref}" matches more than one episode; use its slug`
					: `No episode matches the guest appearance "${ref}"`
			);
		}
		return matches.slice(0, 1);
	});
	// ISO dates sort as strings; the sort is stable, so same-day episodes keep their order.
	return found.toSorted((a, b) => b.published.localeCompare(a.published));
}
