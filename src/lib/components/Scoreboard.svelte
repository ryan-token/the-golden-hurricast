<!--
	@component
	The latest episode, set like a scoreboard: season and episode in big gold numerals, the
	title, and a way to play it.
-->
<script lang="ts">
	import ArrowLink from '#lib/components/ArrowLink.svelte';
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { episodePath, formatDate, formatDuration, type Episode } from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';

	interface Props {
		episode: Episode;
	}

	let { episode }: Props = $props();

	const player = getPlayer();
	const playing = $derived(player.isPlaying(episode.slug));
</script>

<article
	aria-labelledby="scoreboard-title"
	class="overflow-hidden rounded-xl bg-royal text-white shadow-lift dark:bg-chrome-raised"
>
	<p class="flex justify-between gap-4 border-b border-white/15 px-5 py-3 text-sm">
		<span class="font-semibold">Latest episode</span>
		<span class="text-on-chrome-muted">
			<time datetime={episode.published}>{formatDate(episode.published)}</time> · {formatDuration(
				episode.duration
			)}
		</span>
	</p>

	<div class="flex items-center gap-5 px-5 py-5 sm:gap-6">
		{#if episode.number !== undefined}
			<p class="sr-only">Season {episode.season}, episode {episode.number}</p>
			<p
				data-numeral={episode.slug}
				class="flex shrink-0 items-baseline font-display leading-[0.8] font-black text-gold"
				aria-hidden="true"
			>
				<span class="text-6xl sm:text-7xl">{episode.season}</span>
				<span class="mx-1 text-3xl text-white/40">·</span>
				<span class="text-6xl sm:text-7xl">{episode.number}</span>
			</p>
		{/if}
		<div class="min-w-0 border-l border-white/15 pl-5 sm:pl-6">
			<h2
				id="scoreboard-title"
				class="font-display text-[1.75rem] leading-none font-extrabold text-balance"
			>
				<a href={episodePath(episode.slug)}>{episode.title}</a>
			</h2>
			{#if episode.subtitle || episode.guest}
				<p class="mt-2 text-sm text-on-chrome-muted">
					{[episode.subtitle, episode.guest && `with ${episode.guest.name}`]
						.filter(Boolean)
						.join(' · ')}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 pb-5">
		<Button variant="gold" onclick={() => player.toggle(episode)}>
			<Icon name={playing ? 'pause' : 'play'} class="size-4" />
			{playing ? 'Pause' : 'Play episode'}
		</Button>
		<ArrowLink href={episodePath(episode.slug)} class="text-white!">Show notes</ArrowLink>
	</div>
</article>
