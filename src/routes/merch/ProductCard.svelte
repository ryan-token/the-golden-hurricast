<!--
	@component
	One item with its size picker, a quantity stepper, and a Buy button. The form posts the chosen
	size's product to the page's `checkout` action, which redirects to Stripe — no JavaScript
	required. With JavaScript, the price, stock note, and quantity limit follow the chosen size.
-->
<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { formatMoney } from '#lib/format.js';
	import { productImage } from '#lib/images.js';
	import type { MerchItem } from '#lib/merch.js';
	import { LINKS } from '#lib/site.js';

	interface Props {
		item: MerchItem;
		/** Why the last checkout attempt for this item failed. */
		error?: string;
		/** This item's checkout is being started. */
		submitting: boolean;
		/** Any checkout is being started. */
		disabled: boolean;
		/** Load the photo immediately (first row of cards). */
		eager: boolean;
		useImageCdn: boolean;
		/** The id of the size chart dialog, for apparel. */
		sizeChart?: string;
		onsubmit: () => void;
	}

	let { item, error, submitting, disabled, eager, useImageCdn, sizeChart, onsubmit }: Props =
		$props();

	const LOW_STOCK = 5;

	const sized = $derived(item.variants.length > 1 || item.variants[0].size !== undefined);
	const soldOut = $derived(item.variants.every((variant) => variant.available < 1));

	let chosenId = $state<string>();
	const chosen = $derived(
		item.variants.find((variant) => variant.id === chosenId) ??
			item.variants.find((variant) => variant.available > 0) ??
			item.variants[0]
	);

	/** A size picked before the page finished loading stays picked: the form will post it. */
	function adoptEarlyChoice(fieldset: HTMLFieldSetElement) {
		const picked = fieldset.querySelector<HTMLInputElement>('input:checked');
		if (picked) chosenId = picked.value;
	}

	let quantity = $state(1);
	const maxQuantity = $derived(Math.max(1, chosen.maxQuantity));
	const clampedQuantity = $derived(Math.min(Math.max(quantity, 1), maxQuantity));

	const price = $derived(formatMoney(chosen.unitAmount * clampedQuantity, chosen.currency));
	const image = $derived(item.image ? productImage(item.image, 480, useImageCdn) : undefined);

	const stockNote = $derived.by(() => {
		if (soldOut) return undefined;
		const size = chosen.size ? `Size ${chosen.size}` : undefined;
		const note = chosen.available <= LOW_STOCK ? `only ${chosen.available} left` : 'in stock';
		return size ? `${size}, ${note}` : note[0].toUpperCase() + note.slice(1);
	});
</script>

<article
	aria-labelledby="name-{item.key}"
	class="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface"
>
	{#if image}
		<img
			src={image.src}
			srcset={image.srcset}
			alt="{item.name} product photo"
			width="480"
			height="480"
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class="aspect-square w-full bg-sand object-cover"
		/>
	{/if}

	<form method="POST" action="?/checkout" class="flex flex-1 flex-col gap-5 p-5 sm:p-6" {onsubmit}>
		<div class="flex items-baseline justify-between gap-4">
			<h2
				id="name-{item.key}"
				class="font-display text-3xl leading-none font-extrabold text-heading"
			>
				{item.name}
			</h2>
			<p class="font-display text-3xl leading-none font-extrabold text-heading">
				{formatMoney(chosen.unitAmount, chosen.currency)}
			</p>
		</div>

		{#if sized}
			<fieldset class="relative" {@attach adoptEarlyChoice}>
				<legend class="mb-2 font-semibold">Size</legend>
				{#if sizeChart}
					<button
						type="button"
						commandfor={sizeChart}
						command="show-modal"
						class="absolute top-0 right-0 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
					>
						<Icon name="ruler" class="size-4" /> Size chart
					</button>
				{/if}
				<div class="flex flex-wrap gap-2">
					{#each item.variants as variant (variant.id)}
						{@const out = variant.available < 1}
						<label class="relative grid w-14 justify-items-center gap-1">
							<input
								type="radio"
								name="productId"
								value={variant.id}
								defaultChecked={variant.id === chosen.id}
								disabled={out}
								onchange={() => (chosenId = variant.id)}
								class="peer sr-only"
							/>
							<span
								class={[
									'grid h-12 w-full place-items-center rounded-md border font-display text-xl font-extrabold transition-colors',
									'border-line-strong bg-canvas text-heading',
									'peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent',
									'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
									out
										? 'cursor-not-allowed text-muted line-through decoration-alert decoration-2 opacity-60'
										: 'cursor-pointer hover:border-heading'
								]}
							>
								{variant.size}
							</span>
							<span
								class={[
									'h-4 text-[0.6875rem] leading-4 font-semibold',
									out ? 'text-muted' : 'text-alert'
								]}
							>
								{#if out}Sold out{:else if variant.available <= LOW_STOCK}{variant.available} left{/if}
							</span>
						</label>
					{/each}
				</div>
			</fieldset>
		{:else}
			<input type="hidden" name="productId" value={chosen.id} />
		{/if}

		<div class="mt-auto grid gap-3">
			{#if soldOut}
				<p class="text-muted">
					Sold out for now. <a href={LINKS.email} class="link">Email us</a> if you’re interested.
				</p>
			{:else}
				<div class="flex gap-3">
					<div class="flex h-13 items-center rounded-full border border-line-strong bg-canvas">
						<button
							type="button"
							onclick={() => (quantity = clampedQuantity - 1)}
							disabled={clampedQuantity <= 1}
							aria-label="One fewer"
							class="grid size-11 place-items-center rounded-full text-heading disabled:opacity-35"
						>
							<Icon name="minus" class="size-4" />
						</button>
						<label>
							<span class="sr-only">Quantity</span>
							<input
								type="number"
								name="quantity"
								inputmode="numeric"
								min="1"
								max={maxQuantity}
								bind:value={() => clampedQuantity, (value) => (quantity = value ?? 1)}
								class="w-8 [appearance:textfield] bg-transparent text-center font-semibold text-heading [&::-webkit-inner-spin-button]:appearance-none"
							/>
						</label>
						<button
							type="button"
							onclick={() => (quantity = clampedQuantity + 1)}
							disabled={clampedQuantity >= maxQuantity}
							aria-label="One more"
							class="grid size-11 place-items-center rounded-full text-heading disabled:opacity-35"
						>
							<Icon name="plus" class="size-4" />
						</button>
					</div>
					<Button type="submit" variant="gold" size="lg" {disabled} class="flex-1">
						{submitting ? 'Heading to checkout…' : `Buy · ${price}`}
					</Button>
				</div>
				<p class="text-sm text-muted">{stockNote}. Shipping included.</p>
			{/if}

			{#if error}
				<p role="alert" class="font-semibold text-alert">{error}</p>
			{/if}
		</div>
	</form>
</article>
