# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blog / CMS — Content-driven blog with MDX support, categories, search, RSS feed, and syntax highlighting. Built with Next.js and @next/mdx.

Built with Next.js 14, React 19, TypeScript 5.9, and Tailwind CSS.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npx tsc --noEmit         # Type check
npm run lint             # ESLint

# Testing
npm test                 # Vitest unit tests (run once)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest + v8 coverage report
npm run test:e2e         # Playwright E2E (requires dev server or will start one)
npm run test:e2e:ui      # Playwright interactive UI
```

## Architecture

- `src/app/` — App Router pages and layouts
- `src/components/` — Reusable React components
- `src/lib/` — Utilities, helpers, API clients
- `src/test/setup.ts` — Vitest global setup (@testing-library/jest-dom)
- `src/locales/` — i18n JSON translation files
- `public/` — Static assets
- `content/posts/` — MDX/Markdown blog posts (created at runtime; not in repo)
- `e2e/` — Playwright end-to-end specs

## Testing

### Unit tests (Vitest + jsdom)
- Config: `vitest.config.ts` — jsdom environment, `@/` alias, react plugin
- Setup: `src/test/setup.ts` imports `@testing-library/jest-dom`
- Test files: co-located with source as `*.test.{ts,tsx}`
- Key test files:
  - `src/components/Header.test.tsx` — renders nav links, header landmark
  - `src/lib/posts.test.ts` — getAllPosts / getPostBySlug (fs mocked)
  - `src/lib/i18n.test.ts` — t() fallback logic and loadLocale()

### E2E tests (Playwright)
- Config: `playwright.config.ts` — Chromium, auto-starts dev server
- Specs: `e2e/home.spec.ts` — home page loads, nav links, blog post links, categories

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URL for RSS / OG tags |
| `NEXT_PUBLIC_SITE_NAME` | `My Blog` | Site name shown in metadata |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | Active locale |

## Rules

- TypeScript strict mode — no `any` types
- All components must have proper TypeScript interfaces
- Use Tailwind utility classes — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Use `next/image` for all images, `next/link` for navigation
- Mock `next/link` with a plain `<a>` in Vitest tests (no Next.js runtime in jsdom)
- Mock `fs` in `posts.test.ts` — no disk I/O in unit tests
- Blog content lives in `content/posts/*.md` (or `.mdx`); create that directory before `npm run dev`
