import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSecret, getSecrets } from '../src/lib/secrets.ts';

/** Parameter Store, holding `stored`. Each test uses its own names, since values are cached. */
function fakeSsm(stored: Record<string, string>) {
	return vi.spyOn(SSMClient.prototype, 'send').mockImplementation((async (
		command: GetParametersCommand
	) => {
		const names = command.input.Names ?? [];
		return {
			Parameters: names
				.filter((name) => name in stored)
				.map((Name) => ({ Name, Value: stored[Name] })),
			InvalidParameters: names.filter((name) => !(name in stored))
		};
	}) as never);
}

afterEach(() => vi.restoreAllMocks());

describe('getSecrets', () => {
	it('reads several secrets in one SSM call, then from the cache', async () => {
		const send = fakeSsm({ '/a/site-key': 'site', '/a/stripe-key': 'stripe' });

		expect(await getSecrets(['/a/site-key', '/a/stripe-key'])).toEqual(['site', 'stripe']);
		expect(await getSecret('/a/stripe-key')).toBe('stripe');
		expect(send).toHaveBeenCalledOnce();
	});

	it('fails for a missing parameter, and tries again next time', async () => {
		const send = fakeSsm({});
		await expect(getSecret('/b/key')).rejects.toThrow('/b/key');

		send.mockRestore();
		fakeSsm({ '/b/key': 'rotated-in' });
		expect(await getSecret('/b/key')).toBe('rotated-in');
	});
});
