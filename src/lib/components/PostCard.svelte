<!--
	@component
	A blog post teaser: title, date and excerpt. The whole card is clickable (the title link
	is stretched over it), but only the title is announced as the link.
-->
<script lang="ts">
	import type { PostSummary } from '#lib/server/posts.js';

	interface Props {
		post: Pick<PostSummary, 'path' | 'title' | 'excerpt' | 'displayDate' | 'published'>;
		/** Heading level for the title, to fit the surrounding document outline. */
		headingLevel?: 2 | 3 | 4;
	}

	let { post, headingLevel = 3 }: Props = $props();
</script>

<article
	class="relative h-full rounded-lg border border-line bg-surface p-5 transition-[border-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent"
>
	<p class="text-sm text-muted"><time datetime={post.published}>{post.displayDate}</time></p>
	<svelte:element
		this={`h${headingLevel}`}
		class="mt-1 text-lg leading-snug font-bold text-heading"
	>
		<a href={post.path} class="stretched-link focus-ring-none">{post.title}</a>
	</svelte:element>
	<p class="mt-2 text-[0.9375rem] text-muted">{post.excerpt}</p>
</article>
