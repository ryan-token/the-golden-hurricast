import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

const url = v.pipe(v.string(), v.url());

export const variables = defineEnvVars({
	HURRICAST_API_URL: {
		description:
			'Base URL of the Hurricast API on AWS (merch catalog, checkout, orders, questions), without a trailing slash.',
		// Prerendering doesn't call the API, so the value is only required at runtime.
		schema: building ? v.optional(url) : url
	},
	HURRICAST_API_KEY: {
		description:
			'Shared key that authenticates the site to the Hurricast API (SSM: /hurricast/<stage>/site-api-key).',
		schema: building ? v.optional(v.string()) : v.pipe(v.string(), v.minLength(32))
	}
});
