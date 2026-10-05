import type { Product } from '#lib/server/hurricast-api.js';

/** One card on the merch page: a product, or every size of one (see `groupProducts`). */
export interface MerchItem {
	/** The first variant's product id: unique, and safe to use in element ids. */
	key: string;
	name: string;
	image?: string;
	/** In catalog order. A product without sizes has exactly one variant, with no `size`. */
	variants: Product[];
}

/**
 * Gathers products that share a `group` (their Stripe metadata) into one item with a size
 * picker. Items keep the catalog's order, placed where their first variant appears.
 */
export function groupProducts(products: Product[]): MerchItem[] {
	const items = new Map<string, MerchItem>();
	for (const product of products) {
		const group = product.size ? product.group : undefined;
		const item = items.get(group ?? product.id);
		if (item) item.variants.push(product);
		else
			items.set(group ?? product.id, {
				key: product.id,
				name: group ?? product.name,
				image: product.image,
				variants: [product]
			});
	}
	return [...items.values()];
}
