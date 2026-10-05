<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { blogPosting, breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
</script>

<Seo
	title={post.title}
	description={post.excerpt}
	type="article"
	publishedTime={post.published}
	jsonLd={[
		blogPosting({
			title: post.title,
			description: post.excerpt,
			path: post.path,
			authors: post.authors,
			published: post.published
		}),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Blog', path: '/blog/' },
			{ name: post.title, path: post.path }
		])
	]}
/>

<article class="mx-auto max-w-[650px] px-[30px] pt-14 pb-16 sm:px-0">
	<header class="mb-8">
		<h1 class="mb-3 text-[2.5rem] font-bold">{post.title}</h1>
		<p class="text-muted">
			By: {post.authors.join(', ')}
			<br />
			Date: <time datetime={post.published}>{post.displayDate}</time>
		</p>
	</header>

	<div class="prose prose-lg max-w-none prose-img:mx-auto prose-video:mx-auto">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered at build time from our own markdown -->
		{@html post.html}
	</div>

	{#if data.previous || data.next}
		<nav aria-label="More posts" class="mt-16 flex justify-between gap-4 border-t border-line pt-6">
			<div>
				{#if data.previous}
					<a href={data.previous.path} rel="prev">← {data.previous.title}</a>
				{/if}
			</div>
			<div class="text-right">
				{#if data.next}
					<a href={data.next.path} rel="next">{data.next.title} →</a>
				{/if}
			</div>
		</nav>
	{/if}
</article>
