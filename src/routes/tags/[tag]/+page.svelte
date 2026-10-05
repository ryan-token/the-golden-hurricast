<script lang="ts">
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

<div class="mx-auto max-w-content px-4 pt-12 pb-12 sm:px-8 sm:pt-16">
	<h1 class="mb-6 text-h2">Posts about {data.tag}</h1>
	<p>These are all of the posts we've ever written that relate to {data.tag}:</p>
	<hr />
	<ul class="list-disc pl-8 leading-relaxed">
		{#each data.posts as post (post.slug)}
			<li>
				<a href={post.path} class="text-lg font-bold">{post.title}</a>
				<span class="text-muted">
					· <time datetime={post.published}>{post.displayDate}</time>
				</span>
			</li>
		{/each}
	</ul>
	<p class="mt-8"><a href="/tags/">← All tags</a></p>
</div>
