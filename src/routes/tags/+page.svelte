<script lang="ts">
	import PageHeader from '#lib/components/PageHeader.svelte';
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

<PageHeader title="Tags" back={{ href: '/blog/', label: 'Hurc’s Corner' }}>
	{#snippet lead()}
		Every topic we wrote about on the blog.
	{/snippet}
</PageHeader>

<ul class="page flex flex-wrap gap-2 pb-16 sm:pb-20">
	{#each data.tags as tag (tag)}
		<li>
			<a
				href="/tags/{encodeURIComponent(tag)}/"
				class="inline-flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 font-semibold text-heading transition-colors hover:border-heading"
			>
				{tag}
			</a>
		</li>
	{/each}
</ul>
