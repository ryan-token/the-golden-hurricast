import { marshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBRecord } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const purgeSiteMerchCache = vi.hoisted(() =>
	vi.fn<(siteUrl: string) => Promise<void>>(async () => {})
);
vi.mock('../src/lib/site.ts', () => ({ purgeSiteMerchCache }));
vi.stubEnv('SITE_URL', 'https://www.thegoldenhurricast.com');
const { handler } = await import('../src/handlers/purge-site-cache.ts');

const LISTING = { name: 'Hurricast Mug', priceId: 'price_mug', unitAmount: 2000, currency: 'usd' };
const STOCK = { Available: 5, Reserved: 1, Sold: 3 };
const item = (fields: Record<string, unknown>) =>
	marshall({ PK: 'INVENTORY', SK: 'PRODUCT#prod_mug', Listing: LISTING, ...STOCK, ...fields });

const change = (before: Record<string, unknown>, after: Record<string, unknown>) =>
	({
		eventName: 'MODIFY',
		dynamodb: { OldImage: item(before), NewImage: item(after) }
	}) as DynamoDBRecord;

describe('purging the site’s merch cache', () => {
	beforeEach(() => purgeSiteMerchCache.mockReset());

	it('purges once per batch when stock or a listing changes', async () => {
		await handler({
			Records: [
				change({}, { Available: 4, Reserved: 2 }),
				change({}, { Listing: { ...LISTING, unitAmount: 2500 } })
			]
		});
		expect(purgeSiteMerchCache).toHaveBeenCalledOnce();
		expect(purgeSiteMerchCache).toHaveBeenCalledWith('https://www.thegoldenhurricast.com');
	});

	it('leaves the cache alone when nothing a visitor sees has changed', async () => {
		// A paid order: Reserved → Sold. The page shows neither.
		await handler({ Records: [change({}, { Reserved: 0, Sold: 4 })] });
		expect(purgeSiteMerchCache).not.toHaveBeenCalled();
	});

	it('fails the batch when the purge fails, so Lambda retries it', async () => {
		purgeSiteMerchCache.mockRejectedValueOnce(new Error('Site responded 503'));
		await expect(handler({ Records: [change({}, { Available: 0 })] })).rejects.toThrow('503');
	});
});
