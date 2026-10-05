import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestTable } from './table.ts';

// Every SSM secret (webhook signing secret, site API key) resolves to this in tests.
const SECRET = 'test_secret';
const realStripe = new Stripe('sk_test_dummy');

vi.mock('../src/merch/stripe.ts', async (original) => ({
	...(await original<typeof import('../src/merch/stripe.ts')>()),
	getStripe: async () => realStripe
}));
vi.mock('../src/lib/secrets.ts', () => ({ getSecret: async () => SECRET }));
const reconcile = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('../src/merch/reconcile.ts', () => ({ reconcileCheckoutSession: reconcile }));

vi.stubEnv('STRIPE_WEBHOOK_SECRET_PARAM', '/test/webhook');
vi.stubEnv('SITE_API_KEY_PARAM', '/test/site-key');
vi.stubEnv('ALLOWED_ORIGINS', 'https://www.thegoldenhurricast.com');
vi.stubEnv('ALLOWED_ORIGIN_PATTERN', '^https://[a-z0-9-]+--thegoldenhurricast\\.netlify\\.app$');

const context = {} as Context;

function request(body: string, headers: Record<string, string> = {}): APIGatewayProxyEventV2 {
	return {
		body,
		headers,
		isBase64Encoded: false,
		routeKey: 'TEST',
		requestContext: { http: { sourceIp: '203.0.113.9' } }
	} as APIGatewayProxyEventV2;
}

/** A request from the website: authenticated, with the visitor's IP forwarded. */
const fromSite = (body: string, ip = '198.51.100.7') =>
	request(body, { 'x-api-key': SECRET, 'x-client-ip': ip });

function signedEvent(type: string, sessionId = 'cs_test_123') {
	const payload = JSON.stringify({
		id: 'evt_1',
		object: 'event',
		type,
		data: { object: { id: sessionId, object: 'checkout.session' } }
	});
	const signature = realStripe.webhooks.generateTestHeaderString({
		payload,
		secret: SECRET
	});
	return request(payload, { 'stripe-signature': signature });
}

describe('POST /stripe/webhook', async () => {
	const { handler } = await import('../src/handlers/stripe-webhook.ts');
	beforeEach(() => reconcile.mockClear());

	it('reconciles the order for checkout events', async () => {
		const response = await handler(signedEvent('checkout.session.completed'), context);
		expect(response.statusCode).toBe(200);
		expect(reconcile).toHaveBeenCalledWith(realStripe, 'cs_test_123');
	});

	it('rejects a bad signature without doing anything', async () => {
		const event = signedEvent('checkout.session.completed');
		event.body = event.body!.replace('cs_test_123', 'cs_test_evil');
		expect((await handler(event, context)).statusCode).toBe(400);
		expect((await handler(request('{}'), context)).statusCode).toBe(400);
		expect(reconcile).not.toHaveBeenCalled();
	});

	it('verifies base64-encoded bodies against the original bytes', async () => {
		const event = signedEvent('checkout.session.expired');
		event.body = Buffer.from(event.body!).toString('base64');
		event.isBase64Encoded = true;
		expect((await handler(event, context)).statusCode).toBe(200);
		expect(reconcile).toHaveBeenCalledOnce();
	});

	it('acknowledges events it does not handle', async () => {
		expect((await handler(signedEvent('customer.created'), context)).statusCode).toBe(200);
		expect(reconcile).not.toHaveBeenCalled();
	});

	it('returns 500 when reconciling fails, so Stripe retries', async () => {
		reconcile.mockRejectedValueOnce(new Error('DynamoDB is unavailable'));
		const response = await handler(signedEvent('checkout.session.completed'), context);
		expect(response.statusCode).toBe(500);
		expect(response.body).not.toContain('DynamoDB');
	});
});

describe('site-only routes', async () => {
	const { handler } = await import('../src/handlers/checkout.ts');
	const body = (origin: string) => JSON.stringify({ productId: 'prod_abc', quantity: 1, origin });

	it('reject callers without the site key', async () => {
		const valid = body('https://www.thegoldenhurricast.com');
		expect((await handler(request(valid), context)).statusCode).toBe(401);
		expect((await handler(request(valid, { 'x-api-key': 'guess' }), context)).statusCode).toBe(401);
	});

	it.each([
		'https://evil.example',
		'https://www.thegoldenhurricast.com/',
		'https://www.thegoldenhurricast.com.evil.example',
		'https://x--thegoldenhurricast.netlify.app.evil.example'
	])('checkout rejects the redirect origin %s', async (origin) => {
		const response = await handler(fromSite(body(origin)), context);
		expect(response.statusCode).toBe(400);
		expect(JSON.parse(response.body!).error.code).toBe('invalid_origin');
	});
});

describe('POST /questions', async () => {
	const { handler } = await import('../src/handlers/questions.ts');
	const { listQuestions } = await import('../src/data/questions.ts');

	it('limits each visitor to five questions per ten minutes', async () => {
		await createTestTable();
		const ask = (ip: string) =>
			handler(fromSite(JSON.stringify({ question: 'Who starts at QB?' }), ip), context);

		for (let i = 0; i < 5; i++) expect((await ask('198.51.100.7')).statusCode).toBe(201);
		expect((await ask('198.51.100.7')).statusCode).toBe(429);
		// Someone else is unaffected.
		expect((await ask('198.51.100.8')).statusCode).toBe(201);
		expect(await listQuestions(10)).toHaveLength(6);
	});

	it('counts a whole IPv6 /64 as one visitor', async () => {
		await createTestTable();
		const ask = (ip: string) =>
			handler(fromSite(JSON.stringify({ question: 'Who starts at QB?' }), ip), context);

		// Five different addresses in 2001:db8:0:7::/64, written every way IPv6 allows.
		for (const ip of [
			'2001:db8:0:7::1',
			'2001:db8::7:0:0:0:2',
			'2001:0db8:0000:0007::3',
			'2001:db8:0:7:a:b:c:d',
			'2001:db8:0:7::1.2.3.4'
		]) {
			expect((await ask(ip)).statusCode).toBe(201);
		}
		expect((await ask('2001:db8:0:7:ffff::9')).statusCode).toBe(429);
		expect((await ask('2001:db8:0:8::1')).statusCode).toBe(201);
	});
});

describe('GET /checkout/sessions/{sessionId}', async () => {
	const { handler } = await import('../src/handlers/checkout-session.ts');
	const lookup = (sessionId: string) => {
		const event = fromSite('');
		event.pathParameters = { sessionId };
		return handler(event, context);
	};

	it('is a 404 only when Stripe has no such session; other Stripe errors are 500s', async () => {
		await createTestTable();
		reconcile.mockRejectedValueOnce(
			new Stripe.errors.StripeInvalidRequestError({
				message: 'No such session',
				code: 'resource_missing'
			})
		);
		expect((await lookup('cs_test_missing')).statusCode).toBe(404);

		// e.g. a bad `expand` after an API upgrade: must surface, not look like a missing order.
		reconcile.mockRejectedValueOnce(
			new Stripe.errors.StripeInvalidRequestError({ message: 'Invalid expand' })
		);
		expect((await lookup('cs_test_broken')).statusCode).toBe(500);
	});
});
