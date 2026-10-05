<script lang="ts">
	import PageHeader from '#lib/components/PageHeader.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const path = $derived(`/tags/${encodeURIComponent(data.tag)}/`);
</script>

<Seo
	title="Posts about {data.tag}"
	description="Every post on The Golden Hurricast blog about {data.tag}."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Blog', path: '/blog/' },
		{ name: 'Tags', path: '/tags/' },
		{ name: data.tag, path }
	])}
/>

<PageHeader title="Posts about {data.tag}" back={{ href: '/tags/', label: 'All tags' }} />

<ul class="page grid gap-4 pb-16 sm:grid-cols-2 sm:pb-20 lg:grid-cols-3">
	{#each data.posts as post (post.slug)}
		<li><PostCard {post} headingLevel={2} /></li>
	{/each}
</ul>
