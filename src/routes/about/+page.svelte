<script lang="ts">
	import hostsPhoto from '#lib/assets/matt-ryan-pat.jpeg?enhanced';
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LinkList from '#lib/components/LinkList.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import ReviewSheet from '#lib/components/ReviewSheet.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { episodePath } from '#lib/episodes.js';
	import { LINKS, SITE } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';

	/** Milestones, with the episode to hear each one where there is one. */
	const TIMELINE = [
		{
			when: 'Aug 2018',
			title: 'The first episode.',
			text: 'Inspired by the late Reign Cane Sports podcast, “Stay Golden” goes up on August 29.',
			episode: '1-1-stay-golden'
		},
		{
			when: 'Oct 2018',
			title: 'Our first big interview.',
			text: 'Former Tulsa quarterback Dane Evans joins us from the CFL’s Hamilton Tiger-Cats.',
			episode: '1-8-the-hamilton-tiger-cast'
		},
		{
			when: 'Sep 2019',
			title: 'Hurc’s Corner opens.',
			text: 'Our blog, named for TU’s former mascot, runs alongside the show. Its posts are still in the archive.'
		},
		{
			when: 'Oct 2019',
			title: 'JP Gooderham’s first visit.',
			text: 'The first of many from the voice of Tulane’s Fear the Wave, which was a huge influence on this show.',
			episode: '2-12-the-battle-of-the-color-based-water-phenomenons'
		},
		{
			when: 'Nov 2019',
			title: 'The Scott & Holman Pawdcast.',
			text: 'Sam and Dustin bring the Houston view for the first time. Another huge influence on us.',
			episode: '2-15-crude-control'
		},
		{
			when: 'Mar 2020',
			title: 'Pat Fox signs off.',
			text: 'Season 2, cut short by COVID, is our co-host Pat’s last. Season 3 picks up as a two-man show.',
			episode: '2-26-have-yourself-a-week-lawson'
		},
		{
			when: 'Mar 2022',
			title: 'TU President Brad Carson.',
			text: 'One of the biggest episodes we’ve ever made.',
			episode: '4-28-renaissance'
		},
		{
			when: 'Apr 2022',
			title: 'Eric Konkol’s first visit.',
			text: 'The new men’s basketball coach joins us weeks into the job. He’s been a regular ever since.',
			episode: '4-29-hurricane-party'
		},
		{
			when: 'May 2022',
			title: 'Athletic Director Rick Dickson.',
			text: 'His first time on the show, on his return to TU and the future of Tulsa athletics. Another of our biggest episodes.',
			episode: '4-31-good-juju-the-future-of-tu-athletics'
		},
		{
			when: 'Dec 2024',
			title: 'Writing moves to Patreon.',
			text: 'Our occasional blog posts live there now, alongside bonus content for patrons.'
		},
		{
			when: 'Jan 2025',
			title: 'Tre Lamb’s first visit.',
			text: 'Tulsa’s new head football coach sits down with us a month after his hiring.',
			episode: '7-16-tu-head-football-coach-tre-lamb-joins-the-podcast'
		},
		{
			when: 'Aug 2026',
			title: 'Season 9.',
			text: 'Opened with TU President Stacy Leeds.',
			episode: '9-1-punching-above-our-weight'
		}
	];

	const REVIEW_SHEET = 'review';

	const WAYS_TO_SUPPORT = [
		{
			name: 'Leave a 5-star review',
			commandfor: REVIEW_SHEET,
			detail: 'On Apple Podcasts or Spotify. It’s free, and it helps other fans find us'
		},
		{
			name: 'Recurring support on Spotify',
			href: LINKS.spotifySupport,
			detail: 'A monthly donation through Spotify for Creators, our podcast host'
		},
		{
			name: 'Buy the merch',
			href: '/merch/',
			detail: 'Tees, hoodies, mugs, and stickers, made in Tulsa'
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

<PageHeader title="Two alums, one time zone away.">
	{#snippet lead()}
		The Golden Hurricast is Ryan Token and Matt Rechtien: TU graduates (class of 2017), friends, and
		die-hard fans who have talked Golden Hurricane athletics every week since August 2018. These
		days we both live in Denver, so most games reach us on a screen, but the show hasn’t missed a
		beat. We’re independent and not affiliated with The University of Tulsa.
	{/snippet}
</PageHeader>

<figure class="page">
	<enhanced:img
		src={hostsPhoto}
		alt="Matt, Ryan, and Pat smiling together at a TU alumni event"
		sizes="(min-width: 80rem) 75rem, 100vw"
		fetchpriority="high"
		class="aspect-[16/7] w-full rounded-xl object-cover object-top sm:aspect-auto"
	/>
	<figcaption class="mt-3 text-sm text-muted">Matt, Ryan, and Pat at a TU alumni event.</figcaption>
</figure>

<section aria-labelledby="hosts" class="page grid gap-8 py-14 sm:grid-cols-2 sm:py-16">
	<h2 id="hosts" class="sr-only">The hosts</h2>
	<div class="border-t-2 border-gold pt-5">
		<h3 class="display text-d2">Ryan Token</h3>
		<p class="mt-3 max-w-md text-lead text-muted">
			Co-host, and the one who built this website. Has opinions about the coaching staff and the
			depth chart, and is happy to share them.
		</p>
	</div>
	<div class="border-t-2 border-gold pt-5">
		<h3 class="display text-d2">Matt Rechtien</h3>
		<p class="mt-3 max-w-md text-lead text-muted">
			Co-host, and a former sports editor of
			<a href={LINKS.collegian} target="_blank" rel="noopener" class="link">The Collegian</a>, TU’s
			student newspaper. Brings the stats and the history.
		</p>
	</div>
</section>

<section
	aria-labelledby="story"
	class="page grid gap-10 pb-16 sm:pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
>
	<!-- Stays in view beside the timeline on wide screens, just below the sticky site header. -->
	<div class="lg:sticky lg:top-24 lg:self-start">
		<h2 id="story" class="display text-d2">How we got here</h2>
		<p class="mt-4 text-lead text-muted">
			When Reign Cane Sports signed off, Tulsa fans were left without a show of their own. We
			figured somebody should keep the conversation going, and it might as well be us.
		</p>
	</div>
	<ol class="relative grid gap-6 border-l-2 border-line pl-8">
		{#each TIMELINE as item (item.title)}
			<li class="relative">
				<span
					class="absolute top-1 -left-[2.6rem] size-4 rounded-full border-4 border-canvas bg-gold"
					aria-hidden="true"
				></span>
				<p class="font-display text-3xl leading-none font-extrabold text-heading">{item.when}</p>
				<p class="mt-1">
					<b>{item.title}</b>
					{item.text}
					{#if item.episode}
						<a href={episodePath(item.episode)} class="link whitespace-nowrap">Listen</a>
					{/if}
				</p>
			</li>
		{/each}
	</ol>
</section>

<section
	id="support"
	aria-labelledby="support-title"
	class="scroll-mt-16 bg-band py-16 text-on-chrome sm:py-20"
>
	<div class="page grid gap-10 lg:grid-cols-2 lg:gap-16">
		<div>
			<h2 id="support-title" class="display text-d1 text-on-chrome">Support the show</h2>
			<p class="mt-4 max-w-lg text-lead text-on-chrome-muted">
				The Golden Hurricast is free and ad-free, and always will be. If it’s part of your week,
				here’s how to help keep it going.
			</p>
			<div class="mt-8 rounded-xl bg-white/8 p-6 ring-1 ring-white/12">
				<h3 class="font-display text-3xl leading-none font-extrabold">Join us on Patreon</h3>
				<p class="mt-3 text-on-chrome-muted">
					There are no ads on the show, so patrons are what keep it going, and keep it independent.
					From $5 a month, with bonus content like video episodes and the occasional blog post, our
					private Discord, and 20% off merch. Ten percent of every pledge goes to TU’s <a
						href={LINKS.loyalAlwaysTrue}
						target="_blank"
						rel="noopener"
						class="link text-on-chrome">Loyal Always True fund</a
					>.
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
			<ReviewSheet id={REVIEW_SHEET} />
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
