<script lang="ts">
	import AskQuestion from '#lib/components/AskQuestion.svelte';
	import Button from '#lib/components/Button.svelte';
	import Crest from '#lib/components/Crest.svelte';
	import EpisodeRow from '#lib/components/EpisodeRow.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Scoreboard from '#lib/components/Scoreboard.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { GUEST_PHOTOS } from '#lib/guest-photos.js';
	import { FEATURED_GUESTS } from '#lib/guests.js';
	import { LINKS, LISTEN_ON, PATREON_TIERS } from '#lib/site.js';
	import { organization, website } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo
	description="Golden Hurricane talk every week since 2018: game recaps, opponent previews, and interviews with TU’s president, athletic director, and head coaches."
	jsonLd={[organization(), website()]}
/>

<svelte:head>
	<!-- IndieWeb / Mastodon identity verification. -->
	<link rel="me" href={LINKS.mastodon} />
</svelte:head>

<section aria-labelledby="home-title" class="overflow-hidden bg-sand">
	<div
		class="page grid items-center gap-x-12 gap-y-8 pt-10 pb-14 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:pb-20"
	>
		<div class="max-w-3xl">
			<h1 id="home-title" class="display text-hero">
				Golden Hurricane talk, every week since&nbsp;2018.
			</h1>
			<p class="mt-6 max-w-[36rem] text-lead">
				Ryan Token and Matt Rechtien are two TU alums who recap every game, preview every opponent,
				and argue about the depth chart so you don’t have to. Independent, listener-funded, and only
				occasionally wrong.
			</p>
			<div class="mt-6"><AskQuestion /></div>
			<div class="mt-10 max-w-xl"><Scoreboard episode={data.latest} /></div>
		</div>

		<Crest
			size="lg"
			priority
			alt="The Golden Hurricast logo: three superhero Golden Hurricane mascots circling the show’s name"
			sizes="(min-width: 64rem) 24rem, 70vw"
			class="mx-auto w-[min(70vw,24rem)] shadow-lift max-lg:row-start-1 max-lg:w-36 sm:max-lg:w-52"
		/>
	</div>
</section>

<section aria-labelledby="listen" class="border-b border-line">
	<div class="page flex flex-wrap items-center gap-x-6 gap-y-3 py-6">
		<h2 id="listen" class="font-semibold text-heading">Free, everywhere you already listen</h2>
		<ul class="flex flex-wrap gap-2">
			{#each LISTEN_ON as { name, href } (name)}
				<li>
					<a
						{href}
						target="_blank"
						rel="noopener"
						class="inline-flex h-9 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-heading transition-colors hover:border-heading"
					>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section aria-labelledby="latest" class="page py-16 sm:py-20">
	<SectionHeading id="latest" more={{ href: '/podcast/episodes/', label: 'Every episode' }}>
		Latest episodes
	</SectionHeading>
	<ol class="grid gap-3">
		{#each data.recent as episode (episode.slug)}
			<li><EpisodeRow {episode} /></li>
		{/each}
	</ol>
</section>

<section aria-labelledby="guests" class="page pb-16 sm:pb-20">
	<SectionHeading
		id="guests"
		lede="Plus beat writers, former players, and a rival-site blogger/podcaster nearly every game week."
		more={{ href: '/podcast/#guests', label: 'Meet the guests' }}
	>
		The president, the AD, and multiple head coaches have all been on.
	</SectionHeading>
	<ul
		class="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto px-(--gutter) pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0"
	>
		{#each FEATURED_GUESTS as guest (guest.slug)}
			<li class="w-40 shrink-0 snap-start sm:w-auto">
				<a href="/podcast/#{guest.slug}" class="group block">
					<span class="block overflow-hidden rounded-lg bg-sand">
						<enhanced:img
							src={GUEST_PHOTOS[guest.slug]}
							alt=""
							sizes="(min-width: 75rem) 14rem, (min-width: 40rem) 19vw, 10rem"
							loading="lazy"
							class="aspect-4/5 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>
					</span>
					<span class="mt-3 block font-display text-2xl leading-none font-extrabold text-heading">
						{guest.name}
					</span>
					<span class="mt-1 block text-sm text-muted">{guest.short}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<section aria-labelledby="patreon" class="bg-band text-on-chrome">
	<div class="page grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
		<div>
			<h2 id="patreon" class="display text-d1 text-on-chrome">
				Back the show. Back the&nbsp;Hurricane.
			</h2>
			<p class="mt-5 max-w-md text-lead text-on-chrome-muted">
				There are no ads on the show. Patreon is how listeners keep it that way, and keep it
				independent. Patrons also get bonus content: video versions of episodes, the occasional blog
				post, and our private Discord.
			</p>
			<div class="mt-8 flex items-center gap-5 border-t border-white/15 pt-8">
				<p class="font-display text-7xl leading-none font-black text-gold">10%</p>
				<p class="max-w-64 text-on-chrome-muted">
					of every pledge goes to TU’s <a
						href={LINKS.loyalAlwaysTrue}
						target="_blank"
						rel="noopener"
						class="link text-on-chrome">Loyal Always True fund</a
					>, so your support reaches Tulsa athletes too.
				</p>
			</div>
		</div>

		<ul class="grid content-start gap-3">
			{#each PATREON_TIERS as tier (tier.name)}
				{@const featured = 'featured' in tier}
				<li
					class={[
						'grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 rounded-lg p-5 sm:grid-cols-[6rem_1fr_auto]',
						featured ? 'bg-gold text-night' : 'bg-white/8 ring-1 ring-white/12'
					]}
				>
					<p class="font-display leading-none font-black">
						<span class={['text-5xl', !featured && 'text-gold']}>${tier.price}</span>
						<span class="mt-1 block font-sans text-xs font-semibold opacity-75">a month</span>
					</p>
					<div>
						<h3 class="font-display text-2xl leading-none font-extrabold">
							{tier.name}
							{#if featured}<span class="ml-1 font-sans text-xs font-semibold whitespace-nowrap"
									>· Recommended</span
								>{/if}
						</h3>
						<ul class="mt-2 grid gap-1 text-sm">
							{#each tier.perks as perk (perk)}
								<li class="flex gap-2">
									<Icon
										name="check"
										class={['mt-0.5 size-4', featured ? 'text-royal' : 'text-gold']}
									/>
									{perk}
								</li>
							{/each}
						</ul>
					</div>
					<Button
						href={LINKS.patreon}
						target="_blank"
						rel="noopener"
						size="sm"
						variant={featured ? 'on-gold' : 'on-blue'}
						class="col-span-2 sm:col-span-1"
					>
						Join <Icon name="external" class="size-4" />
						<span class="sr-only">{tier.name} on Patreon (opens in a new tab)</span>
					</Button>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section aria-labelledby="mailbag" class="page py-16 sm:py-20">
	<div
		class="flex flex-wrap items-center justify-between gap-8 rounded-xl border border-line bg-surface p-8 sm:p-10"
	>
		<div class="max-w-xl">
			<h2 id="mailbag" class="display text-d2">The mailbag’s open.</h2>
			<p class="mt-3 text-lead text-muted">
				Ask us anything Tulsa: a recruit, a fourth-down call, whether TU deserves a P4 invite. We'll try to answer it on our next show.
			</p>
		</div>
		<AskQuestion />
	</div>
</section>
