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
	class="relative rounded-[5px] border border-line bg-white p-2.5 shadow-card transition-shadow hover:shadow-lg has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary"
>
	<svelte:element this={`h${headingLevel}`} class="text-lg leading-snug font-bold">
		<a href={post.path} class="after:absolute after:inset-0 focus-visible:outline-none">
			{post.title}
		</a>
	</svelte:element>
	<p class="mt-2.5 text-[15px] text-muted">
		<time datetime={post.published}>{post.displayDate}</time>
	</p>
	<p class="mt-2.5 text-[15px] text-muted">{post.excerpt}</p>
</article>
