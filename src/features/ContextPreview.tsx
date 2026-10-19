import { useState, type CSSProperties, type ReactNode } from 'react'
import type { UiProfile } from './uiTypes'
import { PreviewSurface } from './PreviewSurface'
import { PlatformLogo } from './PlatformLogo'
import './contextPreview.css'

export type ContextPreviewProps = {
  profile: UiProfile
  locale: 'vi' | 'en'
  brandName: string
  accountName: string
  headline: string
  description: string
  primaryText: string
  domain: string
  cta: string
  media: ReactNode
  identity?: ReactNode
  appChrome?: boolean
  videoTimeSeconds?: number
  videoDurationSeconds?: number
  videoTimeline?: ReactNode
  children?: ReactNode
}

type Copy = {
  all: string
  images: string
  videos: string
  news: string
  demo: string
  sponsored: string
  organic: string
  searchQuery: string
  assistant: string
  userPrompt: string
  composer: string
  learnMore: string
  skipAd: string
  skipIn: string
  adEndsIn: string
  subscribe: string
  comments: string
  share: string
  save: string
  dislike: string
  remix: string
  home: string
  shorts: string
  subscriptions: string
  demoArticle: string
  demoContext: string
  notRealPerformance: string
  hostVideoTitle: string
  hostChannel: string
  recommendations: string
  companion: string
  topicAll: string
  topicCreative: string
  topicPlanning: string
  localeTitle: string
  organicTitle: string
  articleBody: string
  articleAfter: string
  collapse: string
  expand: string
  newChat: string
  creativeNotes: string
  audiencePrompts: string
  sitelinks: Array<{ title: string; desc: string }>
}

const copies: Record<ContextPreviewProps['locale'], Copy> = {
  vi: {
    all: 'Tất cả',
    images: 'Hình ảnh',
    videos: 'Video',
    news: 'Tin tức',
    demo: 'DEMO',
    sponsored: 'Được tài trợ',
    organic: 'Kết quả mô phỏng',
    searchQuery: 'ý tưởng cho chiến dịch mới',
    assistant:
      'Dưới đây là vài hướng tiếp cận để bạn so sánh thông điệp và hình ảnh cho chiến dịch Digital Marketing & AI Automation:',
    userPrompt: 'Gợi ý công cụ và giải pháp tối ưu chiến dịch quảng cáo đa kênh tuần này?',
    composer: 'Nhắn tiếp trong cuộc trò chuyện...',
    learnMore: 'Tìm hiểu thêm',
    skipAd: 'Bỏ qua quảng cáo',
    skipIn: 'Bỏ qua sau',
    adEndsIn: 'Quảng cáo kết thúc sau',
    subscribe: 'Đăng ký',
    comments: 'bình luận',
    share: 'Chia sẻ',
    save: 'Lưu',
    dislike: 'Không thích',
    remix: 'Phối lại',
    home: 'Trang chủ',
    shorts: 'Shorts',
    subscriptions: 'Kênh đăng ký',
    demoArticle: 'CÔNG NGHỆ & MARKETING',
    demoContext: '125 N người đăng ký',
    notRealPerformance: 'Số liệu demo, không phải hiệu quả thực.',
    hostVideoTitle: 'Cách nhóm marketing đánh giá creative trước ngày ra mắt',
    hostChannel: 'Kênh Demo Studio',
    recommendations: 'Video đề xuất tiếp theo',
    companion: 'Vị trí companion demo 300x60',
    topicAll: 'Tất cả',
    topicCreative: 'Marketing',
    topicPlanning: 'AI & Automation',
    localeTitle: 'Từ ý tưởng đến chiến dịch: cách chọn hình ảnh phù hợp',
    organicTitle: 'Hướng dẫn lập kế hoạch nội dung cho thương hiệu',
    articleBody:
      'Một chiến dịch bắt đầu từ nhu cầu của khách hàng. Nhóm sáng tạo thường so sánh nhiều hướng hình ảnh, thông điệp và điểm chạm trước khi lựa chọn phương án phù hợp.',
    articleAfter:
      'Bối cảnh hiển thị giúp người xem đánh giá nội dung rõ hơn. Hãy chú ý sự cân bằng giữa hình ảnh, tiêu đề và phần thông tin tiếp theo trong bài viết.',
    collapse: 'Ẩn kết quả được tài trợ',
    expand: 'Hiện kết quả được tài trợ',
    newChat: 'Cuộc trò chuyện mới',
    creativeNotes: 'Chiến lược Digital Marketing',
    audiencePrompts: 'Tự động hóa với AI Agent',
    sitelinks: [
      { title: 'Tìm hiểu thêm', desc: 'Khám phá giải pháp toàn diện cho doanh nghiệp' },
      { title: 'Bảng giá & Gói dịch vụ', desc: 'Ưu đãi đặc biệt dành cho khách hàng mới' },
      { title: 'Liên hệ tư vấn', desc: 'Hỗ trợ 24/7 từ đội ngũ chuyên gia' },
      { title: 'Tài liệu hướng dẫn', desc: 'Bắt đầu nhanh chóng chỉ trong 5 phút' },
    ],
  },
  en: {
    all: 'All',
    images: 'Images',
    videos: 'Videos',
    news: 'News',
    demo: 'DEMO',
    sponsored: 'Sponsored',
    organic: 'Demo organic result',
    searchQuery: 'ideas for a new campaign',
    assistant: 'Here are a few angles to compare messaging and creative direction.',
    userPrompt: 'Suggest ways to choose creative for this week’s campaign',
    composer: 'Message the conversation...',
    learnMore: 'Learn more',
    skipAd: 'Skip ad',
    skipIn: 'Skip in',
    adEndsIn: 'Ad ends in',
    subscribe: 'Subscribe',
    comments: 'comments',
    share: 'Share',
    save: 'Save',
    dislike: 'Dislike',
    remix: 'Remix',
    home: 'Home',
    shorts: 'Shorts',
    subscriptions: 'Subscriptions',
    demoArticle: 'TECH & MARKETING',
    demoContext: '125K subscribers',
    notRealPerformance: 'Demo metrics, not live performance.',
    hostVideoTitle: 'How marketing teams review creative before launch day',
    hostChannel: 'Demo Studio Channel',
    recommendations: 'Up next recommendations',
    companion: 'Demo companion 300x60 slot',
    topicAll: 'All',
    topicCreative: 'Creative',
    topicPlanning: 'Planning',
    localeTitle: 'From idea to campaign: choosing the right creative',
    organicTitle: 'A guide to planning content for your brand',
    articleBody:
      'A campaign starts with customer needs. Creative teams compare visual directions, messages and touchpoints before selecting an approach that fits their audience.',
    articleAfter:
      'The surrounding page helps readers assess a message. Consider the balance between the image, headline and information that follows in the article.',
    collapse: 'Hide sponsored results',
    expand: 'Show sponsored results',
    newChat: 'New chat',
    creativeNotes: 'Creative notes',
    audiencePrompts: 'Audience ideas',
    sitelinks: [
      { title: 'Learn More', desc: 'Explore end-to-end growth solutions' },
      { title: 'Pricing & Plans', desc: 'Special offer for new business teams' },
      { title: 'Contact Sales', desc: '24/7 support from our specialists' },
      { title: 'Documentation', desc: 'Get started in under 5 minutes' },
    ],
  },
}

const demoHosts = ['insight.example', 'journal.example', 'studio.example']

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function initials(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || 'A'
}

function safeDomain(value: string) {
  return value.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'example.com'
}

function secondsLabel(seconds: number | undefined) {
  const safeSeconds = Math.max(0, Math.ceil(Number.isFinite(seconds) ? Number(seconds) : 0))
  return `${safeSeconds}s`
}

function displaySize(profile: UiProfile) {
  const match = profile.id.match(/(\d+)x(\d+)/)
  if (!match) return undefined
  return { width: Number(match[1]), height: Number(match[2]) }
}

function displaySlotKind(size?: { width: number; height: number }, profile?: UiProfile) {
  if (profile?.id.includes('native_in_article')) return 'native'
  if (!size) return 'native'
  if (size.width === 728 && size.height === 90) return 'top'
  if (size.width === 320 && size.height === 100) return 'top'
  if (size.width === 320 && size.height === 50) return 'footer'
  if (size.height >= 500) return 'sidebar'
  return 'in-article'
}

function isDesktopProfile(profile: UiProfile) {
  return ['desktop', 'web'].some((part) => profile.device.toLowerCase().includes(part))
}

function isSkippableYouTube(profile: UiProfile) {
  return (
    profile.id.includes('desktop_in_stream') ||
    (profile.id.includes('skippable') && !profile.id.includes('non_skippable'))
  )
}

function defaultDuration(profile: UiProfile) {
  return profile.id.includes('bumper') ? 6 : 15
}

function IdentityMark({ identity, name }: { identity?: ReactNode; name: string }) {
  return <span className="context-avatar">{identity ?? initials(name)}</span>
}

function Action({ label }: { label: ReactNode }) {
  return (
    <span className="context-action">
      <span>{label}</span>
    </span>
  )
}

function MediaSlot({ media }: { media: ReactNode }) {
  return <div className="context-media-slot">{media}</div>
}

function Cta({ label }: { label: string }) {
  return label ? <span className="context-cta">{label}</span> : null
}

function AdvertiserStrip({
  props,
  copy,
  compact,
}: {
  props: ContextPreviewProps
  copy: Copy
  compact?: boolean
}) {
  const name = props.accountName || props.brandName
  return (
    <div className={cx('context-advertiser-strip', compact && 'compact')}>
      <IdentityMark identity={props.identity} name={name} />
      <div>
        <strong>{name}</strong>
        <span>
          {copy.sponsored} · {safeDomain(props.domain)}
        </span>
      </div>
    </div>
  )
}

function BareAd(props: ContextPreviewProps & { copy: Copy }) {
  const { headline, description, primaryText, media, cta, copy } = props
  return (
    <article className="context-bare-ad">
      <AdvertiserStrip props={props} copy={copy} />
      {props.children ? (
        <div className="context-bare-search">{props.children}</div>
      ) : (
        <>
          {primaryText && <p>{primaryText}</p>}
          <MediaSlot media={media} />
          <div className="context-bare-copy">
            <strong>{headline}</strong>
            <span>{description}</span>
            <Cta label={cta} />
          </div>
        </>
      )}
      {props.videoTimeline}
    </article>
  )
}

function GoogleSearchContext(props: ContextPreviewProps & { copy: Copy }) {
  const { brandName, headline, description, domain, children, copy, profile } = props
  const [collapsed, setCollapsed] = useState(false)
  const query = headline || brandName || copy.searchQuery
  const desktop = isDesktopProfile(profile)
  return (
    <section className="context-search-page">
      <header className="context-search-top">
        <div className="context-google-wordmark" aria-label="Google">
          <span>G</span>
          <span>o</span>
          <span>o</span>
          <span>g</span>
          <span>l</span>
          <span>e</span>
        </div>
        <div className="context-search-box">
          <span>{query}</span>
          <small aria-hidden="true">✕ &nbsp; 🔍</small>
        </div>
      </header>
      <nav className="context-search-tabs" aria-label="Search result tabs">
        <span>{copy.all}</span>
        <span>{copy.images}</span>
        <span>{copy.videos}</span>
        <span>{copy.news}</span>
      </nav>
      <div className="context-sponsored-results">
        <div className="context-search-label">
          <span>{copy.sponsored}</span>
          <button
            className="context-search-collapse"
            type="button"
            aria-label={collapsed ? copy.expand : copy.collapse}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▾' : '▴'}
          </button>
        </div>
        <div hidden={collapsed}>
          {children ?? (
            <article className="context-search-result">
              <span>{safeDomain(domain)}</span>
              <h3>{headline}</h3>
              <p>{description}</p>
            </article>
          )}
          <div className={cx('context-search-sitelinks', desktop ? 'is-grid' : 'is-pills')}>
            {copy.sitelinks.map((link) => (
              <div key={link.title} className="context-sitelink-item">
                <strong>{link.title}</strong>
                {desktop && <small>{link.desc}</small>}
              </div>
            ))}
          </div>
          <div className="context-search-hide-bar" aria-hidden="true">
            <span>{copy.collapse} ▴</span>
          </div>
        </div>
      </div>
      <OrganicResult host={demoHosts[0]} title={copy.organicTitle} copy={copy} />
      <OrganicResult host={demoHosts[1]} title={copy.localeTitle} copy={copy} />
    </section>
  )
}

function OrganicResult({ host, title, copy }: { host: string; title: string; copy: Copy }) {
  return (
    <article className="context-search-result organic">
      <div className="context-organic-host-row">
        <span className="context-organic-favicon">{host.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{host}</strong>
          <small>https://{host}/bai-viet-chuyen-sau</small>
        </div>
      </div>
      <h3>{title}</h3>
      <p>{copy.articleBody}</p>
    </article>
  )
}

function DisplayAdSlot({
  media,
  size,
  label,
}: {
  media: ReactNode
  size?: { width: number; height: number }
  label: string
}) {
  const style = {
    '--context-slot-width': `${size?.width ?? 320}px`,
    '--context-slot-height': `${size?.height ?? 250}px`,
  } as CSSProperties
  return (
    <div className="context-display-slot-holder" style={{ maxWidth: size?.width ?? 320 }}>
      <PreviewSurface width={size?.width ?? 320} height={size?.height ?? 250}>
        <div className="context-display-slot" style={style} aria-label={label}>
          <span className="context-adchoices-badge" aria-hidden="true">
            ⓘ ×
          </span>
          {media}
        </div>
      </PreviewSurface>
    </div>
  )
}

function GoogleDisplayContext(props: ContextPreviewProps & { copy: Copy }) {
  const { profile, media, headline, description, cta, brandName, copy } = props
  const size = displaySize(profile)
  const kind = displaySlotKind(size, profile)
  if (kind === 'native') {
    return (
      <article className="context-display-native">
        <header className="context-display-header">
          <strong>VN Tạp Chí Số · Daily Example</strong>
          <span>Công nghệ · Kinh doanh · Marketing</span>
        </header>
        <div className="context-display-article-label">{copy.demoArticle}</div>
        <h2>{copy.localeTitle}</h2>
        <p>{copy.articleBody}</p>
        <div className="context-native-card">
          <MediaSlot media={media} />
          <div>
            <small className="context-native-sponsored">
              {copy.sponsored} · {brandName}
            </small>
            <strong>{headline}</strong>
            <p>{description}</p>
            <span>{brandName}</span>
            <Cta label={cta} />
          </div>
        </div>
        <p>{copy.articleAfter}</p>
      </article>
    )
  }
  const adSlot = <DisplayAdSlot media={media} size={size} label={`${profile.title} ad slot`} />
  return (
    <section className={cx('context-display-page', `slot-${kind}`)}>
      <header className="context-display-header">
        <strong>VN Tạp Chí Số · Daily Example</strong>
        <span>Công nghệ · Kinh doanh · Marketing · AI</span>
      </header>
      {kind === 'top' && <div className="context-display-top">{adSlot}</div>}
      <main className="context-display-layout">
        <article className="context-display-article">
          <span>{copy.demoArticle}</span>
          <h2>{copy.localeTitle}</h2>
          <div className="context-editorial-photo" aria-hidden="true">
            <span>Daily Example · Editorial</span>
          </div>
          <p>{copy.articleBody}</p>
          {kind === 'in-article' && adSlot}
          <p>{copy.articleAfter}</p>
          <p>{copy.articleBody}</p>
        </article>
        <aside className="context-display-sidebar">
          {kind === 'sidebar' ? adSlot : <RelatedStories copy={copy} />}
        </aside>
      </main>
      {kind === 'footer' && <div className="context-display-footer-ad">{adSlot}</div>}
    </section>
  )
}

function RelatedStories({ copy }: { copy: Copy }) {
  return (
    <div className="context-related">
      <span>{copy.recommendations}</span>
      <p>{copy.demoContext}</p>
      <p>{copy.organic}</p>
      <p>{copy.notRealPerformance}</p>
    </div>
  )
}

function ChatGptContext(props: ContextPreviewProps & { copy: Copy }) {
  const { brandName, headline, description, domain, cta, media, copy, profile } = props
  const isMobile = profile.id.includes('mobile') || !isDesktopProfile(profile)
  return (
    <section className={cx('context-chatgpt-shell', isMobile ? 'is-mobile' : 'is-web')}>
      {!isMobile && (
        <aside className="context-chatgpt-sidebar">
          <div className="context-chatgpt-brand-row">
            <PlatformLogo groupId="chatgpt" label="ChatGPT" size={20} />
            <strong>ChatGPT</strong>
          </div>
          <span className="chatgpt-new-btn">+ {copy.newChat}</span>
          <small>Hôm nay</small>
          <span className="active">{copy.creativeNotes}</span>
          <span>{copy.audiencePrompts}</span>
        </aside>
      )}
      <main className="context-chatgpt-thread">
        <header className="context-chatgpt-header">
          {isMobile ? (
            <>
              <span className="chatgpt-mobile-menu" aria-hidden="true">☰</span>
              <div className="chatgpt-mobile-title">
                <PlatformLogo groupId="chatgpt" label="ChatGPT" size={18} />
                <strong>ChatGPT 5 ▾</strong>
              </div>
              <span className="chatgpt-mobile-new" aria-hidden="true">+</span>
            </>
          ) : (
            <>
              <strong>ChatGPT 5 ▾</strong>
              <span className="chatgpt-user-dot">U</span>
            </>
          )}
        </header>
        <div className="context-chat-message user">{copy.userPrompt}</div>
        <div className="context-chat-message assistant">
          <span className="chatgpt-ai-badge context-chat-assistant-badge">
            <PlatformLogo groupId="chatgpt" label="ChatGPT" size={16} />
          </span>
          <div className="context-chat-assistant-body">
            <p>{copy.assistant}</p>
            <ul className="context-chat-bullets" aria-hidden="true">
              <li>
                <strong>Tối ưu đa vị trí:</strong> Kiểm tra hiển thị trên Feed, Reels, Search và
                Display trước khi xuất bản.
              </li>
              <li>
                <strong>Cá nhân hóa thông điệp:</strong> Kết hợp tiêu đề rõ ràng cùng nút hành động
                phù hợp từng nền tảng.
              </li>
            </ul>
          </div>
        </div>
        <article className="context-chat-sponsored">
          <MediaSlot media={media} />
          <div>
            <div className="context-chat-sponsored-tag">
              <span className="chatgpt-sponsored-badge">{copy.sponsored}</span>
              <span>· {brandName} ({safeDomain(domain)})</span>
            </div>
            <strong>{headline}</strong>
            <p>{description}</p>
            <Cta label={cta} />
          </div>
        </article>
        <div className="context-chat-composer">
          <span>{copy.composer}</span>
          <span className="chatgpt-send-icon context-chat-composer-send" aria-hidden="true">↑</span>
        </div>
      </main>
    </section>
  )
}

function YouTubeContext(props: ContextPreviewProps & { copy: Copy }) {
  if (props.profile.id.includes('shorts')) return <YouTubeShortsContext {...props} />
  if (props.profile.id.includes('in_feed')) return <YouTubeInFeedContext {...props} />
  return <YouTubeWatchContext {...props} />
}

function YouTubeWatchContext(props: ContextPreviewProps & { copy: Copy }) {
  const {
    profile,
    cta,
    media,
    videoTimeSeconds = 0,
    videoDurationSeconds,
    videoTimeline,
    copy,
  } = props
  const skippable = isSkippableYouTube(profile)
  const duration = videoDurationSeconds ?? defaultDuration(profile)
  const canSkip = skippable && videoTimeSeconds >= 5
  const remaining = Math.max(0, duration - videoTimeSeconds)
  return (
    <section className="context-youtube-watch">
      <header className="context-youtube-header">
        <strong>YouTube</strong>
        <div>
          <span>{copy.searchQuery}</span>
        </div>
        <span className="youtube-header-user">U</span>
      </header>
      <div className="context-youtube-main">
        <main>
          <div className="context-youtube-player">
            <MediaSlot media={media} />
            <div className="context-youtube-player-overlay">
              <span>
                {copy.sponsored} · {safeDomain(props.domain)}
              </span>
              {skippable ? (
                <span className={cx('context-skip', canSkip && 'can-skip')}>
                  {canSkip ? `${copy.skipAd} ›` : `${copy.skipIn} ${secondsLabel(5 - videoTimeSeconds)}`}
                </span>
              ) : (
                <span>
                  {copy.adEndsIn} {secondsLabel(remaining)}
                </span>
              )}
            </div>
            <div className="context-youtube-ad-progress" aria-hidden="true" />
          </div>
          {videoTimeline}
          <h2>{copy.hostVideoTitle}</h2>
          <div className="context-youtube-owner">
            <IdentityMark name={copy.hostChannel} />
            <div>
              <strong>{copy.hostChannel}</strong>
              <span>{copy.demoContext}</span>
            </div>
            <span className="context-pill">{copy.subscribe}</span>
          </div>
          <div className="context-action-row">
            <Action label="👍 4.2K" />
            <Action label={copy.share} />
            <Action label={copy.save} />
          </div>
          <AdvertiserStrip props={props} copy={copy} />
          <div className="context-youtube-ad-copy">
            <strong>{props.headline}</strong>
            <p>{props.description}</p>
            <Cta label={cta} />
          </div>
          <section className="context-youtube-comments">
            <strong>248 {copy.comments}</strong>
            <p>{copy.notRealPerformance}</p>
          </section>
        </main>
        <aside className="context-youtube-side">
          <div className="context-youtube-companion">
            <div>
              <strong>{props.brandName}</strong>
              <small>{copy.companion}</small>
            </div>
            <span className="companion-cta">{cta}</span>
          </div>
          <RelatedStories copy={copy} />
        </aside>
      </div>
    </section>
  )
}

function YouTubeInFeedContext(props: ContextPreviewProps & { copy: Copy }) {
  const { accountName, brandName, headline, description, cta, media, copy } = props
  return (
    <section className="context-youtube-home">
      <header>
        <strong>YouTube</strong>
        <span>🔍</span>
      </header>
      <nav className="context-youtube-topics">
        <span>{copy.topicAll}</span>
        <span>{copy.topicCreative}</span>
        <span>{copy.topicPlanning}</span>
      </nav>
      <div className="context-youtube-organic-card" aria-hidden="true">
        <div className="context-youtube-organic-thumb">
          <span>12:45</span>
        </div>
        <div className="context-youtube-organic-meta">
          <strong>Hướng dẫn xây dựng phễu Marketing tự động hóa từ A-Z</strong>
          <small>Kênh Marketing Thực Chiến · 45 N lượt xem · 2 ngày trước</small>
        </div>
      </div>
      <article className="context-youtube-feed-card">
        <MediaSlot media={media} />
        <div>
          <IdentityMark identity={props.identity} name={accountName || brandName} />
          <div>
            <strong>{headline}</strong>
            <p>{description}</p>
            <span>
              {copy.sponsored} · {accountName || brandName}
            </span>
            <div className="context-youtube-feed-buttons">
              <span className="watch-btn">Xem</span>
              <Cta label={cta} />
            </div>
          </div>
        </div>
      </article>
      <nav className="context-youtube-bottom-nav">
        <span>{copy.home}</span>
        <span>{copy.shorts}</span>
        <span>{copy.subscriptions}</span>
      </nav>
    </section>
  )
}

function YouTubeShortsContext(props: ContextPreviewProps & { copy: Copy }) {
  const { primaryText, headline, cta, media, videoTimeline, copy } = props
  return (
    <section className="context-youtube-shorts">
      <MediaSlot media={media} />
      <div className="context-shorts-top">Shorts</div>
      <div className="context-shorts-rail">
        <Action label="👍 8.1K" />
        <Action label="💬 312" />
        <Action label={copy.dislike} />
        <Action label={copy.share} />
        <Action label={copy.remix} />
      </div>
      <div className="context-shorts-caption">
        <AdvertiserStrip props={props} copy={copy} compact />
        <p>{primaryText || headline}</p>
        <span className="context-pill">{copy.subscribe}</span>
        <Cta label={cta} />
      </div>
      <nav className="context-shorts-bottom-nav" aria-label="Shorts navigation">
        <span>{copy.home}</span>
        <strong>{copy.shorts}</strong>
        <span>{copy.subscriptions}</span>
      </nav>
      {videoTimeline}
    </section>
  )
}

function AdmicroContext(props: ContextPreviewProps & { copy: Copy }) {
  const { profile, copy, media } = props
  const id = profile.id.toLowerCase()

  const isKenh14 = id.includes('kenh14')
  const isVnExpress = id.includes('vnexpress')
  const isDantri = id.includes('dantri')

  let config = {
    publisher: 'CafeF',
    accent: '#bd2027',
    tagline: 'Kênh thông tin kinh tế - tài chính Việt Nam',
    section: 'KINH DOANH',
    nav: ['Trang chủ', 'Thị trường', 'Doanh nghiệp', 'Bất động sản', 'Tài chính'],
    articleTitle: 'Doanh nghiệp Việt đón nhịp tăng trưởng mới từ đổi mới sáng tạo',
    articleLead:
      'Nhiều mô hình kinh doanh đang thay đổi cùng nhu cầu tiêu dùng. Công nghệ và dịch vụ giúp doanh nghiệp tìm hướng phát triển trong giai đoạn mới.',
    adLabel: 'CafeF CPD · 1160×250 PC Masthead',
    slotAspect: '1160 / 250',
    isMobile: false,
  }

  if (isKenh14) {
    config = {
      publisher: 'kenh14.vn',
      accent: '#ec9026',
      tagline: 'Trang tin tức giải trí - xã hội giới trẻ',
      section: 'ĐỜI SỐNG',
      nav: ['Star', 'Đời sống', 'Ăn - Quẩy - Đi', 'Công nghệ'],
      articleTitle: 'Một góc phố quen, một trải nghiệm mới trong ngày cuối tuần',
      articleLead:
        'Những không gian trải nghiệm sáng tạo thu hút đông đảo bạn trẻ khám phá những ngày cuối năm.',
      adLabel: 'Kenh14 CPD · 300×250 Mobile Header',
      slotAspect: '300 / 250',
      isMobile: true,
    }
  } else if (isVnExpress) {
    config = {
      publisher: 'VnExpress',
      accent: '#9f224e',
      tagline: 'Báo tiếng Việt nhiều người xem nhất',
      section: 'KINH DOANH',
      nav: ['Thời sự', 'Góc nhìn', 'Kinh doanh', 'Khoa học', 'Giải trí'],
      articleTitle: 'Thị trường ghi nhận nhiều chuyển động tích cực từ khối doanh nghiệp',
      articleLead:
        'Các chỉ số sản xuất và kinh doanh ghi nhận mức tăng trưởng ổn định trong quý vừa qua.',
      adLabel: 'VnExpress CPD · 1160×250 PC Masthead',
      slotAspect: '1160 / 250',
      isMobile: false,
    }
  } else if (isDantri) {
    config = {
      publisher: 'Dân trí',
      accent: '#008848',
      tagline: 'Dân trí - Tin tức Việt Nam và thế giới',
      section: 'XÃ HỘI',
      nav: ['Xã hội', 'Kinh doanh', 'Bất động sản', 'Thể thao'],
      articleTitle: 'Nhiều sáng kiến mới thúc đẩy chuyển đổi số và phát triển bền vững',
      articleLead:
        'Hội thảo quốc tế tập trung vào các giải pháp ứng dụng công nghệ để giải quyết thách thức hiện đại.',
      adLabel: 'Dân trí CPD · 300×375 Mobile In-Page (4:5)',
      slotAspect: '4 / 5',
      isMobile: true,
    }
  }

  return (
    <section className={`context-admicro-paper ${config.isMobile ? 'is-mobile' : 'is-desktop'}`}>
      <header
        className="context-admicro-masthead"
        style={{
          borderTop: `3px solid ${config.accent}`,
          padding: '12px 16px',
          borderBottom: '1px solid #e4e5e7',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <strong
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: config.accent,
              letterSpacing: '-0.5px',
            }}
          >
            {config.publisher}
          </strong>
          <small style={{ color: '#606368', fontSize: '11px' }}>{config.tagline}</small>
        </div>
        <nav
          style={{
            display: 'flex',
            gap: '12px',
            fontSize: '12px',
            fontWeight: 600,
            marginTop: '8px',
            color: '#333',
            overflowX: 'auto',
          }}
        >
          {config.nav.map((item) => (
            <span key={item} style={{ whiteSpace: 'nowrap' }}>
              {item}
            </span>
          ))}
        </nav>
      </header>

      {!config.isMobile && (
        <div
          style={{
            padding: '12px 16px',
            background: '#f2f3f5',
            borderBottom: '1px solid #e4e5e7',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#606368',
              marginBottom: '4px',
            }}
          >
            <span>{config.adLabel}</span>
            <span>{copy.sponsored}</span>
          </div>
          <div
            style={{
              aspectRatio: config.slotAspect,
              width: '100%',
              maxWidth: '1160px',
              margin: '0 auto',
              background: '#fff',
              border: '1px dashed #ccc',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {media}
          </div>
        </div>
      )}

      <article style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: config.accent,
            marginBottom: '6px',
          }}
        >
          TRANG CHỦ / {config.section}
        </div>
        <h2
          style={{
            fontSize: config.isMobile ? '18px' : '22px',
            lineHeight: 1.3,
            marginBottom: '8px',
            fontWeight: 700,
          }}
        >
          {config.articleTitle}
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: '#444',
            lineHeight: 1.5,
            fontWeight: 500,
            marginBottom: '12px',
          }}
        >
          {config.articleLead}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            fontSize: '11px',
            color: '#888',
            marginBottom: '16px',
            borderBottom: '1px solid #eee',
            paddingBottom: '8px',
          }}
        >
          <span>Ban Biên tập</span> · <span>08:30</span> · <span>Tin tức kinh tế</span>
        </div>

        {config.isMobile && (
          <div
            style={{
              margin: '16px auto',
              padding: '10px',
              background: '#f2f3f5',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#606368',
                marginBottom: '4px',
              }}
            >
              <span>{config.adLabel}</span>
              <span>{copy.sponsored}</span>
            </div>
            <div
              style={{
                aspectRatio: config.slotAspect,
                width: '100%',
                background: '#fff',
                border: '1px dashed #ccc',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {media}
            </div>
          </div>
        )}

        <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#333' }}>
          <p style={{ marginBottom: '10px' }}>
            Sự chuyển đổi mô hình tăng trưởng kinh tế đang mở ra những hướng đi mới. Các đơn vị chủ
            động đón đầu xu thế công nghệ số, tối ưu hoá kênh truyền thông và tiếp thị đa nền tảng
            đều ghi nhận kết quả tích cực.
          </p>
          <p style={{ marginBottom: '10px' }}>
            Trong bối cảnh hội nhập sâu rộng, việc nâng cao năng lực cạnh tranh và xây dựng thương
            hiệu uy tín trở thành yếu tố then chốt cho sự phát triển dài hạn.
          </p>
        </div>
      </article>

      <footer
        style={{
          borderTop: '1px solid #e4e5e7',
          padding: '12px 16px',
          fontSize: '11px',
          color: '#888',
          textAlign: 'center',
          background: '#fafafa',
        }}
      >
        <small>© {config.publisher} · Hệ thống đối tác xuất bản Admicro · Mô phỏng hiển thị</small>
      </footer>
    </section>
  )
}

export function ContextPreview(input: ContextPreviewProps) {
  const props = { ...input, appChrome: input.appChrome ?? true }
  const copy = copies[props.locale]
  const groupClass = `group-${props.profile.groupId}`
  const layout = isDesktopProfile(props.profile) ? 'desktop' : 'mobile'
  const baseClass = cx('context-preview', groupClass, !props.appChrome && 'no-app-chrome')

  let content: ReactNode
  switch (props.profile.groupId) {
    case 'google-search':
      content = <GoogleSearchContext {...props} copy={copy} />
      break
    case 'google-display':
      content = <GoogleDisplayContext {...props} copy={copy} />
      break
    case 'chatgpt':
      content = <ChatGptContext {...props} copy={copy} />
      break
    case 'youtube':
      content = <YouTubeContext {...props} copy={copy} />
      break
    case 'admicro':
      content = <AdmicroContext {...props} copy={copy} />
      break
    default:
      content = <BareAd {...props} copy={copy} />
  }

  return (
    <div
      className={baseClass}
      data-context-preview={props.profile.groupId}
      data-content-layout={layout}
    >
      {content}
    </div>
  )
}
