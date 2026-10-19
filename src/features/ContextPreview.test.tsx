import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ContextPreview } from './ContextPreview'
import type { ContextPreviewProps } from './ContextPreview'
import type { UiProfile } from './uiTypes'

const profile = (overrides: Partial<UiProfile> = {}): UiProfile => ({
  id: 'facebook.feed',
  groupId: 'facebook',
  groupName: 'Facebook',
  title: 'Feed',
  product: 'Meta Ads',
  device: 'Mobile',
  evidence: 'reference_only',
  version: 'test',
  checkedAt: '2026-10-13',
  composition: ['single_image'],
  source: [],
  renderer: 'feed',
  ratio: 1,
  limits: {},
  ...overrides,
})

const baseProps = (overrides: Partial<ContextPreviewProps> = {}): ContextPreviewProps => ({
  profile: profile(),
  locale: 'vi',
  brandName: 'Demo Brand',
  accountName: 'Demo Account',
  headline: 'Launch headline',
  description: 'Description copy',
  primaryText: 'Primary text copy',
  domain: 'https://brand.example/path',
  cta: 'Learn more',
  media: <img src="creative.png" alt="creative" />,
  ...overrides,
})

describe('ContextPreview', () => {
  it('wraps Google Search ad children with native search context and organic demo results', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'google.search.desktop',
            groupId: 'google-search',
            groupName: 'Google Search',
            device: 'Desktop',
            renderer: 'search',
          }),
        })}
      >
        <div data-rsa-result>RSA result from root</div>
      </ContextPreview>,
    )

    expect(html).toContain('context-preview group-google-search')
    expect(html).toContain('Google')
    expect(html).toContain('RSA result from root')
    expect(html).toContain('insight.example')
    expect(html).toContain('journal.example')
  })

  it('keeps uploaded GDN banner in an exact display slot box', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'google.display.728x90',
            groupId: 'google-display',
            groupName: 'Google Display',
            title: '728x90',
            device: 'Desktop',
            renderer: 'banner',
          }),
        })}
      />,
    )

    expect(html).toContain('--context-slot-width:728px')
    expect(html).toContain('--context-slot-height:90px')
    expect(html).toContain('Daily Example')
  })

  it('renders YouTube skippable and non-skippable in-stream states from video time', () => {
    const skippable = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'youtube.skippable_in_stream',
            groupId: 'youtube',
            groupName: 'YouTube',
            renderer: 'feed',
          }),
          videoTimeSeconds: 5,
          videoDurationSeconds: 30,
        })}
      />,
    )
    const nonSkippable = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'youtube.non_skippable_in_stream',
            groupId: 'youtube',
            groupName: 'YouTube',
            renderer: 'feed',
          }),
          videoTimeSeconds: 3,
          videoDurationSeconds: 15,
        })}
      />,
    )

    expect(skippable).toContain('Bỏ qua quảng cáo')
    expect(nonSkippable).toContain('Quảng cáo kết thúc sau')
    expect(nonSkippable).toContain('12s')
  })

  it('places ChatGPT sponsored card after assistant response and before composer', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'chatgpt.chat_card.web',
            groupId: 'chatgpt',
            groupName: 'ChatGPT',
            device: 'Web',
            renderer: 'chat',
          }),
        })}
      />,
    )

    expect(html.indexOf('Dưới đây là vài hướng')).toBeLessThan(
      html.indexOf('context-chat-sponsored'),
    )
    expect(html.indexOf('context-chat-sponsored')).toBeLessThan(html.indexOf('Nhắn tiếp'))
  })

  it('keeps advertiser content in both languages while localizing the conversation context', () => {
    const render = (locale: 'vi' | 'en') =>
      renderToStaticMarkup(
        <ContextPreview
          {...baseProps({
            locale,
            profile: profile({
              id: 'chatgpt.chat_card.web',
              groupId: 'chatgpt',
              groupName: 'ChatGPT',
              device: 'Web',
              renderer: 'chat',
            }),
            headline: 'Tiêu đề quảng cáo giữ nguyên',
            description: 'Mô tả do khách hàng viết',
          })}
        />,
      )
    const vi = render('vi')
    const en = render('en')

    expect(vi).toContain('Dưới đây là vài hướng')
    expect(en).toContain('Here are a few angles')
    expect(vi).toContain('Được tài trợ')
    expect(en).toContain('Sponsored')
    for (const html of [vi, en]) {
      expect(html).toContain('Tiêu đề quảng cáo giữ nguyên')
      expect(html).toContain('Mô tả do khách hàng viết')
      expect(html).toContain('creative.png')
      expect(html.indexOf('context-chat-message assistant')).toBeLessThan(
        html.indexOf('context-chat-sponsored'),
      )
      expect(html.indexOf('context-chat-sponsored')).toBeLessThan(
        html.indexOf('context-chat-composer'),
      )
    }
  })

  it('renders authentic ChatGPT conversational UI with logo, sponsored badge, and mobile/web layouts', () => {
    const webHtml = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'chatgpt.chat_card.web',
            groupId: 'chatgpt',
            groupName: 'ChatGPT',
            device: 'Desktop',
            renderer: 'chat',
          }),
        })}
      />,
    )
    expect(webHtml).toContain('context-chatgpt-shell')
    expect(webHtml).not.toContain('is-mobile')
    expect(webHtml).toContain('chatgpt-ai-badge')
    expect(webHtml).toContain('context-chat-assistant-badge')
    expect(webHtml).toContain('platform-logo-chatgpt')
    expect(webHtml).toContain('context-chat-sponsored-tag')
    expect(webHtml).toContain('Được tài trợ')
    expect(webHtml).toContain('chatgpt-send-icon')
    expect(webHtml).toContain('context-chat-composer-send')

    const mobileHtml = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'chatgpt.chat_card.mobile',
            groupId: 'chatgpt',
            groupName: 'ChatGPT',
            device: 'Mobile',
            renderer: 'chat',
          }),
        })}
      />,
    )
    expect(mobileHtml).toContain('context-chatgpt-shell is-mobile')
    expect(mobileHtml).toContain('platform-logo-chatgpt')
    expect(mobileHtml).toContain('context-chat-sponsored-tag')
    expect(mobileHtml).toContain('Được tài trợ')
  })

  it('keeps the Search placement and RSA controls when app chrome is hidden', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'google.search.mobile',
            groupId: 'google-search',
            groupName: 'Google Search',
            renderer: 'search',
          }),
          appChrome: false,
        })}
      >
        <div data-rsa-result>RSA sample and controls from root</div>
      </ContextPreview>,
    )

    expect(html).toContain('no-app-chrome')
    expect(html).toContain('RSA sample and controls from root')
    expect(html).toContain('context-sponsored-results')
    expect(html).toContain('context-search-tabs')
  })

  it('keeps the YouTube player and video controls when app chrome is hidden', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'youtube.skippable_in_stream',
            groupId: 'youtube',
            groupName: 'YouTube',
          }),
          appChrome: false,
          videoTimeline: <input type="range" aria-label="Root video timeline" max={30} />,
        })}
      />,
    )

    expect(html).toContain('creative.png')
    expect(html).toContain('Launch headline')
    expect(html).toContain('aria-label="Root video timeline"')
    expect(html).toContain('context-youtube-player')
    expect(html).toContain('context-youtube-player-overlay')
  })

  it('keeps Shorts navigation in the immersive placement', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'youtube.shorts',
            groupId: 'youtube',
            groupName: 'YouTube',
            renderer: 'vertical',
          }),
          appChrome: false,
        })}
      />,
    )

    expect(html).toContain('context-youtube-shorts')
    expect(html).toContain('context-shorts-bottom-nav')
    expect(html).toContain('context-shorts-caption')
  })

  it('shows skip countdown before five seconds and keeps host video distinct from the advertiser', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'youtube.skippable_in_stream',
            groupId: 'youtube',
            groupName: 'YouTube',
          }),
          locale: 'en',
          videoTimeSeconds: 4,
          videoDurationSeconds: 30,
        })}
      />,
    )

    expect(html).toContain('Skip in 1s')
    expect(html).not.toContain('Skip ad')
    expect(html).toContain('How marketing teams review creative before launch day')
    expect(html).toContain('Demo Studio Channel')
    expect(html).toContain('Demo Account')
    expect(html).toContain('Launch headline')
  })

  it('surrounds a native display ad with article text rather than presenting a standalone card', () => {
    const html = renderToStaticMarkup(
      <ContextPreview
        {...baseProps({
          profile: profile({
            id: 'google.display.native_in_article',
            groupId: 'google-display',
            groupName: 'Google Display',
          }),
          locale: 'en',
        })}
      />,
    )

    expect(html.indexOf('A campaign starts with customer needs')).toBeLessThan(
      html.indexOf('context-native-card'),
    )
    expect(html.indexOf('context-native-card')).toBeLessThan(
      html.indexOf('The surrounding page helps readers'),
    )
    expect(html).toContain('Launch headline')
    expect(html).toContain('creative.png')
  })
})
