<!--
	@component
	A featured guest's sheet: a bigger photo, their bio, every episode they were on, and their
	official bio.
-->
<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import CompactEpisode from '#lib/components/CompactEpisode.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import type { Episode } from '#lib/episodes.js';
	import { GUEST_PHOTOS } from '#lib/guest-photos.js';
	import type { FeaturedGuest } from '#lib/guests.js';

	interface Props {
		id: string;
		guest: FeaturedGuest;
		appearances: Episode[];
	}

	let { id, guest, appearances }: Props = $props();

	const bioSite = $derived(new URL(guest.bioUrl).hostname.replace(/^www\./, ''));
</script>

<Sheet {id} labelledby="{id}-name" width="lg">
	<!-- minmax(0, …): a long episode title truncates rather than widening the sheet. -->
	<div class="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[15rem_minmax(0,1fr)]">
		<enhanced:img
			src={GUEST_PHOTOS[guest.slug]}
			alt=""
			sizes="(min-width: 40rem) 15rem, 100vw"
			loading="lazy"
			class="aspect-4/3 w-full object-cover object-top sm:aspect-auto sm:h-full"
		/>

		<div class="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold text-muted">{guest.role}</p>
					<h2 id="{id}-name" class="mt-1 display text-d3">{guest.name}</h2>
				</div>
				<button
					type="button"
					commandfor={id}
					command="close"
					class="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink"
				>
					<span class="sr-only">Close</span>
					<Icon name="close" />
				</button>
			</div>

			<p class="mt-3">{guest.bio}</p>

			<h3 class="mt-6 text-sm font-semibold text-muted">
				On the show {appearances.length === 1 ? 'once' : `${appearances.length} times`}
			</h3>
			<ul class="divide-y divide-line">
				{#each appearances as episode (episode.slug)}
					<li><CompactEpisode {episode} /></li>
				{/each}
			</ul>

			<Button href={guest.bioUrl} target="_blank" rel="noopener" variant="quiet" class="mt-5">
				<!-- The site name is dropped from sight on the narrowest phones, where it won't fit. -->
				<!-- An expression keeps the space: Svelte trims whitespace at the start of an element. -->
				<span>Official bio<span class="max-[24rem]:sr-only">{` on ${bioSite}`}</span></span>
				<Icon name="external" class="size-4" />
				<span class="sr-only">(opens in a new tab)</span>
			</Button>
		</div>
	</div>
</Sheet>
