import type { PageServerLoad } from './$types';

// Rendered per request: the outcome comes from the query string set by /api/questions/.
// (Only visitors without JavaScript land here; everyone else sees the result in place.)
export const prerender = false;

export const load: PageServerLoad = ({ url }) => {
	const error = url.searchParams.get('error');
	const outcome =
		error === 'invalid' || error === 'rate-limited' ? error : error ? 'failed' : 'received';
	return { outcome } as const;
};
