<script lang="ts">
	import ArrowLink from '#lib/components/ArrowLink.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo
	title="Blog"
	description="Hurc's Corner, The Golden Hurricast's blog from 2019 to 2024: stats deep dives, TU history, and Golden Hurricane milestones."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Blog', path: '/blog/' }
	])}
/>

<PageHeader title="Hurc’s Corner">
	{#snippet lead()}
		Our blog from 2019 to 2024: stat deep dives, TU history, and milestones along the way. Our
		occasional writing lives on Patreon now, but these posts stay up for the record.
	{/snippet}
	<ArrowLink href={LINKS.patreon} target="_blank" rel="noopener">Read us on Patreon</ArrowLink>
	<ArrowLink href="/tags/">Browse posts by tag</ArrowLink>
</PageHeader>

<section aria-labelledby="all-posts" class="page pb-16 sm:pb-20">
	<h2 id="all-posts" class="sr-only">All posts</h2>
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.posts as post (post.slug)}
			<li><PostCard {post} /></li>
		{/each}
	</ul>
</section>
