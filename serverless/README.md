# Hurricast API

The AWS backend for [thegoldenhurricast.com](https://www.thegoldenhurricast.com): the merch catalog, inventory, Stripe Checkout and order fulfillment, and listener questions. One [Serverless Framework v4](https://www.serverless.com/framework/docs) service (`serverless.yml`): TypeScript Lambdas on Node.js 24 (arm64), an HTTP API, and a single DynamoDB table.

The website calls this API **server to server** (from SvelteKit load functions and form actions on Netlify), never from browsers.

## Security

- **Only the website can call the API.** Every route except the Stripe webhook requires the shared site key in `x-api-key` (compared in constant time); everything else gets a 401. The webhook is authenticated by Stripe's signature instead.
- **Per-visitor rate limits.** The site forwards the visitor's IP in `x-client-ip` (trusted only because the request carries the site key). It's stored only as a keyed hash: 5 questions per 10 minutes, 10 checkout attempts per 30 minutes (each checkout holds stock), 30 order lookups per 10 minutes (each is a Stripe call). An IPv6 /64 counts as one visitor. API Gateway also throttles the whole API.
- **User text isn't filtered by character.** Questions and names are Unicode-normalized, stripped of invisible control and bidi-override characters, trimmed and length-limited (`src/lib/text.ts`). Quotes, `<`, `&`, emoji and every language are fine: DynamoDB writes are parameterized, and every output escapes (Svelte on the site, `escapeSlack()` for Slack).
- **Bots:** the question form has a honeypot field, and SvelteKit's CSRF protection rejects cross-site form posts.
- **Least privilege:** each Lambda has its own IAM role with only the table actions and SSM parameters it uses. Secrets are read from SSM at runtime.
- **Checkout redirects** only go to origins on an allowlist (`allowedOrigins` / `allowedOriginPattern` per stage), and the site only redirects to `checkout.stripe.com`.

## Merch: how a purchase works

```
Site (form action)                 Hurricast API                          Stripe
───────────────────                ─────────────                          ──────
POST ?/checkout ──────────────────▶ POST /checkout
                                    1. Resolve product + default price from Stripe
                                    2. One transaction: create order (RESERVED)
                                       + move stock Available → Reserved
                                       (fails if not enough stock: 409)
                                    3. Create Checkout Session ───────────▶ (expires in 31 min)
◀── 303 to checkout.stripe.com ◀── { url }
                                                                           Customer pays
/merch/success/?session_id=… ─────▶ GET /checkout/sessions/{id} ─┐
                                    POST /stripe/webhook ◀────────┼──────── checkout.session.*
                                    sweep (every 10 min) ─────────┘
                                         └──▶ reconcileCheckoutSession(): read the session
                                              from Stripe, then one transaction:
                                              RESERVED → PAID     (Reserved → Sold)
                                              RESERVED → EXPIRED  (Reserved → Available)
                                              RESERVED → PROCESSING → PAID | FAILED
```

This follows Stripe's [fulfillment](https://docs.stripe.com/checkout/fulfillment) and [limited inventory](https://docs.stripe.com/payments/checkout/managing-limited-inventory) guides:

- **Prices are resolved on the server.** The site sends only a product id and quantity; the charge is the product's Stripe `default_price`.
- **Stock is reserved before checkout**, so two customers can't buy the last item, and released when a checkout expires.
- **Fulfillment is idempotent.** The webhook, the success page and the sweeper all call the same `reconcileCheckoutSession()`, which always re-reads the session from Stripe. Every order change is a DynamoDB transaction conditioned on the order's current status, so retries and concurrent calls can't double-count.
- **The sweeper is the safety net**: it expires checkouts Stripe left open, catches missed webhooks, and releases reservations whose checkout was never created.
- **A payment that lands after its reservation was released** is still honored and flagged `oversold` (the Slack message says so).
- Paid orders and new questions are posted to Slack by a DynamoDB-stream consumer.

Customer details (name, address, email) stay in Stripe. The table stores only what's needed to manage stock.

## DynamoDB: single-table design

One table (`hurricast-<stage>`), following Alex DeBrie's _The DynamoDB Book_: generic `PK`/`SK` and `GSI<n>PK`/`GSI<n>SK` keys, a `Type` attribute on every item, application attributes kept separate from indexing attributes, and all DynamoDB access in `src/data/`.

| Entity    | PK                | SK                    | GSI1PK (sparse) | GSI1SK                         | GSI2PK      | GSI2SK      |
| --------- | ----------------- | --------------------- | --------------- | ------------------------------ | ----------- | ----------- |
| Inventory | `INVENTORY`       | `PRODUCT#<productId>` |                 |                                |             |             |
| Order     | `ORDER#<orderId>` | `ORDER#<orderId>`     | `RESERVATION`   | `<releaseAfter ISO>#<orderId>` | `ORDERS`    | `<orderId>` |
| Question  | `QUESTION#<id>`   | `QUESTION#<id>`       |                 |                                | `QUESTIONS` | `<id>`      |

Order and question ids are [KSUIDs](https://github.com/segmentio/ksuid), so they sort by time.

| Access pattern                    | How                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| Stock for every product           | Query `PK = INVENTORY` (strongly consistent)                                       |
| Reserve stock for a checkout      | Transaction: put order + `Available -= q` if `Available >= q`                      |
| Get an order                      | GetItem `ORDER#<id>`                                                               |
| Change an order's status          | Transaction: update order if status unchanged + adjust stock                       |
| Orders holding stock that are due | Query GSI1 `RESERVATION`, `GSI1SK < now` (sparse: only RESERVED/PROCESSING orders) |
| Recent orders / questions         | Query GSI2 `ORDERS` / `QUESTIONS`, newest first                                    |
| Notify Slack                      | Stream with filter: Question inserts, Order → PAID                                 |

Inventory counters: `Available + Reserved` = units on hand; `Sold` = lifetime sales through this system. Conditions can't do arithmetic, so `Available` is stored explicitly.

## Development

```sh
npm install
npm run check      # TypeScript
npm run lint
npm test           # Vitest against DynamoDB Local (needs Docker) and a fake Stripe
npm run verify:bundle  # package, then load every built handler like Lambda does
```

AWS credentials come from `AWS_PROFILE=tgh-ryan` and the Serverless Framework key from `SERVERLESS_ACCESS_KEY`, both set by the repo's `.envrc` (direnv).

### Admin and debug scripts

```sh
npm run inventory -- --stage prod                            # stock levels
npm run inventory -- --stage prod adjust prod_123 +6         # restock (or -2 after a count)
npm run inventory -- --stage prod track prod_123 "Name" 10   # sell a new Stripe product
npm run orders -- --stage prod                               # recent orders
npm run orders -- --stage prod <orderId>                     # one order in full
npm run orders -- --stage prod --due                         # orders the sweeper will re-check
```

A new product appears on the site once it's active in Stripe with an active one-time USD default price **and** tracked in inventory. Display order comes from the product's `sort_number` metadata.

## Deploying

```sh
npm run deploy:dev
npm run deploy:prod
```

Both type-check, test, and verify the bundle first.

Secrets live in SSM Parameter Store (SecureString) and are read at runtime, never baked into the Lambda configuration:

| Parameter                                  | Value                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `/hurricast/<stage>/stripe-secret-key`     | Stripe restricted key (`rk_…`): Products/Prices read, Checkout Sessions write |
| `/hurricast/<stage>/stripe-webhook-secret` | Signing secret of the stage's webhook endpoint (`whsec_…`)                    |
| `/hurricast/<stage>/slack-webhook-url`     | Slack incoming webhook                                                        |

The Stripe webhook endpoint for each stage points at `<api>/stripe/webhook`, uses API version `2026-09-30.endive` (matching `STRIPE_API_VERSION` in `src/merch/stripe.ts`), and listens for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.

The table has deletion protection, point-in-time recovery and a `Retain` policy.
