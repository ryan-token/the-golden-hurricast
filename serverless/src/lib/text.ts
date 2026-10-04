import * as v from 'valibot';

// Characters removed from user text: C0/C1 controls except tab and newline, plus
// zero-width and bidi-override characters that can hide or disguise text. Everything else
// (quotes, <, &, emoji, any language) is legitimate: storage is parameterized and every
// output escapes. Built from code points so the source stays plain ASCII.
const UNSAFE_RANGES: [number, number][] = [
	[0x00, 0x08],
	[0x0b, 0x1f],
	[0x7f, 0x9f],
	[0x200b, 0x200f], // zero-width spaces/joiners, LRM/RLM
	[0x202a, 0x202e], // bidi embeddings and overrides
	[0x2066, 0x2069], // bidi isolates
	[0xfeff, 0xfeff] // byte-order mark / zero-width no-break space
];
const hex = (code: number) => `\\u${code.toString(16).padStart(4, '0')}`;
const UNSAFE_CHARACTERS = new RegExp(
	`[${UNSAFE_RANGES.map(([from, to]) => `${hex(from)}-${hex(to)}`).join('')}]`,
	'g'
);

/** Normalizes user text: NFC, unsafe invisible characters removed, line endings unified, trimmed. */
export function cleanText(text: string, { multiline }: { multiline: boolean }): string {
	const cleaned = text.normalize('NFC').replace(/\r\n?/g, '\n').replace(UNSAFE_CHARACTERS, '');
	return (multiline ? cleaned.replace(/\n{3,}/g, '\n\n') : cleaned.replace(/\s+/g, ' ')).trim();
}

/** A valibot schema for free text: cleaned, then length-checked. */
export const text = (options: { multiline: boolean; min: number; max: number }) =>
	v.pipe(
		v.string(),
		v.transform((value) => cleanText(value, options)),
		v.minLength(options.min),
		v.maxLength(options.max)
	);
