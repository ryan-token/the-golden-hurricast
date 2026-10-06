<!--
	@component
	"Leave us a 5-star review": a sheet with Apple Podcasts and Spotify. Apple's link opens the
	show's Ratings & Reviews; Spotify has no such link (ratings only happen in its app), so it
	opens the show and says where the stars are. Open it with `commandfor={id}`.
-->
<script lang="ts">
	import applePodcasts from '#lib/assets/apps/apple-podcasts.png?enhanced';
	import spotify from '#lib/assets/apps/spotify.png?enhanced';
	import Icon from '#lib/components/Icon.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { LINKS } from '#lib/site.js';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	const APPS = [
		{
			name: 'Apple Podcasts',
			icon: applePodcasts,
			href: LINKS.applePodcastsReviews,
			how: 'Opens our Ratings & Reviews. Tap five stars, then Write a Review.'
		},
		{
			name: 'Spotify',
			icon: spotify,
			href: LINKS.spotify,
			how: 'In the Spotify app, follow the show, then tap the star rating under its description.'
		}
	];
</script>

<Sheet {id} labelledby="{id}-title">
	<div class="relative bg-gold px-6 pt-7 pb-6 text-night">
		<p class="flex gap-1 text-royal" aria-hidden="true">
			{#each [1, 2, 3, 4, 5] as star (star)}
				<Icon name="star" class="size-5" />
			{/each}
		</p>
		<h2
			id="{id}-title"
			class="mt-3 pr-10 font-display text-3xl leading-none font-extrabold text-royal"
		>
			Leave us a 5-star review
		</h2>
		<p class="mt-2 max-w-[38ch] text-[0.9375rem]">
			Ratings are how other Tulsa fans find the show, and it only takes a minute.
		</p>
		<button
			type="button"
			commandfor={id}
			command="close"
			class="absolute top-3 right-3 grid size-10 place-items-center rounded-full hover:bg-night/10"
		>
			<span class="sr-only">Close</span>
			<Icon name="close" />
		</button>
	</div>

	<ul class="grid gap-3 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
		{#each APPS as app (app.name)}
			<li>
				<a
					href={app.href}
					target="_blank"
					rel="noopener"
					class="flex h-full items-start gap-4 rounded-lg border border-line-strong bg-canvas p-4 transition-colors hover:border-heading"
				>
					<!-- The wrapper is the flex item: enhanced:img renders a <picture> around the image. -->
					<span class="size-12 shrink-0">
						<enhanced:img src={app.icon} alt="" sizes="48px" class="size-full" />
					</span>
					<span class="min-w-0">
						<span class="flex items-center gap-1.5 font-semibold text-heading">
							{app.name}
							<Icon name="external" class="size-4 text-muted" />
						</span>
						<span class="mt-1 block text-sm text-muted">{app.how}</span>
						<span class="sr-only">(opens in a new tab)</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</Sheet>
