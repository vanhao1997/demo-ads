import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BRAND_ASSETS } from '../assets/brands/manifest'
import { PlatformLogo, brandAssetForPlatform, platformLogoLabel } from './PlatformLogo'

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('PlatformLogo', () => {
  it('renders local Simple Icons assets for supported platform groups', () => {
    const groups = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube', 'zalo']

    for (const groupId of groups) {
      const html = renderToStaticMarkup(<PlatformLogo groupId={groupId} />)
      expect(html).toContain('data-asset-status="available"')
      expect(html).toContain(`data-platform="${groupId}"`)
      expect(html).not.toContain('https://')
      expect(html).not.toMatch(/<script|on[a-z]+=|\bhref=/i)
    }
  })

  it('maps Google Search and Display to one Google asset', () => {
    expect(brandAssetForPlatform('google-search')?.assetId).toBe('brand.google')
    expect(brandAssetForPlatform('google-display')?.assetId).toBe('brand.google')
    expect(platformLogoLabel('google-search')).toBe('Google')
    expect(platformLogoLabel('google-display')).toBe('Google')
  })

  it('renders genuine custom SVG with available status for chatgpt', () => {
    const html = renderToStaticMarkup(<PlatformLogo groupId="chatgpt" label="ChatGPT" />)
    expect(html).toContain('data-asset-status="available"')
    expect(html).toContain('aria-label="ChatGPT"')
    expect(html).toContain('<svg')
  })

  it('uses accessible text fallback for platforms without reviewed logo assets', () => {
    const html = renderToStaticMarkup(<PlatformLogo groupId="unsupported" label="Unsupported" />)
    expect(html).toContain('data-asset-status="unavailable"')
    expect(html).toContain('aria-label="Unsupported"')
    expect(html).toContain('>Un</span>')
    expect(html).not.toContain('<svg')
  })

  it('keeps brand manifest provenance and review gate explicit', () => {
    expect(BRAND_ASSETS).toHaveLength(7)
    expect(BRAND_ASSETS.every((asset) => asset.sourceRefIds.includes('E18'))).toBe(true)
    expect(BRAND_ASSETS.every((asset) => asset.trademarkStatus === 'review_required')).toBe(true)
    expect(BRAND_ASSETS.every((asset) => /^[a-f0-9]{64}$/.test(asset.sha256))).toBe(true)
    expect(BRAND_ASSETS.every((asset) => asset.sourceUrl.includes('simple-icons@15.15.0'))).toBe(true)
  })

  it('matches manifest hashes to bundled local SVG content', async () => {
    for (const asset of BRAND_ASSETS) {
      const platformId = asset.id === 'brand.google' ? 'google-search' : asset.id.replace('brand.', '')
      const bundled = brandAssetForPlatform(platformId)

      expect(bundled).toBeDefined()
      expect(await sha256Hex(bundled!.svg)).toBe(asset.sha256)
    }
  })
})
