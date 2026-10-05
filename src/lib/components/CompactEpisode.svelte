<!--
	@component
	A one-line episode with a small play button, for lists inside sheets and sidebars.
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
	}

	let { episode }: Props = $props();
</script>

<div class="flex items-center gap-3 py-3">
	<PlayButton {episode} size="sm" />
	<div class="min-w-0 flex-1 leading-snug">
		<a
			href={episodePath(episode.slug)}
			class="block truncate font-semibold text-heading hover:underline"
		>
			{episode.title}
		</a>
		<p class="text-sm text-muted">
			{episodeLabel(episode)} ·
			<time datetime={episode.published}>{formatDate(episode.published)}</time>
			· {formatDuration(episode.duration)}
		</p>
	</div>
</div>
