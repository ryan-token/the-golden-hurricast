<!--
	@component
	A section's display heading with an optional lede and a link to more, aligned to the right
	on wide screens.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLink from '#lib/components/ArrowLink.svelte';

	interface Props {
		/** Lets the section reference its heading with `aria-labelledby`. */
		id: string;
		children: Snippet;
		lede?: string;
		more?: { href: string; label: string };
		class?: string;
	}

	let { id, children, lede, more, class: className }: Props = $props();
</script>

<div class={['mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-4', className]}>
	<div class="max-w-3xl">
		<h2 {id} class="display text-d2">{@render children()}</h2>
		{#if lede}
			<p class="mt-3 text-lead text-muted">{lede}</p>
		{/if}
	</div>
	{#if more}
		<ArrowLink href={more.href}>{more.label}</ArrowLink>
	{/if}
</div>
