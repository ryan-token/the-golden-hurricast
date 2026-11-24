/**
 * Keeps each tracked product's listing in DynamoDB in step with Stripe, so the catalog can be
 * listed without calling Stripe (see catalog.ts).
 *
 * - `syncProduct` runs on Stripe's `product.*` and `price.updated` webhooks. Like order
 *   reconciliation, it ignores the event's payload and re-reads the product from Stripe, so
 *   events that arrive late or out of order can't store an old listing.
 * - `syncCatalog` re-syncs everything: hourly as the safety net for missed webhooks, and
 *   after each deploy. It reads every product in one list call, but a webhook can store a
 *   newer listing while it works through them, so it never writes from that list: a product
 *   whose listing looks out of date is re-read on its own first, as `syncProduct` does.
 */
import { isDeepStrictEqual } from 'node:util';
import type Stripe from 'stripe';
import { listInventory, setListing } from '../data/inventory.ts';
import { log } from '../lib/log.ts';
import { toListing } from './catalog.ts';
import { isMissing } from './stripe.ts';

export type SyncOutcome = 'listed' | 'unlisted' | 'untracked';

/** Re-reads one product from Stripe and stores its listing, if we track it. */
export async function syncProduct(stripe: Stripe, productId: string): Promise<SyncOutcome> {
	const product = await stripe.products
		.retrieve(productId, { expand: ['default_price'] })
		.catch((error: unknown) => {
			// Deleted in Stripe: no longer sellable.
			if (isMissing(error)) return undefined;
			throw error;
		});
	const listing = product && toListing(product);

	if (!(await setListing(productId, listing))) {
		log.info('Ignoring a product we do not track', { productId });
		return 'untracked';
	}
	if (!listing) log.warn('Tracked product is not sellable; not listing it', { productId });
	return listing ? 'listed' : 'unlisted';
}

export interface CatalogSyncResult {
	listed: number;
	unlisted: number;
}

/** Re-syncs the listing of every tracked product from Stripe's active products. */
export async function syncCatalog(stripe: Stripe): Promise<CatalogSyncResult> {
	const [inventory, products] = await Promise.all([listInventory(), listActiveProducts(stripe)]);

	for (const product of products.values()) {
		if (!inventory.has(product.id)) {
			log.warn('Product has no inventory record; not listing it', { productId: product.id });
		}
	}

	const result: CatalogSyncResult = { listed: 0, unlisted: 0 };
	for (const [productId, stored] of inventory) {
		// Archived products aren't in the list: they come out as unsellable.
		const product = products.get(productId);
		const listing = product && toListing(product);

		if (isDeepStrictEqual(listing, stored.listing)) {
			result[listing ? 'listed' : 'unlisted']++;
			if (!listing) log.warn('Tracked product is not sellable; not listing it', { productId });
			continue;
		}
		const outcome = await syncProduct(stripe, productId);
		// Untracked since the Query above: nothing to count.
		if (outcome !== 'untracked') result[outcome]++;
	}
	return result;
}

async function listActiveProducts(stripe: Stripe): Promise<Map<string, Stripe.Product>> {
	const products = new Map<string, Stripe.Product>();
	for await (const product of stripe.products.list({
		active: true,
		expand: ['data.default_price'],
		limit: 100
	})) {
		products.set(product.id, product);
	}
	return products;
}
