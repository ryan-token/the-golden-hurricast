/**
 * Starting a checkout, following Stripe's "managing limited inventory" pattern:
 * reserve stock first, then create a short-lived Checkout Session. If the customer doesn't
 * pay before it expires, the reservation is released (see reconcile.ts and sweep.ts).
 */
import { ksuid } from '../lib/ksuid.ts';
import type Stripe from 'stripe';
import { getInventory } from '../data/inventory.ts';
import {
	attachCheckoutSession,
	createReservedOrder,
	getOrder,
	InsufficientStockError,
	transitionOrder
} from '../data/orders.ts';
import { HttpError } from '../lib/errors.ts';
import { log } from '../lib/log.ts';
import { MAX_PER_ORDER, toStripeProduct } from './catalog.ts';
import { SWEEP_GRACE_MS } from './schedule.ts';
import { isMissing } from './stripe.ts';

/** How long a customer has to pay. Stripe's minimum is 30 minutes after session creation. */
const CHECKOUT_WINDOW_MS = 31 * 60 * 1000;

export interface CheckoutRequest {
	productId: string;
	quantity: number;
	/** Site origin the customer returns to. Must be in the allowlist. */
	origin: string;
}

export interface CheckoutResult {
	orderId: string;
	url: string;
}

export async function createCheckout(
	stripe: Stripe,
	request: CheckoutRequest,
	now = new Date()
): Promise<CheckoutResult> {
	if (request.quantity < 1 || request.quantity > MAX_PER_ORDER) {
		throw new HttpError(400, 'invalid_quantity', `Quantity must be between 1 and ${MAX_PER_ORDER}`);
	}

	// Resolve the product and its price on the server, from Stripe — never trust the client.
	const product = await stripe.products
		.retrieve(request.productId, { expand: ['default_price'] })
		.then(toStripeProduct)
		.catch((error: unknown) => {
			if (isMissing(error)) return undefined;
			throw error;
		});
	if (!product) throw new HttpError(404, 'product_not_found', 'That product is not available');

	const orderId = ksuid();
	const expiresAt = new Date(now.getTime() + CHECKOUT_WINDOW_MS);
	// Until the session is attached, a crash leaves the reservation for the sweeper.
	const releaseAfter = new Date(expiresAt.getTime() + SWEEP_GRACE_MS).toISOString();

	try {
		await createReservedOrder({
			orderId,
			items: [
				{
					productId: product.id,
					priceId: product.priceId,
					name: product.name,
					quantity: request.quantity,
					unitAmount: product.unitAmount
				}
			],
			currency: product.currency,
			releaseAfter
		});
	} catch (error) {
		if (error instanceof InsufficientStockError) {
			const available = (await getInventory(product.id))?.available ?? 0;
			throw new HttpError(
				409,
				'insufficient_stock',
				available > 0 ? `Only ${available} left` : 'Sold out'
			);
		}
		throw error;
	}

	let session: Stripe.Checkout.Session;
	try {
		session = await stripe.checkout.sessions.create(
			{
				mode: 'payment',
				line_items: [{ price: product.priceId, quantity: request.quantity }],
				// Shipping is included in the price; US addresses only.
				shipping_address_collection: { allowed_countries: ['US'] },
				allow_promotion_codes: true,
				submit_type: 'pay',
				client_reference_id: orderId,
				metadata: { orderId },
				payment_intent_data: { metadata: { orderId } },
				expires_at: Math.floor(expiresAt.getTime() / 1000),
				success_url: `${request.origin}/merch/success/?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${request.origin}/merch/`
			},
			// Retries of this request (by the SDK or by us) can never create a second session.
			{ idempotencyKey: `checkout-session-${orderId}` }
		);
	} catch (error) {
		log.error('Failed to create Checkout Session; releasing reservation', { orderId }, error);
		await releaseAbandonedReservation(orderId);
		throw new HttpError(502, 'checkout_unavailable', 'Checkout is unavailable. Please try again.');
	}

	await attachCheckoutSession(orderId, session.id, releaseAfter);

	log.info('Checkout started', {
		orderId,
		sessionId: session.id,
		productId: product.id,
		quantity: request.quantity
	});
	return { orderId, url: session.url! };
}

async function releaseAbandonedReservation(orderId: string) {
	const order = await getOrder(orderId);
	if (order?.status === 'RESERVED') {
		await transitionOrder(order, { to: 'CANCELED' }).catch((error: unknown) =>
			// The sweeper will release it later.
			log.error('Failed to release reservation', { orderId }, error)
		);
	}
}
