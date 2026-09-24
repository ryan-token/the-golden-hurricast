export const submitQuestion = async (questionData) => {
	const response = await window.fetch(`${process.env.GATSBY_QUESTIONS_API_ENDPOINT}/question`, {
		method: 'POST',
		body: JSON.stringify(questionData),
		headers: {
			'Content-Type': 'application/json'
		}
	})

	if (!response.ok) {
		throw new Error(`Question submission failed with status ${response.status}`)
	}
}
