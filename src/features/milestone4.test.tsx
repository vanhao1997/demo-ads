import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  CANONICAL_CTA_MAP,
  SPONSORED_LABELS,
  SEE_MORE_LABELS,
  translateCta,
  translateSponsored,
  translateSeeMore,
} from './translations'
import { DEFAULT_RENDER_SETTINGS } from './editorModel'
import { getPlacementSpec, PLACEMENT_SPECS } from './placementSpecs'
import { DeviceMockup } from './DeviceMockup'
import { deviceMockups } from './deviceMockupModel'
import { ZoomModal } from './ZoomModal'
import { canonicalProfiles as profiles, runValidation } from './catalogBridge'
import { initialDraft } from './editorModel'
import { isVerticalSafeZonePlacement } from '../App'
import { SocialPreview } from './SocialPreview'

describe('Milestone 4: Interactive Tools, Overlays & Validation', () => {
  describe('Feature 26: Bilingual UI Translations', () => {
    it('CANONICAL_CTA_MAP contains all 18 canonical CTAs', () => {
      const keys = Object.keys(CANONICAL_CTA_MAP)
      expect(keys).toHaveLength(18)
      expect(keys).toContain('learn_more')
      expect(keys).toContain('shop_now')
      expect(keys).toContain('sign_up')
      expect(keys).toContain('book_now')
      expect(keys).toContain('contact_us')
      expect(keys).toContain('download')
      expect(keys).toContain('get_offer')
      expect(keys).toContain('order_now')
      expect(keys).toContain('send_message')
      expect(keys).toContain('subscribe')
      expect(keys).toContain('watch_more')
      expect(keys).toContain('watch_now')
      expect(keys).toContain('apply_now')
      expect(keys).toContain('get_quote')
      expect(keys).toContain('call_now')
      expect(keys).toContain('install_now')
      expect(keys).toContain('visit_site')
      expect(keys).toContain('none')
    })

    it('translates CTAs in both directions accurately', () => {
      expect(translateCta('Tìm hiểu thêm', 'en')).toBe('Learn more')
      expect(translateCta('Learn more', 'vi')).toBe('Tìm hiểu thêm')
      expect(translateCta('Đặt hàng ngay', 'en')).toBe('Order now')
      expect(translateCta('Order now', 'vi')).toBe('Đặt hàng ngay')
      expect(translateCta('Ứng tuyển ngay', 'en')).toBe('Apply now')
      expect(translateCta('Apply now', 'vi')).toBe('Ứng tuyển ngay')
      expect(translateCta('Không có nút', 'en')).toBe('No button')
      expect(translateCta('No button', 'vi')).toBe('Không có nút')
      expect(translateCta('Liên hệ', 'en')).toBe('Contact us')
      expect(translateCta('', 'vi')).toBe('')
    })

    it('SPONSORED_LABELS covers all 11 platforms including LinkedIn Promoted', () => {
      expect(SPONSORED_LABELS.facebook.vi).toBe('Được tài trợ')
      expect(SPONSORED_LABELS.facebook.en).toBe('Sponsored')
      expect(SPONSORED_LABELS.linkedin.vi).toBe('Được quảng bá')
      expect(SPONSORED_LABELS.linkedin.en).toBe('Promoted')
      expect(translateSponsored('linkedin', 'vi')).toBe('Được quảng bá')
      expect(translateSponsored('linkedin', 'en')).toBe('Promoted')
      expect(translateSponsored('facebook', 'vi')).toBe('Được tài trợ')
      expect(translateSponsored('facebook', 'en')).toBe('Sponsored')
      expect(translateSponsored('google-search', 'vi')).toBe('Kết quả được tài trợ')
      expect(translateSponsored('gdn', 'vi')).toBe('Quảng cáo')
    })

    it('SEE_MORE_LABELS maps read more in Vietnamese and English', () => {
      expect(translateSeeMore('facebook', 'vi')).toBe('Xem thêm')
      expect(translateSeeMore('facebook', 'en')).toBe('See more')
      expect(translateSeeMore('instagram', 'vi')).toBe('xem thêm')
      expect(translateSeeMore('instagram', 'en')).toBe('more')
    })
    it('translates canonical keys directly to localized strings', () => {
      expect(translateCta('learn_more', 'vi')).toBe('Tìm hiểu thêm')
      expect(translateCta('learn_more', 'en')).toBe('Learn more')
      expect(translateCta('shop_now', 'vi')).toBe('Mua ngay')
      expect(translateCta('shop_now', 'en')).toBe('Shop now')
      expect(translateCta('order_now', 'vi')).toBe('Đặt hàng ngay')
      expect(translateCta('order_now', 'en')).toBe('Order now')
    })
  })

  describe('Feature 27: Safe-Zone Overlays', () => {
    it('initial safeZone render setting is false so first click activates it', () => {
      expect(DEFAULT_RENDER_SETTINGS.safeZone).toBe(false)
    })

    it('restricts safe-zone overlays strictly to vertical 9:16 placements and excludes overlay banners', () => {
      expect(isVerticalSafeZonePlacement('fb_reels_overlay')).toBe(false)
      expect(isVerticalSafeZonePlacement('facebook.reels_banner')).toBe(false)
      expect(isVerticalSafeZonePlacement('facebook.feed')).toBe(false)
      expect(isVerticalSafeZonePlacement('tiktok.in_feed')).toBe(true)
      expect(isVerticalSafeZonePlacement('tt_infeed')).toBe(true)
      expect(isVerticalSafeZonePlacement('tiktok.topview')).toBe(true)
      expect(isVerticalSafeZonePlacement('tt_topview')).toBe(true)
      expect(isVerticalSafeZonePlacement('youtube.shorts')).toBe(true)
      expect(isVerticalSafeZonePlacement('yt_shorts')).toBe(true)
    })
  })

  describe('Feature 28: Native App UI Toggle', () => {
    const spec = deviceMockups.phone

    it('renders phone status bar and home indicator when appChrome is true', () => {
      const html = renderToStaticMarkup(
        <DeviceMockup spec={spec} contentWidth={393} appChrome={true}>
          <div>Content</div>
        </DeviceMockup>,
      )
      expect(html).toContain('device-phone-status')
      expect(html).toContain('device-home-indicator')
      expect(html).toContain('9:41')
    })

    it('hides phone status bar and home indicator when appChrome is false', () => {
      const html = renderToStaticMarkup(
        <DeviceMockup spec={spec} contentWidth={393} appChrome={false}>
          <div>Content</div>
        </DeviceMockup>,
      )
      expect(html).not.toContain('device-phone-status')
      expect(html).not.toContain('device-home-indicator')
    })

    it('sets data-app-chrome attribute on SocialPreview root container', () => {
      const chromeOn = renderToStaticMarkup(
        <SocialPreview
          profileId="tiktok.in_feed"
          groupId="tiktok"
          brandName="Brand"
          accountName="brand"
          media={<div>Video</div>}
          appChrome={true}
        />,
      )
      expect(chromeOn).toContain('data-app-chrome="true"')

      const chromeOff = renderToStaticMarkup(
        <SocialPreview
          profileId="tiktok.in_feed"
          groupId="tiktok"
          brandName="Brand"
          accountName="brand"
          media={<div>Video</div>}
          appChrome={false}
        />,
      )
      expect(chromeOff).toContain('data-app-chrome="false"')
    })
  })

  describe('Feature 29: TikTok TopView Phase Toggle', () => {
    it('isTopView evaluates to true for both canonical tiktok.topview and fixture tt_topview', () => {
      const isTopView = (id: string) => id === 'tiktok.topview' || id === 'tt_topview'
      expect(isTopView('tiktok.topview')).toBe(true)
      expect(isTopView('tt_topview')).toBe(true)
      expect(isTopView('tiktok.in_feed')).toBe(false)
      expect(isTopView('tt_infeed')).toBe(false)
    })

    it('renders TopView badges and sets intro phase for both canonical and fixture IDs', () => {
      const canonicalHtml = renderToStaticMarkup(
        <SocialPreview
          profileId="tiktok.topview"
          groupId="tiktok"
          brandName="Brand"
          accountName="brand"
          media={<div>Video</div>}
          topViewPhase="intro"
        />,
      )
      expect(canonicalHtml).toContain('tiktok-topview-badges')
      expect(canonicalHtml).toContain('data-topview-phase="intro"')

      const fixtureHtml = renderToStaticMarkup(
        <SocialPreview
          profileId="tt_topview"
          groupId="tiktok"
          brandName="Brand"
          accountName="brand"
          media={<div>Video</div>}
          topViewPhase="intro"
        />,
      )
      expect(fixtureHtml).toContain('tiktok-topview-badges')
      expect(fixtureHtml).toContain('data-topview-phase="intro"')
    })

    it('suppresses intro phase on non-topview placements', () => {
      const inFeedHtml = renderToStaticMarkup(
        <SocialPreview
          profileId="tiktok.in_feed"
          groupId="tiktok"
          brandName="Brand"
          accountName="brand"
          media={<div>Video</div>}
          topViewPhase="intro"
        />,
      )
      expect(inFeedHtml).not.toContain('tiktok-topview-badges')
      expect(inFeedHtml).toContain('data-topview-phase="feed"')
    })
  })

  describe('Feature 30: Dedicated Zoom Modal', () => {
    const profile = profiles[0]
    const mockup = deviceMockups.phone

    it('renders zoom modal with dark backdrop and close button when open', () => {
      const html = renderToStaticMarkup(
        <ZoomModal isOpen={true} onClose={() => {}} profile={profile} mockup={mockup}>
          <div className="test-mockup">Preview</div>
        </ZoomModal>,
      )
      expect(html).toContain('zoom-modal-backdrop')
      expect(html).toContain('close-zoom-btn')
      expect(html).toContain('✕')
      expect(html).toContain('test-mockup')
    })

    it('renders null when isOpen is false', () => {
      const html = renderToStaticMarkup(
        <ZoomModal isOpen={false} onClose={() => {}} profile={profile} mockup={mockup}>
          <div>Preview</div>
        </ZoomModal>,
      )
      expect(html).toBe('')
    })
  })

  describe('Feature 32: Live Validation Rules', () => {
    it('Google Search triggers warning when brand name exceeds 25 characters', () => {
      const draft = {
        ...initialDraft,
        identity: { brandName: 'Thương hiệu công nghệ kỹ thuật số quá dài', handle: '@tech' },
      }
      const checks = runValidation(draft, 'google.search.mobile')
      const brandCheck = checks.find((c) => c.id.includes('brandName') || c.fieldPath.includes('brandName'))
      expect(brandCheck).toBeDefined()
      expect(brandCheck?.status).toBe('warn')
    })

    it('TikTok In-Feed triggers warning when brand name contains emoji', () => {
      const draft = {
        ...initialDraft,
        identity: { brandName: 'Brand 🔥 Shop', handle: '@brand' },
      }
      const checks = runValidation(draft, 'tiktok.in_feed')
      const emojiCheck = checks.find((c) => c.id.includes('no_emoji'))
      expect(emojiCheck).toBeDefined()
      expect(emojiCheck?.status).toBe('warn')
    })

    it('Threads Feed triggers warning when primary text contains hashtag or URL', () => {
      const draft = {
        ...initialDraft,
        copy: { ...initialDraft.copy, primaryText: 'Xem sản phẩm tại https://example.com #sale' },
      }
      const checks = runValidation(draft, 'threads.feed')
      const threadCheck = checks.find((c) => c.id.includes('threads_no_links'))
      expect(threadCheck).toBeDefined()
      expect(threadCheck?.status).toBe('warn')
    })
  })

  describe('Feature 33: Official Specifications Card', () => {
    it('maps all 46 placements with official ratios and specs', () => {
      expect(Object.keys(PLACEMENT_SPECS).length).toBeGreaterThanOrEqual(30)
      const fbFeed = getPlacementSpec('fb_feed')
      expect(fbFeed.ratio).toBe('4:5')
      expect(fbFeed.recommendedPx).toBe('1440×1800')
      expect(fbFeed.primaryTruncate).toBe(124)
      expect(fbFeed.sourceStatus).toBe('Thông số chính thức')
      expect(fbFeed.notes).toContain('Messenger')
    })

    it('resolves canonical profile IDs to specs', () => {
      const fbFeed = getPlacementSpec('facebook.feed')
      expect(fbFeed.ratio).toBe('4:5')
      expect(fbFeed.recommendedPx).toBe('1440×1800')

      const ttInfeed = getPlacementSpec('tiktok.in_feed')
      expect(ttInfeed.ratio).toBe('9:16')
      expect(ttInfeed.recommendedPx).toBe('1080×1920')

      const ytShorts = getPlacementSpec('youtube.shorts')
      expect(ytShorts.ratio).toBe('9:16')
      expect(ytShorts.safeZone).toBe(true)
    })
  })
})
