/**
 * Creates a fresh table per test, mirroring the schema in serverless.yml.
 */
import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'node:crypto';

const client = new DynamoDBClient({});

export async function createTestTable(): Promise<string> {
	const name = `test-${randomUUID()}`;
	process.env.TABLE_NAME = name;

	const key = (pk: string, sk: string) => [
		{ AttributeName: pk, KeyType: 'HASH' as const },
		{ AttributeName: sk, KeyType: 'RANGE' as const }
	];

	await client.send(
		new CreateTableCommand({
			TableName: name,
			BillingMode: 'PAY_PER_REQUEST',
			AttributeDefinitions: ['PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK'].map(
				(AttributeName) => ({
					AttributeName,
					AttributeType: 'S'
				})
			),
			KeySchema: key('PK', 'SK'),
			GlobalSecondaryIndexes: [
				{
					IndexName: 'GSI1',
					KeySchema: key('GSI1PK', 'GSI1SK'),
					Projection: { ProjectionType: 'ALL' }
				},
				{
					IndexName: 'GSI2',
					KeySchema: key('GSI2PK', 'GSI2SK'),
					Projection: { ProjectionType: 'ALL' }
				}
			]
		})
	);
	return name;
}

export async function deleteTestTable(name: string) {
	await client.send(new DeleteTableCommand({ TableName: name }));
}
