<!--
	@component
	A seek bar for the player: a native range input with a gold fill. Sits on blue chrome.
-->
<script lang="ts">
	import { formatClock } from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';

	interface Props {
		/** The episode's duration from the feed, until the audio reports its own. */
		fallbackDuration: number;
		class?: string;
	}

	let { fallbackDuration, class: className }: Props = $props();

	const player = getPlayer();

	const max = $derived(player.duration || fallbackDuration);
	const progress = $derived(max ? (player.currentTime / max) * 100 : 0);
</script>

<input
	type="range"
	min="0"
	{max}
	step="1"
	value={player.currentTime}
	oninput={(event) => player.seek(event.currentTarget.valueAsNumber)}
	aria-label="Seek"
	aria-valuetext="{formatClock(player.currentTime)} of {formatClock(max)}"
	class={['scrubber', className]}
	style:--progress="{progress}%"
/>

<style>
	.scrubber {
		--track: linear-gradient(
			to right,
			var(--color-gold) var(--progress),
			rgb(255 255 255 / 0.22) var(--progress)
		);
		appearance: none;
		height: 1.5rem;
		background: transparent;
		cursor: pointer;
	}
	.scrubber::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 999px;
		background: var(--track);
	}
	.scrubber::-moz-range-track {
		height: 4px;
		border-radius: 999px;
		background: var(--track);
	}
	.scrubber::-webkit-slider-thumb {
		appearance: none;
		margin-top: -5px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #fff;
		transition: scale 150ms;
	}
	.scrubber::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 0;
		border-radius: 50%;
		background: #fff;
	}
	.scrubber:active::-webkit-slider-thumb {
		scale: 1.25;
	}
</style>
