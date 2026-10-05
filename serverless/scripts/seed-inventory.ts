/**
 * One-time migration from the legacy merch backend: computes each product's remaining stock
 * the way the old `calculateRemainingItems` Lambda did (hard-coded "total ever bought" minus
 * the quantities recorded in the legacy Orders table) and starts tracking it here.
 *
 *   node scripts/seed-inventory.ts --stage dev                 # dry run: print the plan
 *   node scripts/seed-inventory.ts --stage prod --apply        # write it
 *   ... --set prod_123=4 --set prod_456=0                      # override after a physical count
 *
 * The legacy data was written by the browser and could be incomplete or tampered with, so
 * check the plan against a physical count (and Stripe's payments) before applying it.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, paginateScan } from '@aws-sdk/lib-dynamodb';
import { createInventory, listInventory } from '../src/data/inventory.ts';
import { parseCli } from './cli.ts';

const { stage, values } = parseCli({
	apply: { type: 'boolean' },
	set: { type: 'string', multiple: true }
});

// From the legacy merch-api handler (main branch: serverless/services/merch-api/handler.js).
const LEGACY = {
	prod: {
		table: 'Orders',
		products: [
			['prod_LPdRKopEfIEVR5', 'Hurricast T-Shirt (3xl)', 3],
			['prod_LPdR9Nox0aEBIE', 'Hurricast T-Shirt (2xl)', 6],
			['prod_LPdQGwJQfyqk4j', 'Hurricast T-Shirt (xl)', 20],
			['prod_LPdQkbU0fqZbuR', 'Hurricast T-Shirt (large)', 28],
			['prod_LPdQJsFmLSMvA6', 'Hurricast T-Shirt (med)', 10],
			['prod_LPdOWN6j9BTVkI', 'Hurricast T-Shirt (small)', 6],
			['prod_LgLOepRsUuhoLr', 'Hurricast Hoodie (2xl)', 2],
			['prod_LPdRl5mBH7g7Pj', 'Hurricast Hoodie (xl)', 8],
			['prod_LPdROFctTRyBZy', 'Hurricast Hoodie (large)', 9],
			['prod_LPdRj6SAvLwtoT', 'Hurricast Hoodie (med)', 9],
			['prod_LPdRoZU8UuhHF5', 'Hurricast Mug', 18],
			['prod_LdtEmY4IOlEpaK', 'Hurricast Sticker', 98]
		]
	},
	dev: {
		table: 'Orders-dev',
		products: [
			['prod_LOSb5SQ5OZKjjU', 'Hurricast T-Shirt (3xl)', 3],
			['prod_LOSaG7vnGTethb', 'Hurricast T-Shirt (2xl)', 6],
			['prod_LOSa6G2h9BbWvv', 'Hurricast T-Shirt (xl)', 20],
			['prod_LOSZCa8DDzfnQw', 'Hurricast T-Shirt (large)', 28],
			['prod_LOSYQEvBHBz8Ql', 'Hurricast T-Shirt (med)', 10],
			['prod_LOS9GEK71k4c68', 'Hurricast T-Shirt (small)', 6],
			['prod_Ldt2fpuFUXfGx8', 'Hurricast Hoodie (2xl)', 2],
			['prod_LOSXxWav6ggxVc', 'Hurricast Hoodie (xl)', 8],
			['prod_LOSWM41qlf8gIJ', 'Hurricast Hoodie (large)', 9],
			['prod_LOSAJMwijaQv1u', 'Hurricast Hoodie (med)', 9],
			['prod_LPdHHLIvgksU1C', 'Hurricast Mug', 18],
			['prod_LdrsVALUNpfIz4', 'Hurricast Sticker', 98]
		]
	}
} as const;

const legacy = LEGACY[stage];
const overrides = new Map(
	(values.set ?? []).map((entry) => {
		const [productId, count] = entry.split('=');
		if (!productId || !Number.isInteger(Number(count))) throw new Error(`Bad --set ${entry}`);
		return [productId, Number(count)];
	})
);

// Sum legacy orders per product.
const legacyDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sold = new Map<string, number>();
for await (const page of paginateScan({ client: legacyDb }, { TableName: legacy.table })) {
	for (const item of page.Items ?? []) {
		const quantity = Number(item.quantity);
		if (Number.isInteger(quantity) && quantity > 0) {
			sold.set(item.productId, (sold.get(item.productId) ?? 0) + quantity);
		}
	}
}

const existing = await listInventory();
const plan = legacy.products.map(([productId, name, total]) => {
	const computed = Math.max(0, total - (sold.get(productId) ?? 0));
	return {
		productId,
		name,
		total,
		legacySold: sold.get(productId) ?? 0,
		computed,
		available: overrides.get(productId) ?? computed,
		status: existing.has(productId)
			? 'already tracked (skipped)'
			: values.apply
				? 'created'
				: 'would create'
	};
});

for (const row of plan) {
	if (values.apply && !existing.has(row.productId)) {
		await createInventory({ productId: row.productId, name: row.name, available: row.available });
	}
}

console.log(
	`Seed inventory for hurricast-${stage} from ${legacy.table}${values.apply ? '' : ' (dry run)'}`
);
console.table(plan);
