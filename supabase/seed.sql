-- Seed data: 4 categories, 6 tags, 8 posts, tag associations, 5 comments
-- Uses a fixed author UUID; in production the auto-profile trigger creates profiles on signup.
-- For local dev seeding we insert a profile row directly.

-- Seed author profile (matches Supabase local dev default user or can be created manually)
INSERT INTO profiles (id, username, full_name, bio, role) VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'admin', 'Admin User', 'Blog administrator and primary author.', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, slug, description) VALUES
  ('c0c0c0c0-0001-4000-8000-000000000001', 'Engineering', 'engineering', 'Software engineering, architecture, and best practices'),
  ('c0c0c0c0-0002-4000-8000-000000000002', 'Design', 'design', 'UI/UX design, typography, and visual communication'),
  ('c0c0c0c0-0003-4000-8000-000000000003', 'Product', 'product', 'Product management, strategy, and roadmaps'),
  ('c0c0c0c0-0004-4000-8000-000000000004', 'DevOps', 'devops', 'Infrastructure, CI/CD, and deployment workflows')
ON CONFLICT (name) DO NOTHING;

-- Tags
INSERT INTO tags (id, name, slug) VALUES
  ('t0t0t0t0-0001-4000-8000-000000000001', 'TypeScript', 'typescript'),
  ('t0t0t0t0-0002-4000-8000-000000000002', 'React', 'react'),
  ('t0t0t0t0-0003-4000-8000-000000000003', 'Next.js', 'nextjs'),
  ('t0t0t0t0-0004-4000-8000-000000000004', 'Supabase', 'supabase'),
  ('t0t0t0t0-0005-4000-8000-000000000005', 'Tailwind', 'tailwind'),
  ('t0t0t0t0-0006-4000-8000-000000000006', 'PostgreSQL', 'postgresql')
ON CONFLICT (name) DO NOTHING;

-- Posts (6 published, 2 draft)
INSERT INTO posts (id, title, slug, content, excerpt, cover_image_url, category_id, author_id, status, published_at, created_at, updated_at) VALUES
  (
    'p0p0p0p0-0001-4000-8000-000000000001',
    'Getting Started with Next.js 14 App Router',
    'getting-started-nextjs-14-app-router',
    E'## Introduction\n\nNext.js 14 introduced significant improvements to the App Router, making it the recommended way to build new Next.js applications.\n\n## Key Features\n\n- **Server Components by default** — Components are server-rendered unless you opt into client-side rendering with `"use client"`.\n- **Layouts and Templates** — Share UI between routes with persistent layouts.\n- **Loading and Error States** — Built-in support for streaming and error boundaries.\n- **Route Handlers** — API routes using the Web Request/Response API.\n\n## Getting Started\n\nCreate a new project:\n\n```bash\nnpx create-next-app@latest my-app\n```\n\nThe App Router lives in the `app/` directory. Each folder represents a route segment, and `page.tsx` files define the UI for that route.\n\n## Conclusion\n\nThe App Router is a powerful paradigm shift that brings React Server Components to the mainstream. Start building with it today!',
    'Learn the fundamentals of Next.js 14 App Router including server components, layouts, and route handlers.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    'c0c0c0c0-0001-4000-8000-000000000001',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-01-15T10:00:00Z',
    '2024-01-14T08:00:00Z',
    '2024-01-15T10:00:00Z'
  ),
  (
    'p0p0p0p0-0002-4000-8000-000000000002',
    'Building Type-Safe APIs with Supabase',
    'building-type-safe-apis-supabase',
    E'## Why Supabase?\n\nSupabase provides an open-source Firebase alternative with a PostgreSQL database, authentication, real-time subscriptions, and auto-generated APIs.\n\n## Type Generation\n\nSupabase CLI can generate TypeScript types from your database schema:\n\n```bash\nnpx supabase gen types typescript --local > src/types/database.ts\n```\n\n## Using the Typed Client\n\n```typescript\nimport { createClient } from "@supabase/supabase-js";\nimport type { Database } from "@/types/database";\n\nconst supabase = createClient<Database>(url, key);\n```\n\nNow all queries are fully typed — `supabase.from("posts").select("*")` returns `Post[]` automatically.\n\n## Row Level Security\n\nRLS policies ensure users can only access data they are authorized to see. Always enable RLS on every table.\n\n## Conclusion\n\nSupabase + TypeScript gives you a powerful, type-safe data layer with minimal boilerplate.',
    'Leverage Supabase auto-generated types and Row Level Security for a fully typed, secure API layer.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    'c0c0c0c0-0001-4000-8000-000000000001',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-02-10T12:00:00Z',
    '2024-02-08T09:00:00Z',
    '2024-02-10T12:00:00Z'
  ),
  (
    'p0p0p0p0-0003-4000-8000-000000000003',
    'Designing Accessible UI Components',
    'designing-accessible-ui-components',
    E'## Accessibility Matters\n\nAccessibility (a11y) is not optional — it is a requirement for building inclusive web applications.\n\n## Key Principles\n\n1. **Semantic HTML** — Use the right elements: `<button>`, `<nav>`, `<main>`, `<article>`.\n2. **ARIA Labels** — Add `aria-label` or `aria-labelledby` to interactive elements that lack visible text.\n3. **Keyboard Navigation** — Every interactive element must be reachable and operable via keyboard.\n4. **Color Contrast** — Maintain a minimum 4.5:1 contrast ratio for normal text.\n5. **Focus Management** — Visible focus indicators on all focusable elements.\n\n## Component Libraries\n\nRadix UI provides unstyled, accessible primitives. Pair with Tailwind CSS for a fully custom look without sacrificing accessibility.\n\n## Testing\n\nUse `axe-core` via `@axe-core/playwright` for automated accessibility audits in your E2E tests.',
    'Build inclusive UI components with semantic HTML, ARIA attributes, and keyboard navigation.',
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
    'c0c0c0c0-0002-4000-8000-000000000002',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-03-05T14:00:00Z',
    '2024-03-04T11:00:00Z',
    '2024-03-05T14:00:00Z'
  ),
  (
    'p0p0p0p0-0004-4000-8000-000000000004',
    'CI/CD Pipelines with GitHub Actions',
    'cicd-pipelines-github-actions',
    E'## Automating Deployments\n\nGitHub Actions makes it straightforward to set up CI/CD pipelines directly in your repository.\n\n## Basic Workflow\n\n```yaml\nname: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test\n      - run: npm run build\n```\n\n## Best Practices\n\n- Cache `node_modules` with `actions/cache` for faster builds.\n- Run linting, type checking, and tests in parallel jobs.\n- Use environment protection rules for production deployments.\n- Add a canary bake step to catch regressions post-deploy.\n\n## Conclusion\n\nA well-designed CI/CD pipeline catches bugs early and ships changes confidently.',
    'Set up automated testing and deployment pipelines using GitHub Actions with caching and parallel jobs.',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800',
    'c0c0c0c0-0004-4000-8000-000000000004',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-04-01T09:00:00Z',
    '2024-03-30T15:00:00Z',
    '2024-04-01T09:00:00Z'
  ),
  (
    'p0p0p0p0-0005-4000-8000-000000000005',
    'Tailwind CSS Tips for Production Apps',
    'tailwind-css-tips-production-apps',
    E'## Why Tailwind?\n\nTailwind CSS provides utility-first classes that let you build custom designs without leaving your HTML.\n\n## Tips\n\n### 1. Use `@apply` Sparingly\n\nOnly use `@apply` for truly repeated patterns like `.btn-primary`. Otherwise, extract React components.\n\n### 2. Dark Mode\n\nEnable class-based dark mode in `tailwind.config.ts`:\n\n```typescript\nmodule.exports = {\n  darkMode: "class",\n  // ...\n};\n```\n\n### 3. CSS Variables for Theming\n\nDefine your color palette as CSS custom properties so themes can be swapped at runtime.\n\n### 4. Purge Unused Styles\n\nTailwind v3+ automatically tree-shakes unused styles in production builds — make sure your `content` paths cover all template files.\n\n### 5. Typography Plugin\n\nUse `@tailwindcss/typography` for beautiful prose styling with the `prose` class.\n\n## Conclusion\n\nTailwind scales from prototypes to production without accumulating technical debt in your stylesheets.',
    'Practical tips for using Tailwind CSS effectively in large-scale production applications.',
    'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    'c0c0c0c0-0002-4000-8000-000000000002',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-04-20T16:00:00Z',
    '2024-04-18T10:00:00Z',
    '2024-04-20T16:00:00Z'
  ),
  (
    'p0p0p0p0-0006-4000-8000-000000000006',
    'Product Roadmap Planning for Startups',
    'product-roadmap-planning-startups',
    E'## Building a Roadmap\n\nA product roadmap communicates your vision and priorities to stakeholders, engineers, and customers.\n\n## Framework: Now / Next / Later\n\n- **Now** — Committed work for the current sprint or quarter.\n- **Next** — Validated ideas queued for upcoming cycles.\n- **Later** — Exploratory ideas that need more research.\n\n## Prioritization\n\nUse RICE scoring (Reach x Impact x Confidence / Effort) to objectively compare features.\n\n## Communication\n\n- Share the roadmap publicly for transparency.\n- Update it regularly — a stale roadmap erodes trust.\n- Distinguish between commitments and aspirations.\n\n## Conclusion\n\nA clear roadmap aligns the team and sets realistic expectations.',
    'How to build and communicate an effective product roadmap using the Now/Next/Later framework.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'c0c0c0c0-0003-4000-8000-000000000003',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'published',
    '2024-05-12T08:00:00Z',
    '2024-05-10T14:00:00Z',
    '2024-05-12T08:00:00Z'
  ),
  (
    'p0p0p0p0-0007-4000-8000-000000000007',
    'Advanced PostgreSQL Query Optimization',
    'advanced-postgresql-query-optimization',
    E'## Draft Notes\n\nThis post will cover advanced PostgreSQL optimization techniques including:\n\n- EXPLAIN ANALYZE reading\n- Index types (B-tree, GIN, GiST)\n- Partial indexes\n- CTEs vs subqueries performance\n- Connection pooling with PgBouncer\n\nStill gathering benchmarks and examples.',
    'Deep dive into PostgreSQL query optimization techniques including indexing strategies and EXPLAIN ANALYZE.',
    NULL,
    'c0c0c0c0-0004-4000-8000-000000000004',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'draft',
    NULL,
    '2024-05-20T09:00:00Z',
    '2024-05-20T09:00:00Z'
  ),
  (
    'p0p0p0p0-0008-4000-8000-000000000008',
    'React Server Components Deep Dive',
    'react-server-components-deep-dive',
    E'## Work in Progress\n\nExploring:\n\n- Server vs Client component boundaries\n- Serialization constraints\n- Streaming and Suspense integration\n- Data fetching patterns\n- When to use "use client"\n\nNeed to add code examples and performance comparisons.',
    'A comprehensive guide to React Server Components, their constraints, and when to use them.',
    NULL,
    'c0c0c0c0-0001-4000-8000-000000000001',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'draft',
    NULL,
    '2024-06-01T11:00:00Z',
    '2024-06-01T11:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;

-- Post-Tag associations
INSERT INTO post_tags (post_id, tag_id) VALUES
  ('p0p0p0p0-0001-4000-8000-000000000001', 't0t0t0t0-0003-4000-8000-000000000003'),  -- Next.js post -> Next.js tag
  ('p0p0p0p0-0001-4000-8000-000000000001', 't0t0t0t0-0001-4000-8000-000000000001'),  -- Next.js post -> TypeScript tag
  ('p0p0p0p0-0002-4000-8000-000000000002', 't0t0t0t0-0004-4000-8000-000000000004'),  -- Supabase post -> Supabase tag
  ('p0p0p0p0-0002-4000-8000-000000000002', 't0t0t0t0-0001-4000-8000-000000000001'),  -- Supabase post -> TypeScript tag
  ('p0p0p0p0-0002-4000-8000-000000000002', 't0t0t0t0-0006-4000-8000-000000000006'),  -- Supabase post -> PostgreSQL tag
  ('p0p0p0p0-0003-4000-8000-000000000003', 't0t0t0t0-0002-4000-8000-000000000002'),  -- Accessible UI -> React tag
  ('p0p0p0p0-0003-4000-8000-000000000003', 't0t0t0t0-0005-4000-8000-000000000005'),  -- Accessible UI -> Tailwind tag
  ('p0p0p0p0-0005-4000-8000-000000000005', 't0t0t0t0-0005-4000-8000-000000000005'),  -- Tailwind tips -> Tailwind tag
  ('p0p0p0p0-0007-4000-8000-000000000007', 't0t0t0t0-0006-4000-8000-000000000006'),  -- PostgreSQL post -> PostgreSQL tag
  ('p0p0p0p0-0008-4000-8000-000000000008', 't0t0t0t0-0002-4000-8000-000000000002'),  -- RSC post -> React tag
  ('p0p0p0p0-0008-4000-8000-000000000008', 't0t0t0t0-0003-4000-8000-000000000003')   -- RSC post -> Next.js tag
ON CONFLICT DO NOTHING;

-- Comments (3 approved, 2 pending)
INSERT INTO comments (id, post_id, author_id, content, approved, created_at) VALUES
  (
    'cm0cm0cm-0001-4000-8000-000000000001',
    'p0p0p0p0-0001-4000-8000-000000000001',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'Great introduction! The App Router is a game changer for how we think about server-side rendering in React.',
    true,
    '2024-01-16T08:30:00Z'
  ),
  (
    'cm0cm0cm-0002-4000-8000-000000000002',
    'p0p0p0p0-0002-4000-8000-000000000002',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'The type generation from Supabase CLI is incredibly useful. Saved us hours of manual type definitions.',
    true,
    '2024-02-11T14:15:00Z'
  ),
  (
    'cm0cm0cm-0003-4000-8000-000000000003',
    'p0p0p0p0-0003-4000-8000-000000000003',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'Would love to see a follow-up on testing accessibility with Playwright and axe-core!',
    true,
    '2024-03-06T10:45:00Z'
  ),
  (
    'cm0cm0cm-0004-4000-8000-000000000004',
    'p0p0p0p0-0005-4000-8000-000000000005',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'I disagree about @apply — it is useful for reusable button styles across many pages.',
    false,
    '2024-04-21T09:00:00Z'
  ),
  (
    'cm0cm0cm-0005-4000-8000-000000000005',
    'p0p0p0p0-0001-4000-8000-000000000001',
    'd0d0d0d0-0001-4000-8000-000000000001',
    'Check out my website for more Next.js tips!',
    false,
    '2024-01-17T22:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;
