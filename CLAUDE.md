# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blog CMS -- Full-featured blog with Supabase-powered content management, user authentication, category/tag filtering, comments with moderation, and an admin dashboard for creating and editing posts. Content is stored in Supabase (PostgreSQL with RLS). Public visitors see published posts; authenticated authors manage their own drafts and moderate comments.

Built with Next.js 14, React 18, TypeScript 5.9, Tailwind CSS, and Supabase.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npx tsc --noEmit         # Type check
npm run lint             # ESLint
npm run test             # Vitest unit tests
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest + v8 coverage report
npm run test:e2e         # Playwright E2E (requires dev server or will start one)
npm run test:e2e:ui      # Playwright interactive UI

# Database
npx supabase start       # Start local Supabase
npx supabase db reset    # Reset DB and apply migrations + seed
npm run db:migrate       # Apply pending migrations
```

## Architecture

- `src/app/` -- App Router pages and layouts
  - `src/app/auth/` -- Login and signup pages
  - `src/app/blog/[slug]/` -- Post detail page with comments
  - `src/app/categories/` -- Category listing page
  - `src/app/admin/posts/` -- Admin post list, create, and edit pages
  - `src/app/admin/comments/` -- Comment moderation page
- `src/components/` -- Reusable React components
  - `src/components/auth/` -- AuthProvider context
  - `src/components/Header.tsx` -- Auth-aware navigation header
  - `src/components/CommentSection.tsx` -- Comment display and submission
  - `src/components/PostEditor.tsx` -- Post create/edit form
- `src/lib/` -- Utilities and data access
  - `src/lib/supabase.ts` -- Browser and server Supabase clients
  - `src/lib/posts.ts` -- Public post queries (published posts, categories, tags, comments)
  - `src/lib/admin.ts` -- Admin queries (author posts, moderation)
  - `src/lib/i18n.ts` -- i18n translation loader
- `src/types/` -- TypeScript type definitions matching DB schema
- `src/middleware.ts` -- Auth middleware protecting /admin routes
- `supabase/migrations/` -- Database migrations
- `supabase/seed.sql` -- Seed data (4 categories, 6 tags, 8 posts, 5 comments)
- `e2e/` -- Playwright end-to-end specs

## Database Schema

Six tables: `profiles`, `categories`, `posts`, `tags`, `post_tags`, `comments`. RLS enabled on all tables. Published posts are publicly readable; drafts are author-only. Comments are moderated (approved boolean). Auto-profile trigger creates a profile row on user signup. Auto-update trigger maintains `updated_at` on posts.

## Key Patterns

- **Auth flow:** Supabase Auth with email/password. AuthProvider wraps the app, provides user state. Middleware redirects unauthenticated users from /admin routes to /auth/login.
- **Server components:** Public pages (blog listing, post detail, categories) use server components with `createServerClient()` for data fetching. Admin pages use `"use client"` with the browser Supabase client.
- **Comment moderation:** New comments default to `approved = false`. Post authors can approve/reject comments from `/admin/comments`.
- **Category/tag filtering:** Blog listing page accepts `?category=slug&tag=slug` query params for filtering.
- **Post editor:** Shared `PostEditor` component handles both create and edit. Auto-generates slug from title on new posts.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | -- | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | -- | Supabase service role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URL for OG tags |
| `NEXT_PUBLIC_SITE_NAME` | `My Blog` | Site name in metadata |

## Rules

- TypeScript strict mode -- no `any` types
- All components must have proper TypeScript interfaces
- Use Tailwind utility classes -- no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Use `next/image` for optimized images, `next/link` for navigation
- Supabase queries use the typed client from `src/lib/supabase.ts`
- Server components use `createServerClient()`, client components use `supabase` browser client
- RLS policies enforce data access -- never bypass with service role key in client code
