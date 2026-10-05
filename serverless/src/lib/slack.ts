import { requireEnv } from './env.ts';
import { getSecret } from './secrets.ts';

/** Escapes user-provided text for Slack mrkdwn, so it can't inject mentions or links. */
export function escapeSlack(text: string): string {
	return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** Posts a message to the show's Slack channel via its incoming webhook. */
export async function postToSlack(text: string): Promise<void> {
	const webhookUrl = await getSecret(requireEnv('SLACK_WEBHOOK_URL_PARAM'));
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
