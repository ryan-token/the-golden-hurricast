export const addOrderToTable = async (productId, orderId, quantity) => {
	try {
		await window.fetch(`${process.env.GATSBY_MERCH_API_ENDPOINT}/orders/new/${productId}/${orderId}/${quantity}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch (err) {
		console.error('Error adding order to table:', err)
	}
}

// Resolves to a map of Stripe product id -> remaining inventory, or {} if it can't be fetched.
export const calculateRemainingItems = async () => {
	try {
		const response = await window.fetch(`${process.env.GATSBY_MERCH_API_ENDPOINT}/products/calculateRemainingItems`)
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`)
		}
		return await response.json()
	} catch (err) {
		console.error('Error getting remaining items:', err)
		return {}
	}
}
