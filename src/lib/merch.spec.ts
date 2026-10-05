import { expect, test } from 'vitest';
import { groupProducts } from './merch.js';
import type { Product } from '#lib/server/hurricast-api.js';

const product = (id: string, extra: Partial<Product> = {}): Product => ({
	id,
	name: id,
	unitAmount: 2700,
	currency: 'usd',
	available: 5,
	maxQuantity: 5,
	...extra
});

test('sizes of one item become a single card, in catalog order', () => {
	const shirt = { group: 'Hurricast T-Shirt' };
	const items = groupProducts([
		product('prod_tS', { ...shirt, size: 'S' }),
		product('prod_mug'),
		product('prod_tL', { ...shirt, size: 'L' }),
		// A group without a size stands alone: there'd be nothing to pick between.
		product('prod_odd', { group: 'Hurricast T-Shirt' })
	]);

	expect(items.map(({ name, variants }) => [name, variants.map(({ id }) => id)])).toEqual([
		['Hurricast T-Shirt', ['prod_tS', 'prod_tL']],
		['prod_mug', ['prod_mug']],
		['prod_odd', ['prod_odd']]
	]);
});
