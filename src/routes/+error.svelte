<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/Button.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';

	const notFound = $derived(page.status === 404);
</script>

<Seo title={notFound ? 'Page not found' : 'Something went wrong'} noindex />

<div class="pb-16 sm:pb-24">
	<PageHeader title={notFound ? 'Page not found' : 'Something went wrong'}>
		{#snippet lead()}
			{#if notFound}
				We couldn’t find the page you were looking for. It may have moved, or it may have been a
				fumble.
			{:else}
				{page.error?.message ?? 'An unexpected error occurred.'} Please try again in a moment.
			{/if}
		{/snippet}
		<Button href="/" size="lg">Back home</Button>
		<Button href="/podcast/episodes/" variant="quiet" size="lg">Browse episodes</Button>
	</PageHeader>
</div>
