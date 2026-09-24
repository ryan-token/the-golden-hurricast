import React, { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import NavigationBar from '../components/NavigationBar'
import Container from 'react-bootstrap/Container'
import { addOrderToTable } from '../services/merch-api'

const MerchLayout = () => {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		addOrderToTable(params.get('productId'), params.get('orderId'), params.get('quantity'))
	}, [])
	
	return (
		<div>
			<NavigationBar />
	
			<div
				style={{
					marginTop: '110px',
					marginBottom: '30px',
					marginLeft: '30px',
					marginRight: '30px',
					display: 'flex',
					alignItems: 'center'
				}}
			>
				<Container id='supportus'>
					<h4> Order Successful! </h4>
					<hr />
					<div style={{ marginTop: '25px', marginBottom: '25px' }}>
						
						<p style={{ marginBottom: '20px' }}>
							<b>Thank you</b> for your support! Look out for an email from <b>USPS</b> within the next few days with the tracking information for your shipment.
						</p>
						
						<p style={{ marginBottom: '20px' }}>
							If you have any questions or concerns about your order, please email us at <a href='mailto:thegoldenhurricast@gmail.com'>thegoldenhurricast@gmail.com</a>.
						</p>
						
						<p style={{ marginBottom: '20px' }}>
							— Ryan & Matt
						</p>
					</div>
					
					<div>
						<Button variant='outline-primary' href='/merch' style={{ marginRight:  '20px'}}>
							Back to merch
						</Button>
						
						<Button variant='outline-primary' href='/'>
							Back home
						</Button>
					</div>
					
				</Container>
			</div>
		</div>
	)
}

export default MerchLayout

export const Head = () => {
	return (
		<>
			<meta charSet='utf-8' />
			<title>TGH | Merch Success!</title>
		</>
	)
}