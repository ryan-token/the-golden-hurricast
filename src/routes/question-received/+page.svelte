<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { SITE } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const title = $derived(
		{
			received: 'It’s in the mailbag.',
			invalid: 'Your question wasn’t sent',
			'rate-limited': 'Your question wasn’t sent',
			failed: 'Something went wrong'
		}[data.outcome]
	);
</script>

<Seo {title} description="Thanks for sending The Golden Hurricast a question." noindex />

<div class="pb-16 sm:pb-24">
	<PageHeader {title}>
		{#snippet lead()}
			{#if data.outcome === 'received'}
				Thanks for your question. We go through them before every recap, and we’ll try to answer
				yours on the podcast soon.
			{:else if data.outcome === 'invalid'}
				Your question can’t be empty and can be up to 2,000 characters long, and your name can be up
				to 100 characters. Please go back and try again.
			{:else if data.outcome === 'rate-limited'}
				You’ve sent several questions in a short time. Please try again in a few minutes.
			{:else}
				We couldn’t send your question. Sorry about that. You can email it to
				<a href="mailto:{SITE.email}?subject=Listener%20Question" class="link">{SITE.email}</a>
				instead.
			{/if}
		{/snippet}
		<Button href="/podcast/" size="lg">Back to the podcast</Button>
		<Button href="/" variant="quiet" size="lg">Home</Button>
	</PageHeader>
</div>
