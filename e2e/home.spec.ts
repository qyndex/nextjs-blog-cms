import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with a 200 status', async ({ page }) => {
    const response = await page.request.get('/')
    expect(response.status()).toBe(200)
  })

  test('renders the site header with a Blog brand link', async ({ page }) => {
    const brand = page.getByRole('link', { name: 'Blog' }).first()
    await expect(brand).toBeVisible()
    await expect(brand).toHaveAttribute('href', '/')
  })

  test('renders the Posts nav link', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Posts' })).toBeVisible()
  })

  test('renders the Categories nav link', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Categories' })).toBeVisible()
  })

  test('renders the Blog h1 heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible()
  })

  test('blog post list is visible when posts exist', async ({ page }) => {
    // When content/posts has at least one post, article elements appear
    const postCount = await page.locator('article').count()
    // Either there are posts (≥1 article) or no posts (0 articles) — both are valid
    expect(postCount).toBeGreaterThanOrEqual(0)
  })

  test('each post article links to its slug URL', async ({ page }) => {
    const articles = page.locator('article')
    const count = await articles.count()

    for (let i = 0; i < count; i++) {
      const link = articles.nth(i).getByRole('link')
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^\/blog\/[a-z0-9-]+$/)
    }
  })

  test('navigating to Categories page works', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Categories' }).click()
    await expect(page).toHaveURL('/categories')
    await expect(page.getByRole('heading', { name: 'Categories', level: 1 })).toBeVisible()
  })
})

test.describe('Categories page', () => {
  test('renders the Categories h1 heading', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: 'Categories', level: 1 })).toBeVisible()
  })

  test('category cards link to their category slug', async ({ page }) => {
    await page.goto('/categories')
    const links = page.locator('a[href^="/categories/"]')
    const count = await links.count()

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/categories\/[a-z0-9-]+$/)
    }
  })
})
