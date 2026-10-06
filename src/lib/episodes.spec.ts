import { expect, test } from 'vitest';
import { formatDuration } from './episodes.js';

test('durations round to the minute, carrying into the hour', () => {
	expect(formatDuration(3570)).toBe('1 hr');
	expect(formatDuration(7190)).toBe('2 hr');
	expect(formatDuration(6549)).toBe('1 hr 49 min');
	expect(formatDuration(2590)).toBe('43 min');
});
