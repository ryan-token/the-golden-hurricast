import type { Order } from '../data/orders.ts';
import type { Question } from '../data/questions.ts';
import { escapeSlack } from '../lib/slack.ts';

const money = (amount: number, currency: string) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);

export function questionMessage(question: Question): string {
	const name = question.name?.trim() ? escapeSlack(question.name.trim()) : 'Anonymous';
	return `*New question from ${name}*:\n\n${escapeSlack(question.question)}`;
}

export function paidOrderMessage(order: Order): string {
	const items = order.items
		.map((item) => `${item.quantity} × ${escapeSlack(item.name)}`)
		.join('\n');
	const dashboard = order.livemode
		? 'https://dashboard.stripe.com'
		: 'https://dashboard.stripe.com/test';
	const link = order.paymentIntentId
		? `\n<${dashboard}/payments/${order.paymentIntentId}|View in Stripe>`
		: '';
	const warnings = order.flags?.length
		? `\n:warning: Needs attention: ${order.flags.join(', ')}`
		: '';

	return (
		`:shopping_trolley: *New merch order*${order.livemode ? '' : ' (test mode)'}\n` +
		`${items}\nTotal: ${money(order.amountTotal ?? 0, order.currency)}${link}${warnings}`
	);
}
