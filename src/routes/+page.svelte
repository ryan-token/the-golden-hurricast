<script lang="ts">
	import applePodcastsIcon from '#lib/assets/brand-icons/apple-podcasts.png?w=70&enhanced';
	import blueskyIcon from '#lib/assets/brand-icons/bluesky.svg';
	import discordIcon from '#lib/assets/brand-icons/discord.png?w=70&enhanced';
	import emailIcon from '#lib/assets/brand-icons/email.png?w=70&enhanced';
	import patreonIcon from '#lib/assets/brand-icons/patreon.png?w=70&enhanced';
	import spotifyIcon from '#lib/assets/brand-icons/spotify.png?w=70&enhanced';
	import xIcon from '#lib/assets/brand-icons/x.png?w=70&enhanced';
	import patreonTiers from '#lib/assets/patreon-tiers.png?enhanced';
	import ApplePodcastsEmbed from '#lib/components/ApplePodcastsEmbed.svelte';
	import AskQuestion from '#lib/components/AskQuestion.svelte';
	import Button from '#lib/components/Button.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS, SITE } from '#lib/site.js';
	import { organization, website } from '#lib/structured-data.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const SQUARE_ICON = 'h-7 sm:h-[35px]';

	/** Icons are drawn at 35px (28px on phones); Bluesky's is an SVG, so it skips enhanced-img. */
	const SOCIAL_LINKS = [
		{
			name: 'Apple Podcasts',
			href: LINKS.applePodcasts,
			icon: applePodcastsIcon,
			height: SQUARE_ICON
		},
		{ name: 'Spotify', href: LINKS.spotify, icon: spotifyIcon, height: SQUARE_ICON },
		{ name: 'Patreon', href: LINKS.patreon, icon: patreonIcon, height: SQUARE_ICON },
		// Discord's logo is wider than it is tall.
		{ name: 'Discord', href: LINKS.discord, icon: discordIcon, height: 'h-[21px] sm:h-[26px]' },
		{ name: 'X', href: LINKS.x, icon: xIcon, height: SQUARE_ICON },
		{ name: 'Bluesky', href: LINKS.bluesky, icon: blueskyIcon, height: SQUARE_ICON },
		{ name: 'Email', href: LINKS.email, icon: emailIcon, height: SQUARE_ICON }
	];

	const SOCIAL_CARDS = [
		{
			network: 'X',
			href: LINKS.x,
			handle: SITE.xHandle,
			background: 'bg-x',
			viewBox: '0 0 24 24',
			logo: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
		},
		{
			network: 'Bluesky',
			href: LINKS.bluesky,
			handle: SITE.blueskyHandle,
			background: 'bg-bluesky',
			viewBox: '0 0 568 501',
			logo: 'M123.121 33.664C188.241 82.553 258.281 163.747 284 207.035c25.719-43.288 95.759-124.482 160.879-173.371C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664Z'
		}
	];
</script>

<Seo jsonLd={[organization(), website()]} />

<svelte:head>
	<!-- IndieWeb / Mastodon identity verification. -->
	<link rel="me" href={LINKS.mastodon} />
</svelte:head>

<Hero title={SITE.name}>
	{#snippet lead()}
		The leading independent podcast and blog covering Golden Hurricane athletics at The University
		of Tulsa.
	{/snippet}

	<AskQuestion />

	<ul class="mt-4 flex items-center gap-1.5 sm:gap-2.5" aria-label="Find us elsewhere">
		{#each SOCIAL_LINKS as { name, href, icon, height } (name)}
			{const external = !href.startsWith('mailto:')}
			<li>
				<a
					{href}
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener noreferrer' : undefined}
					class="block"
				>
					{#if typeof icon === 'string'}
						<img src={icon} alt={name} width="35" height="35" class="size-7 sm:size-[35px]" />
					{:else}
						<enhanced:img
							src={icon}
							alt={name}
							class={['w-7 object-contain sm:w-[35px]', height]}
						/>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</Hero>

<div class="mx-auto grid max-w-content gap-x-8 px-4 pb-12 sm:px-8 md:grid-cols-12">
	<div class="space-y-12 md:col-span-6">
		<section aria-labelledby="home-podcast">
			<SectionHeading id="home-podcast">Podcast</SectionHeading>
			<p class="mb-4">
				The Golden Hurricast is a weekly podcast covering Golden Hurricane athletics at The
				University of Tulsa.
			</p>
			<Button href="/podcast/" variant="outline-primary" class="mb-4">Listen to our podcast</Button>
			<ApplePodcastsEmbed />
		</section>

		<section aria-labelledby="home-blog">
			<SectionHeading id="home-blog">Blog</SectionHeading>
			<p class="mb-4">
				We've discontinued this blog. We're writing much more often over on our
				<a href={LINKS.patreon} target="_blank" rel="noopener noreferrer">Patreon</a> now. Check it out!
			</p>
			<h3 class="mb-4 text-base">Latest blog post:</h3>
			<PostCard post={data.latestPost} headingLevel={4} />
			<Button href="/blog/" variant="outline-primary" class="mt-10">See all posts</Button>
		</section>
	</div>

	<div class="mt-12 space-y-12 md:col-span-5 md:col-start-8 md:mt-0">
		<section aria-labelledby="home-patreon">
			<SectionHeading id="home-patreon">Patreon</SectionHeading>
			<p class="mb-4">
				Unlock access to our newsletter, advanced stat breakdowns, a private Discord, automatic NIL
				contributions, and more.
			</p>
			<Button href={LINKS.patreon} variant="outline-dark" class="mb-4">Join our Patreon</Button>
			<a
				href={LINKS.patreon}
				aria-label="Our Patreon membership tiers: Carrot Cane, $5 a month; Gus T. Hurricane, $10 a month; Hurc the Hurricane, $25 a month"
				class="block"
			>
				<enhanced:img
					src={patreonTiers}
					alt=""
					sizes="(min-width: 68rem) 450px, (min-width: 48rem) 40vw, 100vw"
					loading="lazy"
					class="h-auto w-full rounded-md"
				/>
			</a>
		</section>

		<section aria-labelledby="home-socials">
			<SectionHeading id="home-socials">Socials</SectionHeading>
			<ul class="space-y-4">
				{#each SOCIAL_CARDS as { network, href, handle, background, viewBox, logo } (network)}
					<li>
						<a
							{href}
							target="_blank"
							rel="noopener noreferrer"
							class={[
								'flex max-w-[420px] items-center gap-3.5 rounded-xl px-5 py-4 text-white no-underline shadow-md transition-opacity hover:text-white hover:opacity-90',
								background
							]}
						>
							<svg {viewBox} class="size-[26px] shrink-0 fill-current" aria-hidden="true">
								<path d={logo} />
							</svg>
							<span class="flex-1 leading-tight">
								<span class="block font-bold">See our latest posts</span>
								<span class="block text-[13px]"
									>{handle}<span class="sr-only"> on {network}</span></span
								>
							</span>
							<span aria-hidden="true" class="text-xl leading-none">→</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>
