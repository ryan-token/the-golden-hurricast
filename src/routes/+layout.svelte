<script lang="ts">
	import './layout.css';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2"
>
	Skip to content
</a>

<SiteHeader />

<main id="main">
	{@render children()}
</main>
