import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { value: Promise<string>; expires: number }>();

/**
 * Reads a SecureString from SSM Parameter Store, cached per container for five minutes.
 * Secrets are read at runtime rather than baked into Lambda environment variables, so they
 * never appear in the function's configuration and can be rotated without a deploy.
 */
export function getSecret(name: string): Promise<string> {
	const cached = cache.get(name);
	if (cached && cached.expires > Date.now()) return cached.value;

	const value = ssm
		.send(new GetParameterCommand({ Name: name, WithDecryption: true }))
		.then((result) => {
			const secret = result.Parameter?.Value;
			if (!secret) throw new Error(`SSM parameter ${name} is empty`);
			return secret;
		});

	// Don't cache failures.
	value.catch(() => cache.delete(name));
	cache.set(name, { value, expires: Date.now() + TTL_MS });
	return value;
}
