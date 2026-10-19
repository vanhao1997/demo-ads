import type { ReactNode } from 'react'
import { PlatformLogo } from './PlatformLogo'
import './socialPreview.css'

export type SocialPreviewLocale = 'vi' | 'en'

export type SocialPlacementVariant =
  | 'feed'
  | 'video_feeds'
  | 'marketplace'
  | 'search_results'
  | 'right_column'
  | 'audience_network'
  | 'stories'
  | 'reels'
  | 'banner_on_reels'
  | 'in_stream'
  | 'threads_feed'
  | 'tiktok_in_feed'
  | 'zalo_journal'
  | 'zalo_video'
  | 'zalo_message'
  | 'zalo_commerce'
  | 'zalo_article'
  | 'zalo_display'
  | 'linkedin_feed_mobile'
  | 'linkedin_feed_desktop'
  | 'linkedin_message'
  | 'linkedin_right_rail'
  | 'youtube_in_stream'

export type SocialSimulationCounts = {
  reactions?: string
  likes?: string
  comments?: string
  shares?: string
  reposts?: string
  saves?: string
  views?: string
}

export type SocialPreviewProps = {
  groupId: string
  profileId: string
  title: string
  placementVariant?: SocialPlacementVariant
  locale?: SocialPreviewLocale
  effectiveRenderer: 'feed' | 'vertical' | string
  identity: ReactNode
  primaryText?: string
  headline?: string
  description?: string
  cta?: string
  domain?: string
  expanded?: boolean
  onToggleExpand?: () => void
  media: ReactNode
  footer?: ReactNode
  videoTimeline?: ReactNode
  audio?: ReactNode
  verticalChrome?: ReactNode
  appChrome?: boolean
  topViewPhase?: 'intro' | 'feed'
  brandName: string
  accountName: string
  counts?: SocialSimulationCounts
}

type ResolvedSocialProps = SocialPreviewProps & {
  locale: SocialPreviewLocale
  placementVariant: SocialPlacementVariant
  counts: Required<SocialSimulationCounts>
  appChrome: boolean
  topViewPhase: 'intro' | 'feed'
  headline: string
  description: string
  cta: string
  domain: string
}

const textLimit = 140

const dictionaries = {
  vi: {
    demo: 'Tương tác demo',
    sponsored: 'Được tài trợ',
    search: 'Tìm kiếm',
    like: 'Thích',
    comment: 'Bình luận',
    share: 'Chia sẻ',
    send: 'Gửi',
    save: 'Lưu',
    reply: 'Trả lời',
    repost: 'Đăng lại',
    follow: 'Theo dõi',
    following: 'Đang Follow',
    forYou: 'Đề xuất',
    live: 'LIVE',
    originalSound: 'Nhạc nền gốc',
    marketplace: 'Marketplace',
    nearby: 'Gần bạn',
    categories: 'Danh mục',
    searchTabs: 'Tất cả · Bài viết · Video · Marketplace',
    rightColumn: 'Cột phải desktop · 1920×1032',
    audienceNetwork: 'Bài viết đối tác',
    news: 'BÁO MỚI 24H',
    home: 'Trang chủ',
    friends: 'Bạn bè',
    inbox: 'Hộp thư',
    profile: 'Hồ sơ',
    journal: 'Nhật ký',
    interested: 'Quan tâm',
    comments: 'bình luận',
    shares: 'chia sẻ',
    likes: 'lượt thích',
    viewAll: 'Xem tất cả',
    readMore: 'Xem thêm',
    collapse: 'Thu gọn',
    skip: 'Bỏ qua',
    subscribe: 'Đăng ký',
    remix: 'Remix',
    download: 'Tải xuống',
    adBreak: 'Quảng cáo · 0:15',
    replyMessage: 'Gửi tin nhắn...',
    promoted: 'Được quảng bá',
    followers: 'người theo dõi',
    network: 'Mạng lưới',
    jobs: 'Việc làm',
    notifications: 'Thông báo',
  },
  en: {
    demo: 'Demo interactions',
    sponsored: 'Sponsored',
    search: 'Search',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    send: 'Send',
    save: 'Save',
    reply: 'Reply',
    repost: 'Repost',
    follow: 'Follow',
    following: 'Following',
    forYou: 'For You',
    live: 'LIVE',
    originalSound: 'Original sound',
    marketplace: 'Marketplace',
    nearby: 'Near you',
    categories: 'Categories',
    searchTabs: 'All · Posts · Videos · Marketplace',
    rightColumn: 'Desktop right column · 1920×1032',
    audienceNetwork: 'Partner article',
    news: 'DAILY NEWS 24H',
    home: 'Home',
    friends: 'Friends',
    inbox: 'Inbox',
    profile: 'Profile',
    journal: 'Timeline',
    interested: 'Interested',
    comments: 'comments',
    shares: 'shares',
    likes: 'likes',
    viewAll: 'View all',
    readMore: 'See more',
    collapse: 'See less',
    skip: 'Skip',
    subscribe: 'Subscribe',
    remix: 'Remix',
    download: 'Download',
    adBreak: 'Sponsored · 0:15',
    replyMessage: 'Send message...',
    promoted: 'Promoted',
    followers: 'followers',
    network: 'My Network',
    jobs: 'Jobs',
    notifications: 'Notifications',
  },
} satisfies Record<SocialPreviewLocale, Record<string, string>>

const fallbackCounts: Record<string, Required<SocialSimulationCounts>> = {
  facebook: {
    reactions: '1.2K',
    likes: '1.2K',
    comments: '86',
    shares: '24',
    reposts: '18',
    saves: '18',
    views: '24K',
  },
  instagram: {
    reactions: '1,234',
    likes: '1,234',
    comments: '48',
    shares: '97',
    reposts: '56',
    saves: '18',
    views: '18K',
  },
  threads: {
    reactions: '428',
    likes: '428',
    comments: '32',
    shares: '18',
    reposts: '14',
    saves: '12',
    views: '9.8K',
  },
  tiktok: {
    reactions: '12.3K',
    likes: '12.3K',
    comments: '284',
    shares: '96',
    reposts: '1,024',
    saves: '1,024',
    views: '88K',
  },
  zalo: {
    reactions: '1.2K',
    likes: '1.2K',
    comments: '86',
    shares: '24',
    reposts: '18',
    saves: '18',
    views: '24K',
  },
  linkedin: {
    reactions: '482',
    likes: '482',
    comments: '38',
    shares: '19',
    reposts: '19',
    saves: '27',
    views: '14.8K',
  },
  youtube: {
    reactions: '8.4K',
    likes: '8.4K',
    comments: '412',
    shares: '96',
    reposts: '56',
    saves: '121',
    views: '120K',
  },
  default: {
    reactions: '1.2K',
    likes: '1.2K',
    comments: '86',
    shares: '24',
    reposts: '18',
    saves: '18',
    views: '24K',
  },
}

function resolvePlacementVariant({
  profileId,
  title,
  groupId,
  effectiveRenderer,
}: SocialPreviewProps): SocialPlacementVariant {
  const key = `${profileId} ${title}`.toLowerCase()
  if (groupId === 'linkedin') {
    if (
      profileId === 'linkedin.message' ||
      profileId === 'li_message' ||
      profileId === 'linkedin_message' ||
      key.includes('message')
    )
      return 'linkedin_message'
    if (
      profileId === 'linkedin.spotlight' ||
      profileId === 'li_spotlight' ||
      profileId === 'linkedin.right_rail' ||
      profileId === 'linkedin_right_rail' ||
      key.includes('right_rail') ||
      key.includes('spotlight')
    )
      return 'linkedin_right_rail'
    if (
      profileId === 'linkedin.desktop_feed' ||
      profileId === 'li_desktop_feed' ||
      profileId === 'linkedin_feed_desktop' ||
      profileId === 'linkedin.feed.desktop' ||
      key.includes('desktop')
    )
      return 'linkedin_feed_desktop'
    return 'linkedin_feed_mobile'
  }
  if (groupId === 'zalo') {
    if (
      profileId === 'zalo.video' ||
      profileId === 'zalo_video' ||
      profileId === 'zalo.video.safe_zone' ||
      key.includes('video')
    )
      return 'zalo_video'
    if (
      profileId === 'zalo.message' ||
      profileId === 'zalo_message' ||
      key.includes('message')
    )
      return 'zalo_message'
    if (profileId === 'zalo.commerce.product' || key.includes('commerce')) return 'zalo_commerce'
    if (
      profileId === 'zalo.article' ||
      profileId === 'zalo_article' ||
      profileId === 'zalo.oa_article.native' ||
      key.includes('article') ||
      key.includes('báo mới')
    )
      return 'zalo_article'
    if (profileId.startsWith('zalo.display.') || effectiveRenderer === 'banner')
      return 'zalo_display'
    return 'zalo_journal'
  }
  if (key.includes('marketplace')) return 'marketplace'
  if (key.includes('search')) return 'search_results'
  if (key.includes('right_column') || key.includes('right column')) return 'right_column'
  if (key.includes('audience_network') || key.includes('audience network'))
    return 'audience_network'
  if (key.includes('stories')) return 'stories'
  if (key.includes('reels_banner') || key.includes('reels banner')) return 'banner_on_reels'
  if (key.includes('reels') || key.includes('shorts')) return 'reels'
  if (key.includes('in_stream') || key.includes('in-stream') || key.includes('instream')) {
    return groupId === 'youtube' ? 'youtube_in_stream' : 'in_stream'
  }
  if (groupId === 'threads') return 'threads_feed'
  if (groupId === 'tiktok') return 'tiktok_in_feed'
  if (effectiveRenderer === 'vertical') return 'stories'
  if (key.includes('video_feeds') || key.includes('video feeds')) return 'video_feeds'
  return 'feed'
}

function resolveProps(props: SocialPreviewProps): ResolvedSocialProps {
  const locale = props.locale ?? 'vi'
  const placementVariant = props.placementVariant ?? resolvePlacementVariant(props)
  const defaults = fallbackCounts[props.groupId] ?? fallbackCounts.default
  return {
    ...props,
    locale,
    placementVariant,
    counts: { ...defaults, ...(props.counts ?? {}) },
    appChrome: props.appChrome ?? true,
    topViewPhase:
      props.profileId === 'tiktok.topview' || props.profileId === 'tt_topview'
        ? (props.topViewPhase ?? 'feed')
        : 'feed',
    headline:
      props.headline || 'Tối ưu chiến dịch quảng cáo đa kênh cùng P2P Digital',
    description: props.description || 'Khám phá giải pháp tại p2pdigital.vn',
    cta: props.cta || (locale === 'vi' ? 'Tìm hiểu thêm' : 'Learn more'),
    domain: props.domain || 'p2pdigital.vn',
  }
}

function labels(locale: SocialPreviewLocale) {
  return dictionaries[locale]
}

function ActionItem({ label, value }: { label: string; value?: string }) {
  return (
    <span className="social-icon-text" aria-label={value ? `${label}: ${value}` : label}>
      <span>{label}</span>
      {value && <small>{value}</small>}
    </span>
  )
}

function Caption({
  accountName,
  primaryText,
  expanded,
  onToggleExpand,
  locale,
  showAuthor = false,
}: Pick<
  ResolvedSocialProps,
  'accountName' | 'primaryText' | 'expanded' | 'onToggleExpand' | 'locale'
> & { showAuthor?: boolean }) {
  if (!primaryText) return null
  const t = labels(locale)
  const shouldClamp = primaryText.length > textLimit
  return (
    <p className={`social-caption ${expanded ? 'expanded' : ''}`}>
      {showAuthor && <strong>{accountName} </strong>}
      {primaryText}
      {shouldClamp && onToggleExpand && (
        <button type="button" className="social-read-more" onClick={onToggleExpand}>
          {expanded ? t.collapse : t.readMore}
        </button>
      )}
    </p>
  )
}

function Root({
  props,
  className,
  children,
}: {
  props: ResolvedSocialProps
  className: string
  children: ReactNode
}) {
  return (
    <article
      className={`social-ad social-native ${className} group-${props.groupId}`}
      data-platform={props.groupId}
      data-placement={props.placementVariant}
      data-profile-id={props.profileId}
      data-app-chrome={props.appChrome ? 'true' : 'false'}
      data-topview-phase={props.topViewPhase}
    >
      {children}
    </article>
  )
}

export function SocialPreview(input: SocialPreviewProps) {
  const props = resolveProps(input)
  if (props.groupId === 'youtube' || props.placementVariant === 'youtube_in_stream')
    return <YouTubeInStreamPreview {...props} />
  if (props.groupId === 'linkedin') return <LinkedInPreview {...props} />
  if (props.groupId === 'zalo') return <ZaloPreview {...props} />
  if (props.placementVariant === 'in_stream') return <FacebookInStreamPreview {...props} />
  if (props.placementVariant === 'right_column') return <FacebookRightColumnPreview {...props} />
  if (props.placementVariant === 'audience_network') return <AudienceNetworkPreview {...props} />
  if (props.placementVariant === 'marketplace') return <FacebookMarketplacePreview {...props} />
  if (props.placementVariant === 'search_results') return <FacebookSearchPreview {...props} />
  if (props.placementVariant === 'banner_on_reels') return <MetaReelsBannerPreview {...props} />
  if (
    props.effectiveRenderer === 'vertical' ||
    ['stories', 'reels', 'banner_on_reels', 'tiktok_in_feed'].includes(props.placementVariant)
  ) {
    return props.groupId === 'tiktok' ? (
      <TikTokPreview {...props} />
    ) : (
      <VerticalMetaPreview {...props} />
    )
  }
  if (props.groupId === 'instagram') return <InstagramPreview {...props} />
  if (props.groupId === 'threads') return <ThreadsPreview {...props} />
  return <FacebookFeedPreview {...props} />
}

function FacebookAppBar({
  locale,
  variant = 'feed',
}: {
  locale: SocialPreviewLocale
  variant?: 'feed' | 'video'
}) {
  const t = labels(locale)
  return (
    <div className="facebook-appbar" aria-hidden="true">
      <div className="facebook-appbar-brand">
        <span>{variant === 'video' ? 'Video' : 'facebook'}</span>
      </div>
      <div className="facebook-appbar-actions">
        {variant === 'video' ? (
          <>
            <span className="facebook-pill-chip active">
              {locale === 'vi' ? 'Dành cho bạn' : 'For you'}
            </span>
            <span className="facebook-pill-chip">{t.live}</span>
            <span className="facebook-pill-chip">Reels</span>
          </>
        ) : (
          <>
            <span className="facebook-app-pill">+</span>
            <span className="facebook-app-pill">{t.search}</span>
          </>
        )}
      </div>
    </div>
  )
}

function FacebookFooterMetrics({ props }: { props: ResolvedSocialProps }) {
  const t = labels(props.locale)
  return (
    <>
      <div className="facebook-metrics">
        <span>
          <span className="facebook-reaction-dots" aria-hidden="true">
            <i className="dot-like" />
            <i className="dot-love" />
          </span>
          {props.counts.reactions}
        </span>
        <span>
          {props.counts.comments} {t.comments} · {props.counts.shares} {t.shares}
        </span>
      </div>
      <div className="facebook-action-row">
        <ActionItem label={t.like} />
        <ActionItem label={t.comment} />
        <ActionItem label={t.share} />
      </div>
    </>
  )
}

function FacebookFeedPreview(props: ResolvedSocialProps) {
  const isVideoFeed = props.placementVariant === 'video_feeds'
  return (
    <Root props={props} className="social-facebook social-facebook-feed">
      <FacebookAppBar locale={props.locale} variant={isVideoFeed ? 'video' : 'feed'} />
      <div className="social-card">
        <div className="social-card-head">
          {props.identity}
          <span className="social-kebab" aria-label="Display options">
            ••• &nbsp; ✕
          </span>
        </div>
        <Caption {...props} />
        <div
          className="social-media-frame social-media-4x5"
          aria-label={`${props.title} media preview`}
        >
          {props.media}
        </div>
        {props.videoTimeline}
        {props.footer}
        <FacebookFooterMetrics props={props} />
        {props.audio}
      </div>
    </Root>
  )
}

function FacebookMarketplacePreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-facebook social-facebook-marketplace">
      <FacebookAppBar locale={props.locale} />
      <div className="facebook-market-tabs" aria-hidden="true">
        <strong>{t.marketplace}</strong>
        <span>TP. Hồ Chí Minh · 10 km</span>
      </div>
      <div className="marketplace-grid">
        <div className="marketplace-organic-item" aria-hidden="true">
          <div className="marketplace-organic-thumb" />
          <div className="marketplace-organic-meta">
            <strong>299.000 ₫</strong>
            <span>Sản phẩm nổi bật</span>
            <small>TP. Hồ Chí Minh</small>
          </div>
        </div>
        <div className="marketplace-card">
          <div className="marketplace-media">{props.media}</div>
          <div className="marketplace-copy">
            <span>
              {t.sponsored} · {props.brandName}
            </span>
            <strong>{props.headline}</strong>
            <small>{props.domain}</small>
            {props.footer}
          </div>
        </div>
        <div className="marketplace-organic-item" aria-hidden="true">
          <div className="marketplace-organic-thumb alt" />
          <div className="marketplace-organic-meta">
            <strong>450.000 ₫</strong>
            <span>Thiết bị văn phòng</span>
            <small>TP. Hồ Chí Minh</small>
          </div>
        </div>
        <div className="marketplace-organic-item" aria-hidden="true">
          <div className="marketplace-organic-thumb" />
          <div className="marketplace-organic-meta">
            <strong>199.000 ₫</strong>
            <span>Phụ kiện công nghệ</span>
            <small>TP. Hồ Chí Minh</small>
          </div>
        </div>
      </div>
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function FacebookSearchPreview(props: ResolvedSocialProps) {
  return (
    <Root props={props} className="social-facebook social-facebook-search-results">
      <div className="facebook-search-header" aria-hidden="true">
        <span className="facebook-back-arrow">←</span>
        <div className="facebook-query">{props.brandName}</div>
      </div>
      <div className="facebook-search-tabs" aria-hidden="true">
        <strong>Tất cả</strong>
        <span>Bài viết</span>
        <span>Mọi người</span>
        <span>Nhóm</span>
      </div>
      <div className="facebook-search-organic" aria-hidden="true">
        <div className="facebook-search-organic-head">
          <span className="organic-avatar">C</span>
          <div>
            <strong>Cộng đồng Marketing Việt Nam</strong>
            <small>2 giờ · 🌐</small>
          </div>
        </div>
        <p>Tổng hợp các công cụ tối ưu quảng cáo đa kênh hiệu quả nhất hiện nay...</p>
      </div>
      <div className="search-result-card">
        <div className="social-card-head">
          {props.identity}
          <span className="social-kebab">•••</span>
        </div>
        <Caption {...props} />
        <div className="social-media-frame social-media-4x5">{props.media}</div>
        {props.footer}
        <FacebookFooterMetrics props={props} />
      </div>
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function FacebookRightColumnPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-facebook social-facebook-right-column">
      <div className="fb-desktop-navbar" aria-hidden="true">
        <div className="fb-desktop-navbar-left">
          <span className="fb-circle-logo">f</span>
          <span className="fb-desktop-search">{t.search} trên Facebook</span>
        </div>
        <div className="fb-desktop-navbar-center">
          <span className="active">{t.home}</span>
          <span>Video</span>
          <span>{t.marketplace}</span>
          <span>Nhóm</span>
        </div>
        <div className="fb-desktop-navbar-right">
          <span>Menu</span>
          <span>Chat</span>
        </div>
      </div>
      <div className="right-column-shell" aria-label={t.rightColumn}>
        <nav className="fb-desktop-left-rail" aria-hidden="true">
          <strong>{t.home}</strong>
          <span>{t.friends}</span>
          <span>Nhóm</span>
          <span>{t.marketplace}</span>
          <span>Video</span>
          <span>Đã lưu</span>
        </nav>
        <div className="right-column-page" aria-hidden="true">
          <div className="fb-desktop-composer">
            <span className="organic-avatar">U</span>
            <div className="fb-desktop-composer-input">Bạn đang nghĩ gì?</div>
          </div>
          <div className="fb-desktop-organic-post">
            <div className="facebook-search-organic-head">
              <span className="organic-avatar">N</span>
              <div>
                <strong>Trang Tin Công Nghệ</strong>
                <small>1 giờ · 🌐</small>
              </div>
            </div>
            <p>Cập nhật xu hướng chuyển đổi số và AI Agent cho doanh nghiệp năm 2026.</p>
            <div className="fb-desktop-organic-rect" />
          </div>
        </div>
        <aside className="right-column-ad">
          <div className="right-column-section-title">{t.sponsored}</div>
          <div className="right-column-ad-item">
            <div className="right-column-media">{props.media}</div>
            <div className="right-column-ad-copy">
              <strong>{props.headline}</strong>
              <small>{props.domain}</small>
            </div>
          </div>
          {props.footer}
          <div className="right-column-contacts" aria-hidden="true">
            <div className="right-column-section-title">Người liên hệ</div>
            <span>
              <i /> Nguyễn Minh
            </span>
            <span>
              <i /> Trần Thảo
            </span>
            <span>
              <i /> Lê Hoàng
            </span>
          </div>
        </aside>
      </div>
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function AudienceNetworkPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-facebook social-audience-network">
      <div className="audience-news-shell">
        <header aria-hidden="true">
          <strong>{t.news}</strong>
          <span>Công nghệ · Kinh doanh · Đời sống</span>
        </header>
        <article>
          <div className="audience-article-intro" aria-hidden="true">
            <h4>Xu hướng công nghệ mới năm 2026: AI và tự động hóa lên ngôi</h4>
            <p>
              Các doanh nghiệp đang đẩy mạnh ứng dụng AI Agent vào quy trình vận hành và tiếp thị...
            </p>
          </div>
          <div className="audience-ad-card">
            <div className="audience-ad-topbar">
              <span>Quảng cáo · {props.brandName}</span>
              <small>AdChoices ⓘ</small>
            </div>
            <div className="social-media-frame social-media-4x5">{props.media}</div>
            <div className="audience-ad-dark-footer">{props.footer}</div>
          </div>
          <p className="audience-article-outro" aria-hidden="true">
            Nhiều chuyên gia nhận định việc tối ưu hóa dữ liệu khách hàng sẽ quyết định tăng trưởng...
          </p>
        </article>
      </div>
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function FacebookInStreamPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-facebook social-facebook-instream">
      <div className="facebook-instream-shell">
        <div className="facebook-instream-host-header" aria-hidden="true">
          <span className="organic-avatar">K</span>
          <div>
            <strong>Kênh Giải Trí Official</strong>
            <small>Đang phát video · 12K người xem</small>
          </div>
        </div>
        <div className="facebook-instream-player">
          {props.media}
          <span className="facebook-instream-sponsored">{t.adBreak}</span>
          <span className="facebook-instream-continue">Video sẽ tiếp tục sau quảng cáo</span>
        </div>
        {props.videoTimeline}
        <div className="facebook-instream-ad-bar">
          <div className="social-card-head">{props.identity}</div>
          <Caption {...props} />
          {props.footer}
        </div>
        <FacebookFooterMetrics props={props} />
        {props.audio}
      </div>
    </Root>
  )
}

function InstagramPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-instagram">
      <div className="instagram-appbar" aria-hidden="true">
        <span className="instagram-wordmark">Instagram</span>
        <span className="instagram-app-icons">
          <span>♡</span>
          <span>✉</span>
        </span>
      </div>
      <div className="instagram-post">
        <div className="social-card-head">
          {props.identity}
          <span className="social-kebab" aria-label="Display options">
            •••
          </span>
        </div>
        <div className="social-media-frame social-media-4x5">{props.media}</div>
        {props.videoTimeline}
        {props.footer}
        <div className="instagram-actions">
          <span>
            <span>♡</span>
            <span>💬</span>
            <span>↗</span>
          </span>
          <span>🔖</span>
        </div>
        <strong className="instagram-likes">
          {props.counts.likes} {t.likes}
        </strong>
        <Caption {...props} showAuthor />
        <small className="instagram-comments">
          {t.viewAll} {props.counts.comments} {t.comments}
        </small>
        {props.audio}
      </div>
    </Root>
  )
}

function ThreadsPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-threads">
      <div className="threads-appbar" aria-hidden="true">
        <PlatformLogo groupId="threads" label="Threads" size={22} />
      </div>
      <div className="threads-composer-bar" aria-hidden="true">
        <span className="organic-avatar">b</span>
        <span>Có gì mới?</span>
      </div>
      <div className="threads-thread">
        <div className="threads-line" aria-hidden="true" />
        <div className="threads-avatar-slot">{props.identity}</div>
        <div className="threads-body">
          <div className="threads-meta">
            <strong>{props.accountName}</strong>
            <span>{t.sponsored}</span>
            <span className="threads-more">•••</span>
          </div>
          <Caption {...props} />
          <div className="threads-card-attachment">
            <div className="social-media-frame social-media-4x5">{props.media}</div>
            {props.videoTimeline}
            {props.footer}
          </div>
          <div className="threads-actions" aria-label="Reference interaction controls">
            <ActionItem label={t.reply} value={props.counts.comments} />
            <ActionItem label={t.repost} value={props.counts.reposts} />
            <ActionItem label={t.like} value={props.counts.likes} />
            <ActionItem label={t.share} value={props.counts.shares} />
          </div>
          <small>
            {props.counts.likes} {t.likes} · {props.counts.comments} {t.reply}
          </small>
          {props.audio}
        </div>
      </div>
    </Root>
  )
}

function VerticalMetaPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  const isReels = props.placementVariant === 'reels' || props.placementVariant === 'banner_on_reels'
  const label = isReels ? 'Reels' : 'Stories'
  return (
    <Root props={props} className="social-vertical-meta vertical-ad">
      <div className={`social-vertical-stage meta-stage ${isReels ? 'is-reels' : 'is-stories'}`}>
        <div className="social-vertical-media">{props.media}</div>
        {!isReels && (
          <div className="meta-story-progress" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        <div className="meta-vertical-top" aria-hidden="true">
          <PlatformLogo groupId={props.groupId} label={props.title} size={18} />
          {isReels ? <strong>{label}</strong> : props.identity}
          <span className="meta-vertical-close">••• &nbsp; ✕</span>
        </div>
        {props.verticalChrome}
        {isReels && (
          <div className="meta-reels-rail">
            <ActionItem label="♡" value={props.counts.likes} />
            <ActionItem label="💬" value={props.counts.comments} />
            <ActionItem label="↻" value={props.counts.reposts} />
            <ActionItem label="↗" value={props.counts.shares} />
          </div>
        )}
        <div className="meta-vertical-caption">
          {props.identity}
          <p>{props.primaryText}</p>
          {props.footer}
        </div>
        {!isReels && (
          <div className="meta-vertical-reply" aria-label={`${t.reply}: ${props.accountName}`}>
            {t.replyMessage}
          </div>
        )}
      </div>
      {isReels && <ReelsNavigation locale={props.locale} />}
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function MetaReelsBannerPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-vertical-meta social-reels-banner vertical-ad">
      <div className="social-vertical-stage meta-stage is-reels is-banner-on-reels">
        <div className="meta-ambient-reel" aria-hidden="true">
          <div className="meta-ambient-creator" />
          <div className="meta-ambient-creator-info">
            <strong>@creator_official</strong>
            <span>Video nội dung của nhà sáng tạo trên Reels...</span>
            <small>♫ Âm thanh gốc - Creator</small>
          </div>
        </div>
        <div className="meta-vertical-top" aria-hidden="true">
          <PlatformLogo groupId={props.groupId} label={props.title} size={18} />
          <strong>Reels</strong>
        </div>
        {props.verticalChrome}
        <div className="meta-reels-rail">
          <ActionItem label="♡" value={props.counts.likes} />
          <ActionItem label="💬" value={props.counts.comments} />
          <ActionItem label="↗" value={props.counts.shares} />
        </div>
        <div className="meta-reels-banner-slot" aria-label={`${props.title} banner preview`}>
          <div className="meta-reels-banner-thumb">{props.media}</div>
          <div className="meta-reels-banner-copy">
            <strong>{props.headline}</strong>
            <small>
              {t.sponsored} · {props.brandName}
            </small>
          </div>
          <span className="meta-reels-banner-cta">{props.cta}</span>
          <span className="meta-reels-banner-dismiss">✕</span>
        </div>
        <div className="meta-vertical-caption">
          {props.identity}
          <p>{props.primaryText}</p>
          {props.footer}
        </div>
      </div>
      <ReelsNavigation locale={props.locale} />
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function TikTokPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  const isTopView = props.profileId === 'tiktok.topview' || props.profileId === 'tt_topview'
  return (
    <Root props={props} className="social-tiktok vertical-ad">
      <div className="social-vertical-stage tiktok-stage">
        <div className="social-vertical-media">{props.media}</div>
        {isTopView && (
          <div className="tiktok-topview-badges" aria-hidden="true">
            <span className="tiktok-topview-tag">TopView</span>
            <span className="tiktok-topview-skip">{t.skip} quảng cáo ›</span>
          </div>
        )}
        <div className="tiktok-topbar" aria-hidden="true">
          <span>{t.live}</span>
          <span>{t.following}</span>
          <strong>{t.forYou}</strong>
          <span>🔍</span>
        </div>
        {props.verticalChrome}
        <div className="tiktok-rail">
          <span className="tiktok-avatar">{props.identity}</span>
          <ActionItem label="♥" value={props.counts.likes} />
          <ActionItem label="💬" value={props.counts.comments} />
          <ActionItem label="🔖" value={props.counts.saves} />
          <ActionItem label="↗" value={props.counts.shares} />
          <span className="tiktok-disc" aria-hidden="true" />
        </div>
        <div className="tiktok-caption">
          <strong>@{props.accountName.replace(/^@/, '')}</strong>
          <small>{t.sponsored}</small>
          <p>{props.primaryText}</p>
          {props.footer}
          <span className="tiktok-music">
            ♫ {t.originalSound} - {props.brandName}
          </span>
        </div>
      </div>
      <div className="tiktok-bottom-nav" aria-hidden="true">
        <span>{t.home}</span>
        <span>{t.friends}</span>
        <span>+</span>
        <span>{t.inbox}</span>
        <span>{t.profile}</span>
      </div>
      {props.videoTimeline}
      {props.audio}
    </Root>
  )
}

function ReelsNavigation({ locale }: { locale: SocialPreviewLocale }) {
  const t = labels(locale)
  return (
    <div className="meta-reels-bottom-nav" aria-hidden="true">
      <span>{t.home}</span>
      <strong>Reels</strong>
      <span>+</span>
      <span>{t.search}</span>
      <span>{t.profile}</span>
    </div>
  )
}

function ZaloPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)

  if (props.placementVariant === 'zalo_video') {
    return (
      <Root props={props} className="social-zalo social-zalo-video vertical-ad">
        <div className="social-vertical-stage zalo-video-stage">
          <div className="social-vertical-media">{props.media}</div>
          <div className="zalo-video-topbar" aria-hidden="true">
            <PlatformLogo groupId="zalo" label="Zalo" size={18} />
            <strong>Zalo Video</strong>
            <span>{t.forYou}</span>
          </div>
          <div className="tiktok-rail">
            <ActionItem label="♥" value={props.counts.likes} />
            <ActionItem label="💬" value={props.counts.comments} />
            <ActionItem label="↗" value={props.counts.shares} />
          </div>
          <div className="tiktok-caption zalo-video-caption">
            <div className="zalo-oa-inline">
              <strong>{props.brandName}</strong>
              <span className="zalo-oa-badge">OA</span>
            </div>
            <small>{t.sponsored}</small>
            <p>{props.primaryText}</p>
            {props.footer}
          </div>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  if (props.placementVariant === 'zalo_message') {
    return (
      <Root props={props} className="social-zalo social-zalo-message">
        <div className="zalo-chat-header" aria-hidden="true">
          <span className="zalo-back">←</span>
          <div className="zalo-chat-oa-title">
            <strong>
              {props.brandName} <i className="zalo-oa-badge">OA</i>
            </strong>
            <small>Official Account · Đã xác thực</small>
          </div>
          <span>☰</span>
        </div>
        <div className="zalo-chat-body">
          <div className="zalo-chat-sponsored-pill">Tin nhắn được tài trợ từ Official Account</div>
          <div className="zalo-chat-card">
            <div className="social-media-frame">{props.media}</div>
            <div className="zalo-chat-card-copy">
              <strong>{props.headline}</strong>
              <p>{props.primaryText}</p>
              <small>{props.description}</small>
            </div>
            <div className="zalo-chat-buttons">
              <span className="primary">{props.cta}</span>
              <span>Tư vấn ngay</span>
              <span>Xem bảng giá</span>
            </div>
          </div>
        </div>
        <div className="zalo-chat-inputbar" aria-hidden="true">
          <span>Nhập tin nhắn...</span>
          <strong>Gửi</strong>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  if (props.placementVariant === 'zalo_commerce') {
    return (
      <Root props={props} className="social-zalo social-zalo-commerce">
        <div className="zalo-appbar" aria-hidden="true">
          <PlatformLogo groupId="zalo" label="Zalo" size={20} />
          <span>{t.search} trên Zalo Shop</span>
        </div>
        <div className="zalo-card zalo-commerce-card">
          <div className="social-card-head">
            {props.identity}
            <span className="zalo-oa-badge">Zalo Shop</span>
          </div>
          <div className="social-media-frame">{props.media}</div>
          <div className="zalo-commerce-details">
            <span className="zalo-commerce-tag">{t.sponsored} · Sản phẩm chính hãng</span>
            <strong>{props.headline}</strong>
            <p className="zalo-commerce-price">Liên hệ nhận ưu đãi · {props.domain}</p>
            <Caption {...props} />
          </div>
          {props.footer}
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  if (props.placementVariant === 'zalo_article') {
    return (
      <Root props={props} className="social-zalo social-zalo-article">
        <div className="zalo-article-header" aria-hidden="true">
          <strong>BÁO MỚI · ZALO KHÁM PHÁ</strong>
          <span>Thời sự · Công nghệ · Kinh doanh</span>
        </div>
        <div className="zalo-article-list">
          <div className="zalo-article-organic" aria-hidden="true">
            <div>
              <strong>Doanh nghiệp Việt tăng tốc chuyển đổi số cùng AI trong năm 2026</strong>
              <small>Báo Mới · 15 phút trước</small>
            </div>
            <span className="zalo-article-thumb" />
          </div>
          <div className="zalo-card zalo-article-sponsored">
            <div className="zalo-article-sponsored-head">
              <span>
                {t.sponsored} bởi <strong>{props.brandName}</strong>
              </span>
              <span className="zalo-oa-badge">OA</span>
            </div>
            <div className="social-media-frame">{props.media}</div>
            <div className="zalo-article-sponsored-body">
              <strong>{props.headline}</strong>
              <Caption {...props} />
            </div>
            {props.footer}
          </div>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  if (props.placementVariant === 'zalo_display') {
    const isDesktop = ['zalo.display.masthead', 'zalo.display.halfpage', 'zalo.display.medium_rectangle'].includes(
      props.profileId,
    )
    const isSidebar = ['zalo.display.halfpage', 'zalo.display.medium_rectangle'].includes(
      props.profileId,
    )
    return (
      <Root props={props} className="social-zalo social-zalo-display">
        <div className="zalo-display-publisher">
          <header className="zalo-display-header" aria-hidden="true">
            <strong>ZING / BÁO MỚI · ZALO NETWORK</strong>
            <span>{props.title}</span>
          </header>
          {!isSidebar && (
            <div className="zalo-display-slot-banner">
              <div className="zalo-display-slot-label">
                <span>Quảng cáo Zalo Network · {props.title}</span>
                <small>{props.brandName}</small>
              </div>
              <div className="social-media-frame">{props.media}</div>
              {props.footer}
            </div>
          )}
          <div className={`zalo-display-body ${isDesktop && isSidebar ? 'has-sidebar' : ''}`}>
            <div className="zalo-display-editorial" aria-hidden="true">
              <h4>Toàn cảnh thị trường công nghệ & truyền thông số Việt Nam</h4>
              <p>
                Hệ sinh thái Zalo Network kết nối hàng chục triệu độc giả mỗi ngày trên Báo Mới,
                Zing MP3 và các trang tin điện tử hàng đầu.
              </p>
              <div className="zalo-display-skeleton" />
              <div className="zalo-display-skeleton short" />
            </div>
            {isSidebar && (
              <aside className="zalo-display-sidebar-slot">
                <div className="zalo-display-slot-label">
                  <span>{props.title}</span>
                  <small>{t.sponsored}</small>
                </div>
                <div className="social-media-frame">{props.media}</div>
                {props.footer}
              </aside>
            )}
          </div>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  return (
    <Root props={props} className="social-zalo">
      <div className="zalo-appbar" aria-hidden="true">
        <PlatformLogo groupId="zalo" label="Zalo" size={20} />
        <span>{t.search}</span>
      </div>
      <div className="zalo-tabs" aria-hidden="true">
        <strong>{t.journal}</strong>
        <span>Khám phá</span>
        <span>Video</span>
      </div>
      <div className="zalo-composer" aria-hidden="true">
        <span>Hôm nay bạn thế nào?</span>
        <div className="zalo-composer-chips">
          <span>Ảnh</span>
          <span>Video</span>
          <span>Album</span>
        </div>
      </div>
      <div className="zalo-card">
        <div className="social-card-head">
          {props.identity}
          <span className="zalo-oa-badge">OA</span>
        </div>
        <Caption {...props} />
        <div className="social-media-frame social-media-4x5">{props.media}</div>
        {props.videoTimeline}
        {props.footer}
        <div className="zalo-metrics">
          <span>
            ♥ {props.counts.reactions} {t.interested}
          </span>
          <span>
            {props.counts.comments} {t.comments} · {props.counts.shares} {t.shares}
          </span>
        </div>
        <div className="zalo-actions">
          <ActionItem label={t.interested} />
          <ActionItem label={t.comment} />
          <ActionItem label={t.share} />
        </div>
        {props.audio}
      </div>
      <div className="zalo-bottom-nav" aria-hidden="true">
        <span>Tin nhắn</span>
        <span>Danh bạ</span>
        <span>Khám phá</span>
        <strong>{t.journal}</strong>
        <span>Cá nhân</span>
      </div>
    </Root>
  )
}

function LinkedInPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)

  if (props.placementVariant === 'linkedin_message') {
    return (
      <Root props={props} className="social-linkedin social-linkedin-message">
        <div className="linkedin-desktop-nav" aria-hidden="true">
          <div className="linkedin-nav-left">
            <span className="linkedin-in-badge">in</span>
            <span className="linkedin-search-pill">{t.search}</span>
          </div>
          <div className="linkedin-nav-links">
            <span>{t.home}</span>
            <span>{t.network}</span>
            <span>{t.jobs}</span>
            <strong className="active">Tin nhắn</strong>
            <span>{t.notifications}</span>
          </div>
        </div>
        <div className="linkedin-messaging-shell">
          <aside className="linkedin-inbox-list" aria-hidden="true">
            <div className="linkedin-inbox-head">Tin nhắn</div>
            <div className="linkedin-inbox-item active">
              <span className="linkedin-company-avatar">{props.brandName.slice(0, 1) || 'L'}</span>
              <div>
                <strong>{props.brandName}</strong>
                <small>{t.promoted} · {props.headline}</small>
              </div>
            </div>
            <div className="linkedin-inbox-item">
              <span className="linkedin-company-avatar muted">M</span>
              <div>
                <strong>Minh Nguyễn · B2B Growth</strong>
                <small>Cảm ơn bạn đã kết nối...</small>
              </div>
            </div>
          </aside>
          <div className="linkedin-message-thread">
            <div className="linkedin-message-thread-head">
              <div>
                <strong>{props.brandName}</strong>
                <small>{t.promoted} · LinkedIn Message Ad</small>
              </div>
              <span>•••</span>
            </div>
            <div className="linkedin-message-body">
              <div className="linkedin-message-subject">{props.headline}</div>
              <p className="linkedin-message-greeting">Xin chào bạn,</p>
              <p className="linkedin-message-text">{props.primaryText}</p>
              <p className="linkedin-message-desc">{props.description}</p>
              <div className="linkedin-message-cta-row">
                <span className="linkedin-solid-cta">{props.cta}</span>
              </div>
            </div>
          </div>
          <aside className="linkedin-message-companion">
            <small>{t.promoted} · 300×250</small>
            <div className="linkedin-companion-media">{props.media}</div>
            <strong>{props.brandName}</strong>
            <span>{props.domain}</span>
          </aside>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  if (props.placementVariant === 'linkedin_right_rail') {
    return (
      <Root props={props} className="social-linkedin social-linkedin-right-rail">
        <div className="linkedin-desktop-nav" aria-hidden="true">
          <div className="linkedin-nav-left">
            <span className="linkedin-in-badge">in</span>
            <span className="linkedin-search-pill">{t.search}</span>
          </div>
          <div className="linkedin-nav-links">
            <strong className="active">{t.home}</strong>
            <span>{t.network}</span>
            <span>{t.jobs}</span>
            <span>Tin nhắn</span>
            <span>{t.notifications}</span>
          </div>
        </div>
        <div className="linkedin-desktop-grid right-rail-focus">
          <div className="linkedin-desktop-main-placeholder" aria-hidden="true">
            <div className="linkedin-composer-box">Bắt đầu bài viết trên LinkedIn...</div>
            <div className="linkedin-organic-post">
              <strong>Báo cáo Tăng trưởng B2B & MarTech Đông Nam Á 2026</strong>
              <p>Các giải pháp AI Agent giúp đội ngũ Sales & Marketing rút ngắn 40% chu kỳ chốt đơn...</p>
              <div className="linkedin-organic-skeleton" />
            </div>
          </div>
          <aside className="linkedin-right-rail-column">
            <div className="linkedin-spotlight-card">
              <div className="linkedin-spotlight-top">
                <small>{t.promoted}</small>
                <span>•••</span>
              </div>
              <p className="linkedin-spotlight-sub">{props.description}</p>
              <div className="linkedin-spotlight-avatars">
                <span className="linkedin-member-circle">Bạn</span>
                <div className="linkedin-spotlight-media">{props.media}</div>
              </div>
              <strong>{props.headline}</strong>
              <p className="linkedin-spotlight-copy">{props.primaryText}</p>
              <span className="linkedin-outline-cta">{props.cta}</span>
            </div>
            <div className="linkedin-text-ad-card">
              <div className="linkedin-spotlight-top">
                <small>Text Ad · {t.promoted}</small>
              </div>
              <div className="linkedin-text-ad-row">
                <span className="linkedin-company-avatar">{props.brandName.slice(0, 1) || 'L'}</span>
                <div>
                  <strong>{props.headline}</strong>
                  <p>{props.description}</p>
                  <small>{props.domain}</small>
                </div>
              </div>
            </div>
          </aside>
        </div>
        {props.videoTimeline}
        {props.audio}
      </Root>
    )
  }

  const isDesktop = props.placementVariant === 'linkedin_feed_desktop'

  const feedCard = (
    <div className="linkedin-card">
      <div className="linkedin-card-head">
        <div className="linkedin-identity-wrap">
          {props.identity}
          <small className="linkedin-followers">
            14.820 {t.followers} · {t.promoted} · 🌐
          </small>
        </div>
        <span className="linkedin-follow-btn">+ {t.follow}</span>
      </div>
      <Caption {...props} />
      <div className="social-media-frame social-media-4x5">{props.media}</div>
      {props.videoTimeline}
      {props.footer}
      <div className="linkedin-metrics">
        <span>👍 💡 👏 {props.counts.reactions}</span>
        <span>
          {props.counts.comments} {t.comments} · {props.counts.reposts} {t.repost.toLowerCase()}
        </span>
      </div>
      <div className="linkedin-actions">
        <ActionItem label={t.like} />
        <ActionItem label={t.comment} />
        <ActionItem label={t.repost} />
        <ActionItem label={t.send} />
      </div>
      {props.audio}
    </div>
  )

  if (isDesktop) {
    return (
      <Root props={props} className="social-linkedin social-linkedin-desktop">
        <div className="linkedin-desktop-nav" aria-hidden="true">
          <div className="linkedin-nav-left">
            <span className="linkedin-in-badge">in</span>
            <span className="linkedin-search-pill">{t.search}</span>
          </div>
          <div className="linkedin-nav-links">
            <strong className="active">{t.home}</strong>
            <span>{t.network}</span>
            <span>{t.jobs}</span>
            <span>Tin nhắn</span>
            <span>{t.notifications}</span>
          </div>
        </div>
        <div className="linkedin-desktop-grid">
          <aside className="linkedin-left-profile" aria-hidden="true">
            <div className="linkedin-profile-banner" />
            <span className="linkedin-member-circle">M</span>
            <strong>Chuyên gia Marketing</strong>
            <small>Growth & Performance Lead</small>
            <div className="linkedin-profile-stats">
              <span>Lượt xem hồ sơ</span>
              <strong>128</strong>
            </div>
          </aside>
          <div className="linkedin-center-feed">
            <div className="linkedin-composer-box" aria-hidden="true">
              Bắt đầu bài viết...
            </div>
            {feedCard}
          </div>
          <aside className="linkedin-right-news" aria-hidden="true">
            <strong>LinkedIn Tin tức</strong>
            <span>• Xu hướng AI Agent trong B2B</span>
            <span>• Báo cáo lương Marketing 2026</span>
            <span>• Tối ưu chuyển đổi đa kênh</span>
          </aside>
        </div>
      </Root>
    )
  }

  return (
    <Root props={props} className="social-linkedin social-linkedin-mobile">
      <div className="linkedin-mobile-appbar" aria-hidden="true">
        <span className="linkedin-in-badge">in</span>
        <span className="linkedin-search-pill">{t.search}</span>
        <span>✉</span>
      </div>
      {feedCard}
      <div className="linkedin-mobile-bottom-nav" aria-hidden="true">
        <strong>{t.home}</strong>
        <span>{t.network}</span>
        <span>Đăng</span>
        <span>{t.notifications}</span>
        <span>{t.jobs}</span>
      </div>
    </Root>
  )
}

function YouTubeInStreamPreview(props: ResolvedSocialProps) {
  const t = labels(props.locale)
  return (
    <Root props={props} className="social-youtube-instream">
      <div className="youtube-watch-shell">
        <div className="youtube-player">
          {props.media}
          <span className="youtube-sponsored">{t.adBreak}</span>
          <span className="youtube-skip">{t.skip} ›</span>
        </div>
        {props.videoTimeline}
        <div className="youtube-watch-meta">
          <div>
            {props.identity}
            <strong>{props.brandName}</strong>
            <span>{t.sponsored}</span>
          </div>
          <span className="youtube-subscribe">{t.subscribe}</span>
        </div>
        {props.footer}
        <div className="youtube-actions">
          <ActionItem label={t.like} value={props.counts.likes} />
          <ActionItem label={t.share} />
          <ActionItem label={t.remix} />
          <ActionItem label={t.save} />
          <ActionItem label={t.comment} value={props.counts.comments} />
        </div>
      </div>
      {props.audio}
    </Root>
  )
}
