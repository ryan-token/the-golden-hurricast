/** Listener questions submitted from the site, for the show. */
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ksuid } from '../lib/ksuid.ts';
import { ddb, keys, QUESTIONS_GSI2PK, tableName } from './table.ts';

export interface Question {
	questionId: string;
	question: string;
	/** Optional name the listener gave. */
	name?: string;
	submittedAt: string;
}

export function questionFromItem(item: Record<string, unknown>): Question {
	return {
		questionId: item.QuestionId as string,
		question: item.Question as string,
		name: item.Name as string | undefined,
		submittedAt: item.SubmittedAt as string
	};
}

export async function createQuestion(input: {
	question: string;
	name?: string;
}): Promise<Question> {
	const question: Question = {
		questionId: ksuid(),
		question: input.question,
		name: input.name,
		submittedAt: new Date().toISOString()
	};

	await ddb.send(
		new PutCommand({
			TableName: tableName(),
			Item: {
				...keys.question(question.questionId),
				GSI2PK: QUESTIONS_GSI2PK,
				GSI2SK: question.questionId,
				Type: 'Question',
				QuestionId: question.questionId,
				Question: question.question,
				Name: question.name,
				SubmittedAt: question.submittedAt
			},
			ConditionExpression: 'attribute_not_exists(PK)'
		})
	);

	return question;
}

/** Most recent questions first. */
export async function listQuestions(limit = 25): Promise<Question[]> {
	const page = await ddb.send(
		new QueryCommand({
			TableName: tableName(),
			IndexName: 'GSI2',
			KeyConditionExpression: 'GSI2PK = :pk',
			ExpressionAttributeValues: { ':pk': QUESTIONS_GSI2PK },
			ScanIndexForward: false,
			Limit: limit
		})
	);
	return (page.Items ?? []).map(questionFromItem);
}
