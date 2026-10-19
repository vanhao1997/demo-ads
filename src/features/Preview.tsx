import { useEffect, useId, useRef, useState } from 'react'
import type { CopyField, CopyOverride, EditorDraft } from './editorModel'
import { resolvedCopy, resolvedRenderSettings } from './editorModel'
import type { UiProfile } from './uiTypes'
import { SocialPreview } from './SocialPreview'
import { ContextPreview } from './ContextPreview'
import { OcclusionOverlay } from './OcclusionOverlay'
import {
  DEFAULT_PRESENTATION,
  presentationCta,
  type PreviewPresentation,
} from './previewPresentation'

const formatTimestamp = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  const minutes = Math.floor(safeSeconds / 60)
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`
}

const hostnameFromUrl = (url: string, fallback = 'Tên miền đích') => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.hostname : 'URL chưa hợp lệ'
  } catch {
    return fallback
  }
}

const previewFormQuestions = (draft: EditorDraft) => (draft.form.questions ?? []).slice(0, 10)

const compactStrings = (values: string[]) =>
  values.map((value) => value.trim()).filter((value) => value.length > 0)

const sourceDefaults = {
  brandName: 'P2P Digital',
  handle: '@p2pdigital',
  primaryText:
    'Chia sẻ về Digital Marketing, AI Automation, AI Agent và Marketing Operations giúp marketer, doanh nghiệp tối ưu tăng trưởng và vận hành.',
  headline: 'Tối ưu chiến dịch quảng cáo đa kênh cùng P2P Digital',
  description: 'Khám phá giải pháp tại p2pdigital.vn',
  destinationUrl: 'https://p2pdigital.vn/',
} as const

const rotatePick = (values: string[], start: number, count: number) => {
  const safeValues = compactStrings(values)
  if (!safeValues.length) return []
  return Array.from(
    { length: Math.min(count, safeValues.length) },
    (_, offset) => safeValues[(start + offset) % safeValues.length],
  )
}

export function buildSearchSamples(headlines: string[], descriptions: string[]) {
  const safeHeadlines = compactStrings(headlines)
  const safeDescriptions = compactStrings(descriptions)
  const sampleCount = Math.max(1, safeHeadlines.length, safeDescriptions.length)
  return Array.from({ length: sampleCount }, (_, index) => ({
    index,
    headlines: rotatePick(safeHeadlines, index, 3),
    descriptions: rotatePick(safeDescriptions, index, 2),
  }))
}

const resolvedVariants = (values: string[], resolvedFirst: string, override?: CopyOverride) =>
  values.length || override ? [resolvedFirst, ...values.slice(1)] : []

export function Preview({
  draft,
  profile,
  safeZone,
  fit,
  focalX,
  focalY,
  formStage = 'form',
  presentation = DEFAULT_PRESENTATION,
}: {
  draft: EditorDraft
  profile: UiProfile
  safeZone?: boolean
  fit?: 'cover' | 'contain'
  focalX?: number
  focalY?: number
  formStage?: 'creative' | 'form'
  presentation?: PreviewPresentation
}) {
  const { locale, appChrome, captionMask, topViewPhase } = presentation
  const sponsored = locale === 'vi' ? 'Được tài trợ' : 'Sponsored'
  const [card, setCard] = useState(0)
  const [searchSample, setSearchSample] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [videoTime, setVideoTime] = useState({ current: 0, duration: 0 })
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const formId = useId()
  const savedSettings = resolvedRenderSettings(draft, profile.id)
  const activeFit = fit ?? savedSettings.fit
  const activeSafeZone = safeZone ?? savedSettings.safeZone
  const activeFocalX = Math.min(100, Math.max(0, focalX ?? savedSettings.focalX))
  const activeFocalY = Math.min(100, Math.max(0, focalY ?? savedSettings.focalY))
  const objectPosition = `${activeFocalX}% ${activeFocalY}%`
  const effectiveRenderer =
    profile.renderer === 'form' && formStage === 'creative' ? 'feed' : profile.renderer
  const copy = resolvedCopy(draft, profile.id)
  const fieldText = (field: CopyField, placeholder: string) =>
    copy[field] ||
    (draft.overrides[profile.id]?.[field]?.mode === 'clear'
      ? ''
      : field === 'brandName'
        ? sourceDefaults.brandName
        : field === 'primaryText'
          ? sourceDefaults.primaryText
          : field === 'headline'
            ? sourceDefaults.headline
            : field === 'description'
              ? sourceDefaults.description
              : field === 'destinationUrl'
                ? sourceDefaults.destinationUrl
                : placeholder)
  const media = draft.assets.filter((asset) => asset.role === 'creative')
  const logo =
    draft.assets.find(
      (asset) => asset.role === (effectiveRenderer === 'form' ? 'avatar' : 'logo'),
    ) ??
    (effectiveRenderer === 'form'
      ? undefined
      : draft.assets.find((asset) => asset.role === 'avatar'))
  const cover = draft.assets.find((asset) => asset.role === 'form_cover')
  const audio = draft.assets.find((asset) => asset.kind === 'audio')
  const formQuestions = previewFormQuestions(draft)
  const activeCard = Math.min(card, Math.max(0, media.length - 1))
  const item = media[activeCard]
  const activeCardDetail =
    draft.composition === 'carousel' && item ? draft.cardDetails?.[item.id] : undefined
  const tiktokStandardCarousel =
    profile.id === 'tiktok.in_feed.standard_carousel' ||
    (profile.groupId === 'tiktok' && draft.composition === 'carousel')
  const supportedCardDetail = !tiktokStandardCarousel ? activeCardDetail : undefined
  const activeDestinationUrl =
    supportedCardDetail?.url || fieldText('destinationUrl', sourceDefaults.destinationUrl)
  const activeDomain = hostnameFromUrl(activeDestinationUrl, 'Tên miền card')
  const sharedDomain = hostnameFromUrl(fieldText('destinationUrl', sourceDefaults.destinationUrl))
  const activeHeadline = supportedCardDetail?.title || fieldText('headline', 'Tiêu đề quảng cáo')
  const activeDescription =
    supportedCardDetail?.description || fieldText('description', 'Mô tả quảng cáo')
  const activeVideoDuration = item?.kind === 'video' ? (item.durationMs ?? 0) / 1000 : 0
  const override = draft.overrides[profile.id]
  const searchHeadlines = compactStrings(
    resolvedVariants(draft.copy.headlines, copy.headline, override?.headline),
  )
  const searchDescriptions = compactStrings(
    resolvedVariants(draft.copy.descriptions, copy.description, override?.description),
  )
  const fallbackHeadline = fieldText('headline', 'Tiêu đề quảng cáo')
  const fallbackDescription = fieldText('description', 'Mô tả quảng cáo')
  const searchSamples = buildSearchSamples(
    searchHeadlines.length ? searchHeadlines : fallbackHeadline ? [fallbackHeadline] : [],
    searchDescriptions.length
      ? searchDescriptions
      : fallbackDescription
        ? [fallbackDescription]
        : [],
  )
  const activeSearchSample = Math.min(searchSample, Math.max(0, searchSamples.length - 1))
  const displayedVideoDuration = videoTime.duration || activeVideoDuration
  const displayedVideoTime = Math.min(
    videoTime.current,
    displayedVideoDuration || videoTime.current,
  )
  const cardUrlUnsupported =
    tiktokStandardCarousel && !!activeCardDetail?.url && activeCardDetail.url.trim().length > 0
  useEffect(() => {
    setCard((current) => Math.min(current, Math.max(0, media.length - 1)))
  }, [media.length])
  useEffect(() => {
    setSearchSample((current) => Math.min(current, Math.max(0, searchSamples.length - 1)))
  }, [searchSamples.length])
  useEffect(() => {
    setVideoTime({ current: 0, duration: activeVideoDuration })
    const video = videoRef.current
    if (video && Number.isFinite(video.currentTime)) {
      try {
        video.currentTime = 0
      } catch {
        // Some browsers reject seeking before metadata is ready.
      }
    }
  }, [item?.id, activeVideoDuration])
  const syncVideoTime = (node = videoRef.current) => {
    if (!node) return
    const duration = Number.isFinite(node.duration) ? node.duration : activeVideoDuration
    const current = Number.isFinite(node.currentTime) ? node.currentTime : 0
    setVideoTime({
      current: duration ? Math.min(current, duration) : current,
      duration,
    })
  }
  const restoreVideoTime = (node: HTMLVideoElement) => {
    const duration = Number.isFinite(node.duration) ? node.duration : activeVideoDuration
    const current = Math.max(0, Math.min(videoTime.current, duration || videoTime.current))
    // Placement chrome can recreate the video node without changing the selected asset.
    try {
      node.currentTime = current
    } catch {
      // The timeline remains usable if the browser cannot seek during metadata loading.
    }
    setVideoTime({ current, duration })
  }
  const seekVideo = (seconds: number) => {
    const video = videoRef.current
    const max = videoTime.duration || activeVideoDuration
    const next = Math.max(0, Math.min(seconds, max || seconds))
    if (video && Number.isFinite(next)) {
      try {
        video.currentTime = next
      } catch {
        // Keep preview state usable even when browser blocks early seek.
      }
    }
    setVideoTime((current) => ({ ...current, current: next }))
  }
  const rootData = {
    'data-renderer': effectiveRenderer,
    'data-preview-locale': locale,
    'data-app-chrome': String(appChrome),
    'data-caption-mask': String(captionMask),
    'data-topview-phase': topViewPhase,
    'data-preview-card': draft.composition === 'carousel' ? String(activeCard + 1) : undefined,
    'data-preview-combination':
      effectiveRenderer === 'search' ? String(activeSearchSample + 1) : undefined,
    'data-video-state': item?.kind === 'video' ? 'metadata' : undefined,
    'data-video-time-ms':
      item?.kind === 'video' ? String(Math.round(displayedVideoTime * 1000)) : undefined,
  }
  const rootGroupClass = `group-${profile.groupId}`
  const vertical = effectiveRenderer === 'vertical'
  const mediaRatio =
    profile.id === 'facebook.marketplace'
      ? 1
      : ['facebook.in_stream', 'facebook.search_results'].includes(profile.id)
        ? 16 / 9
        : profile.id === 'threads.feed' || profile.id === 'instagram.feed'
          ? 4 / 5
          : profile.ratio
  const placeholderRatio =
    vertical || Math.abs(mediaRatio - 9 / 16) < 0.01
      ? '9:16'
      : Math.abs(mediaRatio - 4 / 5) < 0.01
        ? '4:5'
        : Math.abs(mediaRatio - 16 / 9) < 0.01
          ? '16:9'
          : Math.abs(mediaRatio - 1) < 0.01
            ? '1:1'
            : 'theo vị trí'
  const showVideoTimeline = item?.kind === 'video'
  const videoTimeline = showVideoTimeline ? (
    <div className="video-timeline" aria-label="Điều khiển thời điểm preview video">
      <label htmlFor={`${formId}-video-time`}>
        Thời điểm preview video
        <strong>
          {formatTimestamp(displayedVideoTime)} / {formatTimestamp(displayedVideoDuration)}
        </strong>
      </label>
      <input
        id={`${formId}-video-time`}
        type="range"
        min="0"
        max={Math.max(0, displayedVideoDuration)}
        step="0.1"
        value={displayedVideoTime}
        disabled={!displayedVideoDuration}
        aria-label="Tua thời điểm preview video"
        onChange={(event) => seekVideo(Number(event.currentTarget.value))}
      />
    </div>
  ) : null
  const showMedia = (asset = item) =>
    asset ? (
      asset.kind === 'image' ? (
        <img
          src={asset.url}
          alt={asset.name}
          style={{ objectFit: activeFit, objectPosition }}
          data-media-kind="image"
        />
      ) : asset.kind === 'video' ? (
        <video
          ref={asset.id === item?.id ? videoRef : undefined}
          controls
          playsInline
          preload="metadata"
          src={asset.url}
          style={{ objectFit: activeFit, objectPosition }}
          data-media-kind="video"
          data-video-state="metadata"
          data-video-time-ms={
            asset.id === item?.id ? Math.round(displayedVideoTime * 1000) : undefined
          }
          onLoadedMetadata={(event) => restoreVideoTime(event.currentTarget)}
          onDurationChange={(event) => restoreVideoTime(event.currentTarget)}
          onTimeUpdate={(event) => syncVideoTime(event.currentTarget)}
        />
      ) : null
    ) : (
      <div
        className="media-placeholder source-like-placeholder"
        aria-label={`Chưa có ảnh hoặc video · tỷ lệ ${placeholderRatio}`}
      >
        <strong className="placeholder-ratio-pill">{placeholderRatio}</strong>
        <span>Chưa có ảnh hoặc video</span>
        <small>Tải ảnh hoặc video lên để xem trước · {placeholderRatio}</small>
      </div>
    )
  const identityName =
    effectiveRenderer === 'form'
      ? draft.form.oaName || sourceDefaults.brandName
      : fieldText('brandName', sourceDefaults.brandName)
  const identity = (
    <div className="ad-identity">
      <div className="avatar">
        {logo ? <img src={logo.url} alt="Logo" /> : <span>{identityName.slice(0, 1) || 'A'}</span>}
      </div>
      <div>
        <strong>{identityName}</strong>
        <small>{sponsored} · 🌐</small>
      </div>
    </div>
  )

  const contextual = ['youtube', 'google-display', 'chatgpt', 'google-search'].includes(
    profile.groupId,
  )
  const creativeMedia = (
    <div
      className="ad-media"
      style={{ aspectRatio: vertical ? '9 / 16' : String(mediaRatio) }}
      data-preview-card={draft.composition === 'carousel' ? String(activeCard + 1) : undefined}
    >
      {draft.composition === 'multi_image_grid' && media.length > 1 ? (
        <div className="album-grid">
          {media.slice(0, 4).map((asset) => (
            <div key={asset.id}>{showMedia(asset)}</div>
          ))}
        </div>
      ) : (
        showMedia()
      )}
      {draft.composition === 'carousel' && (
        <div className="carousel-controls">
          <button
            aria-label="Card trước"
            disabled={activeCard === 0}
            onClick={() => setCard(Math.max(0, activeCard - 1))}
          >
            ‹
          </button>
          <span>
            {Math.min(activeCard + 1, Math.max(1, media.length))} / {Math.max(1, media.length)}
          </span>
          <button
            aria-label="Card tiếp theo"
            disabled={activeCard >= media.length - 1}
            onClick={() => setCard(Math.min(media.length - 1, activeCard + 1))}
          >
            ›
          </button>
        </div>
      )}
      {vertical && activeSafeZone && (
        <OcclusionOverlay profileId={profile.id} captionMask={captionMask} locale={locale} />
      )}
    </div>
  )
  const cta = presentationCta(copy.cta, locale)
  const footer = (
    <div
      className={`ad-footer ${vertical ? 'native-vertical-footer' : ''} ${draft.composition === 'carousel' ? 'carousel-footer' : ''}`}
    >
      <div>
        <small>{tiktokStandardCarousel ? sharedDomain : activeDomain}</small>
        <strong>{activeHeadline}</strong>
        <span>{activeDescription}</span>
        {cardUrlUnsupported && (
          <span className="unsupported-composition">
            URL từng card không hỗ trợ cho TikTok Standard Carousel; đang dùng URL chung{' '}
            {sharedDomain}.
          </span>
        )}
      </div>
      {cta && <span className="ad-cta">{cta}</span>}
    </div>
  )
  const contextProps = {
    profile,
    locale,
    appChrome,
    brandName: identityName,
    accountName: draft.identity.handle || sourceDefaults.handle,
    headline: activeHeadline,
    description: activeDescription,
    primaryText: copy.primaryText,
    domain: sharedDomain,
    cta,
    media: creativeMedia,
    identity,
    videoTimeSeconds: displayedVideoTime,
    videoDurationSeconds: displayedVideoDuration || (profile.id === 'youtube.bumper' ? 6 : 15),
    videoTimeline,
  }

  if (effectiveRenderer === 'search') {
    const brandName = fieldText('brandName', 'Tên thương hiệu')
    const sample = searchSamples[activeSearchSample] ?? searchSamples[0]
    const searchTitle = sample.headlines.join(' | ')
    const searchDescription = sample.descriptions.join(' ')
    const showSearchControls = searchSamples.length > 1
    return (
      <div className={`search-ad ${rootGroupClass}`} {...rootData}>
        <ContextPreview {...contextProps}>
          <div className="search-demo">Kết quả tìm kiếm · Mẫu RSA mô phỏng</div>
          <div className="search-sample-meta" aria-live="polite">
            Mẫu {activeSearchSample + 1} / {searchSamples.length} · Không phải danh sách đầy đủ hay
            trạng thái approved
          </div>
          <small>{sponsored}</small>
          <div className="search-domain">
            <span className="favicon">{brandName.slice(0, 1) || 'A'}</span>
            <div>
              {brandName}
              <small>
                {sharedDomain}
                {draft.copy.paths
                  .filter(Boolean)
                  .map((path) => ` / ${path}`)
                  .join('')}
              </small>
            </div>
          </div>
          <h3>{searchTitle}</h3>
          <p>{searchDescription}</p>
          {showSearchControls && (
            <div className="search-sample-controls" aria-label="Duyệt tổ hợp RSA mô phỏng">
              <button
                type="button"
                aria-label="Tổ hợp RSA trước"
                disabled={activeSearchSample === 0}
                onClick={() => setSearchSample(Math.max(0, activeSearchSample - 1))}
              >
                ‹
              </button>
              <select
                aria-label="Chọn tổ hợp RSA mô phỏng"
                value={activeSearchSample}
                onChange={(event) => setSearchSample(Number(event.currentTarget.value))}
              >
                {searchSamples.map((sampleOption) => (
                  <option key={sampleOption.index} value={sampleOption.index}>
                    Mẫu {sampleOption.index + 1}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Tổ hợp RSA tiếp theo"
                disabled={activeSearchSample >= searchSamples.length - 1}
                onClick={() =>
                  setSearchSample(Math.min(searchSamples.length - 1, activeSearchSample + 1))
                }
              >
                ›
              </button>
            </div>
          )}
          <div className="search-footnote">
            Google có thể ghép asset theo nhiều cách. Preview chỉ minh họa tổ hợp mẫu; vị trí và số
            field hiển thị có thể thay đổi.
          </div>
        </ContextPreview>
      </div>
    )
  }
  if (
    effectiveRenderer === 'banner' &&
    !contextual &&
    profile.id !== 'facebook.right_column' &&
    profile.groupId !== 'zalo'
  )
    return (
      <div
        className={`banner-ad ${rootGroupClass}`}
        style={{ aspectRatio: profile.ratio }}
        {...rootData}
      >
        {showMedia()}
        <span className="banner-note">Mẫu banner · Không kéo giãn asset</span>
      </div>
    )
  if (effectiveRenderer === 'form')
    return (
      <div className={`form-ad ${rootGroupClass}`} {...rootData}>
        {cover && <img className="form-cover" src={cover.url} alt="Ảnh bìa Form" />}
        <div className="form-inner">
          {identity}
          <h3>{draft.form.title || 'Tiêu đề Form'}</h3>
          <p>{draft.form.body}</p>
          <label htmlFor={`${formId}-name`}>
            Họ và tên
            <input id={`${formId}-name`} disabled placeholder="Nguyễn Văn A" />
          </label>
          <label htmlFor={`${formId}-phone`}>
            Số điện thoại
            <input id={`${formId}-phone`} disabled placeholder="0909 xxx xxx" />
          </label>
          {formQuestions.map((question, index) => {
            const id = `${formId}-custom-${question.key || index}`
            const label = question.label || `Câu hỏi ${index + 1}`
            return (
              <label key={`${question.key}-${index}`} htmlFor={id}>
                <span>
                  {label}
                  {question.required ? <em aria-label="bắt buộc"> *</em> : null}
                </span>
                <input id={id} disabled type="text" placeholder="Câu trả lời" />
              </label>
            )
          })}
          <button type="button" className="ad-cta" disabled>
            Gửi thông tin
          </button>
          <small className="form-demo">Form mô phỏng. Không thu thập thông tin.</small>
        </div>
      </div>
    )
  if (contextual)
    return (
      <div className={`native-preview ${rootGroupClass}`} {...rootData}>
        <ContextPreview {...contextProps} />
      </div>
    )

  return (
    <div className="native-preview" {...rootData}>
      <SocialPreview
        groupId={profile.groupId}
        profileId={profile.id}
        title={profile.title}
        locale={locale}
        appChrome={appChrome}
        topViewPhase={topViewPhase}
        effectiveRenderer={effectiveRenderer}
        identity={identity}
        primaryText={copy.primaryText || sourceDefaults.primaryText}
        headline={activeHeadline}
        description={activeDescription}
        cta={cta}
        domain={tiktokStandardCarousel ? sharedDomain : activeDomain}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
        media={creativeMedia}
        footer={footer}
        videoTimeline={videoTimeline}
        brandName={identityName}
        accountName={draft.identity.handle || identityName}
        audio={
          draft.composition === 'carousel' && audio ? (
            <audio className="carousel-audio" controls src={audio.url} preload="metadata" />
          ) : null
        }
      />
    </div>
  )
}
