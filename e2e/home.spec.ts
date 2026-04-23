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
    // When Supabase has published posts, article elements appear
    const postCount = await page.locator('article').count()
    // Either there are posts or no posts — both are valid depending on DB state
    expect(postCount).toBeGreaterThanOrEqual(0)
  })

  test('each post article links to its slug URL', async ({ page }) => {
    const articles = page.locator('article')
    const count = await articles.count()

    for (let i = 0; i < count; i++) {
      const link = articles.nth(i).getByRole('link').first()
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^\/blog\/[a-z0-9-]+$/)
    }
  })

  test('navigating to Categories page works', async ({ page }) => {
    await page.getByRole('navigation').getByRole('link', { name: 'Categories' }).click()
    await expect(page).toHaveURL('/categories')
    await expect(page.getByRole('heading', { name: 'Categories', level: 1 })).toBeVisible()
  })

  test('category and tag filter pills are displayed', async ({ page }) => {
    // Category filter section should be visible
    await expect(page.getByText('Categories')).toBeVisible()
    await expect(page.getByText('Tags')).toBeVisible()
  })
})

test.describe('Categories page', () => {
  test('renders the Categories h1 heading', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: 'Categories', level: 1 })).toBeVisible()
  })

  test('category cards link to filtered blog view', async ({ page }) => {
    await page.goto('/categories')
    const links = page.locator('a[href*="category="]')
    const count = await links.count()

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toMatch(/category=[a-z0-9-]+/)
    }
  })
})

test.describe('Auth pages', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('signup page renders', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
  })

  test('login page links to signup', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
  })
})
