<!--
	@component
	The grey page header ("jumbotron") at the top of each page.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Lead paragraph under the title. */
		lead?: Snippet;
		/** Anything below the lead (buttons, badges…). */
		children?: Snippet;
		/** Optional background image rendered behind a translucent panel. */
		background?: Snippet;
	}

	let { title, lead, children, background }: Props = $props();
</script>

<header
	class={[
		'relative mb-8 overflow-hidden bg-surface px-4 py-12 sm:px-8',
		background && 'flex min-h-[min(63vh,580px)] items-start bg-ink text-white'
	]}
>
	{@render background?.()}
	<div
		class={[
			'relative mx-auto w-full max-w-5xl',
			background && 'rounded-2xl bg-black/50 p-4 sm:w-3/4'
		]}
	>
		<h1 class="mb-3">{title}</h1>
		{#if lead}
			<p class="mb-4 text-lg">{@render lead()}</p>
		{/if}
		{@render children?.()}
	</div>
</header>
