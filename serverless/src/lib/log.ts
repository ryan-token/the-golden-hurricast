/**
 * Structured logging. With Lambda's JSON log format, logging an object keeps its fields
 * queryable in CloudWatch Logs Insights (e.g. `filter message.orderId = "…"`).
 * Never log card data, secrets, or customer PII.
 */
type Fields = Record<string, unknown>;

function serializeError(error: unknown) {
	return error instanceof Error
		? { name: error.name, message: error.message, stack: error.stack }
		: error;
}

const entry = (msg: string, fields?: Fields, error?: unknown) => ({
	msg,
	...fields,
	...(error !== undefined && { error: serializeError(error) })
});

export const log = {
	info: (msg: string, fields?: Fields) => console.info(entry(msg, fields)),
	warn: (msg: string, fields?: Fields, error?: unknown) => console.warn(entry(msg, fields, error)),
	error: (msg: string, fields?: Fields, error?: unknown) => console.error(entry(msg, fields, error))
};
