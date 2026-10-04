import { describe, expect, it } from 'vitest';
import { cleanText } from '../src/lib/text.ts';

describe('cleanText', () => {
	it('keeps everything a real listener might type', () => {
		const question = `What's the "real" story with A&M <3?\n\nAsking for José — 🏈 ¿Por qué?`;
		expect(cleanText(question, { multiline: true })).toBe(question);
		expect(cleanText("Sean O'Neil Jr.", { multiline: false })).toBe("Sean O'Neil Jr.");
	});

	it('removes invisible and control characters that can hide or disguise text', () => {
		expect(cleanText('safe‮txt.exe\u0000 ​note', { multiline: true })).toBe('safetxt.exe note');
		expect(cleanText('  Matt\n\tR  ', { multiline: false })).toBe('Matt R');
		expect(cleanText('a\r\n\r\n\r\n\r\nb', { multiline: true })).toBe('a\n\nb');
	});
});
