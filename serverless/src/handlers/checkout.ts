import * as v from 'valibot';
import { MAX_PER_ORDER } from '../merch/catalog.ts';
import { createCheckout } from '../merch/checkout.ts';
import { getStripe } from '../merch/stripe.ts';
import { requireEnv } from '../lib/env.ts';
import { consumeRateLimit } from '../data/rate-limits.ts';
import { assertWithinRateLimit, HttpError, json, parseJsonBody, siteHandler } from '../lib/http.ts';

const CheckoutBody = v.object({
	productId: v.pipe(v.string(), v.regex(/^prod_[A-Za-z0-9]{1,64}$/)),
	quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_PER_ORDER)),
	origin: v.pipe(v.string(), v.url())
});

const allowedOrigins = new Set(requireEnv('ALLOWED_ORIGINS').split(','));
const allowedOriginPattern = process.env.ALLOWED_ORIGIN_PATTERN
	? new RegExp(process.env.ALLOWED_ORIGIN_PATTERN)
	: undefined;

/** Only our own site may be used for Stripe's success/cancel redirects. */
function assertAllowedOrigin(origin: string) {
	const normalized = new URL(origin).origin;
	if (
		normalized !== origin ||
		!(allowedOrigins.has(origin) || allowedOriginPattern?.test(origin))
	) {
		throw new HttpError(400, 'invalid_origin', 'Origin not allowed');
	}
}

/** POST /checkout — reserve stock and create a Stripe Checkout Session. */
export const handler = siteHandler(async (event, { clientId }) => {
	const body = parseJsonBody(event, CheckoutBody);
	assertAllowedOrigin(body.origin);

	// Each checkout holds stock for half an hour, so cap how much one visitor can hold.
	assertWithinRateLimit(
		await consumeRateLimit({
			action: 'checkout',
			subject: clientId,
			limit: 10,
			windowSeconds: 1800
		}),
		'Too many checkout attempts. Please try again later.'
	);

	const result = await createCheckout(await getStripe(), body);
	return json(201, result);
});
