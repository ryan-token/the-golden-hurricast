'use strict'

const KSUID = require('ksuid')
const uploadToDynamo = require('./shared/utils').uploadToDynamo
const questionsTable = process.env.QUESTIONS_TABLE

const submitQuestion = async (event, context) => {
  console.log('event:', JSON.stringify(event, null, 2))
  
  const eventBody = JSON.parse(event.body)
  
  const response = {
    statusCode: 200,
    body: {}
  }
  
  const questionId = (await KSUID.random()).string
  const questionText = eventBody.question
  const name = eventBody.name
  const submissionDate = new Date().toISOString()
  
  console.log('questionId:', questionId)
  console.log('question:', questionText)
  console.log('name:', name)
  
  const questionObject = {
    'questionId': questionId,
    'question': questionText,
    'name': name,
    'submissionDate': submissionDate
  }
  
  try {
    await uploadToDynamo(questionsTable, questionObject)
    console.log('New Question uploaded to DynamoDB successfully')
  } catch(err) {
    console.error('DynamoDB Question upload failed')
    context.captureError(err)
    response.statusCode = 500
    response.body = JSON.stringify({ error: 'error uploading question to the database' })
    return response
  }
  
  response.body = JSON.stringify({ message: `Successfully uploaded question ${questionId} to the database` }, null, 2)
  
  return response
}

module.exports = {
  submitQuestion
}