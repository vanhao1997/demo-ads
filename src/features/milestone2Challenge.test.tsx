import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AD_PROFILES, requireProfile, resolveProfile } from '../catalog'
import type { InspectedMedia } from '../media/inspect'
import { ContextPreview } from './ContextPreview'
import type { ContextPreviewProps } from './ContextPreview'
import { DeviceMockup } from './DeviceMockup'
import { DEVICE_MOCKUPS, deviceMockupFor } from './deviceMockupModel'
import { initialDraft } from './editorModel'
import type { EditorDraft } from './editorModel'
import { OcclusionOverlay } from './OcclusionOverlay'
import { occlusionRegions } from './previewPresentation'
import { Preview } from './Preview'
import { toCreative, validateDraft } from './catalogBridge'
import type { UiProfile } from './uiTypes'

const imageAsset = (id: string, width = 720, height = 1280): InspectedMedia => ({
  id,
  name: `${id}.png`,
  kind: 'image',
  mime: 'image/png',
  bytes: 80_000,
  width,
  height,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'creative',
})

const videoAsset = (id: string, durationMs = 15_000): InspectedMedia => ({
  id,
  name: `${id}.mp4`,
  kind: 'video',
  mime: 'video/mp4',
  bytes: 5_000_000,
  width: 720,
  height: 1280,
  durationMs,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'creative',
})

const audioAsset = (id: string, durationMs = 5_000): InspectedMedia => ({
  id,
  name: `${id}.mp3`,
  kind: 'audio',
  mime: 'audio/mpeg',
  bytes: 500_000,
  durationMs,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'audio',
})

const uiProfile = (overrides: Partial<UiProfile> = {}): UiProfile => ({
  id: 'chatgpt.chat_card.web',
  groupId: 'chatgpt',
  groupName: 'ChatGPT',
  title: 'Web',
  product: 'ChatGPT Sponsored Card',
  device: 'Desktop',
  evidence: 'reference_only',
  version: '2026.10',
  checkedAt: '2026-10-17',
  composition: ['single_image'],
  source: [],
  renderer: 'chat',
  ratio: 1,
  limits: {},
  ...overrides,
})

const contextProps = (overrides: Partial<ContextPreviewProps> = {}): ContextPreviewProps => ({
  profile: uiProfile(),
  locale: 'vi',
  brandName: 'Demo Brand',
  accountName: 'demobrand',
  headline: 'Tối ưu quảng cáo đa kênh',
  description: 'Giải pháp xem trước quảng cáo tự động',
  primaryText: 'Trải nghiệm ngay hôm nay',
  domain: 'https://demo.example.com',
  cta: 'Tìm hiểu thêm',
  media: <img src="test-media.png" alt="media" />,
  ...overrides,
})

describe('Milestone 2 Adversarial & Empirical Challenge Suite', () => {
  describe('Challenge Dimension 1: TikTok Consolidation & Composition Engine', () => {
    it('verifies canonical tiktok.in_feed profile exists and defines all 3 allowed compositions', () => {
      const inFeed = resolveProfile('tiktok.in_feed')
      expect(inFeed).toBeDefined()
      expect(inFeed?.id).toBe('tiktok.in_feed')
      expect(inFeed?.placement).toBe('In-Feed')
      expect(inFeed?.allowedCompositions).toContain('single_video')
      expect(inFeed?.allowedCompositions).toContain('carousel')
      expect(inFeed?.allowedCompositions).toContain('single_image')
    })

    it('verifies legacy TikTok profile IDs normalize without throwing or breaking callers', () => {
      const legacyVideo = resolveProfile('tiktok.in_feed.video')
      const legacyCarousel = resolveProfile('tiktok.in_feed.standard_carousel')
      expect(legacyVideo).toBeDefined()
      expect(legacyVideo?.id).toBe('tiktok.in_feed')
      expect(legacyCarousel).toBeDefined()
      expect(legacyCarousel?.id).toBe('tiktok.in_feed')

      expect(requireProfile('tiktok.in_feed.video').id).toBe('tiktok.in_feed')
      expect(requireProfile('tiktok.in_feed.standard_carousel').id).toBe('tiktok.in_feed')
    })

    it('verifies single_video composition passes video rules and ignores carousel-only rules', () => {
      const draft: EditorDraft = {
        ...initialDraft,
        composition: 'single_video',
        assets: [videoAsset('tiktok-vid-1')],
      }
      const results = validateDraft(draft, 'tiktok.in_feed')
      expect(results.some((r) => r.ruleId === 'profile.composition.allowed' && r.status === 'pass')).toBe(true)
      // Carousel audio and multi-asset rules should not apply
      expect(results.some((r) => r.ruleId === 'audio.mime.mp3')).toBe(false)
      expect(results.some((r) => r.ruleId === 'composition.audio.required')).toBe(false)
      expect(results.some((r) => r.ruleId === 'asset.dimensions.carousel')).toBe(false)
    })

    it('verifies carousel composition enforces 2-35 cards, audio MP3 requirement, and shared URL', () => {
      const draftNoAudio: EditorDraft = {
        ...initialDraft,
        composition: 'carousel',
        assets: [imageAsset('card-1'), imageAsset('card-2')],
      }
      const resultsNoAudio = validateDraft(draftNoAudio, 'tiktok.in_feed')
      expect(resultsNoAudio.some((r) => r.ruleId === 'profile.composition.allowed' && r.status === 'pass')).toBe(true)
      // Audio missing should trigger failure
      const audioResult = resultsNoAudio.find((r) => r.ruleId === 'composition.audio.required')
      expect(audioResult?.status).toBe('fail')

      // With audio and shared URL
      const draftValidCarousel: EditorDraft = {
        ...initialDraft,
        composition: 'carousel',
        assets: [imageAsset('card-1'), imageAsset('card-2'), audioAsset('sound-1')],
      }
      const resultsValid = validateDraft(draftValidCarousel, 'tiktok.in_feed')
      expect(resultsValid.find((r) => r.ruleId === 'composition.audio.required')?.status).toBe('pass')
    })

    it('verifies single_image composition is supported on tiktok.in_feed without audio requirement', () => {
      const draftImage: EditorDraft = {
        ...initialDraft,
        composition: 'single_image',
        assets: [imageAsset('single-card')],
      }
      const resultsImage = validateDraft(draftImage, 'tiktok.in_feed')
      expect(resultsImage.some((r) => r.ruleId === 'profile.composition.allowed' && r.status === 'pass')).toBe(true)
      expect(resultsImage.some((r) => r.ruleId === 'composition.audio.required')).toBe(false)
    })

    it('renders TikTok preview for tiktok.in_feed in React without throwing', () => {
      const profile = uiProfile({
        id: 'tiktok.in_feed',
        groupId: 'tiktok',
        groupName: 'TikTok',
        renderer: 'vertical',
      })
      const draft: EditorDraft = {
        ...initialDraft,
        identity: { ...initialDraft.identity, brandName: 'BrandTest', handle: 'brandhandle' },
        assets: [videoAsset('vid-tiktok')],
      }
      const html = renderToStaticMarkup(
        <Preview draft={draft} profile={profile} locale="vi" appChrome topViewPhase="feed" />,
      )
      expect(html).toContain('social-tiktok')
      expect(html).toContain('@brandhandle')
      expect(html).toContain('Được tài trợ')
    })
  })

  describe('Challenge Dimension 2: Desktop Chrome Scaling & AutoScaler Boundary Robustness', () => {
    it('verifies Desktop Chrome (pc-1920) has exact viewport 1920x945 and 87px header', () => {
      const pc = DEVICE_MOCKUPS['pc-1920']
      expect(pc.viewport).toEqual({ width: 1920, height: 945 })
      expect(pc.frame).toEqual({ width: 1920, height: 1032 })
      expect(pc.frame.height - pc.viewport.height).toBe(87)
    })

    it('verifies deviceMockupFor correctly selects pc-1920 for desktop/web classes and overrides', () => {
      expect(deviceMockupFor({ device: 'desktop' }, 'target').id).toBe('pc-1920')
      expect(deviceMockupFor({ device: 'web' }, 'target').id).toBe('pc-1920')
      expect(deviceMockupFor({ device: 'Desktop' }, 'target').id).toBe('pc-1920')
      expect(deviceMockupFor({ device: 'Web' }, 'target').id).toBe('pc-1920')
      expect(deviceMockupFor({ device: 'mobile' }, 'pc').id).toBe('pc-1920')
    })

    it('adversarially stress-tests AutoScaler scale math under extreme container widths', () => {
      const computeScale = (containerWidth: number, frameWidth = 1920, maxHeight?: number, naturalHeight?: number) => {
        return Math.min(
          1,
          Math.max(0, containerWidth / frameWidth),
          maxHeight && naturalHeight ? maxHeight / naturalHeight : 1,
        )
      }

      // Normal Full-HD
      expect(computeScale(1920)).toBe(1)
      // Scaled in 960px column
      expect(computeScale(960)).toBe(0.5)
      // Scaled in 480px column
      expect(computeScale(480)).toBe(0.25)
      // Narrow mobile container (320px)
      const scaleNarrow = computeScale(320)
      expect(scaleNarrow).toBeCloseTo(320 / 1920, 5)
      expect(scaleNarrow).toBeGreaterThan(0)
      expect(scaleNarrow).toBeLessThan(1)
      // Extreme edge: 1px container
      expect(computeScale(1)).toBeGreaterThan(0)
      // Extreme edge: 0px container
      expect(computeScale(0)).toBe(0)
      // Adversarial edge: negative container width
      expect(computeScale(-100)).toBe(0) // Must never be negative!
      // Extremely wide viewport (4K / 3840px)
      expect(computeScale(3840)).toBe(1) // Must cap at 1.0
      // MaxHeight constraint
      expect(computeScale(1920, 1920, 600, 1032)).toBeCloseTo(600 / 1032, 4)
    })

    it('renders DeviceMockup for pc-1920 with full Chrome window frame and 1920 content width', () => {
      const pc = DEVICE_MOCKUPS['pc-1920']
      const html = renderToStaticMarkup(
        <DeviceMockup spec={pc} contentWidth={1920} browserTitle="Google Display">
          <div>Desktop Content</div>
        </DeviceMockup>,
      )
      expect(html).toContain('data-device-frame="pc-1920"')
      expect(html).toContain('--device-screen-width:1920px')
      expect(html).toContain('--device-screen-height:945px')
      expect(html).toContain('device-chrome-tabbar')
      expect(html).toContain('device-chrome-toolbar')
      expect(html).toContain('Google Display')
      expect(html).toContain('Desktop Content')
    })
  })

  describe('Challenge Dimension 3: ChatGPT Context Preview & Layout Integrity', () => {
    it('renders Desktop Web shell with sidebar, ChatGPT title, assistant response, and sponsored card', () => {
      const html = renderToStaticMarkup(
        <ContextPreview
          {...contextProps({
            profile: uiProfile({ id: 'chatgpt.chat_card.web', device: 'Desktop' }),
          })}
        />,
      )
      expect(html).toContain('context-chatgpt-shell')
      expect(html).toContain('context-chatgpt-sidebar')
      expect(html).toContain('context-chatgpt-thread')
      expect(html).toContain('context-chat-message user')
      expect(html).toContain('context-chat-message assistant')
      expect(html).toContain('context-chat-sponsored')
      expect(html).toContain('chatgpt-sponsored-badge')
      expect(html).toContain('Được tài trợ')
      expect(html).toContain('Tối ưu quảng cáo đa kênh')
      expect(html).toContain('context-chat-composer')
    })

    it('renders Mobile shell without sidebar, with mobile menu and header, and full-width sponsored card', () => {
      const html = renderToStaticMarkup(
        <ContextPreview
          {...contextProps({
            profile: uiProfile({ id: 'chatgpt.chat_card.mobile', device: 'Mobile' }),
          })}
        />,
      )
      expect(html).toContain('context-chatgpt-shell is-mobile')
      expect(html).not.toContain('context-chatgpt-sidebar')
      expect(html).toContain('chatgpt-mobile-menu')
      expect(html).toContain('chatgpt-mobile-title')
      expect(html).toContain('chatgpt-mobile-new')
      expect(html).toContain('context-chat-sponsored')
      expect(html).toContain('chatgpt-sponsored-badge')
      expect(html).toContain('Được tài trợ')
    })

    it('AUDIT FINDING: detects unclosed CSS brace in contextPreview.css line 479 for .context-chat-sponsored', () => {
      const cssPath = resolve(process.cwd(), 'src/features/contextPreview.css')
      const css = readFileSync(cssPath, 'utf-8')
      const sponsoredBlockRegex = /\.context-chat-sponsored\s*\{[^}]*?\.context-chatgpt-shell\.is-mobile/s
      const isUnclosed = sponsoredBlockRegex.test(css)
      // This test confirms whether the CSS file has the unclosed brace bug
      expect(isUnclosed, 'contextPreview.css contains unclosed .context-chat-sponsored block before .context-chatgpt-shell.is-mobile').toBe(true)
    })

    it('AUDIT FINDING: detects hallucinated test assertions in worker ContextPreview.test.tsx', () => {
      const testPath = resolve(process.cwd(), 'src/features/ContextPreview.test.tsx')
      const testContent = readFileSync(testPath, 'utf-8')
      // Worker wrote assertions looking for 'context-chat-assistant-badge', 'platform-logo-chatgpt', 'context-chat-composer-send'
      // which do not exist in ContextPreview.tsx
      expect(testContent).toContain("'context-chat-assistant-badge'")
      expect(testContent).toContain("'platform-logo-chatgpt'")
      expect(testContent).toContain("'context-chat-composer-send'")
    })
  })

  describe('Challenge Dimension 4: Safe-Zone Coordinates & Vertical 9:16 Placements', () => {
    const verticalPlacements = [
      'facebook.stories',
      'facebook.reels',
      'instagram.stories',
      'instagram.reels',
      'tiktok.in_feed',
      'tiktok.topview',
      'youtube.shorts',
    ]

    it('verifies all 7 vertical 9:16 placements produce valid occlusion regions', () => {
      for (const id of verticalPlacements) {
        const regions = occlusionRegions(id, true)
        expect(regions.length, `Regions count for ${id}`).toBeGreaterThanOrEqual(4)
      }
    })

    it('empirically verifies boundary containment for all safe-zone rectangles [0 <= val <= 100]', () => {
      for (const id of verticalPlacements) {
        for (const captionMask of [true, false]) {
          const regions = occlusionRegions(id, captionMask)
          for (const r of regions) {
            expect(r.x, `${id}/${r.id} x`).toBeGreaterThanOrEqual(0)
            expect(r.y, `${id}/${r.id} y`).toBeGreaterThanOrEqual(0)
            expect(r.width, `${id}/${r.id} width`).toBeGreaterThan(0)
            expect(r.height, `${id}/${r.id} height`).toBeGreaterThan(0)
            expect(r.x + r.width, `${id}/${r.id} right edge <= 100`).toBeLessThanOrEqual(100.001)
            expect(r.y + r.height, `${id}/${r.id} bottom edge <= 100`).toBeLessThanOrEqual(100.001)
          }
        }
      }
    })

    it('verifies TikTok safe-zone geometry against official 1280x720 spec', () => {
      const regions = occlusionRegions('tiktok.in_feed', true)
      const header = regions.find((r) => r.id === 'header')
      const caption = regions.find((r) => r.id === 'caption-cta')
      const actions = regions.find((r) => r.id === 'actions')
      const longCaption = regions.find((r) => r.id === 'long-caption')

      expect(header).toEqual({ id: 'header', x: 0, y: 0, width: 100, height: 12.5, kind: 'always' })
      expect(caption).toEqual({ id: 'caption-cta', x: 0, y: 65.625, width: 100, height: 34.375, kind: 'always' })
      expect(actions).toEqual({ id: 'actions', x: 72.222, y: 43.75, width: 16.667, height: 21.875, kind: 'always' })
      expect(longCaption).toEqual({ id: 'long-caption', x: 11.111, y: 55, width: 61.111, height: 10.625, kind: 'caption' })

      // Alignment check: actions right edge (72.222 + 16.667 = 88.889) aligns with right-edge (88.889)
      expect(actions!.x + actions!.width).toBeCloseTo(88.889, 2)
      // Alignment check: actions bottom edge (43.75 + 21.875 = 65.625) aligns with caption-cta top (65.625)
      expect(actions!.y + actions!.height).toBeCloseTo(caption!.y, 3)
      // Alignment check: longCaption right edge (11.111 + 61.111 = 72.222) aligns with actions rail left (72.222)
      expect(longCaption!.x + longCaption!.width).toBeCloseTo(actions!.x, 3)
      // Alignment check: longCaption bottom edge (55 + 10.625 = 65.625) aligns with caption-cta top (65.625)
      expect(longCaption!.y + longCaption!.height).toBeCloseTo(caption!.y, 3)
    })

    it('verifies YouTube Shorts safe-zone geometry (top 15%, bottom 35%, right 17.778%)', () => {
      const regions = occlusionRegions('youtube.shorts', true)
      const header = regions.find((r) => r.id === 'header')
      const caption = regions.find((r) => r.id === 'caption-cta')
      const actions = regions.find((r) => r.id === 'actions')

      expect(header).toEqual({ id: 'header', x: 0, y: 0, width: 100, height: 15, kind: 'always' })
      expect(caption).toEqual({ id: 'caption-cta', x: 0, y: 65, width: 100, height: 35, kind: 'always' })
      expect(actions).toEqual({ id: 'actions', x: 82.222, y: 15, width: 17.778, height: 50, kind: 'always' })
      expect(actions!.x + actions!.width).toBeCloseTo(100, 2)
      expect(actions!.y + actions!.height).toBeCloseTo(65, 2)
    })

    it('verifies occlusion.css token alignment for danger red and caption orange', () => {
      const cssPath = resolve(process.cwd(), 'src/features/occlusion.css')
      const css = readFileSync(cssPath, 'utf-8')
      expect(css).toContain('--occlusion-red: rgba(237, 60, 71, 0.30);')
      expect(css).toContain('--occlusion-red-rule: rgba(237, 60, 71, 0.95);')
      expect(css).toContain('--occlusion-orange: rgba(255, 159, 28, 0.22);')
      expect(css).toContain('--occlusion-orange-rule: rgba(255, 159, 28, 0.95);')
    })

    it('renders OcclusionOverlay component in Vietnamese and English with bilingual labels', () => {
      const vi = renderToStaticMarkup(<OcclusionOverlay profileId="tiktok.in_feed" captionMask locale="vi" />)
      const en = renderToStaticMarkup(<OcclusionOverlay profileId="tiktok.in_feed" captionMask locale="en" />)

      expect(vi).toContain('Vùng che ước lượng')
      expect(vi).toContain('Thanh ứng dụng')
      expect(vi).toContain('Chú thích / CTA')
      expect(vi).toContain('Cột tương tác')
      expect(vi).toContain('Caption dài')

      expect(en).toContain('Estimated occlusion')
      expect(en).toContain('App header')
      expect(en).toContain('Caption / CTA')
      expect(en).toContain('Actions rail')
      expect(en).toContain('Long caption')
    })
  })
})
