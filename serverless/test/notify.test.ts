import { marshall } from '@aws-sdk/util-dynamodb';
import type { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';

const postToSlack = vi.hoisted(() => vi.fn<(text: string) => Promise<void>>(async () => {}));
vi.mock('../src/lib/slack.ts', async (original) => ({
	...(await original<typeof import('../src/lib/slack.ts')>()),
	postToSlack
}));
const { handler } = await import('../src/handlers/notify.ts');

const question = (sequence: string, text: string): DynamoDBRecord => ({
	eventID: sequence,
	eventName: 'INSERT',
	dynamodb: {
		SequenceNumber: sequence,
		NewImage: marshall({
			Type: 'Question',
			QuestionId: sequence,
			Question: text,
			SubmittedAt: ''
		}) as never
	}
});

describe('stream notifications', () => {
	it('stops at the first failure so a retry never posts a message twice', async () => {
		postToSlack.mockResolvedValueOnce().mockRejectedValueOnce(new Error('Slack is down'));
		const event: DynamoDBStreamEvent = {
			Records: [question('1', 'First?'), question('2', 'Second?'), question('3', 'Third?')]
		};

		// Lambda retries from record 2 onward, so record 3 must not have been posted yet.
		expect(await handler(event)).toEqual({ batchItemFailures: [{ itemIdentifier: '2' }] });
		expect(postToSlack).toHaveBeenCalledTimes(2);
	});
});
