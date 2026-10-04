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

export const log = {
	info: (msg: string, fields?: Fields) => console.info({ msg, ...fields }),
	warn: (msg: string, fields?: Fields) => console.warn({ msg, ...fields }),
	error: (msg: string, error: unknown, fields?: Fields) =>
		console.error({ msg, ...fields, error: serializeError(error) })
};
