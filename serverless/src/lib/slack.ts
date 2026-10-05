import { requireEnv } from './env.ts';
import { getSecret } from './secrets.ts';

/** Escapes user-provided text for Slack mrkdwn, so it can't inject mentions or links. */
export function escapeSlack(text: string): string {
	return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** SSM parameters holding each channel's incoming-webhook URL. */
const WEBHOOK_PARAMS = {
	/** Listener questions. */
	questions: 'SLACK_QUESTIONS_WEBHOOK_URL_PARAM',
	/** Paid merch orders. */
	orders: 'SLACK_ORDERS_WEBHOOK_URL_PARAM'
} as const;

/** Posts a message to one of the show's Slack channels via its incoming webhook. */
export async function postToSlack(
	channel: keyof typeof WEBHOOK_PARAMS,
	text: string
): Promise<void> {
	const webhookUrl = await getSecret(requireEnv(WEBHOOK_PARAMS[channel]));
	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ text }),
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`Slack webhook responded ${response.status}`);
	}
}
