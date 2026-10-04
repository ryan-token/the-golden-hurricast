import type Stripe from 'stripe';
import { reconcileCheckoutSession } from '../merch/reconcile.ts';
import { getStripe } from '../merch/stripe.ts';
import { requireEnv } from '../lib/env.ts';
import { httpHandler, json } from '../lib/http.ts';
import { log } from '../lib/log.ts';
import { getSecret } from '../lib/secrets.ts';

const CHECKOUT_EVENTS = new Set<Stripe.Event['type']>([
	'checkout.session.completed',
	'checkout.session.async_payment_succeeded',
	'checkout.session.async_payment_failed',
	'checkout.session.expired'
]);

/**
 * POST /stripe/webhook — Stripe event destination. Verifies the signature against the raw
 * body, then reconciles the affected order. Any failure returns 5xx so Stripe retries.
 */
export const handler = httpHandler(async (event) => {
	const signature = event.headers['stripe-signature'];
	if (!signature)
		return json(400, { error: { code: 'missing_signature', message: 'Missing signature' } });

	// The signature covers the exact bytes Stripe sent: don't parse or re-encode the body.
	const payload = event.isBase64Encoded
		? Buffer.from(event.body ?? '', 'base64')
		: (event.body ?? '');

	const stripe = await getStripe();
	let stripeEvent: Stripe.Event;
	try {
		stripeEvent = stripe.webhooks.constructEvent(
			payload,
			signature,
			await getSecret(requireEnv('STRIPE_WEBHOOK_SECRET_PARAM'))
		);
	} catch (error) {
		log.warn('Rejected webhook with an invalid signature', { error: String(error) });
		return json(400, { error: { code: 'invalid_signature', message: 'Invalid signature' } });
	}

	if (!CHECKOUT_EVENTS.has(stripeEvent.type)) {
		log.info('Ignoring unhandled event type', { eventId: stripeEvent.id, type: stripeEvent.type });
		return json(200, { received: true });
	}

	const session = stripeEvent.data.object as Stripe.Checkout.Session;
	log.info('Handling webhook', {
		eventId: stripeEvent.id,
		type: stripeEvent.type,
		sessionId: session.id
	});
	await reconcileCheckoutSession(stripe, session.id);

	return json(200, { received: true });
});
