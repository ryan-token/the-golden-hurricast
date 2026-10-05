import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyStructuredResultV2,
	Context
} from 'aws-lambda';
import * as v from 'valibot';
import { HttpError } from './errors.ts';
import { log } from './log.ts';
import { authenticateSite } from './site-auth.ts';
import type { SiteRequest } from './site-auth.ts';

export type Response = APIGatewayProxyStructuredResultV2;
export type Handler = (event: APIGatewayProxyEventV2, context: Context) => Promise<Response>;
export type SiteHandler = (
	event: APIGatewayProxyEventV2,
	site: SiteRequest,
	context: Context
) => Promise<Response>;

export function json(
	status: number,
	body: unknown,
	headers: Record<string, string> = {}
): Response {
	return {
		statusCode: status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
		body: JSON.stringify(body)
	};
}

/** Raw request body as a string, decoding API Gateway's base64 encoding when used. */
export function rawBody(event: APIGatewayProxyEventV2): string {
	const body = event.body ?? '';
	return event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
}

/** Parses and validates a JSON request body, throwing a 400 on anything malformed. */
export function parseJsonBody<T>(
	event: APIGatewayProxyEventV2,
	schema: v.GenericSchema<unknown, T>
): T {
	let data: unknown;
	try {
		data = JSON.parse(rawBody(event));
	} catch {
		throw new HttpError(400, 'invalid_request', 'Request body must be valid JSON');
	}

	const result = v.safeParse(schema, data);
	if (!result.success) {
		throw new HttpError(400, 'invalid_request', v.summarize(result.issues));
	}
	return result.output;
}

/**
 * Wraps a handler so that `HttpError`s become JSON error responses and anything else
 * becomes a logged, generic 500 — internal details never reach the client.
 */
export function httpHandler(handler: Handler): Handler {
	return async (event, context) => {
		try {
			return await handler(event, context);
		} catch (error) {
			if (error instanceof HttpError) {
				if (error.status >= 500) log.error('Request failed', { route: event.routeKey }, error);
				return json(error.status, { error: { code: error.code, message: error.message } });
			}
			log.error('Unhandled error', { route: event.routeKey }, error);
			return json(500, {
				error: { code: 'internal_error', message: 'Something went wrong. Please try again.' }
			});
		}
	};
}

/** Like `httpHandler`, for routes only the website may call (see site-auth.ts). */
export function siteHandler(handler: SiteHandler): Handler {
	return httpHandler(async (event, context) =>
		handler(event, await authenticateSite(event), context)
	);
}

/** Throws a 429 when `allowed` is false. */
export function assertWithinRateLimit(allowed: boolean, message: string) {
	if (!allowed) throw new HttpError(429, 'rate_limited', message);
}
