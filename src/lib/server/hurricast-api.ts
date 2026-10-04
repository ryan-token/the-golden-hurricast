/**
 * Client for the Hurricast API (see `serverless/`). Server-only: the API is called from
 * load functions, form actions and endpoints, never from the browser.
 *
 * Every response is validated, so a misbehaving API surfaces as a clear error here
 * rather than as a broken page.
 */
import { HURRICAST_API_KEY, HURRICAST_API_URL } from '$app/env/private';
import * as v from 'valibot';

const ProductSchema = v.object({
	id: v.string(),
	name: v.string(),
	image: v.optional(v.string()),
	/** In the currency's minor unit (cents). */
	unitAmount: v.pipe(v.number(), v.integer()),
	currency: v.string(),
	/** Units that can be bought right now. */
	available: v.pipe(v.number(), v.integer()),
	/** Largest quantity allowed in one checkout. */
	maxQuantity: v.pipe(v.number(), v.integer())
});

const CatalogSchema = v.object({ products: v.array(ProductSchema) });

const CheckoutSchema = v.object({ orderId: v.string(), url: v.pipe(v.string(), v.url()) });

const OrderSummarySchema = v.object({
	orderId: v.string(),
	status: v.picklist(['reserved', 'processing', 'paid', 'expired', 'failed', 'canceled']),
	items: v.array(
		v.object({
			name: v.string(),
			quantity: v.pipe(v.number(), v.integer()),
			amountTotal: v.pipe(v.number(), v.integer())
		})
	),
	amountTotal: v.pipe(v.number(), v.integer()),
	currency: v.string()
});

const ErrorSchema = v.object({
	error: v.object({ code: v.string(), message: v.string() })
});

export type Product = v.InferOutput<typeof ProductSchema>;
export type OrderSummary = v.InferOutput<typeof OrderSummarySchema>;

/** A well-formed error response from the API, e.g. `insufficient_stock`. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * @param clientIp The visitor's IP, for the API's per-visitor rate limits. The API only
 *   trusts it because the request is authenticated with the site key.
 */
async function request<T>(
	path: string,
	schema: v.GenericSchema<unknown, T>,
	{ clientIp, ...init }: RequestInit & { clientIp?: string } = {}
): Promise<T> {
	const response = await fetch(`${HURRICAST_API_URL}${path}`, {
		...init,
		headers: {
			accept: 'application/json',
			// Always set at runtime (validated in src/env.ts); only optional while prerendering.
			'x-api-key': HURRICAST_API_KEY ?? '',
			...(clientIp && { 'x-client-ip': clientIp }),
			...init.headers
		},
		signal: AbortSignal.timeout(10_000)
	});
	const body: unknown = await response.json().catch(() => undefined);

	if (!response.ok) {
		const parsed = v.safeParse(ErrorSchema, body);
		if (parsed.success) {
			throw new ApiError(response.status, parsed.output.error.code, parsed.output.error.message);
		}
		throw new Error(`Hurricast API ${init.method ?? 'GET'} ${path} failed: ${response.status}`);
	}

	return v.parse(schema, body);
}

function post<T>(
	path: string,
	schema: v.GenericSchema<unknown, T>,
	body: unknown,
	clientIp: string
) {
	return request(path, schema, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		clientIp
	});
}

/** Products for sale, with live stock, in display order. */
export async function getCatalog(): Promise<Product[]> {
	return (await request('/products', CatalogSchema)).products;
}

/**
 * Reserves stock and creates a Stripe Checkout Session. `origin` must be one of the
 * API's allowed site origins; Stripe returns the customer there afterwards.
 */
export function createCheckout(
	input: { productId: string; quantity: number; origin: string },
	clientIp: string
) {
	return post('/checkout', CheckoutSchema, input, clientIp);
}

/** Looks up (and reconciles) the order behind a completed Checkout Session. */
export function getOrderForCheckoutSession(
	sessionId: string,
	clientIp: string
): Promise<OrderSummary> {
	return request(`/checkout/sessions/${encodeURIComponent(sessionId)}`, OrderSummarySchema, {
		clientIp
	});
}

export async function submitQuestion(
	input: { question: string; name?: string },
	clientIp: string
): Promise<void> {
	await post('/questions', v.unknown(), input, clientIp);
}
