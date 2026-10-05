<!--
	@component
	A featured guest as a trading card: official photo, name, a stat line, a short bio and a link
	to their official bio. The card opens the guest's sheet, which has their episodes.
-->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import GuestSheet from '#lib/components/GuestSheet.svelte';
	import type { Episode } from '#lib/episodes.js';
	import { GUEST_PHOTOS } from '#lib/guest-photos.js';
	import type { FeaturedGuest } from '#lib/guests.js';

	interface Props {
		guest: FeaturedGuest;
		appearances: Episode[];
	}

	let { guest, appearances }: Props = $props();

	const first = $derived(appearances[0]);
	const sheetId = $derived(`guest-${guest.slug}`);
</script>

<!-- On wide screens the card is a subgrid of the list (five rows: photo, name and role, stats, bio, link),
     so each part lines up across the cards whatever the length of a role or bio. -->
<article
	id={guest.slug}
	class="group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-xl bg-surface text-ink shadow-lift transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-float lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
>
	<div class="overflow-hidden bg-sand">
		<enhanced:img
			src={GUEST_PHOTOS[guest.slug]}
			alt="{guest.name}, {guest.role}"
			sizes="(min-width: 75rem) 14rem, (min-width: 64rem) 18vw, 16rem"
			loading="lazy"
			class="aspect-4/5 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
		/>
	</div>

	<div class="px-4 pt-4">
		<h3 class="font-display text-[1.75rem] leading-none font-extrabold text-heading">
			<button
				type="button"
				commandfor={sheetId}
				command="show-modal"
				class="stretched-link text-left focus-ring-none"
			>
				{guest.name}
			</button>
		</h3>
		<p class="mt-1 text-sm text-muted">{guest.role}</p>
	</div>

	<dl class="mx-4 mt-3 grid grid-cols-2 border-y border-line py-2.5">
		<div>
			<dt class="text-xs text-muted">
				{appearances.length === 1 ? 'Appearance' : 'Appearances'}
			</dt>
			<dd class="font-display text-2xl leading-tight font-extrabold text-heading">
				{appearances.length}
			</dd>
		</div>
		{#if first?.number !== undefined}
			<div class="border-l border-line pl-3">
				<dt class="text-xs text-muted">First on</dt>
				<dd class="font-display text-2xl leading-tight font-extrabold text-heading">
					S{first.season}·E{first.number}
				</dd>
			</div>
		{/if}
	</dl>

	<p class="mt-3 px-4 text-sm text-muted">{guest.bio}</p>

	<a
		href={guest.bioUrl}
		target="_blank"
		rel="noopener"
		class="relative z-10 mt-auto inline-flex items-center gap-1 self-start px-4 pt-4 pb-4 text-sm font-semibold text-link hover:underline lg:mt-0 lg:justify-self-start"
	>
		Official bio <Icon name="external" class="size-4" />
		<span class="sr-only">for {guest.name} (opens in a new tab)</span>
	</a>
</article>

<GuestSheet id={sheetId} {guest} {appearances} />

<style>
	article:has(button:focus-visible) {
		outline: 2px solid var(--color-gold);
		outline-offset: 3px;
	}
</style>
