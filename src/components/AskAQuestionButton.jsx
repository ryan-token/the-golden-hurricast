import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Toast from 'react-bootstrap/Toast'
import { submitQuestion } from '../services/questions-api'

const AskAQuestionButton = () => {
	const [showModal, setShowModal] = useState(false)
	const [question, setQuestion] = useState('')
	const [name, setName] = useState('')
	const [showSubmitButton, setShowSubmitButton] = useState(true)
	const [showSubmittedQuestionToast, setShowSubmittedQuestionToast] = useState(false)
	const [showInvalidQuestionToast, setShowInvalidQuestionToast] = useState(false)
	const [showSubmissionErrorToast, setShowSubmissionErrorToast] = useState(false)
	
	const handleShowModal = () => setShowModal(true)
	
	const handleCloseModal = () => {
		setShowSubmittedQuestionToast(false)
		setShowInvalidQuestionToast(false)
		setShowSubmissionErrorToast(false)
		setShowModal(false)
		setShowSubmitButton(true)
	}
	
	const handleSubmitQuestion = async () => {
		const textareaRegex = /^(?!.*(<|>|&|")).{1,5000}$/
		const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
		if (textareaRegex.test(question) && (name === '' || nameRegex.test(name))) {
			try {
				await submitQuestion({ question, name })
			} catch (err) {
				console.error('Error submitting question:', err)
				setShowSubmissionErrorToast(true)
				return
			}

			setShowSubmitButton(false)
			setQuestion('')
			setName('')
			setShowInvalidQuestionToast(false)
			setShowSubmissionErrorToast(false)
			setShowSubmittedQuestionToast(true)
			setTimeout(() => {
				handleCloseModal()
			}, 6000)
		} else {
			setShowInvalidQuestionToast(true)
		}
	}
	
	return (
		<div>
			<Button variant='primary' onClick={handleShowModal}>
				Ask a Question for the Show
			</Button>
			
			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Ask a Question</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Submit a question and we'll do our best to answer it on an upcoming show. Feel free to ask anonymously if you'd prefer us not to mention your name.
					<br /> <br />
					<Form>
						<Form.Group className='mb-3' controlId='askQuestionText'>
							<Form.Label><strong>What is your question for us?</strong></Form.Label>
							<Form.Control 
								required
								as='textarea'
								rows={3}
								value={question}
								onChange={(event) => {setQuestion(event.target.value)}}
							/>
						</Form.Group>
						
						<Form.Group className='mb-3' controlId='askQuestionName'>
							<Form.Label><strong>What is your name?</strong></Form.Label>
							<Form.Control
								type='text'
								value={name}
								placeholder='Your Name'
								onChange={(event) => {setName(event.target.value)}}
							/>
						</Form.Group>
					</Form>
					
					<Toast onClose={() => setShowSubmittedQuestionToast(false)} show={showSubmittedQuestionToast} delay={6000} autohide>
						<Toast.Header>
							<strong className='me-auto'>Question Submitted!</strong>
						</Toast.Header>
						<Toast.Body>
							✅ Thanks for submitting a question! We'll try to answer it on the podcast soon.
						</Toast.Body>
					</Toast>
					
					<Toast onClose={() => setShowInvalidQuestionToast(false)} show={showInvalidQuestionToast}>
						<Toast.Header>
							<strong className='me-auto'>Invalid Question</strong>
						</Toast.Header>
						<Toast.Body>
							⚠️ Your question must not be empty, and the following characters are not allowed in the question: {'<'}, {'>'}, " (straight quotes), and &
							<br /> <br />
							⚠️ Also ensure your name is formatted properly. For security reasons, the only special characters we allow in the name field are an apostrophe, a comma, a period, and a hyphen
						</Toast.Body>
					</Toast>
					
					<Toast onClose={() => setShowSubmissionErrorToast(false)} show={showSubmissionErrorToast}>
						<Toast.Header>
							<strong className='me-auto'>Error Submitting Question</strong>
						</Toast.Header>
						<Toast.Body>
							⛔️ There was an error submitting your question. Sorry about that. If you'd like to submit your question over email, send one to <a href="mailto:thegoldenhurricast@gmail.com?subject=Listener Question">thegoldenhurricast@gmail.com</a>
						</Toast.Body>
					</Toast>
					
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={handleCloseModal}>
						Close
					</Button>
					{showSubmitButton &&
						<Button variant='primary' onClick={handleSubmitQuestion}>
							Submit
						</Button>	
					}
				</Modal.Footer>
			</Modal>
		</div>
	)
}

export default AskAQuestionButton