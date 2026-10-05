<!--
	@component
	The show's crest on a white disc with a gold ring. The artwork is drawn on white, and its
	navy outlines need a light ground to stay legible in dark mode.
-->
<script lang="ts">
	import large from '#lib/assets/crest.jpg?w=480;720;960&enhanced';
	import small from '#lib/assets/crest.jpg?w=64;128;192&enhanced';

	interface Props {
		/** `sm` for the nav and footer (up to 96px), `lg` for heroes. */
		size?: 'sm' | 'lg';
		/** Rendered width, for the browser's image choice, e.g. "(min-width: 64rem) 26rem, 70vw". */
		sizes?: string;
		/** Describe the artwork where the crest carries meaning; decorative otherwise. */
		alt?: string;
		priority?: boolean;
		class?: string;
	}

	let {
		size = 'sm',
		sizes = '48px',
		alt = '',
		priority = false,
		class: className
	}: Props = $props();
</script>

<span
	class={[
		'block aspect-square overflow-hidden rounded-full bg-white ring-gold',
		size === 'sm' ? 'ring-2' : 'ring-[clamp(6px,1vw,10px)]',
		className
	]}
>
	<enhanced:img
		src={size === 'sm' ? small : large}
		{alt}
		{sizes}
		fetchpriority={priority ? 'high' : undefined}
		loading={priority ? 'eager' : 'lazy'}
		decoding="async"
		class="size-full scale-[1.04] object-cover"
	/>
</span>
