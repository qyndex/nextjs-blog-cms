import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

// next/link renders a plain <a> in test environments
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('Header', () => {
  it('renders the blog brand link pointing to /', () => {
    render(<Header />)
    const brandLink = screen.getByRole('link', { name: /blog/i })
    expect(brandLink).toBeInTheDocument()
    expect(brandLink).toHaveAttribute('href', '/')
  })

  it('renders the Posts nav link', () => {
    render(<Header />)
    const postsLink = screen.getByRole('link', { name: /posts/i })
    expect(postsLink).toBeInTheDocument()
    expect(postsLink).toHaveAttribute('href', '/')
  })

  it('renders the Categories nav link', () => {
    render(<Header />)
    const categoriesLink = screen.getByRole('link', { name: /categories/i })
    expect(categoriesLink).toBeInTheDocument()
    expect(categoriesLink).toHaveAttribute('href', '/categories')
  })

  it('wraps navigation links in a <nav> element', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    // Both Posts and Categories links are children of the nav
    expect(nav).toContainElement(screen.getByRole('link', { name: /categories/i }))
  })

  it('renders as a <header> landmark', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
