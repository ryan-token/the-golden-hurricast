<script lang="ts">
	import hostsPhoto from '#lib/assets/matt-ryan-pat.jpeg?enhanced';
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkList from '#lib/components/LinkList.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS, SITE } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';

	const HOSTS = [
		{
			name: 'Ryan Token',
			bio: 'Co-host, and the one who built this website. Has opinions about the depth chart and will share them.'
		},
		{
			name: 'Matt Rechtien',
			bio: 'Co-host, and a former sports editor of The Collegian, TU’s student newspaper. Brings the stats and the history.'
		}
	];

	const TIMELINE = [
		{
			year: '2018',
			title: 'The first episode.',
			text: 'Inspired by the late Reign Cane Sports podcast, “Stay Golden” goes up on August 29.'
		},
		{
			year: '2019',
			title: 'Hurc’s Corner opens.',
			text: 'Our blog, named for TU’s former mascot, runs alongside the show. Its posts are still in the archive.'
		},
		{
			year: '2024',
			title: 'Writing moves to Patreon.',
			text: 'Our occasional blog posts live there now, alongside bonus content for patrons.'
		},
		{
			year: '2026',
			title: 'Season 9.',
			text: 'Opened with TU President Stacy Leeds.'
		}
	];

	const WAYS_TO_SUPPORT = [
		{
			name: 'Recurring support on Spotify',
			href: LINKS.spotifySupport,
			detail: 'A monthly donation through Spotify for Creators, our podcast host'
		},
		{
			name: 'Buy the merch',
			href: '/merch/',
			detail: 'Tees, hoodies, mugs and stickers, made in Tulsa'
		},
		{ name: 'One-time donation', href: LINKS.paypal, detail: 'Any amount, through PayPal' },
		{ name: 'Tip us on X', href: LINKS.x, detail: 'Tap the tip button on our profile' }
	];

	const CONTACT = [
		{ name: 'Email', href: LINKS.email, detail: SITE.email },
		{ name: 'X', href: LINKS.x, detail: SITE.xHandle },
		{ name: 'Bluesky', href: LINKS.bluesky, detail: SITE.blueskyHandle },
		{ name: 'Discord', href: LINKS.discord, detail: 'Join the conversation' }
	];
</script>

<Seo
	title="About"
	description="The Golden Hurricast is an independent podcast about Golden Hurricane athletics by Ryan Token and Matt Rechtien, two TU alums. Here's our story, and how to support the show."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about/' }
	])}
/>

<PageHeader title="Two alums who never stopped going to games.">
	{#snippet lead()}
		The Golden Hurricast is Ryan Token and Matt Rechtien: TU graduates, friends and die-hard fans
		who have talked Golden Hurricane athletics every week since August 2018. We’re independent and
		not affiliated with The University of Tulsa.
	{/snippet}
</PageHeader>

<figure class="page">
	<enhanced:img
		src={hostsPhoto}
		alt="Ryan, Matt and Pat smiling together at a TU alumni event"
		sizes="(min-width: 80rem) 75rem, 100vw"
		fetchpriority="high"
		class="aspect-[16/7] w-full rounded-xl object-cover object-top sm:aspect-auto"
	/>
	<figcaption class="mt-3 text-sm text-muted">Ryan, Matt and Pat at a TU alumni event.</figcaption>
</figure>

<section aria-labelledby="hosts" class="page grid gap-8 py-14 sm:grid-cols-2 sm:py-16">
	<h2 id="hosts" class="sr-only">The hosts</h2>
	{#each HOSTS as host (host.name)}
		<div class="border-t-2 border-gold pt-5">
			<h3 class="display text-d2">{host.name}</h3>
			<p class="mt-3 max-w-md text-lead text-muted">{host.bio}</p>
		</div>
	{/each}
</section>

<section
	aria-labelledby="story"
	class="page grid gap-10 pb-16 sm:pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
>
	<div>
		<h2 id="story" class="display text-d2">How we got here</h2>
		<p class="mt-4 text-lead text-muted">
			When Reign Cane Sports signed off, Tulsa fans were left without a show of their own. We
			figured somebody should keep the conversation going, and it might as well be us.
		</p>
	</div>
	<ol class="relative grid gap-6 border-l-2 border-line pl-8">
		{#each TIMELINE as item (item.year)}
			<li class="relative">
				<span
					class="absolute top-1 -left-[2.6rem] size-4 rounded-full border-4 border-canvas bg-gold"
					aria-hidden="true"
				></span>
				<p class="font-display text-3xl leading-none font-extrabold text-heading">{item.year}</p>
				<p class="mt-1"><b>{item.title}</b> {item.text}</p>
			</li>
		{/each}
	</ol>
</section>

<section
	id="support"
	aria-labelledby="support-title"
	class="scroll-mt-16 bg-royal py-16 text-white sm:py-20 dark:bg-chrome"
>
	<div class="page grid gap-10 lg:grid-cols-2 lg:gap-16">
		<div>
			<h2 id="support-title" class="display text-d1 text-white!">Support the show</h2>
			<p class="mt-4 max-w-lg text-lead text-on-chrome-muted">
				The Golden Hurricast is free and ad-free, and always will be. If it’s part of your week,
				here’s how to help keep it going.
			</p>
			<div class="mt-8 rounded-xl bg-white/8 p-6 ring-1 ring-white/12">
				<h3 class="font-display text-3xl leading-none font-extrabold">Join us on Patreon</h3>
				<p class="mt-3 text-on-chrome-muted">
					There are no ads on the show, so patrons are what keep it going, and keep it independent.
					From $5 a month, with bonus content like video episodes and the occasional blog post, our
					private Discord and 20% off merch. Ten percent of every pledge goes to the Hurricane
					Impact NIL collective.
				</p>
				<Button
					href={LINKS.patreon}
					target="_blank"
					rel="noopener"
					variant="gold"
					size="lg"
					class="mt-6"
				>
					Become a patron <Icon name="external" class="size-4" />
					<span class="sr-only">(opens in a new tab)</span>
				</Button>
			</div>
		</div>
		<div>
			<h3 class="mb-3 text-sm font-semibold text-on-chrome-muted">Other ways to help</h3>
			<LinkList links={WAYS_TO_SUPPORT} class="text-ink" />
		</div>
	</div>
</section>

<section aria-labelledby="contact" class="page grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
	<div>
		<h2 id="contact" class="display text-d2">Say hello</h2>
		<p class="mt-3 max-w-md text-lead text-muted">
			Story ideas, guest suggestions, corrections, or a complaint about the offensive line. We read
			everything.
		</p>
	</div>
	<LinkList links={CONTACT} />
</section>
