/**
 * Inventory admin.
 *
 *   npm run inventory -- --stage prod                          # list stock
 *   npm run inventory -- --stage prod track prod_123 "Mug" 12  # start tracking a product
 *   npm run inventory -- --stage prod adjust prod_123 +6       # restock (or -2 after a count)
 */
import { adjustAvailable, createInventory, listInventory } from '../src/data/inventory.ts';
import { parseCli } from './cli.ts';

const { stage, positionals } = parseCli({});
const [command = 'list', ...args] = positionals;

switch (command) {
	case 'list': {
		const rows = [...(await listInventory()).values()].map(
			({ productId, name, available, reserved, sold }) => ({
				productId,
				name,
				available,
				reserved,
				sold
			})
		);
		console.log(`Inventory (${stage})`);
		console.table(rows);
		break;
	}
	case 'track': {
		const [productId, name, available] = args;
		if (!productId?.startsWith('prod_') || !name || !Number.isInteger(Number(available))) {
			throw new Error('Usage: track <productId> <name> <available>');
		}
		await createInventory({ productId, name, available: Number(available) });
		console.log(`Now tracking ${productId} (${name}) with ${available} available`);
		break;
	}
	case 'adjust': {
		const [productId, delta] = args;
		if (!productId || !Number.isInteger(Number(delta)))
			throw new Error('Usage: adjust <productId> <+n|-n>');
		const updated = await adjustAvailable(productId, Number(delta));
		console.log(
			`${productId}: ${updated.available} available, ${updated.reserved} reserved, ${updated.sold} sold`
		);
		break;
	}
	default:
		throw new Error(`Unknown command ${command}`);
}
