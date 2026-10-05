import { imageSizeFromFile } from 'image-size/fromFile';
import type { Element, Root } from 'hast';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { SITE } from '#lib/site.js';

/**
 * Tunes post media for performance and layout stability:
 * - images get intrinsic `width`/`height` (read from `static/`) plus lazy loading
 * - videos only preload metadata
 * - off-site links open in a new tab
 */
function rehypeMedia() {
	return async (tree: Root) => {
		const images: Element[] = [];

		visit(tree, 'element', (node) => {
			const props = node.properties;

			if (node.tagName === 'img') {
				props.loading = 'lazy';
				props.decoding = 'async';
				images.push(node);
			} else if (node.tagName === 'video') {
				props.preload = 'metadata';
				props.playsInline = true;
			} else if (node.tagName === 'a' && typeof props.href === 'string') {
				const url = new URL(props.href, SITE.url);
				if (url.origin !== SITE.url && url.protocol.startsWith('http')) {
					props.target = '_blank';
					props.rel = ['noopener', 'noreferrer'];
				}
			}
		});

		await Promise.all(
			images.map(async (node) => {
				const src = node.properties.src;
				if (typeof src !== 'string' || !src.startsWith('/')) return;
				const { width, height } = await imageSizeFromFile(`static${decodeURI(src)}`);
				node.properties.width = width;
				node.properties.height = height;
			})
		);
	};
}

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeSlug)
	.use(rehypeMedia)
	.use(rehypeStringify);

/** Renders trusted (repo-authored) markdown to HTML. Raw HTML in the source is kept. */
export async function renderMarkdown(markdown: string): Promise<string> {
	return String(await processor.process(markdown));
}
