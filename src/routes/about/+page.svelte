<script lang="ts">
	import aboutPhoto from '#lib/assets/matt-ryan-pat.jpeg?enhanced';
	import Hero from '#lib/components/Hero.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS, SITE } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';

	const GUESTS = [
		{ name: 'Stacy Leeds', role: 'Current President' },
		{ name: 'Brad Carson', role: 'Former President' },
		{ name: 'Justin Moore', role: 'Current Athletic Director' },
		{ name: 'Rick Dickson', role: 'Former Athletic Director' },
		{ name: 'Tre Lamb', role: 'Head Football Coach' },
		{ name: 'Eric Konkol', role: "Head Men's Basketball Coach" },
		{ name: 'Angie Nelp', role: "Head Women's Basketball Coach" },
		{ name: 'Dane Evans', role: 'Former QB' },
		{ name: 'Steve Gage', role: 'Former QB' },
		{ name: 'Trevis Gipson', role: 'Former DE' }
	];

	const MEDIA_GUESTS = ['Bruce Howard', 'Cayden McFarland', 'Kelly Hines'];
</script>

<Seo
	title="About Us"
	description="We're an independent podcast and blog that covers all things Golden Hurricane athletics."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about/' }
	])}
/>

<Hero title="About Us">
	{#snippet background()}
		<!-- Covers a box up to 580px tall, so even phones show it ~1500px wide: hence `sizes`. -->
		<enhanced:img
			src={aboutPhoto}
			alt=""
			sizes="(min-width: 1600px) 100vw, 1600px"
			fetchpriority="high"
			class="absolute inset-0 size-full object-cover object-top"
		/>
	{/snippet}

	{#snippet lead()}
		The Golden Hurricast is an independent podcast and blog that covers all things Golden Hurricane
		athletics by Ryan Token and Matt Rechtien.
	{/snippet}

	<p class="text-lg">
		We’re two TU alums, friends, and die-hard fans who love talking TU sports. Our content is not
		affiliated with The University of Tulsa.
	</p>
</Hero>

<div class="mx-auto max-w-[68rem] space-y-12 px-4 pt-4 pb-12 sm:px-8">
	<section aria-labelledby="our-podcast">
		<SectionHeading id="our-podcast">Our Podcast</SectionHeading>
		<div class="space-y-4">
			<p>
				Inspired by the late Reign Cane Sports podcast, The Golden Hurricast took up the mantle and
				officially debuted in August of 2018.
			</p>
			<p>
				Since then, we've been lucky enough to chat with several TU players, coaches, and
				administrators including:
			</p>
			<ul class="list-disc pl-8">
				{#each GUESTS as { name, role } (name)}
					<li><b>{name}</b> - {role}</li>
				{/each}
			</ul>
			<p>We've also brought on Tulsa media personalities such as:</p>
			<ul class="list-disc pl-8">
				{#each MEDIA_GUESTS as name (name)}
					<li><b>{name}</b></li>
				{/each}
			</ul>
			<p>And plenty more.</p>
			<p>
				You can find our <a href="/podcast/">podcast</a> on Apple Podcasts, Spotify, Overcast, Pocket
				Casts, Castro, Goodpods, and more. Just search for 'The Golden Hurricast'.
			</p>
		</div>
	</section>

	<section aria-labelledby="our-blog">
		<SectionHeading id="our-blog">Our Blog</SectionHeading>
		<div class="space-y-4">
			<p>
				In the fall of 2019, we decided to up our game a bit and create a <a href="/blog/">blog</a>.
				Affectionately known as Hurc's Corner, our blog was officially born on September 19, 2019.
				The name Hurc's Corner comes from TU's former mascot Hurc the Hurricane (also known as
				Huffy, but we prefer Hurc).
			</p>
			<p>
				Our goal with this blog is to dive deeper into stats, explore TU history, and write about
				interesting milestones as Tulsa athletics continues to progress. Matt (former Sports Editor
				for The Collegian) kicked things off by writing a couple stat-focused articles, and Ryan
				joined in with
				<a href="/picking-new-rivals/">'Tulsa vs Everybody: Picking New Rivals'</a>. It's been a
				joint effort ever since.
			</p>
			<p>
				The blog was going well, but we were unhappy with the WordPress URL (hercscorner.home.blog)
				and some of the other WordPress limitations. Ryan decided to build us a custom website and
				<a href="/">TheGoldenHurricast.com</a> was born. We have high hopes for the website, so let us
				know if there's anything you'd like us to add in the future.
			</p>
		</div>
	</section>

	<section aria-labelledby="contact-us">
		<SectionHeading id="contact-us">Contact Us</SectionHeading>
		<dl>
			<div>
				<dt class="inline">X:</dt>
				<dd class="inline">
					<a href={LINKS.x} target="_blank" rel="noopener noreferrer">{SITE.xHandle}</a>
				</dd>
			</div>
			<div>
				<dt class="inline">Bluesky:</dt>
				<dd class="inline">
					<a href={LINKS.bluesky} target="_blank" rel="noopener noreferrer"
						>@thegoldenhurricast.com</a
					>
				</dd>
			</div>
			<div>
				<dt class="inline">Email:</dt>
				<dd class="inline"><a href={LINKS.email}>TheGoldenHurricast@gmail.com</a></dd>
			</div>
			<div>
				<dt class="inline">Spotify for Creators:</dt>
				<dd class="inline wrap-anywhere">
					<a href={LINKS.spotifyCreators} target="_blank" rel="noopener noreferrer"
						>{LINKS.spotifyCreators}</a
					>
				</dd>
			</div>
		</dl>
	</section>
</div>
