<!--
	@component
	The top of a page: an optional link back up, the title and a lead paragraph.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';

	interface Props {
		title: string;
		/** A link to the parent page, e.g. Podcast above Every episode. */
		back?: { href: string; label: string };
		lead?: Snippet;
		/** Actions under the lead. */
		children?: Snippet;
	}

	let { title, back, lead, children }: Props = $props();
</script>

<header class={['page pb-10', back ? 'pt-10 sm:pt-14' : 'pt-14 sm:pt-20']}>
	{#if back}
		<a
			href={back.href}
			class="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-link"
		>
			<Icon name="back" class="size-4" />
			{back.label}
		</a>
	{/if}
	<h1 class="max-w-4xl display text-d1">{title}</h1>
	{#if lead}
		<p class="mt-5 max-w-2xl text-lead">{@render lead()}</p>
	{/if}
	{#if children}
		<div class="mt-8 flex flex-wrap gap-3">{@render children()}</div>
	{/if}
</header>
