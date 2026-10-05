<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatMoney } from '#lib/format.js';
	import { LINKS, SITE } from '#lib/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const order = $derived(data.order);

	const heading = $derived.by(() => {
		switch (order?.status) {
			case 'paid':
				return 'Order Successful!';
			case 'processing':
				return 'Order Received';
			case undefined:
				return data.notFound ? 'Order Not Found' : 'Thanks for your order!';
			default:
				return 'Order Not Completed';
		}
	});
</script>

<Seo title="Order confirmation" noindex />

<div class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="mb-6 border-b border-line pb-2 text-h4">{heading}</h1>

	<div class="space-y-5">
		{#if order?.status === 'paid' || order?.status === 'processing'}
			{#if order.status === 'processing'}
				<p>
					Your payment is still processing. We'll ship your order as soon as it clears, and you'll
					get an email from Stripe when it does.
				</p>
			{/if}

			<table class="w-full max-w-md text-left">
				<caption class="sr-only">Your order</caption>
				<tbody>
					{#each order.items as item (item.name)}
						<tr class="border-b border-line">
							<th scope="row" class="py-2 pr-4 font-normal">{item.quantity} × {item.name}</th>
							<td class="py-2 text-right">{formatMoney(item.amountTotal, order.currency)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" class="py-2 pr-4">Total paid</th>
						<td class="py-2 text-right font-bold"
							>{formatMoney(order.amountTotal, order.currency)}</td
						>
					</tr>
				</tfoot>
			</table>

			<p>
				<b>Thank you</b> for your support! Look out for an email from <b>USPS</b> within the next few
				days with the tracking information for your shipment.
			</p>
		{:else if order}
			<p>
				This checkout wasn't completed, so you haven't been charged. You can head back to the merch
				page to try again.
			</p>
		{:else if data.notFound}
			<p>
				We couldn't find an order for this link. If you've just checked out, check your email for a
				receipt from Stripe.
			</p>
		{:else}
			<p>
				<b>Thank you</b> for your support! You'll receive an email receipt from Stripe, and an email
				from <b>USPS</b> within the next few days with the tracking information for your shipment.
			</p>
		{/if}

		<p>
			If you have any questions or concerns about your order, please email us at
			<a href={LINKS.email}>{SITE.email}</a>.
		</p>

		<p>— Ryan &amp; Matt</p>
	</div>

	<div class="mt-8 flex gap-5">
		<Button href="/merch/" variant="outline-primary">Back to merch</Button>
		<Button href="/" variant="outline-primary">Back home</Button>
	</div>
</div>
