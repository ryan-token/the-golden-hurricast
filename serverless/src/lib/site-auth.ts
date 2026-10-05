/**
 * The API serves one client: the website's server, which proves itself with a shared key
 * (`x-api-key`) and forwards the visitor's IP (`x-client-ip`) for rate limiting. Requests
 * without the key are rejected, so the forwarded IP can be trusted.
 */
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { isIPv6 } from 'node:net';
import { requireEnv } from './env.ts';
import { HttpError } from './errors.ts';
import { getSecret } from './secrets.ts';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Who to rate-limit for an IP. An IPv6 visitor usually controls a whole /64 (and can rotate
 * through it freely), so all of it counts as one visitor; IPv4-mapped addresses are IPv4.
 */
export function rateLimitSubject(ip: string): string {
	if (!isIPv6(ip)) return ip;
	const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
	if (mapped) return mapped[1]!;

	const [head = '', tail] = ip.split('::');
	const groups = head ? head.split(':') : [];
	if (tail !== undefined) {
		const tailGroups = tail ? tail.split(':') : [];
		// An embedded IPv4 address (always last) fills two groups.
		const tailSize = tailGroups.length + (tail.includes('.') ? 1 : 0);
		groups.push(...Array<string>(8 - groups.length - tailSize).fill('0'), ...tailGroups);
	}
	return `${groups
		.slice(0, 4)
		.map((group) => Number.parseInt(group, 16).toString(16))
		.join(':')}::/64`;
}

export interface SiteRequest {
	/** The visitor, as an opaque keyed hash of their IP. Never the raw IP. */
	clientId: string;
}

export async function authenticateSite(event: APIGatewayProxyEventV2): Promise<SiteRequest> {
	const key = await getSecret(requireEnv('SITE_API_KEY_PARAM'));
	const provided = event.headers['x-api-key'] ?? '';

	// Compare fixed-length digests so the check takes the same time whatever was sent.
	if (!timingSafeEqual(digest(provided), digest(key))) {
		throw new HttpError(401, 'unauthorized', 'Unauthorized');
	}

	const ip = event.headers['x-client-ip'] || event.requestContext.http.sourceIp;
	return {
		clientId: createHmac('sha256', key)
			.update(rateLimitSubject(ip))
			.digest('base64url')
			.slice(0, 22)
	};
}
