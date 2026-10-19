import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { OcclusionOverlay } from './OcclusionOverlay'
import { capturePresentation, occlusionRegions, presentationCta } from './previewPresentation'

describe('preview presentation', () => {
  it('translates preset CTAs in either direction and preserves custom advertiser CTA text', () => {
    expect(presentationCta('Mua ngay', 'en')).toBe('Shop now')
    expect(presentationCta('Shop now', 'vi')).toBe('Mua ngay')
    expect(presentationCta('Discover our spring collection', 'vi')).toBe(
      'Discover our spring collection',
    )
    expect(presentationCta('Discover our spring collection', 'en')).toBe(
      'Discover our spring collection',
    )
    expect(presentationCta('', 'en')).toBe('')
  })

  it('captures explicit presentation values without converting false flags into defaults', () => {
    const querySelector = vi.fn(() => ({
      dataset: {
        previewLocale: 'en',
        appChrome: 'false',
        captionMask: 'false',
        topviewPhase: 'intro',
      },
    }))
    const element = { querySelector } as unknown as HTMLElement

    expect(capturePresentation(element)).toEqual({
      locale: 'en',
      appChrome: false,
      captionMask: false,
      topViewPhase: 'intro',
    })
    expect(querySelector).toHaveBeenCalledWith('[data-preview-locale]')
    expect(capturePresentation(null)).toEqual({})
    expect(capturePresentation({ querySelector: () => null } as unknown as HTMLElement)).toEqual({})
  })

  it('uses existing presentation defaults for legacy preview DOM without new flags', () => {
    const element = {
      querySelector: () => ({ dataset: { previewLocale: 'vi' } }),
    } as unknown as HTMLElement
    expect(capturePresentation(element)).toEqual({
      locale: 'vi',
      appChrome: true,
      captionMask: true,
      topViewPhase: 'feed',
    })
  })

  it('keeps every estimated occlusion rectangle within its normalized creative canvas', () => {
    const placements = [
      'facebook.stories',
      'facebook.reels',
      'instagram.stories',
      'instagram.reels',
      'tiktok.in_feed',
      'tiktok.in_feed.video',
      'tiktok.topview',
      'youtube.shorts',
      'zalo.video.safe_zone',
    ]
    for (const id of placements) {
      for (const captionMask of [true, false]) {
        const regions = occlusionRegions(id, captionMask)
        expect(regions.length, id).toBeGreaterThan(0)
        expect(new Set(regions.map((region) => region.id)).size, id).toBe(regions.length)
        for (const region of regions) {
          expect(region.x, `${id}/${region.id}`).toBeGreaterThanOrEqual(0)
          expect(region.y, `${id}/${region.id}`).toBeGreaterThanOrEqual(0)
          expect(region.width, `${id}/${region.id}`).toBeGreaterThan(0)
          expect(region.height, `${id}/${region.id}`).toBeGreaterThan(0)
          expect(region.x + region.width, `${id}/${region.id}`).toBeLessThanOrEqual(100.001)
          expect(region.y + region.height, `${id}/${region.id}`).toBeLessThanOrEqual(100.001)
        }
      }
    }
  })

  it('toggles only the optional long-caption region and does not invent feed masks', () => {
    const withCaption = occlusionRegions('tiktok.topview', true)
    const withoutCaption = occlusionRegions('tiktok.topview', false)
    expect(withCaption.filter((region) => region.kind === 'caption')).toHaveLength(1)
    expect(withoutCaption.some((region) => region.kind === 'caption')).toBe(false)
    expect(withCaption.filter((region) => region.kind === 'always')).toEqual(withoutCaption)
    for (const id of [
      'facebook.feed',
      'instagram.feed',
      'google.search.mobile',
      'google.display.300x250',
    ]) {
      expect(occlusionRegions(id)).toEqual([])
    }
  })

  it('labels guides as estimates in both languages and omits the orange caption guide when disabled', () => {
    const vi = renderToStaticMarkup(
      <OcclusionOverlay profileId="tiktok.topview" captionMask locale="vi" />,
    )
    const en = renderToStaticMarkup(
      <OcclusionOverlay profileId="tiktok.topview" captionMask={false} locale="en" />,
    )
    expect(vi).toContain('data-occlusion-confidence="estimated"')
    expect(en).toContain('data-occlusion-confidence="estimated"')
    expect(vi).toContain('Vùng che ước lượng')
    expect(en).toContain('Estimated occlusion')
    expect(vi).toContain('data-occlusion-region="long-caption"')
    expect(en).not.toContain('data-occlusion-region="long-caption"')
  })
})
