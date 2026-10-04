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
	}
});
