/** Shared helpers for the admin scripts. Run them with Node (types are stripped natively). */
import { parseArgs } from 'node:util';
import type { ParseArgsOptionsConfig } from 'node:util';
import { formatMoney } from '../src/lib/money.ts';

export type Stage = 'dev' | 'prod';

/** Parses `--stage dev|prod` (required) plus any script-specific options, and targets that stage's table. */
export function parseCli<T extends ParseArgsOptionsConfig>(options: T) {
	const { values, positionals } = parseArgs({
		options: { ...options, stage: { type: 'string' } },
		allowPositionals: true
	});
	const stage = (values as Record<string, unknown>).stage;
	if (stage !== 'dev' && stage !== 'prod') {
		console.error('Pass --stage dev or --stage prod');
		process.exit(1);
	}
	process.env.TABLE_NAME = `hurricast-${stage}`;
	process.env.AWS_REGION ??= 'us-east-2';
	return { stage: stage as Stage, values, positionals };
}

export function money(cents: number | undefined, currency = 'usd') {
	return cents === undefined ? '—' : formatMoney(cents, currency);
}
