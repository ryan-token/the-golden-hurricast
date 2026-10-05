import * as v from 'valibot';
import { createQuestion } from '../data/questions.ts';
import { consumeRateLimit } from '../data/rate-limits.ts';
import { assertWithinRateLimit, json, parseJsonBody, siteHandler } from '../lib/http.ts';
import { log } from '../lib/log.ts';
import { text } from '../lib/text.ts';

const QuestionBody = v.object({
	question: text({ multiline: true, min: 1, max: 2000 }),
	// A blank name means anonymous.
	name: v.optional(
		v.pipe(
			text({ multiline: false, min: 0, max: 100 }),
			v.transform((name) => name || undefined)
		)
	)
});

/** POST /questions — a listener question for the show (forwarded to Slack via the stream). */
export const handler = siteHandler(async (event, { clientId }) => {
	const body = parseJsonBody(event, QuestionBody);

	assertWithinRateLimit(
		await consumeRateLimit({
			action: 'questions',
			subject: clientId,
			limit: 5,
			windowSeconds: 600
		}),
		"You've sent several questions in a short time. Please try again in a few minutes."
	);

	const question = await createQuestion({ question: body.question, name: body.name });
	log.info('Question submitted', { questionId: question.questionId });
	return json(201, { questionId: question.questionId });
});
