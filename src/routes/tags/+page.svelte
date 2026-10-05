<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo
	title="Tags"
	description="Browse The Golden Hurricast blog by topic, from football and basketball to Golden Hurristats."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Blog', path: '/blog/' },
		{ name: 'Tags', path: '/tags/' }
	])}
/>

<div class="mx-auto max-w-content px-4 pt-12 pb-12 sm:px-8 sm:pt-16">
	<h1 class="mb-6 text-h2">Tags</h1>
	<p>Click on any of the tags below to see all the posts we've written about that category.</p>
	<hr />
	<ul class="list-disc pl-8 leading-relaxed">
		{#each data.tags as tag (tag)}
			<li>
				<a href="/tags/{encodeURIComponent(tag)}/" class="text-lg font-bold">{tag}</a>
			</li>
		{/each}
	</ul>
	<p class="mt-8"><a href="/blog/">← All posts</a></p>
</div>
