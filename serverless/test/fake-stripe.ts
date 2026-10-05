/**
 * An in-memory stand-in for the parts of the Stripe API the merch code uses, with the same
 * shapes and semantics (idempotency keys, session lifecycle). Tests drive it the way Stripe
 * and customers would: create a session, then pay for it or let it expire.
 */
import Stripe from 'stripe';

export interface FakeProduct {
	id: string;
	name: string;
	active?: boolean;
	sortNumber?: number;
	/** Other product metadata, e.g. `group` and `size`. */
	metadata?: Record<string, string>;
	price?: { id: string; unitAmount: number; active?: boolean };
}

interface Session {
	id: string;
	object: 'checkout.session';
	status: 'open' | 'complete' | 'expired';
	payment_status: 'paid' | 'unpaid' | 'no_payment_required';
	metadata: Record<string, string>;
	client_reference_id: string | null;
	url: string | null;
	amount_total: number;
	currency: string;
	livemode: boolean;
	expires_at: number;
	payment_intent: { id: string; status: string } | null;
	line_items: { data: { price: { id: string }; quantity: number }[] };
	params: Stripe.Checkout.SessionCreateParams;
}

export class FakeStripe {
	readonly catalog: Map<string, FakeProduct>;
	readonly sessions = new Map<string, Session>();
	private readonly idempotency = new Map<string, string>();
	private nextId = 1;
	createCalls = 0;
	failNextCreate = false;

	constructor(products: FakeProduct[]) {
		this.catalog = new Map(products.map((product) => [product.id, product]));
	}

	/** This fake, typed as the real client for the code under test. */
	get client(): Stripe {
		return this as unknown as Stripe;
	}

	readonly products = {
		retrieve: async (id: string) => {
			const product = this.catalog.get(id);
			if (!product)
				throw new Stripe.errors.StripeInvalidRequestError({
					message: `No such product: '${id}'`,
					code: 'resource_missing'
				});
			return toStripeProduct(product);
		},
		list: () => {
			const products = [...this.catalog.values()]
				.filter((product) => product.active ?? true)
				.map(toStripeProduct);
			return {
				async *[Symbol.asyncIterator]() {
					yield* products;
				}
			};
		}
	};

	readonly checkout = {
		sessions: {
			create: async (
				params: Stripe.Checkout.SessionCreateParams,
				options?: { idempotencyKey?: string }
			) => {
				this.createCalls++;
				const key = options?.idempotencyKey;
				const existing = key && this.idempotency.get(key);
				if (existing) return structuredClone(this.sessions.get(existing)!);
				if (this.failNextCreate) {
					this.failNextCreate = false;
					throw new Stripe.errors.StripeAPIError({ message: 'Stripe is having a bad day' });
				}

				const lineItems = (params.line_items ?? []).map((line) => ({
					price: { id: line.price as string },
					quantity: line.quantity ?? 1
				}));
				const amountTotal = lineItems.reduce((sum, line) => {
					const product = [...this.catalog.values()].find((p) => p.price?.id === line.price.id);
					return sum + (product?.price?.unitAmount ?? 0) * line.quantity;
				}, 0);

				const id = `cs_test_fake${this.nextId++}`;
				const session: Session = {
					id,
					object: 'checkout.session',
					status: 'open',
					payment_status: 'unpaid',
					metadata: (params.metadata ?? {}) as Record<string, string>,
					client_reference_id: params.client_reference_id ?? null,
					url: `https://checkout.stripe.com/c/pay/${id}`,
					amount_total: amountTotal,
					currency: 'usd',
					livemode: false,
					expires_at: params.expires_at ?? 0,
					payment_intent: null,
					line_items: { data: lineItems },
					params
				};
				this.sessions.set(id, session);
				if (key) this.idempotency.set(key, id);
				return structuredClone(session);
			},

			retrieve: async (id: string) => {
				const session = this.sessions.get(id);
				if (!session)
					throw new Stripe.errors.StripeInvalidRequestError({
						message: `No such checkout.session: '${id}'`,
						code: 'resource_missing'
					});
				return structuredClone(session);
			},

			expire: async (id: string) => {
				const session = this.sessions.get(id);
				if (session?.status !== 'open') {
					throw new Stripe.errors.StripeInvalidRequestError({
						message: 'Only open sessions can be expired'
					});
				}
				session.status = 'expired';
				return structuredClone(session);
			}
		}
	};

	// --- What customers and Stripe do --------------------------------------------------

	/** The only session created so far (most tests create exactly one). */
	get onlySession(): Session {
		const [session, ...rest] = this.sessions.values();
		if (!session || rest.length > 0)
			throw new Error(`Expected one session, found ${this.sessions.size}`);
		return session;
	}

	/** The customer paid by card. */
	pay(sessionId: string) {
		const session = this.sessions.get(sessionId)!;
		session.status = 'complete';
		session.payment_status = 'paid';
		session.payment_intent = { id: `pi_${sessionId}`, status: 'succeeded' };
	}

	/** The customer completed checkout with a delayed payment method (e.g. bank debit). */
	completeWithDelayedPayment(sessionId: string) {
		const session = this.sessions.get(sessionId)!;
		session.status = 'complete';
		session.payment_status = 'unpaid';
		session.payment_intent = { id: `pi_${sessionId}`, status: 'processing' };
	}

	/** The delayed payment settled. */
	settleDelayedPayment(sessionId: string, succeeded: boolean) {
		const session = this.sessions.get(sessionId)!;
		session.payment_status = succeeded ? 'paid' : 'unpaid';
		session.payment_intent = {
			id: `pi_${sessionId}`,
			status: succeeded ? 'succeeded' : 'requires_payment_method'
		};
	}

	/** Stripe expired the session once its `expires_at` passed. */
	expire(sessionId: string) {
		this.sessions.get(sessionId)!.status = 'expired';
	}
}

function toStripeProduct(product: FakeProduct): Stripe.Product {
	return {
		id: product.id,
		object: 'product',
		name: product.name,
		active: product.active ?? true,
		images: [`https://files.stripe.com/links/${product.id}`],
		metadata: {
			...product.metadata,
			...(product.sortNumber !== undefined && { sort_number: String(product.sortNumber) })
		},
		default_price: product.price
			? {
					id: product.price.id,
					object: 'price',
					active: product.price.active ?? true,
					type: 'one_time',
					currency: 'usd',
					unit_amount: product.price.unitAmount
				}
			: null
	} as unknown as Stripe.Product;
}
