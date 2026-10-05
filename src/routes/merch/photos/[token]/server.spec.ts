import { describe, expect, it, vi } from 'vitest';

const PHOTO = 'https://files.stripe.com/links/our_product_photo';
vi.mock('#lib/server/hurricast-api.js', () => ({
	getCatalog: async () => [{ id: 'prod_1', image: PHOTO }]
}));
const { GET } = await import('./+server.js');

const get = (token: string, fetch = vi.fn()) =>
	GET({ params: { token }, fetch } as unknown as Parameters<typeof GET>[0]);

describe('GET /merch/photos/[token]', () => {
	it('only re-serves photos of products we sell, never other files', async () => {
		const fetch = vi.fn();
		await expect(get('someone_elses_file', fetch)).rejects.toMatchObject({ status: 404 });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('serves our product photos with long-lived cache headers', async () => {
		const fetch = vi.fn(
			async () => new Response('jpeg', { headers: { 'content-type': 'image/jpeg' } })
		);
		const response = await get('our_product_photo', fetch);

		expect(fetch).toHaveBeenCalledWith(PHOTO);
		expect(response.headers.get('cache-control')).toContain('immutable');
		expect(response.headers.get('content-type')).toBe('image/jpeg');
	});
});
