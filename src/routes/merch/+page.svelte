<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { groupProducts } from '#lib/merch.js';
	import { LINKS } from '#lib/site.js';
	import { breadcrumbs, product as productJsonLd } from '#lib/structured-data.js';
	import type { PageProps } from './$types';
	import ProductCard from './ProductCard.svelte';

	let { data, form }: PageProps = $props();

	const SIZE_CHART = 'size-chart';

	const items = $derived(groupProducts(data.products));

	/** The item whose checkout is being started, while the browser heads to Stripe. */
	let submitting = $state<string>();

	const CHARTS = [
		{
			name: 'T-shirt',
			sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
			rows: [
				['Body length from HPS', '28', '29', '30', '31', '32', '33'],
				['Chest width, laid flat', '18', '20', '22', '24', '26', '28'],
				['Sleeve length', '8¼', '8⅝', '9½', '9⅝', '10¼', '10⅞']
			]
		},
		{
			name: 'Hoodie',
			sizes: ['M', 'L', 'XL'],
			rows: [
				['Across shoulders', '21½', '23½', '25½'],
				['Body length from HPS', '28', '29', '30'],
				['Chest width, laid flat', '22', '24', '26'],
				['Sleeve length from center back', '35¼', '35⅞', '36⅝']
			]
		}
	];
</script>

<!-- Coming back from Stripe with the back button restores this page from the bfcache. -->
<svelte:window onpageshow={() => (submitting = undefined)} />

<Seo
	title="Merch"
	description="Hurricast t-shirts, hoodies, mugs, and stickers, made with Mythic here in Tulsa."
	jsonLd={[
		...items.map((item) =>
			productJsonLd({
				name: item.name,
				image: item.image,
				unitAmount: Math.min(...item.variants.map((variant) => variant.unitAmount)),
				currency: item.variants[0].currency,
				inStock: item.variants.some((variant) => variant.available > 0)
			})
		),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Merch', path: '/merch/' }
		])
	]}
/>

<PageHeader title="Wear the Hurricast.">
	{#snippet lead()}
		Our logo on a tee, a hoodie, a mug, and a sticker, made with
		<a href={LINKS.mythic} target="_blank" rel="noopener" class="link">Mythic</a>
		right here in Tulsa. Shipping is included in every price, and checkout runs securely through Stripe.
	{/snippet}
</PageHeader>

<section aria-label="Products" class="page pb-16 sm:pb-20">
	{#if items.length === 0}
		<p class="rounded-xl border border-line bg-surface p-8 text-lead text-muted">
			Merch is unavailable right now. Please check back soon, or
			<a href={LINKS.email} class="link">email us</a>.
		</p>
	{:else}
		<ul class="grid gap-5 md:grid-cols-2">
			{#each items as item, index (item.key)}
				{@const ids = item.variants.map((variant) => variant.id)}
				<li>
					<ProductCard
						{item}
						useImageCdn={data.useImageCdn}
						error={form?.productId && ids.includes(form.productId) ? form.message : undefined}
						submitting={submitting === item.key}
						disabled={submitting !== undefined}
						eager={index < 2}
						sizeChart={item.variants.some((variant) => variant.size) ? SIZE_CHART : undefined}
						onsubmit={() => (submitting = item.key)}
					/>
				</li>
			{/each}
		</ul>
		{#if form && !form.productId}
			<p role="alert" class="mt-5 font-semibold text-alert">{form.message}</p>
		{/if}
	{/if}
</section>

<Sheet id={SIZE_CHART} labelledby="{SIZE_CHART}-title" width="lg">
	<div class="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
		<div class="flex items-start justify-between gap-4">
			<h2 id="{SIZE_CHART}-title" class="display text-d3">Size charts</h2>
			<button
				type="button"
				commandfor={SIZE_CHART}
				command="close"
				class="-mt-1 -mr-2 grid size-10 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink"
			>
				<span class="sr-only">Close</span>
				<Icon name="close" />
			</button>
		</div>
		<p class="mt-2 text-muted">
			Unisex fit, in inches. For reference, Ryan is 6′1″ and wears a large in the photos.
		</p>

		{#each CHARTS as chart (chart.name)}
			<div class="mt-6 overflow-x-auto">
				<table class="w-full text-sm">
					<caption class="mb-2 text-left font-display text-2xl font-extrabold text-heading">
						{chart.name}
					</caption>
					<thead>
						<tr class="border-b-2 border-heading">
							<th scope="col" class="py-2 pr-3 text-left font-semibold"
								><span class="sr-only">Measurement</span></th
							>
							{#each chart.sizes as size (size)}
								<th
									scope="col"
									class="px-1 py-2 text-center font-display text-lg font-extrabold sm:px-2"
									>{size}</th
								>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each chart.rows as [label, ...values] (label)}
							<tr class="border-b border-line">
								<th
									scope="row"
									class="py-2.5 pr-2 text-left font-normal text-muted sm:min-w-36 sm:pr-3"
									>{label}</th
								>
								{#each values as value, column (column)}
									<td class="px-1 py-2.5 text-center font-semibold sm:px-2">{value}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</div>
</Sheet>
