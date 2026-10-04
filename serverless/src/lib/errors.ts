/** An error with a safe, client-facing code and message. */
export class HttpError extends Error {
	readonly status: number;
	readonly code: string;

	constructor(status: number, code: string, message: string) {
		super(message);
		this.name = 'HttpError';
		this.status = status;
		this.code = code;
	}
}
