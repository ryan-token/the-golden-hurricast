/**
 * The merch catalog: Stripe is the source of truth for products and prices; DynamoDB for
 * stock. Only products that are active in Stripe, have an active one-time USD default price,
 * and are tracked in inventory are for sale.
 */
import type Stripe from 'stripe';
import { listInventory } from '../data/inventory.ts';
import { log } from '../lib/log.ts';

/** Most units of one product a customer can buy in a single checkout. */
export const MAX_PER_ORDER = 10;

export interface StripeProduct {
	id: string;
	name: string;
	image?: string;
	priceId: string;
	/** In the currency's minor unit (cents). */
	unitAmount: number;
	currency: string;
	/** From the product's `sort_number` metadata; lower sorts first. */
	sortNumber: number;
}

export interface CatalogProduct {
	id: string;
	name: string;
	image?: string;
	unitAmount: number;
	currency: string;
	available: number;
	maxQuantity: number;
}

/**
 * Converts a Stripe product into what we sell, or `undefined` if it isn't sellable.
 * The price charged is always the product's default price, resolved here on the server.
 */
export function toStripeProduct(product: Stripe.Product): StripeProduct | undefined {
	const price = product.default_price;
	if (!product.active || !price || typeof price === 'string') return undefined;
	if (!price.active || price.type !== 'one_time' || price.currency !== 'usd') return undefined;
	if (price.unit_amount === null || price.unit_amount <= 0) return undefined;

	const sortNumber = Number.parseInt(product.metadata.sort_number ?? '', 10);
	return {
		id: product.id,
		name: product.name,
		image: product.images[0],
		priceId: price.id,
		unitAmount: price.unit_amount,
		currency: price.currency,
		sortNumber: Number.isNaN(sortNumber) ? Number.MAX_SAFE_INTEGER : sortNumber
	};
}

const CACHE_TTL_MS = 60_000;
let cached: { products: Promise<StripeProduct[]>; expires: number } | undefined;

/** Sellable Stripe products in display order, cached for a minute per container. */
export function getStripeProducts(stripe: Stripe): Promise<StripeProduct[]> {
	if (cached && cached.expires > Date.now()) return cached.products;

	const products = (async () => {
		const sellable: StripeProduct[] = [];
		for await (const product of stripe.products.list({
			active: true,
			expand: ['data.default_price'],
			limit: 100
		})) {
			const converted = toStripeProduct(product);
			if (converted) sellable.push(converted);
			else log.warn('Skipping product without a sellable default price', { productId: product.id });
		}
		return sellable.sort((a, b) => a.sortNumber - b.sortNumber || a.name.localeCompare(b.name));
	})();

	products.catch(() => (cached = undefined));
	cached = { products, expires: Date.now() + CACHE_TTL_MS };
	return products;
}

/** Products for sale with live stock. Untracked products are left out (and logged). */
export async function getCatalog(stripe: Stripe): Promise<CatalogProduct[]> {
	const [products, inventory] = await Promise.all([getStripeProducts(stripe), listInventory()]);

	return products.flatMap((product) => {
		const stock = inventory.get(product.id);
		if (!stock) {
			log.warn('Product has no inventory record; not listing it', { productId: product.id });
			return [];
		}
		const available = Math.max(0, stock.available);
		return [
			{
				id: product.id,
				name: product.name,
				image: product.image,
				unitAmount: product.unitAmount,
				currency: product.currency,
				available,
				maxQuantity: Math.min(available, MAX_PER_ORDER)
			}
		];
	});
}

/** Test hook: forget the cached Stripe catalog. */
export function clearCatalogCache() {
	cached = undefined;
}
