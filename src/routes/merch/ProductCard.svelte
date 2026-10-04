<!--
	@component
	One product with a quantity picker and a checkout button. The form posts to the page's
	`checkout` action, which redirects to Stripe — no JavaScript required.
-->
<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import { productImage } from '#lib/images.js';
	import { LINKS } from '#lib/site.js';
	import type { Product } from '#lib/server/hurricast-api.js';

	interface Props {
		product: Product;
		/** Why the last checkout attempt for this product failed. */
		error?: string;
		/** This product's checkout is being started. */
		submitting: boolean;
		/** Any checkout is being started. */
		disabled: boolean;
		/** Load the photo immediately (first row of cards). */
		eager: boolean;
		useImageCdn: boolean;
		onsubmit: () => void;
	}

	let { product, error, submitting, disabled, eager, useImageCdn, onsubmit }: Props = $props();

	const LOW_STOCK = 5;

	const soldOut = $derived(product.maxQuantity < 1);
	const lowStock = $derived(!soldOut && product.available <= LOW_STOCK);
	const price = $derived(
		new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(
			product.unitAmount / 100
		)
	);
	const quantityId = $derived(`quantity-${product.id}`);
	const image = $derived(product.image ? productImage(product.image, 200, useImageCdn) : undefined);
</script>

<article
	class="flex h-full flex-col rounded-md border border-line bg-white p-3 shadow-card"
	aria-labelledby="name-{product.id}"
>
	<h3 id="name-{product.id}" class="mb-4 text-2xl">{product.name}</h3>

	{#if image}
		<img
			src={image.src}
			srcset={image.srcset}
			alt="{product.name} product photo"
			width="200"
			height="200"
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class="mx-auto mb-4 size-[200px] rounded-[10px] object-cover shadow-photo"
		/>
	{/if}

	<form method="POST" action="?/checkout" class="mt-auto flex flex-col gap-2" {onsubmit}>
		<input type="hidden" name="productId" value={product.id} />

		<p><b>Price</b>: {price}</p>

		{#if soldOut}
			<p class="text-danger italic">Sold out</p>
			<p class="text-muted italic">
				Please <a href={LINKS.email}>email us</a> if you're interested
			</p>
		{:else}
			<div class="flex items-center gap-2">
				<label for={quantityId} class="font-bold">Quantity:</label>
				<select
					id={quantityId}
					name="quantity"
					class="w-1/2 rounded border border-line bg-white px-2 py-1"
				>
					{#each { length: product.maxQuantity }, index (index)}
						<option value={index + 1}>{index + 1}</option>
					{/each}
				</select>
			</div>
			{#if lowStock}
				<p class="text-danger italic">Only {product.available} left!</p>
			{/if}
		{/if}

		{#if error}
			<p role="alert" class="text-danger">{error}</p>
		{/if}

		<Button
			type="submit"
			class="mt-2 self-start text-sm tracking-wider uppercase"
			disabled={soldOut || disabled}
		>
			{submitting ? 'Redirecting to checkout…' : 'See details & checkout'}
		</Button>
	</form>
</article>
