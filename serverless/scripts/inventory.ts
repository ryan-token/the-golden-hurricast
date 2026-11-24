/**
 * Inventory admin.
 *
 *   npm run inventory -- --stage prod                          # list stock
 *   npm run inventory -- --stage prod track prod_123 "Mug" 12  # start tracking (and listing) a product
 *   npm run inventory -- --stage prod adjust prod_123 +6       # restock (or -2 after a count)
 */
import { adjustAvailable, createInventory, listInventory } from '../src/data/inventory.ts';
import { syncProduct } from '../src/merch/catalog-sync.ts';
import { getStripe } from '../src/merch/stripe.ts';
import { parseCli } from './cli.ts';

const { stage, positionals } = parseCli({});
const [command = 'list', ...args] = positionals;

switch (command) {
	case 'list': {
		const rows = [...(await listInventory()).values()].map(
			({ productId, name, available, reserved, sold, listing }) => ({
				productId,
				name,
				listed: listing !== undefined,
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
		if (
			!productId?.startsWith('prod_') ||
			!name ||
			!Number.isInteger(Number(available)) ||
			Number(available) < 0
		) {
			throw new Error('Usage: track <productId> <name> <available>');
		}
		// Check the id with Stripe before creating anything, so a typo leaves nothing behind.
		const stripe = await getStripe();
		await stripe.products.retrieve(productId);
		await createInventory({ productId, name, available: Number(available) });
		// List it now rather than at the next hourly sync.
		await syncProduct(stripe, productId);
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
