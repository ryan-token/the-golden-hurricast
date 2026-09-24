import React, { useEffect, useMemo, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import ProductCard from './ProductCard'
import { calculateRemainingItems } from '../../services/merch-api'

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
		calculateRemainingItems().then(items => {
			if (mounted) {
				setRemainingItems(items)
			}
		})
		return () => {
			mounted = false
		}
	}, [])

	// Group each active product's prices together, ordered by the product's sort_number.
	const products = useMemo(() => {
		const productsById = new Map()
		const activePrices = prices.edges
			.map(({ node }) => node)
			.filter(price => price.product.active)
			.sort((a, b) => a.product.metadata.sort_number.localeCompare(b.product.metadata.sort_number))

		for (const price of activePrices) {
			const { product } = price
			if (!productsById.has(product.id)) {
				productsById.set(product.id, { ...product, prices: [] })
			}
			productsById.get(product.id).prices.push(price)
		}

		return [...productsById.values()]
	}, [prices])

	return (
		<div style={containerStyles}>
			{products.map(product => (
				<ProductCard key={product.id} product={product} remainingItems={remainingItems[product.id]} />
			))}
		</div>
	)
}

export default Products
