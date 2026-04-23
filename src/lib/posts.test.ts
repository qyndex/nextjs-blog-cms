import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import fs from 'fs'

// We mock the `fs` module so tests have no disk dependency
vi.mock('fs')

const mockedFs = vi.mocked(fs)

// gray-matter is a pure function over a string — we let it run for real
// so the parsing logic in posts.ts is fully exercised.

describe('getAllPosts', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty array when the content directory does not exist', async () => {
    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(false)

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()
    expect(posts).toEqual([])
  })

  it('parses a single markdown file and returns a Post', async () => {
    const mdContent = `---
title: Hello World
date: 2024-01-15
category: Engineering
excerpt: A first post
tags: [typescript, nextjs]
---
Post body here.`

    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue(['hello-world.md'] as unknown as fs.Dirent[])
    ;(mockedFs.readFileSync as unknown as MockInstance).mockReturnValue(mdContent)

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()

    expect(posts).toHaveLength(1)
    expect(posts[0]).toMatchObject({
      slug: 'hello-world',
      title: 'Hello World',
      date: '2024-01-15',
      category: 'Engineering',
      excerpt: 'A first post',
      tags: ['typescript', 'nextjs'],
    })
  })

  it('sorts posts by date descending (newest first)', async () => {
    const makePost = (title: string, date: string) => `---
title: ${title}
date: ${date}
category: General
excerpt: excerpt
tags: []
---
body`

    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue(['older.md', 'newer.md'] as unknown as fs.Dirent[])
    ;(mockedFs.readFileSync as unknown as MockInstance)
      .mockReturnValueOnce(makePost('Older Post', '2024-01-01'))
      .mockReturnValueOnce(makePost('Newer Post', '2024-06-01'))

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()

    expect(posts[0].title).toBe('Newer Post')
    expect(posts[1].title).toBe('Older Post')
  })

  it('applies sensible defaults when frontmatter fields are absent', async () => {
    const mdContent = '---\n---\nJust a body.'

    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue(['no-meta.md'] as unknown as fs.Dirent[])
    ;(mockedFs.readFileSync as unknown as MockInstance).mockReturnValue(mdContent)

    const { getAllPosts } = await import('./posts')
    const [post] = await getAllPosts()

    expect(post.title).toBe('Untitled')
    expect(post.category).toBe('Uncategorized')
    expect(post.tags).toEqual([])
    expect(post.excerpt).toBe('')
  })

  it('ignores non-markdown files in the directory', async () => {
    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue(['post.md', 'image.png', 'data.json'] as unknown as fs.Dirent[])
    ;(mockedFs.readFileSync as unknown as MockInstance).mockReturnValue('---\ntitle: Only Post\ndate: 2024-01-01\ncategory: x\nexcerpt: y\ntags: []\n---\nbody')

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()

    expect(posts).toHaveLength(1)
    expect(posts[0].slug).toBe('post')
  })
})

describe('getPostBySlug', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the matching post by slug', async () => {
    const mdContent = `---
title: Target Post
date: 2024-03-01
category: Tech
excerpt: An excerpt
tags: []
---
body`

    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue(['target-post.md'] as unknown as fs.Dirent[])
    ;(mockedFs.readFileSync as unknown as MockInstance).mockReturnValue(mdContent)

    const { getPostBySlug } = await import('./posts')
    const post = await getPostBySlug('target-post')

    expect(post).not.toBeNull()
    expect(post?.slug).toBe('target-post')
    expect(post?.title).toBe('Target Post')
  })

  it('returns null when no post matches the slug', async () => {
    ;(mockedFs.existsSync as unknown as MockInstance).mockReturnValue(true)
    ;(mockedFs.readdirSync as unknown as MockInstance).mockReturnValue([] as unknown as fs.Dirent[])

    const { getPostBySlug } = await import('./posts')
    const post = await getPostBySlug('does-not-exist')

    expect(post).toBeNull()
  })
})
