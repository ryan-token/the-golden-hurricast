<!--
	@component
	The docked player. Lives in the root layout so audio keeps playing between pages, and
	remembers where you were so a reload can pick up again.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Crest from '#lib/components/Crest.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Scrubber from '#lib/components/Scrubber.svelte';
	import { episodeLabel, episodePath, formatClock } from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';
	import { SITE } from '#lib/site.js';

	const player = getPlayer();

	const progress = $derived(player.duration ? (player.currentTime / player.duration) * 100 : 0);

	onMount(() => {
		const saved = player.saved();
		if (saved && !player.episode) player.load(saved.episode, saved.at);
	});

	// Save every five seconds of playback, and whenever it's paused or played. The derived value
	// only changes every five seconds, so the effect doesn't run on every `timeupdate`.
	const checkpoint = $derived(Math.floor(player.currentTime / 5));
	$effect(() => {
		void checkpoint;
		void player.paused;
		untrack(() => player.save());
	});

	// Lock screen, Control Center, and hardware media keys.
	$effect(() => {
		const episode = player.episode;
		if (!episode || !('mediaSession' in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: episode.title,
			artist: SITE.name,
			album: episodeLabel(episode),
			artwork: [{ src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }]
		});
		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			['play', () => player.audio?.play().catch(() => {})],
			['pause', () => player.audio?.pause()],
			['seekbackward', () => player.skip(-15)],
			['seekforward', () => player.skip(30)],
			['seekto', ({ seekTime }) => seekTime !== undefined && player.seek(seekTime)]
		];
		for (const [action, handler] of handlers)
			navigator.mediaSession.setActionHandler(action, handler);
		return () => {
			for (const [action] of handlers) navigator.mediaSession.setActionHandler(action, null);
		};
	});
</script>

<audio
	bind:this={player.audio}
	bind:paused={player.paused}
	bind:currentTime={player.currentTime}
	bind:duration={null, (duration) => Number.isFinite(duration) && (player.duration = duration)}
	preload="none"
></audio>

{#if player.episode}
	{@const episode = player.episode}
	<aside
		aria-label="Now playing"
		class="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-3xl animate-rise rounded-xl bg-player p-2 text-on-chrome shadow-float ring-1 ring-player-edge [view-transition-name:player] sm:p-2.5"
	>
		<div class="flex items-center gap-3">
			<div class="relative shrink-0">
				<Crest class="size-11 ring-0! sm:size-12" sizes="48px" />
				{#if !player.paused}
					<span
						class="absolute -right-1 -bottom-1 flex h-5 items-end gap-px rounded-sm bg-red px-1 py-1"
						aria-hidden="true"
					>
						{#each [0, 1, 2] as bar (bar)}
							<span
								class="w-0.5 origin-bottom animate-eq rounded-full bg-white"
								style:height="100%"
								style:animation-delay="{bar * -260}ms"
							></span>
						{/each}
					</span>
				{/if}
			</div>

			<a href={episodePath(episode.slug)} class="min-w-0 flex-1 leading-tight">
				<span class="block text-xs font-semibold text-gold">{episodeLabel(episode)}</span>
				<span class="block truncate font-semibold">{episode.title}</span>
			</a>

			<div
				class="hidden min-w-0 flex-[1.4] items-center gap-3 text-xs text-on-chrome-muted sm:flex"
			>
				<span class="w-12 text-right">{formatClock(player.currentTime)}</span>
				<Scrubber fallbackDuration={episode.duration} class="flex-1" />
				<span class="w-12">{formatClock(player.duration || episode.duration)}</span>
			</div>

			<div class="flex items-center">
				<button
					type="button"
					onclick={() => player.skip(-15)}
					aria-label="Back 15 seconds"
					class="hidden size-11 place-items-center rounded-full text-on-chrome-muted hover:text-white sm:grid"
				>
					<Icon name="back15" class="size-6" />
				</button>
				<button
					type="button"
					onclick={() => player.toggle(episode)}
					aria-label={player.paused ? 'Play' : 'Pause'}
					class="grid size-11 place-items-center rounded-full bg-gold text-night transition-transform active:scale-95"
				>
					<Icon name={player.paused ? 'play' : 'pause'} class="size-5" />
				</button>
				<button
					type="button"
					onclick={() => player.skip(30)}
					aria-label="Forward 30 seconds"
					class="hidden size-11 place-items-center rounded-full text-on-chrome-muted hover:text-white sm:grid"
				>
					<Icon name="forward30" class="size-6" />
				</button>
				<button
					type="button"
					onclick={() => player.close()}
					aria-label="Close player"
					class="grid size-11 place-items-center rounded-full text-on-chrome-muted hover:text-white"
				>
					<Icon name="close" class="size-5" />
				</button>
			</div>
		</div>

		<!-- Phones get a thin progress line instead of the scrubber; the episode page has a full one. -->
		<div
			class="mx-2 mt-2 h-0.5 overflow-hidden rounded-full bg-white/20 sm:hidden"
			aria-hidden="true"
		>
			<div class="h-full origin-left bg-gold" style:scale="{progress / 100} 1"></div>
		</div>
	</aside>
{/if}
