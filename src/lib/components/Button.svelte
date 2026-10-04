<!--
	@component
	A button, or a link styled as one when `href` is set.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'outline-primary' | 'outline-dark';

	type Props = { variant?: Variant; children: Snippet } & (
		({ href: string } & HTMLAnchorAttributes) | ({ href?: undefined } & HTMLButtonAttributes)
	);

	let { variant = 'primary', children, class: className, ...rest }: Props = $props();

	const classes = $derived([
		'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-base no-underline transition-colors',
		'disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
		{
			'border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover hover:text-white':
				variant === 'primary',
			'border-primary text-primary hover:bg-primary hover:text-white':
				variant === 'outline-primary',
			'border-ink text-ink hover:bg-ink hover:text-white': variant === 'outline-dark'
		},
		className
	]);
</script>

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render children()}</a>
{:else}
	<button class={classes} type="button" {...rest as HTMLButtonAttributes}
		>{@render children()}</button
	>
{/if}
