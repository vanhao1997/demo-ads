import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { InspectedMedia } from '../media/inspect'
import { profiles } from './catalogBridge'
import { initialDraft } from './editorModel'
import { normalizeFormQuestions, type EditorFormQuestion } from './FormQuestions'
import { buildSearchSamples, Preview } from './Preview'
import { DEFAULT_PRESENTATION } from './previewPresentation'
import type { UiProfile } from './uiTypes'

const imageAsset = (id: string): InspectedMedia => ({
  id,
  name: `${id}.png`,
  kind: 'image',
  mime: 'image/png',
  bytes: 1000,
  width: 1080,
  height: 1080,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'creative',
})

const videoAsset = (id: string): InspectedMedia => ({
  id,
  name: `${id}.mp4`,
  kind: 'video',
  mime: 'video/mp4',
  bytes: 2000,
  width: 1080,
  height: 1920,
  durationMs: 90500,
  sha256: id.padEnd(64, '1'),
  url: `blob:${id}`,
  metadataStatus: 'partial',
  role: 'creative',
})

const profile = (overrides: Partial<UiProfile> = {}): UiProfile => ({
  id: 'instagram.feed',
  groupId: 'instagram',
  groupName: 'Instagram',
  title: 'Feed',
  product: 'Meta Ads',
  device: 'Mobile',
  evidence: 'reference_only',
  version: 'test',
  checkedAt: '2026-10-12',
  composition: ['single_image', 'carousel'],
  source: [],
  renderer: 'feed',
  ratio: 1,
  limits: {},
  ...overrides,
})

describe('Preview renderer', () => {
  it('applies intro chrome only to TopView and keeps regular TikTok feed visible', () => {
    const presentation = { ...DEFAULT_PRESENTATION, topViewPhase: 'intro' as const }
    const draft = { ...initialDraft, assets: [imageAsset('topview-creative')] }
    const render = (id: string) =>
      renderToStaticMarkup(
        <Preview
          draft={draft}
          profile={profile({ id, groupId: 'tiktok', renderer: 'vertical' })}
          presentation={presentation}
        />,
      )
    const intro = render('tiktok.topview')
    const feed = render('tiktok.in_feed.video')
    expect(intro).toMatch(/class="[^"]*social-tiktok[^"]*"[^>]*data-topview-phase="intro"/)
    expect(feed).toMatch(/class="[^"]*social-tiktok[^"]*"[^>]*data-topview-phase="feed"/)
    expect(feed).toContain('12.3K')
    expect(feed).toContain('1,024')
  })

  it('builds rotating RSA samples that preserve every headline and description variant', () => {
    const samples = buildSearchSamples(
      ['特別見出し', 'Headline 2', 'Headline 3', 'Headline 4'],
      ['Description 1', 'Description 2', '説明 3'],
    )

    expect(samples).toHaveLength(4)
    expect(samples[0].headlines).toEqual(['特別見出し', 'Headline 2', 'Headline 3'])
    expect(samples[3].headlines).toEqual(['Headline 4', '特別見出し', 'Headline 2'])
    expect(new Set(samples.flatMap((sample) => sample.headlines))).toEqual(
      new Set(['特別見出し', 'Headline 2', 'Headline 3', 'Headline 4']),
    )
    expect(new Set(samples.flatMap((sample) => sample.descriptions))).toEqual(
      new Set(['Description 1', 'Description 2', '説明 3']),
    )
  })

  it('applies focal point, fit, renderer data, and platform group class', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{ ...initialDraft, assets: [imageAsset('hero')] }}
        profile={profile()}
        fit="contain"
        safeZone={false}
        focalX={25}
        focalY={75}
      />,
    )

    expect(html).toMatch(/class="[^"]*\bsocial-ad\b[^"]*\bgroup-instagram\b[^"]*"/)
    expect(html).toContain('data-renderer="feed"')
    expect(html).toContain('object-fit:contain')
    expect(html).toContain('object-position:25% 75%')
  })

  it('marks active carousel card for review export readers', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          composition: 'carousel',
          assets: [imageAsset('first'), imageAsset('second')],
        }}
        profile={profile()}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('data-preview-card="1"')
    expect(html).toContain('1 / 2')
  })

  it('renders Zalo form pre-click creative with copy identity instead of OA form identity', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          identity: { ...initialDraft.identity, brandName: 'Brand copy' },
          form: { ...initialDraft.form, oaName: 'Zalo OA' },
          assets: [imageAsset('form-creative')],
        }}
        profile={profile({
          id: 'zalo.form',
          groupId: 'zalo',
          groupName: 'Zalo Ads',
          renderer: 'form',
        })}
        formStage="creative"
        fit="cover"
        safeZone
      />,
    )

    expect(html).toMatch(/class="[^"]*\bsocial-ad\b[^"]*\bgroup-zalo\b[^"]*"/)
    expect(html).toContain('Brand copy')
    expect(html).not.toContain('class="form-inner"')
    expect(html).not.toContain('Zalo OA')
  })

  it('renders Google RSA sample controls with resolved overrides and display paths', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          copy: {
            ...initialDraft.copy,
            headlines: ['Base headline', 'Headline 2', 'Headline 3', 'Headline 4'],
            descriptions: ['Base description', 'Description 2', 'Description 3'],
            destinationUrl: 'https://search.example/landing',
            paths: ['sale', 'vn'],
          },
          overrides: {
            'google.search.mobile': {
              headline: { mode: 'replace', value: '特別見出し' },
              description: { mode: 'replace', value: 'Override description' },
            },
          },
        }}
        profile={profile({
          id: 'google.search.mobile',
          groupId: 'google-search',
          groupName: 'Google Search',
          renderer: 'search',
          composition: ['text_only'],
        })}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('data-preview-combination="1"')
    expect(html).toContain('Mẫu 1 / 4')
    expect(html).toContain('特別見出し | Headline 2 | Headline 3')
    expect(html).toContain('Override description Description 2')
    expect(html).toContain('search.example / sale / vn')
    expect(html).toContain('aria-label="Tổ hợp RSA trước"')
    expect(html).toContain('aria-label="Chọn tổ hợp RSA mô phỏng"')
    expect(html).toContain('Không phải danh sách đầy đủ hay trạng thái approved')
    expect(html).not.toContain('Base headline')
    expect(html).not.toContain('Base description')
  })

  it('renders fixed Zalo lead fields plus custom questions in form preview', () => {
    const questions: EditorFormQuestion[] = [
      {
        key: 'email',
        label: 'Email nhận tư vấn',
        required: true,
      },
      {
        key: 'budget',
        label: 'Ngân sách dự kiến',
        required: false,
      },
    ]
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          form: { ...initialDraft.form, questions },
        }}
        profile={profile({
          id: 'zalo.form',
          groupId: 'zalo',
          groupName: 'Zalo Ads',
          renderer: 'form',
        })}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('Họ và tên')
    expect(html).toContain('Số điện thoại')
    expect(html).toContain('Email nhận tư vấn')
    expect(html).toContain('Ngân sách dự kiến')
    expect(html).toContain('type="text"')
    expect(html).toContain('Câu trả lời')
    expect(html).toContain('Form mô phỏng. Không thu thập thông tin.')
    expect(html).toContain('Gửi thông tin')
  })

  it('caps custom form questions and normalizes duplicate keys', () => {
    const normalized = normalizeFormQuestions(
      Array.from({ length: 12 }, (_, index) => ({
        key: 'contact',
        label: `Câu hỏi ${index + 1}`,
        required: index === 0,
      })),
    )

    expect(normalized).toHaveLength(10)
    expect(new Set(normalized.map((question) => question.key)).size).toBe(10)
    expect(normalized[0].required).toBe(true)
    expect(normalized[1].required).toBe(false)
  })

  it('renders video timestamp controls and review export time metadata', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          composition: 'single_video',
          assets: [videoAsset('clip')],
        }}
        profile={profile({ composition: ['single_video'] })}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('data-video-time-ms="0"')
    expect(html).toContain('Thời điểm preview video')
    expect(html).toContain('aria-label="Tua thời điểm preview video"')
    expect(html).toContain('max="90.5"')
    expect(html).toContain('0:00 / 1:30')
  })

  it('uses per-card title, description, and URL for supported carousel profiles', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          composition: 'carousel',
          assets: [imageAsset('card-one'), imageAsset('card-two')],
          cardDetails: {
            'card-one': {
              title: 'Card one title',
              description: 'Card one description',
              url: 'https://card-one.example/path',
            },
          },
        }}
        profile={profile()}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('Card one title')
    expect(html).toContain('Card one description')
    expect(html).toContain('card-one.example')
  })

  it('keeps shared copy and URL for TikTok Standard Carousel card URL constraints', () => {
    const html = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          composition: 'carousel',
          copy: {
            ...initialDraft.copy,
            headlines: ['Shared headline'],
            descriptions: ['Shared description'],
            destinationUrl: 'https://shared.example',
          },
          assets: [imageAsset('tiktok-card'), imageAsset('tiktok-card-two')],
          cardDetails: {
            'tiktok-card': {
              title: 'Per-card title ignored',
              description: 'Per-card description ignored',
              url: 'https://card-url.example',
            },
          },
        }}
        profile={profile({
          id: 'tiktok.in_feed.standard_carousel',
          groupId: 'tiktok',
          groupName: 'TikTok',
          product: 'TikTok Standard Carousel',
          renderer: 'vertical',
        })}
        fit="cover"
        safeZone
      />,
    )

    expect(html).toContain('Shared headline')
    expect(html).toContain('Shared description')
    expect(html).toContain('shared.example')
    expect(html).toContain('URL từng card không hỗ trợ')
    expect(html).not.toContain('Per-card title ignored')
    expect(html).not.toContain('card-url.example')
  })

  it('changes app labels without translating advertiser copy or changing carousel crop', () => {
    const draft = {
      ...initialDraft,
      composition: 'carousel',
      identity: { ...initialDraft.identity, brandName: 'Thương hiệu Việt' },
      copy: {
        ...initialDraft.copy,
        primaryText: 'Nội dung khách hàng giữ nguyên',
        cta: 'Tìm hiểu thêm',
      },
      assets: [imageAsset('card-one'), imageAsset('card-two')],
      cardDetails: {
        'card-one': {
          title: 'Tiêu đề riêng của card',
          description: 'Mô tả riêng giữ nguyên',
          url: 'https://card.example/landing',
        },
      },
    }
    const render = (locale: 'vi' | 'en') =>
      renderToStaticMarkup(
        <Preview
          draft={draft}
          profile={profile({ id: 'facebook.feed', groupId: 'facebook', groupName: 'Facebook' })}
          fit="contain"
          focalX={23}
          focalY={71}
          safeZone={false}
          presentation={{ ...DEFAULT_PRESENTATION, locale }}
        />,
      )
    const vi = render('vi')
    const en = render('en')

    expect(vi).toContain('Được tài trợ')
    expect(en).toContain('Sponsored')
    expect(vi).toContain('Tìm hiểu thêm')
    expect(en).toContain('Learn more')
    for (const html of [vi, en]) {
      for (const original of [
        'Thương hiệu Việt',
        'Nội dung khách hàng giữ nguyên',
        'Tiêu đề riêng của card',
        'Mô tả riêng giữ nguyên',
        'card.example',
      ]) {
        expect(html).toContain(original)
      }
      expect(html).toContain('data-preview-card="1"')
      expect(html).toContain('1 / 2')
      expect(html).toContain('object-fit:contain')
      expect(html).toContain('object-position:23% 71%')
    }
    expect(draft.copy.cta).toBe('Tìm hiểu thêm')
  })

  it('keeps RSA combinations, display paths and video controls with app chrome disabled', () => {
    const presentation = { ...DEFAULT_PRESENTATION, locale: 'en' as const, appChrome: false }
    const search = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          copy: {
            ...initialDraft.copy,
            headlines: ['Tiêu đề gốc', 'Headline two', 'Headline three', 'Headline four'],
            descriptions: ['Mô tả gốc', 'Description two'],
            destinationUrl: 'https://brand.example/landing',
            paths: ['sale', 'vn'],
          },
        }}
        profile={profile({
          id: 'google.search.mobile',
          groupId: 'google-search',
          renderer: 'search',
        })}
        presentation={presentation}
      />,
    )
    const video = renderToStaticMarkup(
      <Preview
        draft={{
          ...initialDraft,
          composition: 'single_video',
          assets: [videoAsset('youtube-clip')],
        }}
        profile={profile({
          id: 'youtube.skippable_in_stream',
          groupId: 'youtube',
          composition: ['single_video'],
        })}
        presentation={presentation}
      />,
    )

    expect(search).toContain('data-app-chrome="false"')
    expect(search).toContain('data-preview-locale="en"')
    expect(search).toContain('Tiêu đề gốc | Headline two | Headline three')
    expect(search).toContain('brand.example / sale / vn')
    expect(search).toContain('aria-label="Chọn tổ hợp RSA mô phỏng"')
    expect(search).toContain('context-search-tabs')
    expect(search).toContain('context-sponsored-results')
    expect(video).toContain('data-video-time-ms="0"')
    expect(video).toContain('max="90.5"')
    expect(video).toContain('aria-label="Tua thời điểm preview video"')
    expect(video).toContain('context-youtube-player')
    expect(video).toContain('context-youtube-ad-copy')
  })

  it('renders every non-publisher catalog placement in both app languages', () => {
    const targets = profiles.filter((target) => target.groupId !== 'admicro')
    expect(targets.length).toBeGreaterThanOrEqual(34)
    for (const target of targets) {
      for (const locale of ['vi', 'en'] as const) {
        const html = renderToStaticMarkup(
          <Preview
            draft={{ ...initialDraft, assets: [imageAsset('catalog-creative')] }}
            profile={target}
            safeZone
            presentation={{ ...DEFAULT_PRESENTATION, locale }}
          />,
        )
        expect(html, `${target.id} / ${locale}`).toContain(`data-preview-locale="${locale}"`)
        expect(html, `${target.id} / ${locale}`).toContain(`data-renderer="${target.renderer}"`)
        expect(html, `${target.id} / ${locale}`).not.toContain('NaN')
        if (target.id === 'facebook.right_column') {
          expect(html).toContain('right-column-shell')
          expect(html).toContain('right-column-ad')
        }
      }
    }
  })
})
