import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase module before importing posts
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
const mockIn = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase', () => ({
  createServerClient: () => ({
    from: mockFrom,
  }),
}))

// Chain builder helper
function chainBuilder(finalData: unknown, finalError: unknown = null) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.in = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockResolvedValue({ data: finalData, error: finalError })
  chain.single = vi.fn().mockResolvedValue({ data: finalData, error: finalError })
  return chain
}

describe('getAllPosts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns an empty array when query returns error', async () => {
    const postsChain = chainBuilder(null, { message: 'error' })
    mockFrom.mockReturnValue(postsChain)

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()
    expect(posts).toEqual([])
  })

  it('returns posts with tags when data exists', async () => {
    const mockPosts = [
      { id: '1', title: 'Test Post', slug: 'test-post', status: 'published' },
    ]
    const mockPostTags = [
      { post_id: '1', tag: { id: 't1', name: 'TypeScript', slug: 'typescript' } },
    ]

    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'posts') {
        const chain = chainBuilder(mockPosts)
        // Override order to return data directly
        chain.order = vi.fn().mockResolvedValue({ data: mockPosts, error: null })
        return chain
      }
      if (table === 'post_tags') {
        const chain = chainBuilder(mockPostTags)
        chain.in = vi.fn().mockResolvedValue({ data: mockPostTags, error: null })
        return chain
      }
      return chainBuilder([])
    })

    const { getAllPosts } = await import('./posts')
    const posts = await getAllPosts()

    expect(posts).toHaveLength(1)
    expect(posts[0].title).toBe('Test Post')
    expect(posts[0].tags).toHaveLength(1)
    expect(posts[0].tags[0].name).toBe('TypeScript')
  })
})

describe('getAllCategories', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns categories with post counts', async () => {
    const mockCategories = [
      { id: 'c1', name: 'Engineering', slug: 'engineering', description: null, created_at: '' },
    ]
    const mockPosts = [
      { category_id: 'c1' },
      { category_id: 'c1' },
    ]

    mockFrom.mockImplementation((table: string) => {
      if (table === 'categories') {
        const chain = chainBuilder(mockCategories)
        chain.order = vi.fn().mockResolvedValue({ data: mockCategories, error: null })
        return chain
      }
      if (table === 'posts') {
        const chain = chainBuilder(mockPosts)
        chain.eq = vi.fn().mockResolvedValue({ data: mockPosts, error: null })
        return chain
      }
      return chainBuilder([])
    })

    const { getAllCategories } = await import('./posts')
    const categories = await getAllCategories()

    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Engineering')
    expect(categories[0].post_count).toBe(2)
  })
})
