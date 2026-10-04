<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { SITE } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const title = $derived(
		{
			received: 'Question received',
			invalid: 'Your question was not sent',
			'rate-limited': 'Your question was not sent',
			failed: 'Something went wrong'
		}[data.outcome]
	);
</script>

<Seo {title} description="Thanks for sending The Golden Hurricast a question." noindex />

<Hero {title}>
	{#snippet lead()}
		{#if data.outcome === 'received'}
			Thanks for submitting a question! We'll try to answer it on the podcast soon.
		{:else if data.outcome === 'invalid'}
			Your question must not be empty and can be up to 2,000 characters long, and your name can be
			up to 100 characters. Please go back and try again.
		{:else if data.outcome === 'rate-limited'}
			You've sent several questions in a short time. Please try again in a few minutes.
		{:else}
			There was an error submitting your question. Sorry about that. If you'd like to submit your
			question over email, send one to
			<a href="mailto:{SITE.email}?subject=Listener%20Question">{SITE.email}</a>.
		{/if}
	{/snippet}

	<div class="flex flex-wrap gap-2">
		<Button href="/podcast/" variant="outline-primary">Back to the podcast</Button>
		<Button href="/" variant="outline-dark">Home</Button>
	</div>
</Hero>
