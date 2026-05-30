import React, { useState } from 'react'

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
	opacity: '0.3',
	cursor: 'not-allowed',
	display: 'block',
	fontSize: '13px',
	textAlign: 'center',
	color: 'white',
	padding: '12px',
	boxShadow: '2px 5px 10px rgba(0,0,0,.1)',
	backgroundColor: '#0275d8',
	border: '1px lightgrey solid',
	borderRadius: '5px',
	letterSpacing: '1.5px',
	marginTop: '15px'
}

const formatPrice = (amount, currency) => {
	let price = (amount / 100).toFixed(2)
	let numberFormat = new Intl.NumberFormat(['en-US'], {
		style: 'currency',
		currency: currency,
		currencyDisplay: 'symbol',
	})
	return numberFormat.format(price)
}

const ProductCard = ({ product }) => {
	const [loading, setLoading] = useState(false)
	const remainingItems = product.remainingItems

	const handleSubmit = async event => {
	  event.preventDefault();
	  setLoading(true);
	
	  try {
		const productId = product.id;
		const orderId = crypto.randomUUID();
		const priceId = new FormData(event.target).get('priceSelect');
		const quantity = new FormData(event.target).get('quantitySelect');

		const response = await fetch('/api/create-stripe-checkout-session', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
			priceId,
			quantity,
			productId,
			orderId,
		  }),
		});

		const data = await response.json();

		if (!data.url) {
		  throw new Error('No checkout URL received from server');
		}

		// Send the customer to Stripe's hosted Checkout page.
		window.location.href = data.url;
	  } catch (error) {
		console.error('Error:', error);
		setLoading(false);
	  }
	};

	if (remainingItems <= 0) {
		return (
			<div style={cardStyles}>
				<form onSubmit={handleSubmit}>
					<fieldset style={{ border: 'none' }}>
						<legend style={{ marginBottom: '15px' }}>
							<h4 style={{marginBottom: '15px'}}>{product.name}</h4>
							
							<picture style={{padding: '10px', marginLeft: '25px'}}>
								<source
									type='image/webp'
									srcSet={product.images[0]}
									style={{ height: '200px', width: '200px', border: '0px' }}
								/>
								<img
									src={product.images[0]}
									alt={product.description}
									style={{ height: '200px', width: '200px' }}
									className='floating_merch_image'
								/>
							</picture>
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
						
						<div style={{ width: '100%', paddingTop: '5px', marginBottom: '-15px' }}>
							<p style={{ color: 'red', fontStyle: 'italic' }}>Sold out</p>
						</div>
						
						<div style={{ width: '100%', paddingTop: '5px' }}>
							<p style={{ color: 'grey', fontStyle: 'italic' }}>Please <a href='mailto:thegoldenhurricast@gmail.com'>email us</a> if you're interested</p>
						</div>
						
					</fieldset>
					
					<button
						disabled
						style={
							buttonDisabledStyles
						}
					>
						SEE DETAILS & CHECKOUT
					</button>
				</form>
			</div>
		)
		
	} else if (remainingItems <= 5 && remainingItems > 0) {
		const quantityArray = Array.from({length: remainingItems}, (_, i) => i + 1)
		return (
			<div style={cardStyles}>
				<form onSubmit={handleSubmit}>
					<fieldset style={{ border: 'none' }}>
						<legend style={{ marginBottom: '15px' }}>
							<h4 style={{marginBottom: '15px'}}>{product.name}</h4>
							
							<picture style={{padding: '10px', marginLeft: '25px'}}>
								<source
									type='image/webp'
									srcSet={product.images[0]}
									style={{ height: '200px', width: '200px', border: '0px' }}
								/>
								<img
									src={product.images[0]}
									alt={product.description}
									style={{ height: '200px', width: '200px' }}
									className='floating_merch_image'
								/>
							</picture>
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
						
						<label style={{ width: '100%', marginTop: '10px' }}>
							<b>Quantity</b>: {' '}
							<select style={{ width: '50%', marginLeft: '5px' }} name='quantitySelect'>
								{quantityArray.map(quantity => {
									return <option value={quantity}>{quantity}</option>
								})}
							</select>
						</label>
						
						<div style={{ width: '100%', paddingTop: '5px', marginBottom: '-15px' }}>
							<p style={{ color: 'red', fontStyle: 'italic' }}>Only {remainingItems} left!</p>
						</div>
					</fieldset>
					
					<button
						disabled={loading}
						style={
							loading
								? { ...buttonStyles, ...buttonDisabledStyles }
								: buttonStyles
						}
					>
						SEE DETAILS & CHECKOUT
					</button>
				</form>
			</div>
		)
		
	} else {
		const quantityArray = Array.from({length: remainingItems}, (_, i) => i + 1)
		return (
			<div style={cardStyles}>
				<form onSubmit={handleSubmit}>
					<fieldset style={{ border: 'none' }}>
						<legend style={{ marginBottom: '15px' }}>
							<h4 style={{marginBottom: '15px'}}>{product.name}</h4>
							
							<picture style={{padding: '10px', marginLeft: '25px'}}>
								<source
									type='image/webp'
									srcSet={product.images[0]}
									style={{ height: '200px', width: '200px', border: '0px' }}
								/>
								<img
									src={product.images[0]}
									alt={product.description}
									style={{ height: '200px', width: '200px' }}
									className='floating_merch_image'
								/>
							</picture>
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
						
						<label style={{ width: '100%', marginTop: '10px' }}>
							<b>Quantity</b>: {' '}
							<select style={{ width: '50%', marginLeft: '5px' }} name='quantitySelect'>
								{quantityArray.map(quantity => {
									if (quantity <= 10) {
										return <option value={quantity}>{quantity}</option>	
									} else {
										return <div />
									}
								})}
							</select>
						</label>
						
						<div style={{ width: '100%', paddingTop: '5px', marginBottom: '-15px' }}>
							<p style={{ color: 'white' }}> | </p>
						</div>
					</fieldset>
					
					<button
						disabled={loading}
						style={
							loading
								? { ...buttonStyles, ...buttonDisabledStyles }
								: buttonStyles
						}
					>
						SEE DETAILS & CHECKOUT
					</button>
				</form>
			</div>
		)	
	}
}

export default ProductCard