import type Stripe from 'stripe';
import { reconcileCheckoutSession } from '../merch/reconcile.ts';
import { getStripe } from '../merch/stripe.ts';
import { requireEnv } from '../lib/env.ts';
import { HttpError } from '../lib/errors.ts';
import { httpHandler, json } from '../lib/http.ts';
import { log } from '../lib/log.ts';
import { getSecret } from '../lib/secrets.ts';

/**
 * POST /stripe/webhook — Stripe event destination. Verifies the signature against the raw
 * body, then reconciles the affected order. Any failure returns 5xx so Stripe retries.
 */
export const handler = httpHandler(async (event) => {
	const signature = event.headers['stripe-signature'];
	if (!signature) throw new HttpError(400, 'missing_signature', 'Missing signature');

	// The signature covers the exact bytes Stripe sent: don't parse or re-encode the body.
	const payload = event.isBase64Encoded
		? Buffer.from(event.body ?? '', 'base64')
		: (event.body ?? '');

	const [stripe, secret] = await Promise.all([
		getStripe(),
		getSecret(requireEnv('STRIPE_WEBHOOK_SECRET_PARAM'))
	]);
	let stripeEvent: Stripe.Event;
	try {
		stripeEvent = stripe.webhooks.constructEvent(payload, signature, secret);
	} catch (error) {
		log.warn('Rejected webhook with an invalid signature', {}, error);
		throw new HttpError(400, 'invalid_signature', 'Invalid signature');
	}

	switch (stripeEvent.type) {
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
		case 'checkout.session.async_payment_failed':
		case 'checkout.session.expired': {
			const sessionId = stripeEvent.data.object.id;
			log.info('Handling webhook', { eventId: stripeEvent.id, type: stripeEvent.type, sessionId });
			await reconcileCheckoutSession(stripe, sessionId);
			break;
		}
		default:
			log.info('Ignoring unhandled event type', {
				eventId: stripeEvent.id,
				type: stripeEvent.type
			});
	}

	return json(200, { received: true });
});
