<script lang="ts">
	import ArrowLink from '#lib/components/ArrowLink.svelte';
	import AskQuestion from '#lib/components/AskQuestion.svelte';
	import Button from '#lib/components/Button.svelte';
	import EpisodeRow from '#lib/components/EpisodeRow.svelte';
	import GuestCard from '#lib/components/GuestCard.svelte';
	import LeaveReview from '#lib/components/LeaveReview.svelte';
	import LinkList from '#lib/components/LinkList.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { FEATURED_GUESTS, GUEST_GROUPS, guestsIn } from '#lib/guests.js';
	import { LISTEN_ON } from '#lib/site.js';
	import { breadcrumbs, podcastSeries } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** A taste of the deeper guest list: the first few from each group, past the headliners. */
	const featuredNames = new Set(FEATURED_GUESTS.map((guest) => guest.name));
	const BENCH = GUEST_GROUPS.slice(0, 5).flatMap((group) =>
		guestsIn(group)
			.filter((guest) => !featuredNames.has(guest.name))
			.slice(0, 3)
	);
</script>

<Seo
	title="Podcast"
	description="A weekly podcast on Golden Hurricane athletics: every Tulsa football and basketball game recapped, with guests including TU’s president, AD, and head coaches."
	jsonLd={[
		podcastSeries(),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Podcast', path: '/podcast/' }
		])
	]}
/>

<header class="page grid gap-10 pt-14 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
	<div>
		<h1 class="display text-d1">The podcast</h1>
		<p class="mt-5 max-w-2xl text-lead">
			Since August 2018 we’ve recapped every Tulsa football game, basketball game, and a good number
			of things in between. New episodes land every week in season.
		</p>
		<!-- Grouped by intent: the pages to explore (filled), then quick ways to join in (outlined,
		     with gold discs for buttons that open a sheet). On phones each button fills its row. -->
		<div class="mt-8 grid gap-5">
			<div class="flex flex-wrap gap-3 max-sm:*:grow">
				<Button href="/podcast/episodes/" variant="primary" size="lg">
					Browse all {data.count} episodes
				</Button>
				<Button href="/podcast/guests/" variant="primary" size="lg">Browse every guest</Button>
			</div>
			<div class="flex flex-wrap gap-3 max-sm:*:grow">
				<AskQuestion />
				<LeaveReview />
			</div>
		</div>
	</div>
	<nav aria-labelledby="follow">
		<h2 id="follow" class="mb-3 text-sm font-semibold text-muted">Follow for free</h2>
		<LinkList links={LISTEN_ON} />
	</nav>
</header>

<section
	aria-labelledby="guests-title"
	id="guests"
	class="scroll-mt-16 bg-band py-16 text-on-chrome sm:py-20"
>
	<div class="page">
		<div class="mb-10 max-w-3xl">
			<h2 id="guests-title" class="display text-d1 text-on-chrome">
				The people who run the place have been on the show.
			</h2>
			<p class="mt-4 text-lead text-on-chrome-muted">
				The president, the athletic director, and multiple head coaches, on the record with two fans
				(us) who still can’t quite believe they said yes.
			</p>
		</div>
		<ul
			class="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto px-(--gutter) pt-1 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0"
		>
			{#each FEATURED_GUESTS as guest (guest.slug)}
				<li
					class="w-64 shrink-0 snap-start lg:row-span-5 lg:grid lg:w-auto lg:grid-rows-subgrid lg:gap-y-0"
				>
					<GuestCard {guest} appearances={data.appearances[guest.slug]} />
				</li>
			{/each}
		</ul>
	</div>
</section>

<section
	aria-labelledby="bench"
	class="page grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]"
>
	<div>
		<h2 id="bench" class="display text-d2">And a deep bench.</h2>
		<p class="mt-3 text-lead text-muted">
			Beat writers, former players, the Voice of the Golden Hurricane, and a rival-site
			blogger/podcaster nearly every game week.
		</p>
		<ArrowLink href="/podcast/guests/" class="mt-5">Browse every guest</ArrowLink>
	</div>
	<ul class="grid grid-cols-2 border-t border-line sm:grid-cols-3">
		{#each BENCH as guest (guest.name)}
			<li class="border-b border-line py-3 pr-3">
				<p class="font-display text-xl leading-tight font-extrabold text-heading">{guest.name}</p>
				{#if guest.role}<p class="text-sm text-muted">{guest.role}</p>{/if}
			</li>
		{/each}
	</ul>
</section>

<section aria-labelledby="latest" class="page pb-16 sm:pb-20">
	<SectionHeading id="latest" more={{ href: '/podcast/episodes/', label: 'Every episode' }}>
		Latest episodes
	</SectionHeading>
	<ol class="grid gap-3">
		{#each data.latest as episode (episode.slug)}
			<li><EpisodeRow {episode} /></li>
		{/each}
	</ol>
</section>
