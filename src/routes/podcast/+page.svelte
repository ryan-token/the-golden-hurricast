<script lang="ts">
	import appleBadge from '#lib/assets/listen-on/listen-on-apple-podcasts.svg';
	import castroBadge from '#lib/assets/listen-on/listen-on-castro.svg';
	import goodpodsBadge from '#lib/assets/listen-on/listen-on-goodpods.svg';
	import overcastBadge from '#lib/assets/listen-on/listen-on-overcast.svg';
	import pocketCastsBadge from '#lib/assets/listen-on/listen-on-pocket-casts.svg';
	import spotifyBadge from '#lib/assets/listen-on/listen-on-spotify.svg';
	import ApplePodcastsEmbed from '#lib/components/ApplePodcastsEmbed.svelte';
	import AskQuestion from '#lib/components/AskQuestion.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS, SITE } from '#lib/site.js';
	import { breadcrumbs, podcastSeries } from '#lib/structured-data.js';

	// Apple's badge is the official one from Apple Marketing Tools; the rest are Podlink's
	// matching dark badges (https://github.com/TeamPodlink/badges). Widths are at 40px tall.
	const PLATFORMS = [
		{ name: 'Apple Podcasts', badge: appleBadge, width: 126, href: LINKS.applePodcasts },
		{ name: 'Spotify', badge: spotifyBadge, width: 106, href: LINKS.spotify },
		{ name: 'Overcast', badge: overcastBadge, width: 121, href: LINKS.overcast },
		{ name: 'Pocket Casts', badge: pocketCastsBadge, width: 155, href: LINKS.pocketCasts },
		{ name: 'Castro', badge: castroBadge, width: 102, href: LINKS.castro },
		{ name: 'Goodpods', badge: goodpodsBadge, width: 133, href: LINKS.goodpods }
	];

	const DESCRIPTION =
		'A weekly podcast covering Golden Hurricane athletics at The University of Tulsa.';
</script>

<Seo
	title="Podcast"
	description={DESCRIPTION}
	jsonLd={[
		podcastSeries(),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Podcast', path: '/podcast/' }
		])
	]}
/>

{#snippet guest(href: string, label: string)}
	<a {href} target="_blank" rel="noopener noreferrer">{label}</a>
{/snippet}

<Hero title={SITE.name}>
	{#snippet lead()}
		{DESCRIPTION}
	{/snippet}

	<AskQuestion />

	<ul class="mt-4 flex flex-wrap gap-2.5" aria-label="Listen on">
		{#each PLATFORMS as { name, badge, width, href } (name)}
			<li>
				<a {href} target="_blank" rel="noopener noreferrer" class="block">
					<img src={badge} alt="Listen on {name}" {width} height="40" class="block h-10 w-auto" />
				</a>
			</li>
		{/each}
	</ul>
</Hero>

<div class="mx-auto max-w-content space-y-4 px-4 pb-12 sm:px-8">
	<p>
		Tune in as we discuss Tulsa athletics with TU figures including
		{@render guest(
			'https://utulsa.edu/about/leadership/president/stacy-leeds/',
			'President Stacy Leeds'
		)},
		{@render guest('https://en.wikipedia.org/wiki/Brad_Carson', 'former President Brad Carson')},
		{@render guest(
			'https://utulsa.edu/about/leadership/executive-staff/justin-moore/',
			'AD Justin Moore'
		)},
		{@render guest(
			'https://tulsahurricane.com/staff-directory/tre-lamb/2657',
			'Head Football Coach Tre Lamb'
		)},
		{@render guest(
			'https://tulsahurricane.com/staff-directory/eric-konkol/2458',
			"Head Men's Basketball Coach Eric Konkol"
		)},
		{@render guest(
			'https://tulsahurricane.com/sports/womens-basketball/roster/coaches/angie-nelp/1685',
			"Head Women's Basketball Coach Angie Nelp"
		)},
		{@render guest(
			'https://tulsahurricane.com/sports/football/roster/dane-evans/5365',
			'QB Dane Evans'
		)}, and
		{@render guest(
			'https://tulsahurricane.com/sports/football/roster/trevis-gipson/8011',
			'DE Trevis Gipson'
		)}, media personalities such as
		{@render guest('https://tulsahurricane.com/staff-directory/bruce-howard/25', 'Bruce Howard')},
		{@render guest('https://www.kjrh.com/cayden-mcfarland', 'Cayden McFarland')}, and
		{@render guest('https://tulsaworld.com/users/profile/kelly%20hines/', 'Kelly Hines')}, and
		conference foes like Tulane's
		{@render guest('https://twitter.com/FearTheWaveBlog', 'Fear the Wave')}, ECU's
		{@render guest('https://twitter.com/BoneyardPodcast', 'Boneyard Podcast')}, and USF's
		{@render guest('https://x.com/SteegLife', 'Bay Area Examiner')}.
	</p>

	<p>
		All of our episodes are available on the web via
		<a href={LINKS.spotifyCreators} target="_blank" rel="noopener noreferrer"
			>Spotify for Creators</a
		>.
	</p>

	<p>
		You can also find our podcast on Apple Podcasts, Spotify, Overcast, Pocket Casts, Castro,
		Goodpods, and more. Just search for 'The Golden Hurricast'.
	</p>

	<section aria-labelledby="listen" class="pt-8">
		<SectionHeading id="listen">Listen to the Show</SectionHeading>
		<ApplePodcastsEmbed />
	</section>
</div>
