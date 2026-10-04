import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
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
			paths: {
				// The public origin. Used for prerendering (absolute URLs, canonical links) and CSRF checks.
				origin: 'https://www.thegoldenhurricast.com'
			},
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					// Product photos are served by Stripe.
					'img-src': ['self', 'data:', 'https://files.stripe.com'],
					'media-src': ['self'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'frame-src': ['https://embed.podcasts.apple.com'],
					// The merch checkout form posts to our own form action, which redirects to Stripe.
					'form-action': ['self', 'https://checkout.stripe.com'],
					'base-uri': ['self'],
					'object-src': ['none'],
					'upgrade-insecure-requests': true
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
