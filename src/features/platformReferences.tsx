import type { ReactNode } from 'react'

type PlatformReference = {
  src: string
  label: string
  note: string
}

const references: Record<string, PlatformReference> = {
  'facebook.feed': {
    src: '/reference-shots/facebook-feed.webp',
    label: 'Facebook · Bảng feed',
    note: 'Ảnh tham chiếu bạn cung cấp; dùng để đối chiếu chrome, khoảng cách và CTA.',
  },
  'facebook.video_feeds': {
    src: '/reference-shots/facebook-video-feeds.webp',
    label: 'Facebook · Video Feeds',
    note: 'Ảnh tham chiếu bạn cung cấp; giao diện feed có thể thay đổi theo phiên bản app.',
  },
  'facebook.stories': {
    src: '/reference-shots/zalo-story.webp',
    label: 'Meta · Story dọc',
    note: 'Ảnh tham chiếu bạn cung cấp; nền tảng cụ thể chưa rõ. Dùng để đối chiếu progress, avatar và CTA.',
  },
  'instagram.feed': {
    src: '/reference-shots/instagram-feed.webp',
    label: 'Instagram · Bảng feed',
    note: 'Ảnh tham chiếu bạn cung cấp; dùng để đối chiếu header, caption và action rail.',
  },
  'instagram.stories': {
    src: '/reference-shots/instagram-story.webp',
    label: 'Instagram · Stories',
    note: 'Ảnh tham chiếu bạn cung cấp; story có thể khác theo tài khoản và phiên bản app.',
  },
  'threads.feed': {
    src: '/reference-shots/threads-feed.webp',
    label: 'Threads · Bảng feed',
    note: 'Ảnh tham chiếu bạn cung cấp; dùng để đối chiếu thread card và action row.',
  },
  'tiktok.in_feed.video': {
    src: '/reference-shots/tiktok-in-feed.webp',
    label: 'TikTok · In-Feed',
    note: 'Ảnh tham chiếu bạn cung cấp; khung dọc có rail tương tác và caption phủ lên video.',
  },
  'tiktok.topview': {
    src: '/reference-shots/tiktok-topview.webp',
    label: 'TikTok · TopView',
    note: 'Ảnh tham chiếu bạn cung cấp; dùng để đối chiếu top bar, safe zone và caption.',
  },
  'zalo.native.single_image': {
    src: '/reference-shots/zalo-feed.webp',
    label: 'Zalo · Nhật ký',
    note: 'Ảnh tham chiếu bạn cung cấp; dùng để đối chiếu header xanh, tab và bài đăng native.',
  },
}

export function platformReferenceFor(profileId: string) {
  return references[profileId]
}

export function PlatformReference({ profileId }: { profileId: string }): ReactNode {
  const reference = platformReferenceFor(profileId)
  if (!reference) return null

  return (
    <details className="platform-reference" open>
      <summary>
        <span>Ảnh tham chiếu thật</span>
        <small>{reference.label}</small>
      </summary>
      <figure>
        <img src={reference.src} alt={reference.label} loading="lazy" />
        <figcaption>
          <span>{reference.note}</span>
          <a href={reference.src} target="_blank" rel="noreferrer" aria-label={`Mở ảnh ${reference.label}`}>
            Mở ảnh ↗
          </a>
        </figcaption>
      </figure>
    </details>
  )
}
