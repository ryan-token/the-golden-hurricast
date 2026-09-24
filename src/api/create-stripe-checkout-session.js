import Stripe from 'stripe'

const stripe = new Stripe(process.env.GATSBY_STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // The body is already parsed in Gatsby Functions
    const { priceId, quantity, productId, orderId } = req.body

    console.log('Received request:', { priceId, quantity, productId, orderId })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: Number.parseInt(quantity, 10),
      }],
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      allow_promotion_codes: true,
      success_url: `${req.headers.origin}/merch-success?productId=${productId}&orderId=${orderId}&quantity=${quantity}`,
      cancel_url: `${req.headers.origin}/merch`,
    })

    console.log('Created session:', session.id)

    // Redirect the browser straight to Stripe's hosted Checkout page.
    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Server Error:', error)
    return res.status(500).json({ message: 'Error creating checkout session', error: error.message })
  }
}
