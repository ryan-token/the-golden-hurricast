/** Reads a required environment variable, failing fast (at cold start) if it's missing. */
export function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable ${name}`);
	return value;
}
