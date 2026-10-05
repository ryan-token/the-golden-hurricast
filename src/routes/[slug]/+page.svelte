<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
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

<article class="page pt-10 pb-16 sm:pt-14 sm:pb-20">
	<div class="mx-auto max-w-176">
		<header class="mb-10">
			<a
				href="/blog/"
				class="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-link"
			>
				<Icon name="back" class="size-4" /> Hurc’s Corner
			</a>
			<h1 class="display text-d1">{post.title}</h1>
			<p class="mt-4 text-muted">
				By {post.authors.join(' & ')} · <time datetime={post.published}>{post.displayDate}</time>
			</p>
		</header>

		<div
			class="prose prose-lg max-w-none prose-img:mx-auto prose-img:rounded-lg prose-video:mx-auto"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered at build time from our own markdown -->
			{@html post.html}
		</div>

		{#if data.previous || data.next}
			<nav
				aria-label="More posts"
				class="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
			>
				{#if data.previous}
					<a
						href={data.previous.path}
						rel="prev"
						class="rounded-lg border border-line bg-surface p-4 hover:border-line-strong"
					>
						<span class="text-sm text-muted">Previous</span>
						<span class="block font-semibold text-heading">{data.previous.title}</span>
					</a>
				{/if}
				{#if data.next}
					<a
						href={data.next.path}
						rel="next"
						class="rounded-lg border border-line bg-surface p-4 text-right hover:border-line-strong sm:col-start-2"
					>
						<span class="text-sm text-muted">Next</span>
						<span class="block font-semibold text-heading">{data.next.title}</span>
					</a>
				{/if}
			</nav>
		{/if}
	</div>
</article>
