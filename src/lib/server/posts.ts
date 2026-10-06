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

/** A post's metadata, plus its Markdown body for rendering on demand. */
type Source = PostSummary & { sortKey: string; body: string };

function parsePost(file: string, source: string): Source {
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
		body: source.slice(match[0].length)
	};
}

/** Every post's metadata, newest first. Parsed once. */
const posts: Source[] = Object.entries(sources)
	.map(([file, source]) => parsePost(file, source))
	.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

/**
 * Post metadata without the body, for listings. It never renders Markdown, so it also works in
 * the server function (the sitemap), where `static/` isn't on disk for reading image sizes.
 */
export async function getPostSummaries(): Promise<PostSummary[]> {
	return posts.map(({ sortKey, body, ...summary }) => summary);
}

/** One post, rendered. Only prerendered pages call this: rendering reads image sizes from `static/`. */
export async function getPost(slug: string): Promise<Post | undefined> {
	const source = posts.find((post) => post.slug === slug);
	if (!source) return undefined;
	const { sortKey, body, ...summary } = source;
	return { ...summary, html: await renderMarkdown(body) };
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
