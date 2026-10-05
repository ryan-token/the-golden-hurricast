<p align="center">
  <a href="https://www.thegoldenhurricast.com">
    <img alt="The Golden Hurricast Logo" src="/static/logo-300px.png" height="200" width="200" />
  </a>
</p>
<h1 align="center">
  The Golden Hurricast
</h1>

Source code for https://thegoldenhurricast.com

_Development by Ryan Token, blog and podcast contributions from Pat Fox, Matt Rechtien, and Ryan Token_

## 🚀 Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) and [Svelte 5](https://svelte.dev/docs/svelte), styled with [Tailwind CSS 4](https://tailwindcss.com/)
- **Hosted on Netlify** with [`@sveltejs/adapter-netlify`](https://svelte.dev/docs/kit/adapter-netlify). Most pages are prerendered to static HTML. Pages built from the podcast's RSS feed (`/`, `/podcast/` and everything under it, and `/sitemap.xml`) are server-rendered and cached by Netlify's CDN for ten minutes, so new episodes appear without a rebuild. The merch pages (`/merch/`, `/merch/success/`, `/merch/cancel/` for Stripe Checkout's back link, and product photos at `/merch/photos/…`), the question endpoint (`/api/questions/`) and `/question-received/` are server-rendered by one Netlify Function, which also receives any other URL without a static file (404s and old-URL redirects).
- Merch, inventory, Stripe Checkout and listener questions are served by the AWS backend in [`serverless/`](serverless/README.md). The site calls it only from the server (`src/lib/server/hurricast-api.ts`), never from browsers.
- **Commits to `main` trigger a production build on Netlify.** Other branches get deploy previews.
- goldenhurricast.com redirects to thegoldenhurricast.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ade9082-ccc8-41ed-b7ff-9964c6be1706/deploy-status)](https://app.netlify.com/sites/thegoldenhurricast/deploys)

## Development

Requires Node.js 24.

```sh
npm install
cp .env.example .env   # then set HURRICAST_API_URL and HURRICAST_API_KEY for the dev API (SSM /hurricast/dev/site-api-key)
npm run dev            # http://localhost:5173
```

```sh
npm run check      # svelte-check (TypeScript)
npm run lint       # Prettier + ESLint
npm run test:unit  # Vitest
npm run test:e2e   # Playwright in Chromium, Firefox and WebKit (Safari), against a production build
npm run build && npm run preview
```

The e2e suite never calls the real API, so any values work for the environment variables there (the key must still be at least 32 characters). It does read the public podcast feed, as the site does.

### How it fits together

| Where                                                     | What                                                                                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/routes/`                                             | Pages, with the same URLs (and trailing slashes) as the old Gatsby site. Blog posts live at the site root (`/a-spartan-recap/`).                                                            |
| `src/content/posts/`                                      | Blog posts in Markdown, rendered at build time (`src/lib/server/markdown.ts`).                                                                                                             |
| `src/lib/components/`                                     | Shared components. `MiniPlayer` holds the site's one `<audio>` element in the root layout, so playback carries on between pages; `AskQuestion` and `Sheet` are native `<dialog>`s that work without JavaScript. |
| `src/lib/server/episodes.ts`                              | Reads the show's RSS feed on Spotify for Creators into episodes (numbering parsed from titles, sanitized show notes).                                                                       |
| `src/lib/guests.ts`                                       | Everyone who's been on the show, and the episodes they were on. Featured guests' official headshots are in `src/lib/assets/guests/`.                                                       |
| `src/routes/merch/photos/` | Re-serves Stripe-hosted product photos from our domain with long cache headers, so the Netlify Image CDN can resize them once and cache the result (Stripe sends `no-store`). |
| `src/lib/assets/`                                         | Images processed at build time by [`@sveltejs/enhanced-img`](https://svelte.dev/docs/kit/images) (AVIF/WebP, responsive sizes).                                                            |
| `static/`                                                 | Files served as-is: blog images and videos, icons, share images.                                                                                                                         |
| `src/routes/layout.css`                                   | Tailwind 4 theme: TU brand colours as light/dark pairs, type scale, radii, page transitions, base styles.                                                                                   |
| `vite.config.ts`                                          | SvelteKit config (Kit 3 has no `svelte.config.js`), including the hash-based Content Security Policy.                                                                                      |
| `src/hooks.server.ts`                                     | Security headers for server-rendered pages, and redirects for old URLs and domain aliases.                                                                                                 |
| `_headers`, `_redirects`, `netlify.toml`                  | Netlify: security headers for static files, domain-alias redirects for static files, build settings (including the publish directory).                                  |

Redirects for old URLs live in `hooks.server.ts` rather than `_redirects`: Netlify sends any path without a static file to the SvelteKit function before it applies `_redirects`.

### Environment variables

Declared and validated in [`src/env.ts`](src/env.ts); they're read at runtime and never reach the browser. Set them in Netlify (Site configuration → Environment variables, scoped to Functions) per deploy context:

| Variable            | Production                                       | Deploy previews / local                         |
| ------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `HURRICAST_API_URL` | the `prod` stage's API URL                       | the `dev` stage's API URL                       |
| `HURRICAST_API_KEY` | SSM `/hurricast/prod/site-api-key` (secret, 32+ characters) | SSM `/hurricast/dev/site-api-key` (secret) |

## Publishing Blog Posts

- Ensure you have [Homebrew](https://brew.sh/), [Node](https://nodejs.org/en/download/), and the [GitHub CLI](https://github.com/cli/cli) installed
- Clone the GitHub repo down locally. From the terminal, run: `gh repo clone ryan-token/the-golden-hurricast`
- From the terminal, switch to the folder you just cloned down: `cd path/to/the-golden-hurricast`
- From the terminal, run `npm i`
- Create a new branch named 'blog' and switch to it: `git switch -c blog`
- Create a new file in `src/content/posts` named after the date and topic, like the existing posts (e.g. `2025-01-15-bowl-preview.md`)
- Add metadata to the top of the file:

```
---
path: "/odd-case-frank-haith"
date: "03/12/2021"
sortDate: "2021/03/12"
title: "The Odd Case of Frank Haith"
authors: "Ryan Token"
excerpt: "Rick Dickson has a decision to make."
tags: ['basketball', 'coaching']
---
```

- Blog post content goes below the metadata, in Markdown
- Images for the post go in the `static/blog_images` folder, and are referenced as `![image alt text](/blog_images/folder-name/your-image-name.jpeg)`. Avoid spaces in file names.
- Keep images light, since they're served as-is: no wider than 1300px (twice the blog column), then compress them, e.g. with Homebrew's `pngquant --quality=80-100 --skip-if-larger --ext .png image.png` plus `oxipng -o max --strip safe image.png` for PNGs, and `jpegtran -optimize -progressive -copy icc -outfile out.jpg in.jpg` for JPEGs (photos can go to quality 85 with `cjpeg`). Prefer JPEG for photos.
- Run `npm run dev` to preview it locally. The build checks that the metadata is complete and that every image exists.
- Once you're ready to publish, run `git add .`, `git commit -m "Add a new blog post"`, and `git push origin blog`
- In a minute or so, the preview of the blog post should be viewable at `blog--thegoldenhurricast.netlify.app`
- Once you're happy with it, open a Pull Request on GitHub with `base` set to `main` and `compare` set to `blog`, and let me know. Once it's approved, merging it into `main` updates https://thegoldenhurricast.com within a minute or two.
