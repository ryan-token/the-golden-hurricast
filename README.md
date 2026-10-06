<p align="center">
  <a href="https://www.thegoldenhurricast.com">
    <img alt="The Golden Hurricast logo" src="/static/logo-300px.png" height="200" width="200" />
  </a>
</p>
<h1 align="center">The Golden Hurricast</h1>

<p align="center">
  The website for <a href="https://www.thegoldenhurricast.com">The Golden Hurricast</a>, the independent podcast about Golden Hurricane athletics at The University of Tulsa.
</p>

_Development by Ryan Token, blog and podcast contributions from Pat Fox, Matt Rechtien, and Ryan Token_

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ade9082-ccc8-41ed-b7ff-9964c6be1706/deploy-status)](https://app.netlify.com/sites/thegoldenhurricast/deploys)

## Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) and [Svelte 5](https://svelte.dev/docs/svelte), styled with [Tailwind CSS 4](https://tailwindcss.com/docs)
- Hosted on [Netlify](https://www.netlify.com/) with [`@sveltejs/adapter-netlify`](https://svelte.dev/docs/kit/adapter-netlify)
- Merch, inventory, Stripe Checkout, and listener questions run on the AWS backend in [`serverless/`](serverless/README.md)

## Getting started

Requires Node.js 24.

```sh
npm install
cp .env.example .env   # set HURRICAST_API_URL and HURRICAST_API_KEY for the dev API
npm run dev            # http://localhost:5173
```

| Command                | What it does                                                             |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run check`        | Type-checks with svelte-check                                            |
| `npm run lint`         | Prettier, then ESLint (`npm run format` fixes formatting)                |
| `npm run test:unit`    | Vitest                                                                   |
| `npm run test:e2e`     | Playwright in Chromium, Firefox, and WebKit, against a production build  |
| `npm run build`        | Production build (`npm run preview` serves it on :4173)                  |

The e2e tests read the public podcast feed and never send a question or start a checkout. Pages that call the API still render without it (the merch page shows an "unavailable" note), so placeholder values in `.env` work, as long as the key is at least 32 characters.

AI coding agents should read [`CLAUDE.md`](CLAUDE.md) (also available as `AGENTS.md`) for project conventions.

## How it works

**Rendering.** Most pages are prerendered to static HTML at build time. Pages built from the podcast's RSS feed (`/`, everything under `/podcast/`, and `/sitemap.xml`) are server-rendered and cached by Netlify's CDN for ten minutes, so a new episode appears within minutes without a rebuild. The merch pages, the question endpoint (`/api/questions/`), and `/question-received/` are rendered per request. All server rendering runs in one Netlify Function, which also handles 404s and redirects from old URLs.

**The API.** The site calls the Hurricast API only from the server (`src/lib/server/hurricast-api.ts`), never from browsers, and validates every response.

| Where                                    | What                                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`                            | Pages and endpoints. URLs (with trailing slashes) match the old Gatsby site, and blog posts live at the site root (`/a-spartan-recap/`).                |
| `src/lib/components/`                    | Shared components. `MiniPlayer` holds the site's one `<audio>` element in the root layout, so playback continues between pages.                        |
| `src/lib/server/episodes.ts`             | Reads the show's RSS feed into episodes: numbering parsed from titles, sanitized show notes, and chapter timestamps.                                    |
| `src/lib/guests.ts`                      | Everyone who has been on the show and the episodes they were on. Headliners' official photos are in `src/lib/assets/guests/`.                          |
| `src/content/posts/`                     | The Hurc's Corner blog archive (2019 to 2024), in Markdown. New writing is on Patreon.                                                                 |
| `src/routes/layout.css`                  | Tailwind theme: TU brand colors as light and dark pairs, the type scale, and base styles.                                                             |
| `src/lib/assets/`, `static/`             | Images processed at build time by [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images), and files served as they are.                         |
| `vite.config.ts`                         | SvelteKit config (Kit 3 has no `svelte.config.js`), including the hash-based Content Security Policy.                                                  |
| `src/hooks.server.ts`                    | Security headers for server-rendered pages, and redirects for old URLs and domain aliases.                                                            |
| `_headers`, `_redirects`, `netlify.toml` | Headers and domain-alias redirects for static files, and build settings.                                                                              |

Redirects for old URLs live in `src/hooks.server.ts` rather than `_redirects`, because Netlify sends any path without a static file to the SvelteKit function before it applies `_redirects`.

## Environment variables

Declared and validated in [`src/env.ts`](src/env.ts). They're read at runtime and never reach the browser. In Netlify, set them per deploy context under Site configuration, Environment variables, scoped to Functions.

| Variable            | Production                          | Deploy previews and local          |
| ------------------- | ----------------------------------- | ---------------------------------- |
| `HURRICAST_API_URL` | The `prod` stage's API URL          | The `dev` stage's API URL          |
| `HURRICAST_API_KEY` | SSM `/hurricast/prod/site-api-key`  | SSM `/hurricast/dev/site-api-key`  |

## Deployment

Pushing to `main` deploys to production on Netlify. Other branches and pull requests get deploy previews. goldenhurricast.com redirects to thegoldenhurricast.com.

The AWS backend deploys separately. See [`serverless/README.md`](serverless/README.md).

## License

[MIT](LICENSE)
