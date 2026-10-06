<!--
	@component
	A text link with a trailing arrow that nudges on hover, e.g. "All 220 episodes →".
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import Icon from '#lib/components/Icon.svelte';

	type Props = HTMLAnchorAttributes & { href: string; children: Snippet };

	let { children, class: className, ...rest }: Props = $props();

	const external = $derived(rest.target === '_blank');
</script>

<a
	{...rest}
	class={[
		'group/arrow inline-flex items-center gap-1.5 font-semibold text-link decoration-2 underline-offset-4 hover:underline',
		className
	]}
>
	{@render children()}
	<Icon
		name={external ? 'external' : 'arrow'}
		class="size-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5"
	/>
	{#if external}<span class="sr-only">(opens in a new tab)</span>{/if}
</a>
