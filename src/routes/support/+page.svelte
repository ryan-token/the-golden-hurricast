<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS } from '#lib/site.js';
	import { breadcrumbs } from '#lib/structured-data.js';
</script>

<Seo
	title="Support Us"
	description="We do all of this for free and for the love of TU athletics. Here's how you can support the podcast and the blog."
	jsonLd={breadcrumbs([
		{ name: 'Home', path: '/' },
		{ name: 'Support', path: '/support/' }
	])}
/>

<Hero title="Support Us">
	{#snippet lead()}
		We do all of this for free (and ad-free) because we love TU athletics. If you have the means to
		do so, there are several ways you can support the podcast and the blog.
	{/snippet}
</Hero>

<section aria-labelledby="how-to-support" class="mx-auto max-w-[68rem] px-4 pt-4 pb-12 sm:px-8">
	<SectionHeading id="how-to-support">How to Support Us</SectionHeading>
	<ol class="space-y-10">
		<li>
			<b>Way #1:</b> Join our
			<a href={LINKS.patreon} target="_blank" rel="noopener noreferrer">Patreon</a>! Unlock access
			to our newsletter, advanced stat breakdowns, automatic NIL contributions, and much more.
		</li>
		<li>
			<b>Way #2:</b> Sign up for a
			<a href={LINKS.spotifySupport} target="_blank" rel="noopener noreferrer"
				>recurring monthly donation</a
			>
			on Spotify for Creators (our podcast host).
		</li>
		<li>
			<b>Way #3:</b> Buy our <a href="/merch/">merchandise</a>.
		</li>
		<li>
			<b>Way #4:</b> Make a
			<a href={LINKS.paypal} target="_blank" rel="noopener noreferrer">one-time donation</a> of any amount
			via PayPal.
		</li>
		<li>
			<b>Way #5:</b> Leave a
			<a href={LINKS.x} target="_blank" rel="noopener noreferrer">tip on X</a>. Just tap the dollar
			bills icon at the top of our profile.
		</li>
	</ol>
</section>
