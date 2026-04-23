import { describe, it, expect, beforeEach, vi } from 'vitest'

// Each test gets a fresh module so the internal `_loaded` state is reset
describe('t()', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns the fallback string when key is missing', async () => {
    const { t, loadLocale } = await import('./i18n')
    await loadLocale('en')
    expect(t('nonexistent.key', 'Default text')).toBe('Default text')
  })

  it('returns the key itself when fallback is not provided and key is missing', async () => {
    const { t, loadLocale } = await import('./i18n')
    await loadLocale('en')
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })
})

describe('loadLocale()', () => {
  it('loads en.json translations and makes them available via t()', async () => {
    const { loadLocale, t } = await import('./i18n')
    await loadLocale('en')
    // en.json has "common.loading": "Loading..."
    expect(t('common.loading')).toBe('Loading...')
  })

  it('uses "en" as the default locale when no argument is provided', async () => {
    const { loadLocale, t } = await import('./i18n')
    await loadLocale()
    expect(t('common.save')).toBe('Save')
  })

  it('exposes the correct defaultLocale constant', async () => {
    const { defaultLocale } = await import('./i18n')
    expect(defaultLocale).toBe('en')
  })

  it('includes "en" in supportedLocales', async () => {
    const { supportedLocales } = await import('./i18n')
    expect(supportedLocales).toContain('en')
  })
})
