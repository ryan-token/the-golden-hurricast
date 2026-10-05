import * as v from 'valibot';
import { parse as parseYaml } from 'yaml';
import { renderMarkdown } from './markdown.js';

/** Frontmatter as authored in `src/content/posts/*.md`. */
const Frontmatter = v.object({
	/** Public URL path, e.g. `/a-spartan-recap`. */
	path: v.pipe(v.string(), v.startsWith('/')),
	/** Display date, `MM/DD/YYYY`. */
	date: v.pipe(v.string(), v.regex(/^\d{2}\/\d{2}\/\d{4}$/)),
	/** Sort key, `YYYY/MM/DD`. */
	sortDate: v.pipe(v.string(), v.regex(/^\d{4}\/\d{2}\/\d{2}$/)),
	title: v.string(),
	/** Comma-separated author names. */
	authors: v.string(),
	excerpt: v.string(),
	tags: v.optional(v.array(v.string()), [])
});

export interface PostSummary {
	slug: string;
	/** Canonical path with trailing slash, e.g. `/a-spartan-recap/`. */
	path: string;
	title: string;
	excerpt: string;
	authors: string[];
	tags: string[];
	/** Date as displayed on the site, `MM/DD/YYYY`. */
	displayDate: string;
	/** ISO 8601 date (`YYYY-MM-DD`) the post was published. */
	published: string;
}

export interface Post extends PostSummary {
	html: string;
}

const sources = import.meta.glob<string>('/src/content/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

async function parsePost(file: string, source: string): Promise<Post & { sortKey: string }> {
	const match = FRONTMATTER.exec(source);
	if (!match) throw new Error(`${file}: missing frontmatter`);

	const result = v.safeParse(Frontmatter, parseYaml(match[1]));
	if (!result.success) {
		throw new Error(`${file}: invalid frontmatter\n${v.summarize(result.issues)}`);
	}

	const fm = result.output;
	const slug = fm.path.slice(1);
	const [month, day, year] = fm.date.split('/');

	return {
		slug,
		path: `/${slug}/`,
		title: fm.title,
		excerpt: fm.excerpt,
		authors: fm.authors.split(',').map((name) => name.trim()),
		tags: fm.tags,
		displayDate: fm.date,
		published: `${year}-${month}-${day}`,
		sortKey: fm.sortDate,
		html: await renderMarkdown(source.slice(match[0].length))
	};
}

let cache: Promise<Post[]> | undefined;

/** All posts, newest first. Parsed once per build. */
export function getPosts(): Promise<Post[]> {
	cache ??= Promise.all(
		Object.entries(sources).map(([file, source]) => parsePost(file, source))
	).then((posts) =>
		posts.sort((a, b) => b.sortKey.localeCompare(a.sortKey)).map(({ sortKey, ...post }) => post)
	);
	return cache;
}

/** Post metadata without the rendered body, for listings. */
export async function getPostSummaries(): Promise<PostSummary[]> {
	return (await getPosts()).map(({ html, ...summary }) => summary);
}

export async function getPost(slug: string): Promise<Post | undefined> {
	return (await getPosts()).find((post) => post.slug === slug);
}

/** Every tag with its posts (newest first), tags sorted alphabetically. */
export async function getTags(): Promise<Map<string, PostSummary[]>> {
	const byTag = new Map<string, PostSummary[]>();
	for (const post of await getPostSummaries()) {
		for (const tag of post.tags) {
			byTag.set(tag, [...(byTag.get(tag) ?? []), post]);
		}
	}
	return new Map([...byTag].sort(([a], [b]) => a.localeCompare(b)));
}
