<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import SectionHeading from '#lib/components/SectionHeading.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { LINKS } from '#lib/site.js';
	import { breadcrumbs, product as productJsonLd } from '#lib/structured-data.js';
	import type { PageProps } from './$types';
	import ProductCard from './ProductCard.svelte';

	let { data, form }: PageProps = $props();

	/** The product whose checkout is being started, while the browser heads to Stripe. */
	let submitting = $state<string>();

	const TSHIRT_SIZES = {
		sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
		rows: [
			['Body Length From HPS', '28', '29', '30', '31', '32', '33'],
			['Chest Width (Laid Flat)', '18', '20', '22', '24', '26', '28'],
			['Sleeve Length', '8 1/4', '8 5/8', '9 1/2', '9 5/8', '10 1/4', '10 7/8']
		]
	};

	const HOODIE_SIZES = {
		sizes: ['M', 'L', 'XL'],
		rows: [
			['Across Shoulders', '21 1/2', '23 1/2', '25 1/2'],
			['Body Length From HPS', '28', '29', '30'],
			['Chest Width (Laid Flat)', '22', '24', '26'],
			['Sleeve Length (From Center Back)', '35 1/4', '35 7/8', '36 5/8']
		]
	};
</script>

<!-- Coming back from Stripe with the back button restores this page from the bfcache. -->
<svelte:window onpageshow={() => (submitting = undefined)} />

<Seo
	title="Merch"
	description="Hurricast t-shirts, hoodies, mugs and stickers, made with Mythic here in Tulsa."
	jsonLd={[
		...data.products.map((item) =>
			productJsonLd({
				name: item.name,
				image: item.image,
				unitAmount: item.unitAmount,
				currency: item.currency,
				inStock: item.available > 0
			})
		),
		breadcrumbs([
			{ name: 'Home', path: '/' },
			{ name: 'Merch', path: '/merch/' }
		])
	]}
/>

{#snippet sizeChart(title: string, chart: { sizes: string[]; rows: string[][] })}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse border border-line text-center text-sm">
			<caption class="mb-2 text-left text-base font-medium">{title}</caption>
			<thead>
				<tr class="border-b-2 border-ink">
					<th scope="col" class="p-2">Points of Measurement (inches)</th>
					{#each chart.sizes as size (size)}
						<th scope="col" class="p-2">{size}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each chart.rows as [label, ...values] (label)}
					<tr class="border-b border-line odd:bg-black/5 hover:bg-black/10">
						<th scope="row" class="border-r border-line p-2 font-normal">{label}</th>
						{#each values as value, column (column)}
							<td class="border-r border-line p-2">{value}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

<Hero title="Hurricast Merch">
	{#snippet lead()}
		Love the Hurricast? Love supporting local Tulsa businesses? Just want a shirt with Hurc the
		Hurricane on it? Buying merchandise from us provides all of this and more.
	{/snippet}
</Hero>

<div class="mx-auto max-w-[68rem] px-4 pb-12 sm:px-8">
	<p class="mb-4">
		We've teamed up with
		<a href={LINKS.mythic} target="_blank" rel="noopener noreferrer">Mythic</a>
		here in Tulsa to design and create the clothing. We use
		<a href="https://stripe.com/" target="_blank" rel="noopener noreferrer">Stripe</a> to handle payments
		and orders.
	</p>
	<p class="mb-8">
		The t-shirts and hoodies are unisex. View the <a href="#size-charts">size charts</a> at the bottom
		of the page for specific item dimensions.
	</p>

	<section aria-labelledby="products">
		<SectionHeading id="products">Hurricast Merchandise</SectionHeading>

		{#if data.products.length === 0}
			<p class="py-8 text-muted">
				Merch is unavailable right now. Please check back soon, or
				<a href={LINKS.email}>email us</a>.
			</p>
		{:else}
			<ul class="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.products as item, index (item.id)}
					<li>
						<ProductCard
							product={item}
							useImageCdn={data.useImageCdn}
							error={form?.productId === item.id ? form.message : undefined}
							submitting={submitting === item.id}
							disabled={submitting !== undefined}
							eager={index < 3}
							onsubmit={() => (submitting = item.id)}
						/>
					</li>
				{/each}
			</ul>
			{#if form && !form.productId}
				<p role="alert" class="text-danger">{form.message}</p>
			{/if}
		{/if}
	</section>

	<section aria-labelledby="size-charts" class="mt-12 space-y-8 border-t border-line pt-8">
		<div>
			<h2 id="size-charts" class="mb-2 text-xl">Size Charts</h2>
			<p class="text-muted">
				For reference, Ryan is 6′ 1″ and is wearing a <b>large</b> t-shirt and hoodie in the photos
			</p>
		</div>
		{@render sizeChart('T-Shirt Size Chart', TSHIRT_SIZES)}
		{@render sizeChart('Hoodie Size Chart', HOODIE_SIZES)}
	</section>
</div>
