import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBBatchResponse, DynamoDBStreamEvent } from 'aws-lambda';
import { orderFromItem } from '../data/orders.ts';
import { questionFromItem } from '../data/questions.ts';
import { log } from '../lib/log.ts';
import { postToSlack } from '../lib/slack.ts';
import { paidOrderMessage, questionMessage } from '../notifications.ts';

type Image = Record<string, AttributeValue> | undefined;
const toItem = (image: Image) => (image ? unmarshall(image) : undefined);

/**
 * DynamoDB stream consumer: posts new questions and newly paid orders to Slack.
 * The event source's filter criteria pre-select those records; we re-check here too.
 *
 * Records are handled in order and processing stops at the first failure: Lambda retries
 * from the failed record onward, so carrying on would post the later ones twice.
 */
export const handler = async (event: DynamoDBStreamEvent): Promise<DynamoDBBatchResponse> => {
	for (const record of event.Records) {
		try {
			const newItem = toItem(record.dynamodb?.NewImage as Image);
			const oldItem = toItem(record.dynamodb?.OldImage as Image);
			if (!newItem) continue;

			if (record.eventName === 'INSERT' && newItem.Type === 'Question') {
				await postToSlack('questions', questionMessage(questionFromItem(newItem)));
			} else if (
				record.eventName === 'MODIFY' &&
				newItem.Type === 'Order' &&
				newItem.Status === 'PAID' &&
				oldItem?.Status !== 'PAID'
			) {
				await postToSlack('orders', paidOrderMessage(orderFromItem(newItem)));
			}
		} catch (error) {
			log.error('Failed to send notification', { eventId: record.eventID }, error);
			return { batchItemFailures: [{ itemIdentifier: record.dynamodb?.SequenceNumber ?? '' }] };
		}
	}
	return { batchItemFailures: [] };
};
