import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const TTL_MS = 5 * 60 * 1000;
/** GetParameters accepts at most 10 names per call. */
const MAX_NAMES_PER_CALL = 10;
const cache = new Map<string, { value: Promise<string>; expires: number }>();

/**
 * Reads SecureStrings from SSM Parameter Store, cached per container for five minutes.
 * Secrets are read at runtime rather than baked into Lambda environment variables, so they
 * never appear in the function's configuration and can be rotated without a deploy.
 *
 * Whatever isn't cached is fetched in one `GetParameters` call, so a handler that needs
 * several secrets pays for one SSM round trip, not one per secret.
 */
export function getSecrets<const Names extends readonly string[]>(
	names: Names
): Promise<{ -readonly [I in keyof Names]: string }> {
	const now = Date.now();
	const missing = [...new Set(names)].filter((name) => {
		const cached = cache.get(name);
		return !cached || cached.expires <= now;
	});

	for (let start = 0; start < missing.length; start += MAX_NAMES_PER_CALL) {
		const batch = missing.slice(start, start + MAX_NAMES_PER_CALL);
		const values = fetchParameters(batch);
		for (const name of batch) {
			const value = values.then((found) => found.get(name)!);
			// Don't cache failures (but leave a newer entry for the same name alone).
			value.catch(() => {
				if (cache.get(name)?.value === value) cache.delete(name);
			});
			cache.set(name, { value, expires: now + TTL_MS });
		}
	}

	return Promise.all(names.map((name) => cache.get(name)!.value)) as Promise<{
		-readonly [I in keyof Names]: string;
	}>;
}

export async function getSecret(name: string): Promise<string> {
	const [value] = await getSecrets([name]);
	return value;
}

async function fetchParameters(names: string[]): Promise<Map<string, string>> {
	const result = await ssm.send(new GetParametersCommand({ Names: names, WithDecryption: true }));
	const found = new Map(
		(result.Parameters ?? []).flatMap(({ Name, Value }) => (Name && Value ? [[Name, Value]] : []))
	);
	// Missing parameters come back in `InvalidParameters` rather than as an error.
	const absent = names.filter((name) => !found.has(name));
	if (absent.length > 0) throw new Error(`SSM parameters missing or empty: ${absent.join(', ')}`);
	return found;
}
