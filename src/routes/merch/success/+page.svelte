<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatMoney } from '#lib/format.js';
	import { LINKS, SITE } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const order = $derived(data.order);

	const heading = $derived.by(() => {
		switch (order?.status) {
			case 'paid':
				return 'Order successful!';
			case 'processing':
				return 'Order received';
			case undefined:
				return data.notFound ? 'Order not found' : 'Thanks for your order!';
			default:
				return 'Order not completed';
		}
	});
</script>

<Seo title="Order confirmation" noindex />

<PageHeader title={heading}>
	{#snippet lead()}
		{#if order?.status === 'paid' || order?.status === 'processing'}
			{#if order.status === 'processing'}
				Your payment is still processing. We’ll ship your order as soon as it clears, and you’ll get
				an email from Stripe when it does.
			{:else}
				Thank you for your support! Look out for an email from USPS within the next few days with
				the tracking information for your shipment.
			{/if}
		{:else if order}
			This checkout wasn’t completed, so you haven’t been charged. You can head back to the merch
			page to try again.
		{:else if data.notFound}
			We couldn’t find an order for this link. If you’ve just checked out, check your email for a
			receipt from Stripe.
		{:else}
			Thank you for your support! You’ll receive an email receipt from Stripe, and an email from
			USPS within the next few days with the tracking information for your shipment.
		{/if}
	{/snippet}
</PageHeader>

<div class="page pb-16 sm:pb-24">
	{#if order?.status === 'paid' || order?.status === 'processing'}
		<table class="w-full max-w-md overflow-hidden rounded-lg bg-surface text-left ring-1 ring-line">
			<caption class="sr-only">Your order</caption>
			<tbody class="divide-y divide-line">
				{#each order.items as item (item.name)}
					<tr>
						<th scope="row" class="px-5 py-3 font-normal">{item.quantity} × {item.name}</th>
						<td class="px-5 py-3 text-right">{formatMoney(item.amountTotal, order.currency)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot class="border-t-2 border-line-strong">
				<tr>
					<th scope="row" class="px-5 py-3">Total paid</th>
					<td class="px-5 py-3 text-right font-bold"
						>{formatMoney(order.amountTotal, order.currency)}</td
					>
				</tr>
			</tfoot>
		</table>
	{/if}

	<p class="mt-8 max-w-2xl text-muted">
		If you have any questions or concerns about your order, please email us at
		<a href={LINKS.email} class="link">{SITE.email}</a>. — Ryan &amp; Matt
	</p>

	<div class="mt-8 flex flex-wrap gap-3">
		<Button href="/merch/" variant="quiet" size="lg">Back to merch</Button>
		<Button href="/" variant="quiet" size="lg">Back home</Button>
	</div>
</div>
