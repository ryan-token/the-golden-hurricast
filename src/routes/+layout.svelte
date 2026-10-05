<script lang="ts">
	import './layout.css';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import font from '#lib/assets/fonts/big-shoulders-display-latin.woff2?url';
	import MiniPlayer from '#lib/components/MiniPlayer.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { Player, setPlayer } from '#lib/player.svelte.js';
	import { syncTheme } from '#lib/theme.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const player = setPlayer(new Player());

	onMount(syncTheme);

	onNavigate((navigation) => {
		if (
			!document.startViewTransition ||
			navigation.from?.url.pathname === navigation.to?.url.pathname
		) {
			return;
		}

		// An episode's number glides from the list into the episode page's header.
		const slug = navigation.to?.params?.slug;
		if (slug && navigation.to?.route.id === '/podcast/episodes/[slug]') {
			const numeral = document.querySelector<HTMLElement>(`[data-numeral="${CSS.escape(slug)}"]`);
			if (numeral) numeral.style.viewTransitionName = 'episode-numeral';
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="preload" href={font} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-night"
>
	Skip to content
</a>

<SiteHeader />

<main id="main">
	{@render children()}
</main>

<div class={['bg-chrome', player.episode && 'pb-24']}>
	<SiteFooter />
</div>

<MiniPlayer />
