/**
 * KSUIDs (https://github.com/segmentio/ksuid): 27-character, URL-safe ids that sort by
 * creation time, used for order and question ids so DynamoDB keeps them in time order.
 * Layout: 4-byte big-endian timestamp (seconds since the KSUID epoch) + 16 random bytes,
 * base62-encoded and left-padded to 27 characters.
 */
import { randomBytes } from 'node:crypto';

const EPOCH_SECONDS = 1_400_000_000;
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const LENGTH = 27;

export function ksuid(now = Date.now()): string {
	const bytes = Buffer.alloc(20);
	bytes.writeUInt32BE(Math.floor(now / 1000) - EPOCH_SECONDS, 0);
	randomBytes(16).copy(bytes, 4);

	let value = BigInt(`0x${bytes.toString('hex')}`);
	let encoded = '';
	while (value > 0n) {
		encoded = ALPHABET[Number(value % 62n)] + encoded;
		value /= 62n;
	}
	return encoded.padStart(LENGTH, '0');
}
