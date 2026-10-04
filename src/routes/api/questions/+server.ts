/**
 * Receives listener questions from the "Ask a Question" form and forwards them to the
 * Hurricast API.
 *
 * - Enhanced (JavaScript) submissions send `accept: application/json` and get a JSON
 *   response: `{ ok: true }`, or `{ ok: false, message }` with status 400 or 502.
 * - Native form posts are redirected (303) to the `/question-received/` page.
 */
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { ApiError, submitQuestion } from '#lib/server/hurricast-api.js';
import type { RequestHandler } from './$types';

export const prerender = false;

// Like the rest of the site, `/api/questions/` (not `/api/questions`) is the canonical URL.
export const trailingSlash = 'always';

const QuestionForm = v.object({
	// Forms submit line breaks as CRLF, but the textarea's maxlength counts them once.
	question: v.pipe(
		v.string(),
		v.transform((value) => value.replace(/\r\n?/g, '\n')),
		v.trim(),
		v.minLength(1),
		v.maxLength(2000)
	),
	name: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(100)), ''),
	/** Honeypot: hidden from people, so anything here came from a bot. */
	website: v.optional(v.string(), '')
});

const INVALID_MESSAGE =
	'Please enter a question of up to 2,000 characters, and a name of up to 100 characters.';

const FAILED_MESSAGE = 'There was an error submitting your question.';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;

	const formData = await request.formData().catch(() => undefined);
	const result = v.safeParse(QuestionForm, formData ? Object.fromEntries(formData) : undefined);

	if (!result.success) {
		if (wantsJson) return Response.json({ ok: false, message: INVALID_MESSAGE }, { status: 400 });
		redirect(303, '/question-received/?error=invalid');
	}

	const { question, name, website } = result.output;

	// Pretend a bot's submission worked so it has no reason to try again.
	if (website === '') {
		try {
			await submitQuestion({ question, name: name || undefined }, getClientAddress());
		} catch (err) {
			// The API's own validation and rate limits come back with safe, readable messages.
			if (err instanceof ApiError && (err.status === 400 || err.status === 429)) {
				if (wantsJson)
					return Response.json({ ok: false, message: err.message }, { status: err.status });
				redirect(
					303,
					`/question-received/?error=${err.status === 429 ? 'rate-limited' : 'invalid'}`
				);
			}
			// Log what went wrong, never the question itself.
			console.error(
				'Question submission failed:',
				err instanceof ApiError
					? `${err.status} ${err.code}`
					: err instanceof Error
						? err.message
						: err
			);
			if (wantsJson) return Response.json({ ok: false, message: FAILED_MESSAGE }, { status: 502 });
			redirect(303, '/question-received/?error=failed');
		}
	}

	if (wantsJson) return Response.json({ ok: true });
	redirect(303, '/question-received/');
};
