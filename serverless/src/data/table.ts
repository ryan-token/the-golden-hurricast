/**
 * The single DynamoDB table and its key design. All DynamoDB access goes through the
 * modules in `src/data/` — the rest of the app works with plain objects (see README).
 *
 * | Entity    | PK                | SK                  | GSI1PK (sparse)  | GSI1SK                       | GSI2PK    | GSI2SK      |
 * |-----------|-------------------|---------------------|------------------|------------------------------|-----------|-------------|
 * | Inventory | INVENTORY         | PRODUCT#<productId> |                  |                              |           |             |
 * | Order     | ORDER#<orderId>   | ORDER#<orderId>     | RESERVATION      | <releaseAfter ISO>#<orderId> | ORDERS    | <orderId>   |
 * | Question  | QUESTION#<id>     | QUESTION#<id>       |                  |                              | QUESTIONS | <id>        |
 *
 * Order and question ids are KSUIDs, so they sort chronologically.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { requireEnv } from '../lib/env.ts';

export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
	marshallOptions: { removeUndefinedValues: true }
});

export const tableName = () => requireEnv('TABLE_NAME');

export const keys = {
	inventory: (productId: string) => ({ PK: INVENTORY_PK, SK: `PRODUCT#${productId}` }),
	order: (orderId: string) => ({ PK: `ORDER#${orderId}`, SK: `ORDER#${orderId}` }),
	question: (questionId: string) => ({ PK: `QUESTION#${questionId}`, SK: `QUESTION#${questionId}` })
};

export const INVENTORY_PK = 'INVENTORY';
export const RESERVATIONS_GSI1PK = 'RESERVATION';
export const ORDERS_GSI2PK = 'ORDERS';
export const QUESTIONS_GSI2PK = 'QUESTIONS';

/** One write in a DynamoDB transaction. */
export type TransactItem = NonNullable<TransactWriteCommandInput['TransactItems']>[number];
