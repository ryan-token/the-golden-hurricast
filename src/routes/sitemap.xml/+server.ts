import { getPostSummaries, getTags } from '#lib/server/posts.js';
import { absoluteUrl } from '#lib/site.js';
import type { RequestHandler } from './$types';

export const prerender = true;

/** Indexable pages that aren't blog posts or tag pages. */
const PAGES = ['/', '/podcast/', '/blog/', '/about/', '/support/', '/merch/', '/tags/'];

export const GET: RequestHandler = async () => {
	const [posts, tags] = await Promise.all([getPostSummaries(), getTags()]);

	const entries: { path: string; lastmod?: string }[] = [
		...PAGES.map((path) => ({ path })),
		...[...tags.keys()].map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/` })),
		...posts.map(({ path, published }) => ({ path, lastmod: published }))
	];

	const urls = entries
		.map(({ path, lastmod }) => {
			const loc = `<loc>${escapeXml(absoluteUrl(path))}</loc>`;
			return `\t<url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
		})
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'content-type': 'application/xml' } }
	);
};

function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
