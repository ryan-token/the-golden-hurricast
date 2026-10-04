import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBBatchResponse, DynamoDBStreamEvent } from 'aws-lambda';
import { orderFromItem } from '../data/orders.ts';
import { questionFromItem } from '../data/questions.ts';
import { paidOrderMessage, questionMessage } from '../merch/notifications.ts';
import { log } from '../lib/log.ts';
import { postToSlack } from '../lib/slack.ts';

type Image = Record<string, AttributeValue> | undefined;
const toItem = (image: Image) => (image ? unmarshall(image) : undefined);

/**
 * DynamoDB stream consumer: posts new questions and newly paid orders to Slack.
 * The event source's filter criteria pre-select those records; we re-check here too.
 */
export const handler = async (event: DynamoDBStreamEvent): Promise<DynamoDBBatchResponse> => {
	const batchItemFailures: DynamoDBBatchResponse['batchItemFailures'] = [];

	for (const record of event.Records) {
		try {
			const newItem = toItem(record.dynamodb?.NewImage as Image);
			const oldItem = toItem(record.dynamodb?.OldImage as Image);
			if (!newItem) continue;

			if (record.eventName === 'INSERT' && newItem.Type === 'Question') {
				await postToSlack(questionMessage(questionFromItem(newItem)));
			} else if (
				record.eventName === 'MODIFY' &&
				newItem.Type === 'Order' &&
				newItem.Status === 'PAID' &&
				oldItem?.Status !== 'PAID'
			) {
				await postToSlack(paidOrderMessage(orderFromItem(newItem)));
			}
		} catch (error) {
			log.error('Failed to send notification', error, { eventId: record.eventID });
			if (record.dynamodb?.SequenceNumber) {
				batchItemFailures.push({ itemIdentifier: record.dynamodb.SequenceNumber });
			}
		}
	}

	return { batchItemFailures };
};
