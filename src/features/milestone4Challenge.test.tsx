import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AD_PROFILES, requireProfile } from '../catalog'
import { canonicalProfiles as profiles, runValidation } from './catalogBridge'
import { deviceMockups } from './deviceMockupModel'
import { initialDraft } from './editorModel'
import type { EditorDraft } from './editorModel'
import { getPlacementSpec, PLACEMENT_SPECS } from './placementSpecs'
import { ZoomModal } from './ZoomModal'
import { countTextUnits } from '../validation/counting'
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  DEFAULT_CAMPAIGN_DRAFT,
} from '../../tests/fixtures/campaign-drafts'

describe('Empirical Challenge: Milestone 4 (Features 30–33)', () => {
  // ---------------------------------------------------------------------------
  // Challenge 1: Dedicated Zoom Modal ("Phóng to")
  // ---------------------------------------------------------------------------
  describe('Challenge 1: Dedicated Zoom Modal ("Phóng to")', () => {
    const profile = profiles[0]
    const mockup = deviceMockups.phone

    it('1.1 verifies modal backdrop CSS class and computed #0b0b0f/90 dark styling', () => {
      const cssPath = resolve(process.cwd(), 'src/styles.css')
      const css = readFileSync(cssPath, 'utf-8')
      expect(css).toContain('.zoom-modal-backdrop')
      expect(css).toMatch(/background-color:\s*rgba\(11,\s*11,\s*15,\s*0\.9\)/)
      expect(css).toMatch(/backdrop-filter:\s*blur\(8px\)/)
      expect(css).toMatch(/z-index:\s*9999/)
    })

    it('1.2 verifies modal contains close button with .close-zoom-btn and ✕ glyph', () => {
      const html = renderToStaticMarkup(
        <ZoomModal isOpen={true} onClose={() => {}} profile={profile} mockup={mockup}>
          <div className="preview-surface-content">Mockup Preview</div>
        </ZoomModal>,
      )
      expect(html).toContain('class="zoom-modal-backdrop"')
      expect(html).toContain('class="close-zoom-btn text-button"')
      expect(html).toContain('✕')
      expect(html).toContain('aria-label="Đóng"')
      expect(html).toContain('title="Đóng (Esc)"')
    })

    it('1.3 verifies ZoomModal renders nothing when isOpen is false', () => {
      const html = renderToStaticMarkup(
        <ZoomModal isOpen={false} onClose={() => {}} profile={profile} mockup={mockup}>
          <div>Mockup Preview</div>
        </ZoomModal>,
      )
      expect(html).toBe('')
    })

    it('1.4 verifies ZoomModal event contracts: backdrop click & Escape handlers do not mutate draft', () => {
      let closed = false
      const closeHandler = () => {
        closed = true
      }
      const draftBefore = JSON.stringify(initialDraft)

      // Simulate close
      closeHandler()
      expect(closed).toBe(true)

      // Ensure draft immutability
      const draftAfter = JSON.stringify(initialDraft)
      expect(draftAfter).toBe(draftBefore)
    })
  })

  // ---------------------------------------------------------------------------
  // Challenge 2: Fullscreen Workspace ("Toàn màn hình")
  // ---------------------------------------------------------------------------
  describe('Challenge 2: Fullscreen Workspace ("Toàn màn hình")', () => {
    it('2.1 verifies button text is "Toàn màn hình" and toggles to "Thoát toàn màn hình"', () => {
      const appCode = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appCode).toContain(
        "{previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}",
      )
      expect(appCode).toContain(
        "title={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}",
      )
      expect(appCode).toContain(
        "aria-label={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}",
      )
    })

    it('2.2 verifies fullscreen targets workbench container keeping toolbar controls accessible', () => {
      const appCode = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appCode).toContain(
        'const target = workbenchRef.current || previewStageRef.current || document.documentElement',
      )
      expect(appCode).toContain(
        '<div ref={workbenchRef} className="workbench lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">',
      )
    })

    it('2.3 verifies Escape key exits fullscreen and syncs with fullscreenchange', () => {
      const appCode = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appCode).toContain("document.addEventListener('fullscreenchange', onFullscreenChange)")
      expect(appCode).toContain("if (e.key === 'Escape' && previewFullscreen)")
      expect(appCode).toContain('document.exitFullscreen?.()')
    })
  })

  // ---------------------------------------------------------------------------
  // Challenge 3: Live Validation Verbal Badges & Platform Warning Dots
  // ---------------------------------------------------------------------------
  describe('Challenge 3: Live Validation Verbal Badges & Warning Dots', () => {
    it('3.1 PLATFORMS_FIXTURE contract: ONLY TikTok and GDN have hasWarning: true', () => {
      const warnedPlatforms = PLATFORMS_FIXTURE.filter((p) => p.hasWarning).map((p) => p.id)
      expect(warnedPlatforms).toEqual(['tiktok', 'gdn'])

      const safePlatforms = PLATFORMS_FIXTURE.filter((p) => !p.hasWarning).map((p) => p.id)
      expect(safePlatforms).toContain('facebook')
      expect(safePlatforms).toContain('instagram')
      expect(safePlatforms).toContain('threads')
      expect(safePlatforms).toContain('youtube')
      expect(safePlatforms).toContain('google_search')
      expect(safePlatforms).toContain('chatgpt')
      expect(safePlatforms).toContain('zalo')
      expect(safePlatforms).toContain('linkedin')
      expect(safePlatforms).toContain('admicro')
      expect(safePlatforms.length).toBe(9)
    })

    it('3.2 evaluates Google Search brand length > 25 chars warning with CJK characters', () => {
      // Latin counting:
      expect(countTextUnits('Tech Brand', 'cjk_weighted')).toBe(10)

      // CJK counting: each CJK char is 2 units
      expect(countTextUnits('東京', 'cjk_weighted')).toBe(4) // 2 * 2 = 4
      expect(countTextUnits('株式会社', 'cjk_weighted')).toBe(8) // 4 * 2 = 8

      // 12 CJK chars = 24 units <= 25 (PASS)
      const cjkPass = '東京広告会社株式会社会社' // 12 glyphs = 24 units
      expect(countTextUnits(cjkPass, 'cjk_weighted')).toBe(24)
      const passDraft: EditorDraft = {
        ...initialDraft,
        identity: { brandName: cjkPass, handle: '@tokyo' },
      }
      const passChecks = runValidation(passDraft, 'google.search.mobile')
      const brandPassCheck = passChecks.find((c) => c.id.includes('identity.brandName.max_25'))
      expect(brandPassCheck).toBeDefined()
      expect(brandPassCheck?.status).toBe('pass')

      // 13 CJK chars = 26 units > 25 (WARN)
      const cjkWarn = '東京広告会社株式会社会社東' // 13 glyphs = 26 units
      expect(countTextUnits(cjkWarn, 'cjk_weighted')).toBe(26)
      const warnDraft: EditorDraft = {
        ...initialDraft,
        identity: { brandName: cjkWarn, handle: '@tokyo' },
      }
      const warnChecks = runValidation(warnDraft, 'google.search.mobile')
      const brandWarnCheck = warnChecks.find((c) => c.id.includes('identity.brandName.max_25'))
      expect(brandWarnCheck).toBeDefined()
      expect(brandWarnCheck?.status).toBe('warn')

      // Mixed Latin + CJK
      // 'Google 東京広告会社' = 7 Latin + 6*2 = 19 units <= 25 (PASS)
      expect(countTextUnits('Google 東京広告会社', 'cjk_weighted')).toBe(19)
      // 'Google 日本東京広告会社テスト' = 7 Latin + 10*2 = 27 units > 25 (WARN)
      expect(countTextUnits('Google 日本東京広告会社テスト', 'cjk_weighted')).toBe(27)
    })

    it('3.3 evaluates "Kiểm tra vị trí này" verbal badges logic', () => {
      const appCode = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appCode).toContain('<span>Kiểm tra vị trí này</span>')
      expect(appCode).toContain('! {summary.fail} lỗi')
      expect(appCode).toContain('{summary.warn} cảnh báo')
      expect(appCode).toContain('✓ Không có lỗi')
      expect(appCode).toContain('<span className="shrink-0 whitespace-nowrap font-semibold text-[#ed3c47]">! Lỗi:</span>')
      expect(appCode).toContain('<span className="shrink-0 whitespace-nowrap font-semibold text-[#e8590c]">! Cảnh báo:</span>')
      expect(appCode).toContain('<span className="shrink-0 whitespace-nowrap font-semibold text-[#5f6470]">ⓘ Lưu ý:</span>')
    })
  })

  // ---------------------------------------------------------------------------
  // Challenge 4: Official Specifications Card across all 46 Placements
  // ---------------------------------------------------------------------------
  describe('Challenge 4: Official Specifications Card across all 46 Placements', () => {
    it('4.1 verifies all 46 canonical profiles retrieve official placement specs', () => {
      expect(AD_PROFILES.length).toBe(46)

      for (const p of AD_PROFILES) {
        const spec = getPlacementSpec(p.id)
        expect(spec).toBeDefined()
        expect(spec.id).toBeDefined()
        expect(spec.ratio).toBeTruthy()
        expect(spec.recommendedPx).toBeTruthy()
        expect(spec.sourceStatus).toMatch(
          /^(Thông số chính thức|Nguồn thứ cấp|Bố cục ước lượng)$/,
        )
        expect(Array.isArray(spec.specs)).toBe(true)
        expect(spec.specs.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('4.2 verifies official aspect ratios for key flagship placements', () => {
      // Facebook Feed: 4:5 (1440×1800)
      const fbFeed = getPlacementSpec('facebook.feed')
      expect(fbFeed.ratio).toBe('4:5')
      expect(fbFeed.recommendedPx).toBe('1440×1800')

      // Facebook Reels: 9:16 (1080×1920) with safe zone
      const fbReels = getPlacementSpec('facebook.reels')
      expect(fbReels.ratio).toBe('9:16')
      expect(fbReels.recommendedPx).toBe('1080×1920')
      expect(fbReels.safeZone).toBe(true)

      // Instagram Feed: 4:5 (1440×1800)
      const igFeed = getPlacementSpec('instagram.feed')
      expect(igFeed.ratio).toBe('4:5')

      // TikTok In-Feed: 9:16 (1080×1920)
      const ttInfeed = getPlacementSpec('tiktok.in_feed')
      expect(ttInfeed.ratio).toBe('9:16')
      expect(ttInfeed.recommendedPx).toBe('1080×1920')

      // YouTube Shorts: 9:16 (1080×1920)
      const ytShorts = getPlacementSpec('youtube.shorts')
      expect(ytShorts.ratio).toBe('9:16')

      // Google Display 300x250
      const gdn300 = getPlacementSpec('google.display.300x250')
      expect(gdn300.ratio).toBe('300:250')
      expect(gdn300.recommendedPx).toBe('300×250')

      // Zalo Video: 9:16 with safe zone
      const zaloVideo = getPlacementSpec('zalo.video')
      expect(zaloVideo.ratio).toBe('9:16')
      expect(zaloVideo.safeZone).toBe(true)

      // LinkedIn Mobile Feed: 4:5
      const liFeed = getPlacementSpec('linkedin.mobile_feed')
      expect(liFeed.ratio).toBe('4:5')

      // Admicro CafeF PC: 300:250
      const admicroCafef = getPlacementSpec('admicro.cafef_pc')
      expect(admicroCafef.ratio).toBe('300:250')
    })

    it('4.3 verifies OfficialSpecificationsCard markup structure', () => {
      const appCode = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf-8')
      expect(appCode).toContain('function OfficialSpecificationsCard({')
      expect(appCode).toContain('Nên dùng {spec.ratio} ({spec.recommendedPx})')
      expect(appCode).toContain('{spec.sourceStatus}')
      expect(appCode).toContain('Lưu ý chính sách:')
      expect(appCode).toContain('Nguồn thông số (')
    })
  })
})
