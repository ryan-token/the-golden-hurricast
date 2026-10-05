import { getCatalog } from '../merch/catalog.ts';
import { getStripe } from '../merch/stripe.ts';
import { json, siteHandler } from '../lib/http.ts';

/** GET /products — products for sale with live stock, in display order. */
export const handler = siteHandler(async () => {
	const products = await getCatalog(await getStripe());
	return json(200, { products });
});
