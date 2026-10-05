/**
 * Loads every handler from a packaged build (`serverless package --package <dir>`) the way
 * Lambda will: as ES modules, with only the AWS SDK available outside the bundle. Catches
 * bundling problems — like a CommonJS dependency calling `require()` — before they reach AWS.
 * The deploy scripts then deploy that same package.
 *
 *   node scripts/verify-bundle.ts .serverless-package/dev   (or: npm run verify:bundle)
 */
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const packageDir = process.argv[2];
if (!packageDir) throw new Error('Usage: node scripts/verify-bundle.ts <package dir>');
const dir = resolve(packageDir, 'build/src/handlers');
// Values the handlers read at import time.
Object.assign(process.env, { ALLOWED_ORIGINS: 'https://example.com', TABLE_NAME: 'verify' });

let failed = false;
for (const file of (await readdir(dir)).filter((name) => name.endsWith('.mjs'))) {
	try {
		const module = await import(pathToFileURL(join(dir, file)).href);
		if (typeof module.handler !== 'function') throw new Error('no `handler` export');
		console.log(`✓ ${file}`);
	} catch (error) {
		failed = true;
		console.error(`✗ ${file}: ${error instanceof Error ? error.message : error}`);
	}
}
process.exit(failed ? 1 : 0);
