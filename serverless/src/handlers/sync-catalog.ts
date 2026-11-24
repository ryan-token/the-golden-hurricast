import { syncCatalog } from '../merch/catalog-sync.ts';
import { getStripe } from '../merch/stripe.ts';
import { log } from '../lib/log.ts';

/** Scheduled (and run after each deploy): re-sync every listing from Stripe (see merch/catalog-sync.ts). */
export const handler = async () => {
	const result = await syncCatalog(await getStripe());
	log.info('Synced the catalog from Stripe', { ...result });
	return result;
};
