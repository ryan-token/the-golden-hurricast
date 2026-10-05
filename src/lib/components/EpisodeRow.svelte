<!--
	@component
	One episode in a list: its number set like a jersey numeral, the title (the whole card links
	to the episode page), and a play button.
-->
<script lang="ts">
	import PlayButton from '#lib/components/PlayButton.svelte';
	import {
		episodeLabel,
		episodePath,
		formatDate,
		formatDuration,
		type Episode
	} from '#lib/episodes.js';

	interface Props {
		episode: Episode;
		/** Show the season above the number (lists that span seasons). */
		showSeason?: boolean;
		headingLevel?: 2 | 3;
	}

	let { episode, showSeason = true, headingLevel = 3 }: Props = $props();
</script>

<article
	class="group relative flex items-center gap-4 rounded-lg border border-line bg-surface p-3 transition-[translate,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift sm:gap-5 sm:p-4"
>
	<div
		data-numeral={episode.slug}
		aria-hidden="true"
		class="flex size-16 shrink-0 flex-col items-center justify-center self-start rounded-md bg-tile font-display leading-none font-extrabold text-on-tile sm:size-20"
	>
		{#if episode.number === undefined}
			<span class="text-2xl sm:text-3xl">SP</span>
		{:else}
			{#if showSeason}<span class="text-xs font-bold opacity-70 sm:text-sm">S{episode.season}</span
				>{/if}
			<span class="text-4xl sm:text-5xl">{episode.number}</span>
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<p class="text-sm text-muted">
			<span class="sr-only">{episodeLabel(episode)}, </span>
			<time datetime={episode.published}>{formatDate(episode.published)}</time> · {formatDuration(
				episode.duration
			)}
		</p>
		<svelte:element
			this={`h${headingLevel}`}
			class="mt-0.5 text-lg leading-snug font-bold text-heading"
		>
			<a href={episodePath(episode.slug)} class="stretched-link focus-ring-none">
				{episode.title}
			</a>
		</svelte:element>
		{#if episode.subtitle}
			<p class="text-[0.9375rem] font-semibold text-heading/80">{episode.subtitle}</p>
		{/if}
		<p class="mt-1 line-clamp-2 text-[0.9375rem] text-muted sm:line-clamp-1">{episode.summary}</p>
		{#if episode.guest}
			<p class="mt-1 text-sm">
				<span class="font-semibold text-heading">with {episode.guest.name}</span
				>{#if episode.guest.outlet}<span class="text-muted">, {episode.guest.outlet}</span>{/if}
			</p>
		{/if}
	</div>

	<PlayButton {episode} class="relative z-10" />
</article>

<style>
	/* The card shows keyboard focus for its stretched link. */
	article:has(a:focus-visible) {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
