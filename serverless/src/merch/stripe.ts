import Stripe from 'stripe';
import { requireEnv } from '../lib/env.ts';
import { getSecret } from '../lib/secrets.ts';

/**
 * Pinned explicitly (it matches stripe-node v23's default) so an SDK upgrade can never
 * silently change API behavior. Webhook endpoints are created with the same version.
 */
export const STRIPE_API_VERSION = '2026-09-30.endive';

let client: Promise<Stripe> | undefined;

/** The Stripe client, created once per Lambda container with the key from SSM. */
export function getStripe(): Promise<Stripe> {
	client ??= getSecret(requireEnv('STRIPE_SECRET_KEY_PARAM'))
		.then(
			(key) =>
				new Stripe(key, {
					apiVersion: STRIPE_API_VERSION,
					// Worst case ~26s for one call (3 attempts plus backoff), inside the checkout
					// Lambda's 29s, so a failed create still releases its reservation.
					maxNetworkRetries: 2,
					timeout: 8_000,
					appInfo: { name: 'thegoldenhurricast.com', url: 'https://www.thegoldenhurricast.com' }
				})
		)
		.catch((error: unknown) => {
			client = undefined;
			throw error;
		});
	return client;
}
