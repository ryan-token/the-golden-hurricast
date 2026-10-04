/**
 * Starts DynamoDB Local in Docker for the test run. Tests never touch real AWS: the
 * endpoint override and dummy credentials apply to every AWS SDK client.
 */
import { execFileSync } from 'node:child_process';

export default async function setup() {
	const container = execFileSync(
		'docker',
		[
			'run',
			'-d',
			'--rm',
			'-p',
			'127.0.0.1::8000',
			'amazon/dynamodb-local:latest',
			'-jar',
			'DynamoDBLocal.jar',
			'-inMemory'
		],
		{ encoding: 'utf8' }
	).trim();
	const port = execFileSync('docker', ['port', container, '8000'], { encoding: 'utf8' })
		.trim()
		.split(':')
		.at(-1);

	delete process.env.AWS_PROFILE;
	Object.assign(process.env, {
		AWS_ENDPOINT_URL_DYNAMODB: `http://127.0.0.1:${port}`,
		AWS_REGION: 'us-east-2',
		AWS_ACCESS_KEY_ID: 'local',
		AWS_SECRET_ACCESS_KEY: 'local'
	});

	// Wait until DynamoDB Local accepts connections.
	for (let attempt = 0; attempt < 50; attempt++) {
		try {
			await fetch(`http://127.0.0.1:${port}`);
			break;
		} catch {
			await new Promise((resolve) => setTimeout(resolve, 200));
		}
	}

	return () => {
		execFileSync('docker', ['rm', '-f', container]);
	};
}
