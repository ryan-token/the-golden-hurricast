<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/Button.svelte';
	import Seo from '#lib/components/Seo.svelte';

	const notFound = $derived(page.status === 404);
</script>

<Seo title={notFound ? 'Page not found' : 'Something went wrong'} noindex />

<div class="mx-auto max-w-3xl px-4 py-16">
	<h1 class="mb-4">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
	<p class="mb-6 text-lg">
		{#if notFound}
			We couldn't find the page you were looking for.
		{:else}
			{page.error?.message ?? 'An unexpected error occurred.'} Please try again in a moment.
		{/if}
	</p>
	<Button href="/" variant="outline-primary">Back home</Button>
</div>
