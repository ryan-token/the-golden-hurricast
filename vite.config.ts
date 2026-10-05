import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ edge: false, split: false, publish: 'build' }),
			// Inline the site's stylesheet (~50 KB, 9 KB compressed) into each page, so the first
			// paint doesn't wait on a separate render-blocking CSS request.
			inlineStyleThreshold: 64 * 1024,
			csp: {
				// Hashes (not nonces) everywhere, so server-rendered pages can be cached by the CDN.
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					// Product photos come from Stripe (via the Netlify Image CDN on Netlify).
					'img-src': ['self', 'data:', 'https://files.stripe.com'],
					'media-src': ['self'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'frame-src': ['https://embed.podcasts.apple.com'],
					// The merch checkout form posts to our own form action, which redirects to Stripe.
					'form-action': ['self', 'https://checkout.stripe.com'],
					'base-uri': ['self'],
					// Only sent for server-rendered pages; `_headers` covers prerendered ones.
					'frame-ancestors': ['none'],
					'object-src': ['none']
					// No `upgrade-insecure-requests`: production is HTTPS-only already (Netlify's
					// redirect plus HSTS), and Safari applies it to http://localhost, breaking
					// every script in dev and preview.
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
