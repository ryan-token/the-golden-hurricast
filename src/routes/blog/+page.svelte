<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const DESCRIPTION =
		"Hurc's Corner. The Golden Hurriblog. Whatever you want to call it, we'll use this to dive deeper into stats, explore TU history, and more.";
</script>

<Seo
	title="Blog"
	description={DESCRIPTION}
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Blog', path: '/blog/' }
	])}
/>

<Hero title="Our Blog">
	{#snippet lead()}
		{DESCRIPTION}
	{/snippet}

	<p>
		You can <a href="/tags/" class="text-primary-hover">browse posts by tag</a>, or view all of our
		posts below.
	</p>
</Hero>

<section aria-labelledby="all-posts" class="mx-auto max-w-content px-4 pb-12 sm:px-8">
	<h2 id="all-posts" class="mb-2 text-h4">All Posts</h2>
	<p class="font-bold">
		This blog has been discontinued. We're primarily writing over on our
		<a href={LINKS.patreon} target="_blank" rel="noopener noreferrer">Patreon</a> now. Check it out!
	</p>
	<hr />

	<ul class="space-y-4">
		{#each data.posts as post (post.slug)}
			<li><PostCard {post} /></li>
		{/each}
	</ul>
</section>
