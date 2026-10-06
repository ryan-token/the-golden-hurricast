<script lang="ts">
	import GuestSheet from '#lib/components/GuestSheet.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { episodeLabel, episodePath, type Episode } from '#lib/episodes.js';
	import { GUEST_PHOTOS } from '#lib/guest-photos.js';
	import { FEATURED_GUESTS } from '#lib/guests.js';
	import { breadcrumbs } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Appearance = Pick<Episode, 'slug' | 'season' | 'number' | 'bonus' | 'title'>;

	/** Each section's anchor, e.g. "around-the-american". */
	const anchor = (name: string) => name.toLowerCase().replaceAll(' ', '-');

	/**
	 * Glides to a section instead of jumping, unless the visitor prefers reduced motion. The link
	 * stays a plain anchor, so the URL, history, and scroll restoration on Back work as usual: the
	 * browser jumps, then, before that jump is painted, it's replayed as a short ease-out.
	 * (CSS smooth scrolling can't be timed, and drags on long jumps.)
	 */
	function glide(event: MouseEvent) {
		const modified =
			event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
		if (modified || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const from = scrollY;
		// The browser's jump arrives as a scroll event, which runs before the frame is painted.
		// (Firefox jumps a little later than other browsers, so waiting a fixed frame isn't enough.)
		const replay = () => {
			clearTimeout(timeout);
			const distance = scrollY - from;
			if (Math.abs(distance) < 2) return;

			// Longer jumps take a little longer, within a quarter to just under half a second.
			const duration = Math.min(450, Math.max(250, Math.abs(distance) / 10));
			const start = performance.now();
			let frame = 0;
			// Scrolling, touching the page, or pressing a key (arrows, Page Down, Space) takes over at once.
			const stop = () => {
				cancelAnimationFrame(frame);
				removeEventListener('wheel', stop);
				removeEventListener('touchstart', stop);
				removeEventListener('keydown', stop);
			};
			addEventListener('wheel', stop, { passive: true });
			addEventListener('touchstart', stop, { passive: true });
			addEventListener('keydown', stop);

			const step = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				const eased = 1 - (1 - t) ** 3;
				scrollTo({ top: from + distance * eased, behavior: 'instant' });
				if (t < 1) frame = requestAnimationFrame(step);
				else stop();
			};
			scrollTo({ top: from, behavior: 'instant' });
			frame = requestAnimationFrame(step);
		};
		addEventListener('scroll', replay, { once: true, passive: true });
		// Already at the section: no jump, so no scroll event to wait for.
		const timeout = setTimeout(() => removeEventListener('scroll', replay), 500);
	}
</script>

<Seo
	title="Guests"
	description="Every guest on The Golden Hurricast, from TU’s president, athletic director, and head coaches to former players, Tulsa media, and friends around the American."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Podcast', path: '/podcast/' },
		{ name: 'Guests', path: '/podcast/guests/' }
	])}
/>

{#snippet episodeLinks(appearances: Appearance[], className?: string)}
	<ul class={['flex flex-wrap gap-1.5', className]}>
		{#each appearances as appearance (appearance.slug)}
			<li>
				<a
					href={episodePath(appearance.slug)}
					title={appearance.title}
					class="inline-flex h-7 items-center rounded-full bg-tile px-2.5 text-xs font-semibold whitespace-nowrap text-on-tile transition-colors hover:bg-accent hover:text-on-accent"
				>
					{episodeLabel(appearance)}<span class="sr-only">: {appearance.title}</span>
				</a>
			</li>
		{/each}
	</ul>
{/snippet}

<PageHeader title="Every guest we’ve ever had" back={{ href: '/podcast/', label: 'Podcast' }}>
	{#snippet lead()}
		University leadership, coaches, former players, the people who cover Tulsa for a living, and our
		counterparts around the American and beyond. Each one links to the episodes they were on.
	{/snippet}
</PageHeader>

<section aria-labelledby="featured" class="page">
	<h2 id="featured" class="sr-only">Featured guests</h2>
	<!-- On wide screens each card is a subgrid of the list, so photos, names, and episode chips
	     line up across all five whatever the length of a role. Like the cards on the podcast
	     page, each one opens the guest's sheet; the episode chips link straight to episodes. -->
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
		{#each FEATURED_GUESTS as guest (guest.slug)}
			{@const sheetId = `guest-${guest.slug}`}
			<li
				class="featured group relative grid grid-cols-[5rem_minmax(0,1fr)] content-start gap-x-4 gap-y-2 rounded-lg border border-line bg-surface p-3 transition-[translate,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-lift lg:row-span-3 lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-y-3"
			>
				<!-- The wrapper is the grid item: enhanced:img renders a <picture> around the image. -->
				<div class="row-span-2 self-start overflow-hidden rounded-md bg-sand lg:row-span-1">
					<enhanced:img
						src={GUEST_PHOTOS[guest.slug]}
						alt=""
						sizes="(min-width: 64rem) 12rem, 5rem"
						loading="lazy"
						class="aspect-4/5 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
					/>
				</div>
				<div>
					<h3 class="font-display text-2xl leading-none font-extrabold text-heading">
						<button
							type="button"
							commandfor={sheetId}
							command="show-modal"
							class="stretched-link cursor-pointer text-left focus-ring-none"
						>
							{guest.name}
						</button>
					</h3>
					<p class="mt-1 text-sm text-muted">{guest.role}</p>
				</div>
				{@render episodeLinks(data.featured[guest.slug], 'relative z-10 content-start')}
				<GuestSheet id={sheetId} {guest} appearances={data.featured[guest.slug]} />
			</li>
		{/each}
	</ul>
</section>

<!-- A shortcut to each section below, which is a lot of scrolling on a phone. Anchor links
     that glide there with JavaScript; `scroll-mt` keeps headings clear of the sticky header. -->
<nav aria-labelledby="sections" class="page pt-10 sm:pt-12">
	<h2 id="sections" class="mb-3 text-sm font-semibold text-muted">Jump to a section</h2>
	<ul class="flex flex-wrap gap-2">
		{#each data.groups as group (group.name)}
			<li>
				<a
					href="#{anchor(group.name)}"
					onclick={glide}
					class="inline-flex h-9 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-heading transition-colors hover:border-heading"
				>
					{group.name}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<div class="page grid gap-12 py-14 sm:py-16 lg:grid-cols-2 lg:gap-x-16">
	{#each data.groups as group (group.name)}
		{@const id = anchor(group.name)}
		<section aria-labelledby={id}>
			<h2 {id} tabindex="-1" class="mb-4 scroll-mt-24 display text-d3 focus-ring-none">
				{group.name}
			</h2>
			{#each group.sections as section (section.name)}
				{#if section.name}
					<h3 class="mt-6 mb-2 text-sm font-semibold text-muted first-of-type:mt-0">
						{section.name}
					</h3>
				{/if}
				<ul class="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
					{#each section.guests as guest (guest.name)}
						<li
							class="grid gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
						>
							<div>
								{#if guest.url}
									<a
										href={guest.url}
										target="_blank"
										rel="noopener"
										class="inline-flex items-center gap-1 font-semibold text-heading hover:underline"
									>
										{guest.name}
										<Icon name="external" class="size-3.5 text-muted" />
										<span class="sr-only">(opens in a new tab)</span>
									</a>
								{:else}
									<p class="font-semibold text-heading">{guest.name}</p>
								{/if}
								{#if guest.role}<p class="text-sm text-muted">{guest.role}</p>{/if}
							</div>
							{@render episodeLinks(guest.appearances, 'sm:max-w-64 sm:justify-end')}
						</li>
					{/each}
				</ul>
			{/each}
		</section>
	{/each}
</div>

<style>
	/* The card shows keyboard focus for the name button that opens its sheet. */
	.featured:has(h3 button:focus-visible) {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
