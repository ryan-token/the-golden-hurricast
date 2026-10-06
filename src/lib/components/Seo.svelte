<!--
	@component
	Per-page `<head>` metadata: title, description, canonical URL, Open Graph, and Twitter cards, and optional JSON-LD structured data.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { SITE, absoluteUrl } from '#lib/site.js';
	import type { JsonLd } from '#lib/structured-data.js';

	interface Props {
		/** Page-specific title, followed by the site name. Without one (the home page), the site name and tagline. */
		title?: string;
		description?: string;
		/** Share image path (site-relative) or absolute URL, 1200×630. Defaults to the site's. */
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article';
		/** ISO 8601 publish date, for articles. */
		publishedTime?: string;
		/** Structured data for this page. */
		jsonLd?: JsonLd | JsonLd[];
		noindex?: boolean;
	}

	let {
		title,
		description = SITE.description,
		image = SITE.ogImage,
		imageAlt = `${SITE.name} logo above the show’s name and “Golden Hurricane talk, every week since 2018”`,
		type = 'website',
		publishedTime,
		jsonLd,
		noindex = false
	}: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`);
	// Search results show about 160 characters; episode summaries run longer.
	const summary = $derived(clip(description, 160));
	const canonical = $derived(absoluteUrl(page.url.pathname));
	const imageUrl = $derived(absoluteUrl(image));

	function clip(text: string, max: number) {
		if (text.length <= max) return text;
		return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
	}

	// One <script> per item: some JSON-LD readers expect an object with `@context`, not an
	// array. `<` is escaped so the JSON can never close the surrounding <script> element.
	// (The closing tag is split so it doesn't end this component's own <script> block.)
	const jsonLdScript = $derived(
		[jsonLd ?? []]
			.flat()
			.map(
				(item) =>
					`<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}<` +
					'/script>'
			)
			.join('')
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={summary} />
	<!-- A page kept out of search has no canonical URL to point at. -->
	{#if noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<link rel="canonical" href={canonical} />
	{/if}

	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title ?? SITE.name} />
	<meta property="og:description" content={summary} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	{#if image === SITE.ogImage}
		<!-- Lets Facebook and LinkedIn lay out the preview before they've fetched the image. -->
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:width" content={String(SITE.ogImageSize.width)} />
		<meta property="og:image:height" content={String(SITE.ogImageSize.height)} />
	{/if}
	<meta property="og:image:alt" content={imageAlt} />
	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={SITE.xHandle} />
	<meta name="twitter:title" content={title ?? SITE.name} />
	<meta name="twitter:description" content={summary} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={imageAlt} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD built from our own data, with `<` escaped -->
	{@html jsonLdScript}
</svelte:head>
