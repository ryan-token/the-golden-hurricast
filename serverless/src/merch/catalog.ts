/**
 * The merch catalog: Stripe is the source of truth for products and prices; DynamoDB for
 * stock. Only products that are active in Stripe, have an active one-time USD default price,
 * and are tracked in inventory are for sale.
 *
 * Listing the catalog reads DynamoDB only: each tracked product's inventory item carries a
 * copy of its Stripe listing, kept current by catalog-sync.ts.
 */
import type Stripe from 'stripe';
import { listInventory } from '../data/inventory.ts';
import type { Listing } from '../data/inventory.ts';

/** Most units of one product a customer can buy in a single checkout. */
export const MAX_PER_ORDER = 10;

export interface CatalogProduct {
	id: string;
	name: string;
	image?: string;
	group?: string;
	size?: string;
	unitAmount: number;
	currency: string;
	available: number;
	maxQuantity: number;
}

/**
 * What we'd list for a Stripe product, or `undefined` if it isn't sellable. The price
 * charged is always the product's default price (expanded), resolved here on the server.
 */
export function toListing(product: Stripe.Product): Listing | undefined {
	const price = product.default_price;
	if (!product.active || !price || typeof price === 'string') return undefined;
	if (!price.active || price.type !== 'one_time' || price.currency !== 'usd') return undefined;
	if (price.unit_amount === null || price.unit_amount <= 0) return undefined;

	const sortNumber = Number.parseInt(product.metadata.sort_number ?? '', 10);
	const group = product.metadata.group?.trim();
	const size = product.metadata.size?.trim();
	const image = product.images[0];
	return {
		name: product.name,
		...(image && { image }),
		priceId: price.id,
		unitAmount: price.unit_amount,
		currency: price.currency,
		sortNumber: Number.isNaN(sortNumber) ? Number.MAX_SAFE_INTEGER : sortNumber,
		...(group && { group }),
		...(size && { size })
	};
}

/** Products for sale with live stock, in display order. */
export async function getCatalog(): Promise<CatalogProduct[]> {
	const listed = [...(await listInventory()).values()].flatMap(({ listing, ...stock }) =>
		listing ? [{ ...stock, listing }] : []
	);

	return listed
		.sort(
			(a, b) =>
				a.listing.sortNumber - b.listing.sortNumber || a.listing.name.localeCompare(b.listing.name)
		)
		.map(({ productId, available, listing }) => {
			const units = Math.max(0, available);
			return {
				id: productId,
				name: listing.name,
				image: listing.image,
				...(listing.group && { group: listing.group }),
				...(listing.size && { size: listing.size }),
				unitAmount: listing.unitAmount,
				currency: listing.currency,
				available: units,
				maxQuantity: Math.min(units, MAX_PER_ORDER)
			};
		});
}
