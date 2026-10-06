<!--
	@component
	The episode page's player. It drives the site player, so playback carries on after you leave
	the page, and it follows along if this episode is already playing.
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Scrubber from '#lib/components/Scrubber.svelte';
	import { episodeLabel, formatClock, type Episode } from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';

	interface Props {
		episode: Episode;
	}

	let { episode }: Props = $props();

	const player = getPlayer();
	const loaded = $derived(player.episode?.slug === episode.slug);
	const playing = $derived(loaded && !player.paused);
</script>

<section
	aria-label="Player"
	class="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-chrome p-4 text-on-chrome shadow-lift sm:flex-nowrap sm:p-5"
>
	<button
		type="button"
		onclick={() => player.toggle(episode)}
		aria-label="{playing ? 'Pause' : 'Play'} {episodeLabel(episode)}"
		class="grid size-16 shrink-0 place-items-center rounded-full bg-gold text-night transition-transform active:scale-95"
	>
		<Icon name={playing ? 'pause' : 'play'} class="size-7" />
	</button>

	<div class="min-w-0 flex-1">
		<p class="truncate font-semibold">{episodeLabel(episode)} · {episode.title}</p>
		{#if loaded}
			<Scrubber fallbackDuration={episode.duration} class="w-full" />
		{:else}
			<!-- Until it's loaded, the bar just shows the length. -->
			<div class="flex h-6 items-center">
				<div class="h-1 w-full rounded-full bg-white/22"></div>
			</div>
		{/if}
		<p class="flex justify-between text-xs text-on-chrome-muted">
			<span>{formatClock(loaded ? player.currentTime : 0)}</span>
			<span>{formatClock(loaded ? player.duration || episode.duration : episode.duration)}</span>
		</p>
	</div>

	{#if loaded}
		<div class="flex gap-1">
			<button
				type="button"
				onclick={() => player.skip(-15)}
				aria-label="Back 15 seconds"
				class="grid size-11 place-items-center rounded-full text-on-chrome-muted hover:bg-white/10 hover:text-white"
			>
				<Icon name="back15" class="size-6" />
			</button>
			<button
				type="button"
				onclick={() => player.skip(30)}
				aria-label="Forward 30 seconds"
				class="grid size-11 place-items-center rounded-full text-on-chrome-muted hover:bg-white/10 hover:text-white"
			>
				<Icon name="forward30" class="size-6" />
			</button>
		</div>
	{/if}
</section>

<noscript>
	<audio controls preload="none" src={episode.audio} class="mt-3 w-full"></audio>
</noscript>
