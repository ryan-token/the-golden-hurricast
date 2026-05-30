import React, { useEffect, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import ProductCard from './ProductCard'
import { calculateRemainingItems } from '../../api/merch-api'

const containerStyles = {
	display: 'flex',
	flexDirection: 'row',
	flexWrap: 'wrap',
	justifyContent: 'space-between',
	padding: '1rem 0 1rem 0',
}

const Products = () => {
	const [remainingItems, setRemainingItems] = useState({})

	const { prices } = useStaticQuery(graphql`
		query ProductPrices {
			prices: allStripePrice(
				filter: { active: { eq: true } }
				sort: { unit_amount: ASC }
			) {
				edges {
					node {
						id
						active
						currency
						unit_amount
						product {
							id
							active
							name
							images
							metadata {
								sort_number
							}
						}
					}
				}
			}
		}
	`)

	useEffect(() => {
		let mounted = true
		calculateRemainingItems()
		.then(items => {
			if(mounted) {
				setRemainingItems(items)
			}
		})
		return () => mounted = false
	}, [])

	// Group prices by product
	const products = {}
	const sortedProducts = prices.edges
		.sort((a, b) => a.node.product.metadata.sort_number.localeCompare(b.node.product.metadata.sort_number))
		.filter(item => item.node.product.active === true)

	for (const { node: price } of sortedProducts) {
		const product = price.product

		if (!products[product.id]) {
			products[product.id] = product
			products[product.id].prices = []
		}
		products[product.id].prices.push(price)
		products[product.id].remainingItems = remainingItems[product.id]
	}

	return (
		<div style={containerStyles}>
			{Object.keys(products).map(key => (
				<ProductCard key={products[key].id} product={products[key]} remainingItems={products[key].remainingItems} />
			))}
		</div>
	)
}

export default Products
