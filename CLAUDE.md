# The Golden Hurricast website

SvelteKit 3, Svelte 5 and Tailwind 4 on Netlify, plus an AWS backend in `serverless/`. Read `README.md` for the architecture map and `serverless/README.md` for the API, merch flow and DynamoDB design.

## Commands

- `npm run dev`: dev server on :5173. Needs `.env` (copy `.env.example`).
- `npm run check`: svelte-check. `npm run lint`: Prettier, then ESLint. `npm run format` fixes formatting.
- `npx vitest --run`: unit tests (`src/**/*.spec.ts`).
- `npx playwright test --project=chromium -g "<name>"`: one e2e test. The suite builds and serves a production build on :4173 and runs in Chromium, Firefox and WebKit; run all three before calling UI work done.
- `serverless/` is a separate package with its own `check`, `lint` and `test`. Its tests start DynamoDB Local in Docker. Never run its `deploy:*` scripts unless asked.

## Workflow

- Don't commit or push. The maintainer does. When asked for a commit title, match the log: imperative, sentence case, no trailing period.
- Before finishing, run check, lint, unit tests and the relevant e2e tests. For visual changes, build, then screenshot the affected pages with Playwright at 320, 390 and 1280px in light and dark mode, and look at them.
- Tests must earn their keep: cover behavior that could regress (parsing, routing, flows a person uses). No tautological tests and no tests of Svelte, SvelteKit or library behavior.
- To prove a new test works, run it once with the fix reverted and confirm it fails.

## Architecture

- SvelteKit 3 has no `svelte.config.js`. Kit options (adapter, CSP, runes) live in `vite.config.ts`.
- Import shared code with `#lib/...` (package.json `imports`), not `$lib`.
- Pages prerender by default (`src/routes/+layout.ts`). Pages built from the podcast RSS feed set `prerender = false` and call `cacheEpisodePage(setHeaders)` so Netlify's CDN caches them. Merch is server-rendered per request for live stock.
- Episodes come from the RSS feed (`src/lib/server/episodes.ts`), never hard-coded. Guests and their episode codes are hand-kept in `src/lib/guests.ts`.
- Only server code calls the Hurricast API (`src/lib/server/hurricast-api.ts`), and every response is validated with valibot. Env vars are declared in `src/env.ts` and read from `$app/env/private`.
- CSP is hash-based. A new external origin for images, audio or form posts must be added to the CSP directives in `vite.config.ts`. The theme script in `src/app.html` is hashed automatically.
- One `<audio>` element lives in `MiniPlayer` in the root layout. Control playback through the `Player` from `getPlayer()`, never with another audio element.

## Svelte and SvelteKit patterns

- Runes only: `$state`, `$derived` (writable when local state should follow a source but can be overridden), `$props`, `$props.id()` for ids. Reach for `$effect` last; derive or handle the event instead.
- `{@attach}` instead of actions, snippets instead of slots, `createContext` for shared state, `onclick`-style event attributes, and class arrays or objects instead of `class:`.
- Forms and dialogs work without JavaScript, then get enhanced. Forms post to form actions or GET to URLs; dialogs and menus use `<dialog>`, `popover` and Invoker Commands (`commandfor`, `command`).
- Filters live in the URL. Update it with `goto(url, { shallow: true, replace: true })`. After a shallow navigation, and when Back returns to one, `page.url` is the original address and the filtered one is `page.shallow.url`. Read `page.shallow?.url ?? page.url`.
- Prefer platform features to libraries: native dialog, popover, view transitions (`onNavigate` in the root layout), `light-dark()` and `@starting-style`.

## Design system

- Colors are semantic tokens in `src/routes/layout.css`, each a `light-dark()` pair: `canvas`, `surface`, `sand`, `ink`, `heading`, `muted`, `line`, `accent`, `link`, `chrome`, `band`, `player` and so on. Use them instead of raw colors. `dark:` is only for what a token can't express. No `!important` overrides; add a token or a `Button` variant instead.
- Reuse what exists before writing new UI: `Button` variants, `Sheet` for every dialog, `PageHeader`, `SectionHeading`, `LinkList`, `Icon`, and the `page`, `display`, `link`, `stretched-link` and `focus-ring-none` utilities.
- Button roles: filled for the page's main destinations, outlined for secondary ones. A gold disc icon marks a button that opens a sheet.
- Layouts must hold at 320px. Use `minmax(0, 1fr)` grid tracks, `min-w-0` on grid and flex children, `contain-inline-size` on truncating text, and `wrap-anywhere` for long words and URLs. `enhanced:img` renders a `<picture>`, so size a wrapper element, not the image, in flex and grid.
- Images in `src/lib/assets/` go through `enhanced:img`. Compress any image you add with pngquant and oxipng (PNG) or cjpeg (JPEG).

## Copy

- Oxford commas, curly quotes and apostrophes (’ “ ”), and sentence-case headings.
- Call the artwork "our logo", never "the crest".
- Avoid wording that goes stale: no "now in his second season" or "four times". The site already computes counts and dates.
- Old blog posts in `src/content/posts/` stay as published.

## Gotchas

- e2e tests act faster than page transitions finish. After a navigation, wait for the new page's `h1` before clicking again, or the click can land on the outgoing page.
- Netlify sends any path without a static file to the SvelteKit function before applying `_redirects`, so redirects for old URLs belong in `src/hooks.server.ts`.
- The `build/` directory is generated output. Never edit it.
