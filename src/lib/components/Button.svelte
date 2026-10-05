<!--
	@component
	A button, or a link styled as one when `href` is set.
-->
<script lang="ts" module>
	export type ButtonVariant = 'primary' | 'gold' | 'quiet' | 'on-blue';
	export type ButtonSize = 'sm' | 'md' | 'lg';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = { variant?: ButtonVariant; size?: ButtonSize; children: Snippet } & (
		({ href: string } & HTMLAnchorAttributes) | ({ href?: undefined } & HTMLButtonAttributes)
	);

	let { variant = 'primary', size = 'md', children, class: className, ...rest }: Props = $props();

	const classes = $derived([
		'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap',
		'transition-[background-color,border-color,color,scale] duration-150 active:scale-[0.97]',
		'disabled:pointer-events-none disabled:opacity-45',
		{
			sm: 'h-9 px-4 text-sm',
			md: 'h-11 px-5 text-[0.9375rem]',
			lg: 'h-13 px-6 text-base'
		}[size],
		{
			primary: 'bg-accent text-on-accent hover:bg-accent-hover',
			gold: 'bg-gold text-night hover:bg-gold-light',
			quiet: 'border border-line-strong bg-surface text-heading hover:border-heading',
			'on-blue': 'border border-white/35 text-white hover:border-white hover:bg-white/10'
		}[variant],
		className
	]);
</script>

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render children()}</a>
{:else}
	<button class={classes} type="button" {...rest as HTMLButtonAttributes}>
		{@render children()}
	</button>
{/if}
