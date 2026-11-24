import { beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = 'k'.repeat(32);
vi.mock('$app/env/private', () => ({ HURRICAST_API_KEY: KEY, HURRICAST_API_URL: 'https://api' }));
const purgeCache = vi.hoisted(() => vi.fn(async () => {}));
vi.mock('@netlify/cache', () => ({ purgeCache }));
const { POST } = await import('./+server.js');

/** `platform` is only set on Netlify. */
const purge = (headers: Record<string, string>, { onNetlify = true } = {}) =>
	POST({
		request: new Request('https://www.thegoldenhurricast.com/api/merch/purge/', {
			method: 'POST',
			headers
		}),
		platform: onNetlify ? {} : undefined
	} as unknown as Parameters<typeof POST>[0]);

describe('POST /api/merch/purge/', () => {
	beforeEach(() => purgeCache.mockClear());

	it('only lets the Hurricast API purge the merch page', async () => {
		expect((await purge({})).status).toBe(401);
		expect((await purge({ 'x-api-key': 'guess' })).status).toBe(401);
		expect(purgeCache).not.toHaveBeenCalled();

		expect((await purge({ 'x-api-key': KEY })).status).toBe(204);
		expect(purgeCache).toHaveBeenCalledWith({ tags: ['merch'] });
	});

	it('has nothing to purge off Netlify', async () => {
		expect((await purge({ 'x-api-key': KEY }, { onNetlify: false })).status).toBe(204);
		expect(purgeCache).not.toHaveBeenCalled();
	});
});
