'use strict'

const { unmarshall } = require('@aws-sdk/util-dynamodb')

const forwardQuestionToSlack = async (event) => {
	console.log('event:', JSON.stringify(event, null, 2))
	const webhookUrl = process.env.WEBHOOK_URL
	console.log('webhookUrl:', webhookUrl)
	
	let unmarshalledRecords = []
	const dynamoRecords = event.Records
	for (const record of dynamoRecords) {
		if (record.eventName === 'REMOVE') {
			console.log('this is a removal from the table; ignore')
			return
		}
		const unmarshalledRecord = unmarshall(record.dynamodb?.NewImage)
		unmarshalledRecords.push(unmarshalledRecord)
	}
	
	console.log('unmarshalledRecords:', unmarshalledRecords)
	for (const record of unmarshalledRecords) {
		const name = record.name !== '' ? record.name : 'Anonymous'
		const question = record.question
		const slackObject = {
			text: `*New question from ${name}*:\n\n${question}`
		}
		
		try {
			await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(slackObject)
			})		
		} catch(err) {
			console.error('Error posting to Slack:', err)
			throw err
		}
	}
}

module.exports = {
	forwardQuestionToSlack
}