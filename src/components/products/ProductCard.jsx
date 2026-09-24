import React, { useState } from 'react'

const MAX_QUANTITY = 10
const LOW_STOCK_THRESHOLD = 5

const cardStyles = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-around',
	alignItems: 'flex-start',
	padding: '10px',
	marginBottom: '1rem',
	boxShadow: '0 5px 15px -7px rgba(0,0,0,0.6)',
	backgroundColor: '#fff',
	borderRadius: '5px',
	maxWidth: '300px',
	boxSizing: 'border-box',
	border: '1px lightgrey solid',
	overflow: 'hidden',
	paddingBottom: '12px'
}

const buttonStyles = {
	display: 'block',
	fontSize: '13px',
	textAlign: 'center',
	color: 'white',
	padding: '12px',
	boxShadow: '2px 5px 10px rgba(0,0,0,.1)',
	backgroundColor: '#0275d8',
	border: '#f5f5f5',
	borderRadius: '5px',
	letterSpacing: '1.5px',
	marginTop: '15px'
}

const buttonDisabledStyles = {
	...buttonStyles,
	opacity: '0.3',
	cursor: 'not-allowed',
	border: '1px lightgrey solid',
}

const formatPrice = (amount, currency) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		currencyDisplay: 'symbol',
	}).format(amount / 100)

// `remainingItems` is undefined until the inventory request resolves.
const ProductCard = ({ product, remainingItems }) => {
	const [loading, setLoading] = useState(false)

	const soldOut = remainingItems <= 0
	const lowStock = remainingItems > 0 && remainingItems <= LOW_STOCK_THRESHOLD
	const quantityOptions = Array.from(
		{ length: Math.max(0, Math.min(remainingItems ?? 0, MAX_QUANTITY)) },
		(_, i) => i + 1
	)
	const buttonDisabled = soldOut || loading

	const handleSubmit = async event => {
		event.preventDefault()
		setLoading(true)

		try {
			const formData = new FormData(event.target)
			const response = await window.fetch('/api/create-stripe-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					priceId: formData.get('priceSelect'),
					quantity: formData.get('quantitySelect'),
					productId: product.id,
					orderId: crypto.randomUUID(),
				}),
			})

			const data = await response.json()

			if (!data.url) {
				throw new Error('No checkout URL received from server')
			}

			// Send the customer to Stripe's hosted Checkout page.
			window.location.href = data.url
		} catch (error) {
			console.error('Error:', error)
			setLoading(false)
		}
	}

	return (
		<div style={cardStyles}>
			<form onSubmit={handleSubmit}>
				<fieldset style={{ border: 'none' }}>
					<legend style={{ marginBottom: '15px' }}>
						<h4 style={{ marginBottom: '15px' }}>{product.name}</h4>

						<img
							src={product.images[0]}
							alt={product.name}
							width='200'
							height='200'
							loading='lazy'
							style={{ marginLeft: '35px' }}
							className='floating_merch_image'
						/>
					</legend>

					<label style={{ width: '100%' }}>
						<b>Price</b>: {' '}
						<select className='hidden-select' style={{ width: '75%' }} name='priceSelect'>
							{product.prices.map(price => (
								<option key={price.id} value={price.id}>
									{formatPrice(price.unit_amount, price.currency)}
								</option>
							))}
						</select>
					</label>

					{!soldOut && (
						<label style={{ width: '100%', marginTop: '10px' }}>
							<b>Quantity</b>: {' '}
							<select style={{ width: '50%', marginLeft: '5px' }} name='quantitySelect'>
								{quantityOptions.map(quantity => (
									<option key={quantity} value={quantity}>{quantity}</option>
								))}
							</select>
						</label>
					)}

					<div style={{ width: '100%', paddingTop: '5px', marginBottom: '-15px' }}>
						{soldOut && <p style={{ color: 'red', fontStyle: 'italic' }}>Sold out</p>}
						{lowStock && <p style={{ color: 'red', fontStyle: 'italic' }}>Only {remainingItems} left!</p>}
						{/* Keeps cards the same height whether or not a stock message is shown. */}
						{!soldOut && !lowStock && <p aria-hidden='true' style={{ visibility: 'hidden' }}>|</p>}
					</div>

					{soldOut && (
						<div style={{ width: '100%', paddingTop: '5px' }}>
							<p style={{ color: 'grey', fontStyle: 'italic' }}>Please <a href='mailto:thegoldenhurricast@gmail.com'>email us</a> if you're interested</p>
						</div>
					)}
				</fieldset>

				<button disabled={buttonDisabled} style={buttonDisabled ? buttonDisabledStyles : buttonStyles}>
					SEE DETAILS & CHECKOUT
				</button>
			</form>
		</div>
	)
}

export default ProductCard
