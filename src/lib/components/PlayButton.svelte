<!--
	@component
	Plays an episode in the site player, or pauses it if it's the one playing.
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { episodeLabel, type Episode } from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';

	interface Props {
		episode: Episode;
		/** `sm` is a quieter tile-coloured button for compact lists. */
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { episode, size = 'md', class: className }: Props = $props();

	const player = getPlayer();
	const playing = $derived(player.isPlaying(episode.slug));
</script>

<button
	type="button"
	onclick={() => player.toggle(episode)}
	aria-label="{playing ? 'Pause' : 'Play'} {episodeLabel(episode)}: {episode.title}"
	class={[
		'grid shrink-0 place-items-center rounded-full transition-[background-color,scale] duration-150 active:scale-95',
		playing
			? 'bg-red text-white'
			: size === 'sm'
				? 'bg-tile text-on-tile hover:bg-accent hover:text-on-accent'
				: 'bg-accent text-on-accent hover:bg-accent-hover',
		{ sm: 'size-9', md: 'size-11', lg: 'size-16' }[size],
		className
	]}
>
	<Icon
		name={playing ? 'pause' : 'play'}
		class={{ sm: 'size-4', md: 'size-5', lg: 'size-7' }[size]}
	/>
</button>
