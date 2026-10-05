import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		// Integration tests share one DynamoDB Local container (see test/global-setup.ts).
		globalSetup: ['test/global-setup.ts'],
		fileParallelism: false,
		testTimeout: 20_000
	}
});
