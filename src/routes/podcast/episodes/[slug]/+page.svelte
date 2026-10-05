<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { archive } from '#lib/archive.svelte.js';
	import BigPlayer from '#lib/components/BigPlayer.svelte';
	import CompactEpisode from '#lib/components/CompactEpisode.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkList from '#lib/components/LinkList.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import {
		episodeLabel,
		episodePath,
		formatDate,
		formatDuration,
		type Episode
	} from '#lib/episodes.js';
	import { getPlayer } from '#lib/player.svelte.js';
	import { LISTEN_ON } from '#lib/site.js';
	import { breadcrumbs, podcastEpisode } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The show notes stay out of the episode handed to the player (which saves it for later).
	const { notes, ...episode } = $derived(data.episode);
	const path = $derived(episodePath(episode.slug));

	const player = getPlayer();

	/**
	 * "All episodes" works like the browser's Back button when the archive is the page before
	 * this one, so the search and scroll position come back as they were. Otherwise it links to
	 * the archive with its last filters.
	 */
	let fromArchive = false;
	afterNavigate(({ from }) => (fromArchive = from?.route.id === '/podcast/episodes'));

	function backToArchive(event: MouseEvent) {
		const newTab =
			event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
		if (!fromArchive || newTab) return;
		event.preventDefault();
		history.back();
	}

	/** Chapter timestamps in the show notes are buttons (see #lib/server/episodes). */
	function chapters(container: HTMLElement) {
		const seek = (event: MouseEvent) => {
			const button = (event.target as Element).closest<HTMLElement>('[data-seek]');
			if (button) player.playFrom(episode, Number(button.dataset.seek));
		};
		container.addEventListener('click', seek);
		return () => container.removeEventListener('click', seek);
	}
	const title = $derived(
		episode.number === undefined
			? episode.title
			: `${episode.season}-${episode.number}: ${episode.title}`
	);
</script>

<Seo
	{title}
	description={episode.summary}
	jsonLd={[
		podcastEpisode({ ...episode, description: episode.summary, path }),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Podcast', path: '/podcast/' },
			{ name: 'Episodes', path: '/podcast/episodes/' },
			{ name: episode.title, path }
		])
	]}
/>

{#snippet pagerTile(direction: 'Previous' | 'Next', other: Episode | undefined)}
	{#if other}
		<a
			href={episodePath(other.slug)}
			rel={direction === 'Previous' ? 'prev' : 'next'}
			class={[
				'group block rounded-lg border border-line bg-surface p-5 transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-line-strong',
				direction === 'Next' && 'text-right'
			]}
		>
			<span class="text-sm text-muted">{direction} · {episodeLabel(other)}</span>
			<span class="mt-1 block font-display text-2xl leading-tight font-extrabold text-heading">
				{other.title}
			</span>
		</a>
	{:else}
		<p class="rounded-lg border border-dashed border-line p-5 text-sm text-muted">
			{direction === 'Next'
				? 'This is the newest episode. You’re all caught up.'
				: 'This is where it all began.'}
		</p>
	{/if}
{/snippet}

<article>
	<header class="bg-sand">
		<div class="page pt-8 pb-10 sm:pt-10 sm:pb-12">
			<a
				href="/podcast/episodes/{archive.search}"
				onclick={backToArchive}
				class="inline-flex items-center gap-1.5 text-sm font-semibold text-link"
			>
				<Icon name="back" class="size-4" /> All episodes
			</a>

			<div class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
				{#if episode.number !== undefined}
					<p class="sr-only">
						Season {episode.season}, {episode.bonus ? 'bonus' : 'episode'}
						{episode.number}
					</p>
					<div
						class="flex shrink-0 items-end gap-4 font-display leading-[0.78] font-black text-heading [view-transition-name:episode-numeral]"
						aria-hidden="true"
					>
						<p class="text-center">
							<span class="block text-[clamp(5rem,14vw,9rem)]">{episode.season}</span>
							<span class="mt-2 block font-sans text-xs leading-none font-semibold text-muted"
								>Season</span
							>
						</p>
						<span class="mb-6 h-[clamp(4rem,11vw,7rem)] w-0.5 bg-gold" aria-hidden="true"></span>
						<p class="text-center">
							<span class="block text-[clamp(5rem,14vw,9rem)]">{episode.number}</span>
							<span class="mt-2 block font-sans text-xs leading-none font-semibold text-muted">
								{episode.bonus ? 'Bonus' : 'Episode'}
							</span>
						</p>
					</div>
				{/if}

				<div class="min-w-0 pb-1">
					<h1 class="display text-d1">{episode.title}</h1>
					{#if episode.subtitle}
						<p class="mt-3 text-lead font-semibold text-heading/80">{episode.subtitle}</p>
					{/if}
					<p class="mt-3 text-sm font-semibold text-muted">
						<time datetime={episode.published}>{formatDate(episode.published)}</time>
						· {formatDuration(episode.duration)}
						{#if episode.guest}· with {episode.guest.name}{/if}
					</p>
				</div>
			</div>

			<div class="mt-8"><BigPlayer {episode} /></div>
		</div>
	</header>

	<div class="page grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
		<section aria-labelledby="notes">
			<h2 id="notes" class="display text-d3">Show notes</h2>
			<div class="notes prose mt-4 max-w-none prose-p:my-3" {@attach chapters}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized in #lib/server/episodes -->
				{@html notes}
			</div>
		</section>

		<aside class="grid content-start gap-8">
			{#if episode.guest}
				<section aria-labelledby="guest" class="rounded-lg border border-line bg-surface p-5">
					<h2 id="guest" class="text-sm font-semibold text-muted">On the mic</h2>
					<p class="mt-1 font-display text-3xl leading-none font-extrabold text-heading">
						{episode.guest.name}
					</p>
					{#if episode.guest.outlet}<p class="mt-1 text-muted">{episode.guest.outlet}</p>{/if}
					<a
						href="/podcast/guests/"
						class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline"
					>
						Everyone who’s been on <Icon name="arrow" class="size-4" />
					</a>
				</section>
			{/if}

			<nav aria-labelledby="listen">
				<h2 id="listen" class="mb-3 text-sm font-semibold text-muted">Listen on</h2>
				<LinkList links={LISTEN_ON} />
			</nav>

			{#if data.sameSeason.length}
				<section aria-labelledby="season">
					<h2 id="season" class="text-sm font-semibold text-muted">
						More from {episode.season === undefined ? 'the specials' : `Season ${episode.season}`}
					</h2>
					<ul class="divide-y divide-line">
						{#each data.sameSeason as other (other.slug)}
							<li><CompactEpisode episode={other} /></li>
						{/each}
					</ul>
				</section>
			{/if}
		</aside>
	</div>

	<nav aria-label="More episodes" class="page grid gap-3 pb-16 sm:grid-cols-2 sm:pb-20">
		{@render pagerTile('Previous', data.previous)}
		{@render pagerTile('Next', data.next)}
	</nav>
</article>

<style>
	.notes :global(button[data-seek]) {
		font-weight: 600;
		color: var(--color-link);
		text-decoration: underline 2px color-mix(in oklab, currentColor 30%, transparent);
		text-underline-offset: 4px;
		cursor: pointer;
	}
	.notes :global(button[data-seek]:hover) {
		text-decoration-color: currentColor;
	}
</style>
