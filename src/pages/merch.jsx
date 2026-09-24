import React from 'react'
import NavigationBar from '../components/NavigationBar'
import Container from 'react-bootstrap/Container'
import MerchJumbotron from '../components/MerchJumbotron'
import Table from 'react-bootstrap/Table'
import Seo from '../components/seo'
import Products from '../components/products/Products'

const MerchLayout = () => {
	return (
		<div>
			<NavigationBar />
			<MerchJumbotron />

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
				<Container id='supportus' style={{marginTop: '-75px'}}>

					<p style={{ marginBottom: '15px' }}>
						We've teamed up with <a href='https://www.mythic.press/' rel='noopener noreferrer'
						target='_blank'>
						Mythic
						</a>
						{' '}
						here in Tulsa to design and create the clothing. We use <a href='https://stripe.com/' rel='noopener noreferrer'
						target='_blank'>
						Stripe
						</a>
						{' '}
						to handle payments and orders.
					</p>
					
					<p style={{ marginBottom: '30px' }}> The t-shirts and hoodies are unisex. View the <a href='#size-charts'>size charts</a> at the bottom of the page for specific item dimensions. </p>

					<h4> Hurricast Merchandise </h4>
					<hr />
					
					<div>
						{' '}
						<Products />
					</div>
					
					<br />
					<hr />
					<br />

					<div>
						<h5 id='size-charts'>Size Charts</h5>
						<p style={{ color: 'grey' }}>For reference, Ryan is 6′ 1″ and is wearing a <b>large</b> t-shirt and hoodie in the photos</p>
						
						<br />
						
						<h6>T-Shirt Size Chart</h6>
						
						<Table striped bordered hover size='sm'>
							<thead>
								<tr>
									<th>Points of Measurement (inches)</th>
									<th>S</th>
									<th>M</th>
									<th>L</th>
									<th>XL</th>
									<th>2XL</th>
									<th>3XL</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Body Length From HPS</td>
									<td>
										28
									</td>
									<td>
										29
									</td>
									<td>
										30
									</td>
									<td>
										31
									</td>
									<td>
										32
									</td>
									<td>
										33
									</td>
								</tr>
								<tr>
									<td>Chest Width (Laid Flat)</td>
									<td>
										18
									</td>
									<td>
										20
									</td>
									<td>
										22
									</td>
									<td>
										24
									</td>
									<td>
										26
									</td>
									<td>
										28
									</td>
								</tr>
								<tr>
									<td>Sleeve Length</td>
									<td>
										8 1/4
									</td>
									<td>
										8 5/8
									</td>
									<td>
										9 1/2
									</td>
									<td>
										9 5/8
									</td>
									<td>
										10 1/4
									</td>
									<td>
										10 7/8
									</td>
								</tr>
							</tbody>
						</Table>
					</div>
					
					<br /> <br />
					
					<div>
						<h6>Hoodie Size Chart</h6>
						
						<Table striped bordered hover size='sm'>
							<thead>
								<tr>
									<th>Points of Measurement (inches)</th>
									<th>M</th>
									<th>L</th>
									<th>XL</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Across Shoulders</td>
									<td>
										21 1/2
									</td>
									<td>
										23 1/2
									</td>
									<td>
										25 1/2
									</td>
								</tr>
								<tr>
									<td>Body Length From HPS</td>
									<td>
										28
									</td>
									<td>
										29
									</td>
									<td>
										30
									</td>
								</tr>
								<tr>
									<td>Chest Width (Laid Flat)</td>
									<td>
										22
									</td>
									<td>
										24
									</td>
									<td>
										26
									</td>
								</tr>
								<tr>
									<td>Sleeve Length (From Center Back)</td>
									<td>
										35 1/4
									</td>
									<td>
										35 7/8
									</td>
									<td>
										36 5/8
									</td>
								</tr>
							</tbody>
						</Table>
					</div>
					
					<br />
					
				</Container>
			</div>
		</div>
	)
}

export default MerchLayout

export const Head = ({ location }) => {
	return (
		<>
			<Seo
				title={'Hurricast Merch'}
				description={'Buy some Hurricast merchandise!'}
				image={'/logo-white.jpg'}
				pathname={location.pathname}
			/>
			<meta charSet='utf-8' />
			<title>TGH | Merch</title>
		</>
	)
}