import { describe, expect, it } from 'vitest';
import { questionMessage } from '../src/merch/notifications.ts';

describe('Slack messages', () => {
	it('escapes listener input so it cannot ping the channel or inject links', () => {
		const message = questionMessage({
			questionId: 'q1',
			question: 'Hey <!channel> check <https://evil.example|this> & that',
			name: '<@U123>',
			submittedAt: ''
		});
		expect(message).toBe(
			'*New question from &lt;@U123&gt;*:\n\nHey &lt;!channel&gt; check &lt;https://evil.example|this&gt; &amp; that'
		);
		expect(questionMessage({ questionId: 'q2', question: 'Hi', submittedAt: '' })).toContain(
			'Anonymous'
		);
	});
});
