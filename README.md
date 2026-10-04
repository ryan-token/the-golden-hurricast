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
- **Hosted on Netlify** with [`@sveltejs/adapter-netlify`](https://svelte.dev/docs/kit/adapter-netlify). Pages are prerendered to static HTML; the merch pages and the question form run as Netlify Functions.
- Merch, inventory, Stripe Checkout and listener questions are served by the AWS backend in [`serverless/`](serverless/README.md)
- **Commits to `main` trigger a production build on Netlify.** Other branches get deploy previews.
- goldenhurricast.com redirects to thegoldenhurricast.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ade9082-ccc8-41ed-b7ff-9964c6be1706/deploy-status)](https://app.netlify.com/sites/thegoldenhurricast/deploys)

## Development

Requires Node.js 24.

```sh
npm install
cp .env.example .env   # then set HURRICAST_API_URL (the dev API)
npm run dev            # http://localhost:5173
```

```sh
npm run check      # svelte-check (TypeScript)
npm run lint       # Prettier + ESLint
npm run test:unit  # Vitest
npm run test:e2e   # Playwright, against a production build
npm run build && npm run preview
```

### Environment variables

Declared and validated in [`src/env.ts`](src/env.ts). Set them in Netlify (Site configuration → Environment variables) per deploy context:

| Variable            | Production                   | Deploy previews / local |
| ------------------- | ---------------------------- | ----------------------- |
| `HURRICAST_API_URL` | the `prod` stage's API URL   | the `dev` stage's API URL |

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
- Run `npm run dev` to preview it locally. The build checks that the metadata is complete and that every image exists.
- Once you're ready to publish, run `git add .`, `git commit -m "Add a new blog post"`, and `git push origin blog`
- In a minute or so, the preview of the blog post should be viewable at `blog--thegoldenhurricast.netlify.app`
- Once you're happy with it, open a Pull Request on GitHub with `base` set to `main` and `compare` set to `blog`, and let me know. Once it's approved, merging it into `main` updates https://thegoldenhurricast.com within a minute or two.
