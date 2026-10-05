<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import EpisodeRow from '#lib/components/EpisodeRow.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { Episode } from '#lib/episodes.js';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Episodes outside the numbered seasons are filed under "specials". */
	const SPECIALS = 'specials';

	const seasonKey = (episode: Episode) =>
		episode.season === undefined ? SPECIALS : String(episode.season);

	const seasons = $derived(
		Object.entries(Object.groupBy(data.episodes, seasonKey))
			.sort(([a], [b]) => (a === SPECIALS ? 1 : b === SPECIALS ? -1 : Number(b) - Number(a)))
			.map(([key, episodes = []]) => {
				const years = episodes.map((episode) => episode.published.slice(0, 4)).sort();
				const [first, last] = [years[0], years.at(-1)];
				return {
					key,
					name: key === SPECIALS ? 'Specials' : `Season ${key}`,
					years: first === last ? first : `${first}–${last?.slice(2)}`,
					episodes
				};
			})
	);

	// Filters live in the URL, so they work without JavaScript (the form submits) and can be
	// shared. With JavaScript, `filter` sets them directly and keeps the URL in step.
	let season = $derived(page.url.searchParams.get('season') ?? '');
	let query = $derived(page.url.searchParams.get('q') ?? '');

	const normalize = (text: string) =>
		text
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();

	const results = $derived.by(() => {
		if (!query.trim()) return undefined;
		const words = normalize(query.trim()).split(/\s+/);
		return data.episodes.filter((episode) => {
			if (season && seasonKey(episode) !== season) return false;
			const haystack = normalize(
				[
					episode.title,
					episode.subtitle,
					episode.guest?.name,
					episode.guest?.outlet,
					episode.summary
				]
					.filter(Boolean)
					.join(' ')
			);
			return words.every((word) => haystack.includes(word));
		});
	});

	const shown = $derived(season ? seasons.filter((group) => group.key === season) : seasons);

	function filter(form: HTMLFormElement) {
		const fields = new FormData(form);
		season = String(fields.get('season') ?? '');
		// Not trimmed: the input shows this value, and trimming would eat a space as it's typed.
		query = String(fields.get('q') ?? '');

		const params = [
			['season', season],
			['q', query]
		].flatMap(([name, value]) => (value.trim() ? [`${name}=${encodeURIComponent(value)}`] : []));
		goto(`${page.url.pathname}${params.length ? `?${params.join('&')}` : ''}`, {
			replace: true,
			shallow: true
		});
	}

	/** Applies anything typed or picked before the page finished loading. Runs once. */
	function catchUp(form: HTMLFormElement) {
		untrack(() => {
			const fields = new FormData(form);
			if (fields.get('q') !== query || (fields.get('season') ?? '') !== season) filter(form);
		});
	}
</script>

<Seo
	title="Every episode"
	description="Every episode of The Golden Hurricast since August 2018, by season. Search for an opponent, a guest, or a game."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Podcast', path: '/podcast/' },
		{ name: 'Episodes', path: '/podcast/episodes/' }
	])}
/>

<PageHeader title="Every episode" back={{ href: '/podcast/', label: 'Podcast' }}>
	{#snippet lead()}
		{data.episodes.length} episodes since August 2018, newest first. Search for an opponent, a guest,
		or a game you’d rather forget.
	{/snippet}
</PageHeader>

<form
	method="GET"
	role="search"
	oninput={(event) => filter(event.currentTarget)}
	onsubmit={(event) => {
		event.preventDefault();
		filter(event.currentTarget);
	}}
	{@attach catchUp}
	class="sticky top-16 z-20 border-y border-line bg-canvas py-3"
>
	<div class="page flex flex-wrap items-center gap-3">
		<fieldset
			class="-mx-(--gutter) flex min-w-0 flex-1 basis-full overflow-x-auto px-(--gutter) md:mx-0 md:basis-auto md:px-0"
		>
			<legend class="sr-only">Season</legend>
			<div class="flex gap-1 rounded-full bg-sand p-1">
				{#each [{ key: '', name: 'All' }, ...seasons] as option (option.key)}
					<label
						class="relative grid h-9 min-w-10 cursor-pointer place-items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap text-muted transition-colors hover:text-heading has-checked:bg-surface has-checked:text-heading has-focus-visible:outline-2 has-focus-visible:outline-accent"
					>
						<input
							type="radio"
							name="season"
							value={option.key}
							defaultChecked={season === option.key}
							aria-label={option.key === '' ? 'All seasons' : option.name}
							class="sr-only"
						/>
						<span aria-hidden="true">
							{option.key === '' || option.key === SPECIALS ? option.name : option.key}
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<label class="relative w-full md:w-72">
			<span class="sr-only">Search episodes</span>
			<Icon
				name="search"
				class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
			/>
			<input
				type="search"
				name="q"
				defaultValue={query}
				placeholder="Search titles, guests, opponents"
				autocomplete="off"
				class="h-11 w-full rounded-full border border-line-strong bg-surface pr-4 pl-10 text-base text-ink placeholder:text-muted/80 focus-visible:border-accent"
			/>
		</label>
		<noscript
			><button class="h-11 rounded-full bg-accent px-5 font-semibold text-on-accent">Filter</button
			></noscript
		>
	</div>
</form>

<div class="page py-10 sm:py-12">
	<!-- Always in the page, so screen readers announce the count as it changes. -->
	<p class={['text-muted', results && 'mb-5']} aria-live="polite">
		{#if results}
			{results.length === 1 ? '1 episode' : `${results.length} episodes`} match “{query.trim()}”{season
				? ` in ${shown[0]?.name}`
				: ''}.
		{/if}
	</p>
	{#if results}
		<ol class="grid gap-3">
			{#each results as episode (episode.slug)}
				<li><EpisodeRow {episode} headingLevel={2} /></li>
			{/each}
		</ol>
	{:else}
		<div class="grid gap-4">
			{#each shown as group, index (group.key)}
				<details open={Boolean(season) || index < 2} class="group/season">
					<summary
						class="flex cursor-pointer list-none items-baseline gap-4 rounded-md py-3 [&::-webkit-details-marker]:hidden"
					>
						<h2 class="display text-d3">{group.name}</h2>
						<span class="text-sm text-muted">
							{group.years} · {group.episodes.length} episodes
						</span>
						<Icon
							name="chevron"
							class="ml-auto size-5 self-center text-muted transition-transform duration-200 group-open/season:rotate-90"
						/>
					</summary>
					<ol class="grid gap-3 pt-2 pb-6">
						{#each group.episodes as episode (episode.slug)}
							<li><EpisodeRow {episode} showSeason={false} /></li>
						{/each}
					</ol>
				</details>
			{/each}
		</div>
	{/if}
</div>
