/**
 * Fixed-window rate limits, one item per (subject, window). Items expire via the table's
 * TTL (`ExpiresAt`), so they clean themselves up.
 *
 * | Entity    | PK                         | SK                       |
 * |-----------|----------------------------|--------------------------|
 * | RateLimit | RATELIMIT#<action>#<subject> | WINDOW#<window start>  |
 */
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './table.ts';

export interface RateLimit {
	/** e.g. `questions`. */
	action: string;
	/** Who is being limited, e.g. a hashed client IP. */
	subject: string;
	limit: number;
	windowSeconds: number;
}

/** Counts one attempt. Returns false (and counts nothing) once the window's limit is reached. */
export async function consumeRateLimit(rule: RateLimit, now = Date.now()): Promise<boolean> {
	const windowStart = Math.floor(now / 1000 / rule.windowSeconds) * rule.windowSeconds;
	try {
		await ddb.send(
			new UpdateCommand({
				TableName: tableName(),
				Key: { PK: `RATELIMIT#${rule.action}#${rule.subject}`, SK: `WINDOW#${windowStart}` },
				UpdateExpression: 'ADD Attempts :one SET #type = :type, ExpiresAt = :expires',
				ConditionExpression: 'attribute_not_exists(Attempts) OR Attempts < :limit',
				ExpressionAttributeNames: { '#type': 'Type' },
				ExpressionAttributeValues: {
					':one': 1,
					':limit': rule.limit,
					':type': 'RateLimit',
					// Keep the item a little past its window, then let TTL delete it.
					':expires': windowStart + rule.windowSeconds * 2
				}
			})
		);
		return true;
	} catch (error) {
		if (error instanceof ConditionalCheckFailedException) return false;
		throw error;
	}
}
