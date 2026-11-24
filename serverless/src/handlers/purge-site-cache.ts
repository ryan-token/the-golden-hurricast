import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { isDeepStrictEqual } from 'node:util';
import { log } from '../lib/log.ts';
import { purgeSiteMerchCache } from '../lib/site.ts';

type Image = Record<string, AttributeValue> | undefined;
const toItem = (image: Image) => (image ? unmarshall(image) : undefined);

/** Empty on stages without a site of their own to purge (dev). */
const siteUrl = process.env.SITE_URL;

/**
 * Whether a change to an inventory item changes what the merch pages show: the listing or
 * the units available. Moving units from Reserved to Sold, say, doesn't.
 */
export function changesStorefront(record: DynamoDBRecord): boolean {
	const before = toItem(record.dynamodb?.OldImage as Image);
	const after = toItem(record.dynamodb?.NewImage as Image);
	return (
		before?.Available !== after?.Available || !isDeepStrictEqual(before?.Listing, after?.Listing)
	);
}

/**
 * DynamoDB stream consumer for inventory items (the event source's filter selects them):
 * purges the site's cached merch pages when stock or a listing changes. One purge covers the
 * whole batch. A failure throws, so Lambda retries the batch; purging twice is harmless.
 */
export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
	if (!siteUrl || !event.Records.some(changesStorefront)) return;
	await purgeSiteMerchCache(siteUrl);
	log.info('Purged the merch pages from the site cache', { records: event.Records.length });
};
