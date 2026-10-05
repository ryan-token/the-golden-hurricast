/**
 * Recent listener questions, e.g. to check one that didn't make it to Slack.
 *
 *   npm run questions -- --stage prod
 */
import { listQuestions } from '../src/data/questions.ts';
import { parseCli } from './cli.ts';

parseCli({});

console.table(
	(await listQuestions(50)).map(({ submittedAt, name, question }) => ({
		submittedAt,
		name: name ?? '(anonymous)',
		question: question.length > 80 ? `${question.slice(0, 79)}…` : question
	}))
);
