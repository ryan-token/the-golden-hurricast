import { expect, test, type Page } from '@playwright/test';

// These tests never send a valid question upstream: they only exercise validation,
// and the honeypot path, which is dropped before the Hurricast API is called.

async function openDialog(page: Page) {
	await page.getByRole('button', { name: 'Ask a Question for the Show' }).click();
	const dialog = page.getByRole('dialog', { name: 'Ask a Question' });
	await expect(dialog).toBeVisible();
	return dialog;
}

test('the question dialog opens, validates without submitting, and closes', async ({ page }) => {
	const submissions: string[] = [];
	page.on('request', (request) => {
		if (request.method() === 'POST') submissions.push(request.url());
	});

	await page.goto('/');
	const dialog = await openDialog(page);
	const question = dialog.getByLabel('What is your question for us?');

	// Empty: the browser's own validation stops the submission.
	await dialog.getByRole('button', { name: 'Submit' }).click();
	expect(await question.evaluate((el: HTMLTextAreaElement) => el.validity.valueMissing)).toBe(true);

	// Only whitespace: caught before anything is sent.
	await question.fill('   ');
	await dialog.getByRole('button', { name: 'Submit' }).click();
	await expect(dialog.getByText('Please enter a question.')).toBeVisible();
	await expect(question).toHaveAttribute('aria-invalid', 'true');
	await expect(question).toBeFocused();
	expect(submissions).toEqual([]);

	await dialog.getByRole('button', { name: 'Close' }).last().click();
	await expect(dialog).toBeHidden();
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the dialog still opens and closes', async ({ page }) => {
		await page.goto('/podcast/');
		const dialog = await openDialog(page);

		await dialog.getByRole('button', { name: 'Close' }).first().click();
		await expect(dialog).toBeHidden();
	});
});

test.describe('the questions endpoint', () => {
	// SvelteKit's CSRF protection only accepts form posts from the site's own origin.
	test.use({ extraHTTPHeaders: { origin: 'http://localhost:4173' } });

	test('rejects an invalid question with JSON', async ({ request }) => {
		const response = await request.post('/api/questions/', {
			form: { question: '   ', name: '' },
			headers: { accept: 'application/json' }
		});

		expect(response.status()).toBe(400);
		expect(await response.json()).toMatchObject({ ok: false });
	});

	test('redirects native form posts', async ({ request }) => {
		const response = await request.post('/api/questions/', {
			form: { question: '' },
			maxRedirects: 0
		});

		expect(response.status()).toBe(303);
		expect(response.headers().location).toBe('/question-received/?error=invalid');
	});

	test('quietly drops honeypot submissions', async ({ request }) => {
		const response = await request.post('/api/questions/', {
			form: { question: 'Bot question', website: 'https://spam.example' },
			headers: { accept: 'application/json' }
		});

		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
	});

	test('counts line breaks once, as the textarea does', async ({ request }) => {
		// 1,997 characters in the textarea, 2,218 once the form sends CRLF. The honeypot keeps
		// the valid question from going upstream.
		const response = await request.post('/api/questions/', {
			form: { question: 'Go Canes\r\n'.repeat(222).trim(), website: 'x' },
			headers: { accept: 'application/json' }
		});

		expect(response.status()).toBe(200);
	});

	test('the confirmation page explains the outcome', async ({ page }) => {
		await page.goto('/question-received/?error=invalid');
		await expect(page.locator('h1')).toHaveText('Your question was not sent');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

		await page.goto('/question-received/');
		await expect(page.locator('h1')).toHaveText('Question received');
	});
});
