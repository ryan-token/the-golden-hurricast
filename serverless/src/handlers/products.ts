import { getCatalog } from '../merch/catalog.ts';
import { json, siteHandler } from '../lib/http.ts';

/** GET /products — products for sale with live stock, in display order. Reads DynamoDB only. */
export const handler = siteHandler(async () => json(200, { products: await getCatalog() }));
