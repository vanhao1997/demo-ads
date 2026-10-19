import { useEffect, useMemo, useRef, useState } from 'react'
import { canonicalProfiles as profiles, runValidation } from './features/catalogBridge'
import { SOURCE_REGISTRY, listPendingCompatibilityProfiles, toPendingCatalogEntry } from './catalog'
import { compositions, evidenceLabel } from './features/uiTypes'
import type { UiProfile, UiCheck } from './features/uiTypes'
import { initialDraft, resolvedCopy, resolvedRenderSettings } from './features/editorModel'
import type { CopyField, EditorDraft, TargetRenderSettings } from './features/editorModel'
import { useHistory } from './features/useHistory'
import { inspectFile, APP_SESSION_BUDGET } from './media/inspect'
import { exportDraft, parseDraft, MAX_DRAFT_BYTES } from './storage/draft'
import type { ReviewManifest, ReviewRenderSettings } from './storage/reviewPackage'
import { Preview } from './features/Preview'
import { ContextPreview } from './features/ContextPreview'
import {
  DEFAULT_PRESENTATION,
  capturePresentation,
  type PreviewPresentation,
} from './features/previewPresentation'
import { PreviewSurface } from './features/PreviewSurface'
import { DeviceMockup } from './features/DeviceMockup'
import { captureDeviceMockup, deviceMockupFor } from './features/deviceMockupModel'
import type { MockupMode, DeviceMockupSpec } from './features/deviceMockupModel'
import { EditorPanel } from './features/EditorPanel'
import { ContextFields } from './features/ContextFields'
import { FormQuestions } from './features/FormQuestions'
import { PlatformLogo } from './features/PlatformLogo'
import { PublisherBindings, PublisherPicker, PublisherPreview } from './features/PublisherStudio'
import { PlatformReference } from './features/platformReferences'
import {
  defaultPublisher,
  publisherDraftForTarget,
  publisherTarget,
} from './features/publisherModel'
import { ZoomModal } from './features/ZoomModal'
import { getPlacementSpec, type PlacementSpecData } from './features/placementSpecs'

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
const count = (value: string) =>
  [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(value)].length
const pendingCatalog = listPendingCompatibilityProfiles().map(toPendingCatalogEntry)
const statusNames = {
  fail: 'Cần sửa',
  warn: 'Lưu ý',
  unknown: 'Chưa xác minh',
  pass: 'Đã kiểm tra',
}
const fieldLabels: Record<string, string> = {
  brandName: 'Tên thương hiệu',
  primaryText: 'Văn bản chính',
  headline: 'Tiêu đề',
  description: 'Mô tả',
  cta: 'CTA',
  destinationUrl: 'URL đích',
}

// Recommended display limits for the default feed example.
// Validation still uses each catalog profile's source-backed limits.
const recommendedDisplayLimits: Record<string, Partial<Record<CopyField, number>>> = {
  'facebook.feed': { primaryText: 150, headline: 27, description: 30 },
}

function displayLimit(profile: UiProfile, field: CopyField) {
  return recommendedDisplayLimits[profile.id]?.[field] ?? profile.limits[field]
}

const placementLabels: Record<string, string> = {
  Feed: 'Bảng feed',
  'Video Feeds': 'Video Feeds',
  Stories: 'Stories',
  Reels: 'Reels',
  'Reels banner': 'Banner trên Reels',
  'In-stream': 'Video trong luồng',
  Marketplace: 'Marketplace',
  'Search results': 'Kết quả tìm kiếm',
  'Right column': 'Cột bên phải',
  'Audience Network': 'Audience Network',
  'Mobile search results': 'Di động',
  'Desktop search results': 'Máy tính',
  'Native in-article': 'Native trong bài viết',
  'Skippable in-stream': 'Trong luồng (bỏ qua được)',
  'Non-skippable in-stream': 'Trong luồng (không bỏ qua)',
  'Desktop in-stream': 'Trong luồng (máy tính)',
  'In-feed': 'Trong nguồn cấp',
  Bumper: 'Bumper 6 giây',
  '300x250': 'Hình chữ nhật 300x250',
  '336x280': 'Hình chữ nhật lớn 336x280',
  '728x90': 'Leaderboard 728x90',
  '300x600': 'Nửa trang 300x600',
  '160x600': 'Skyscraper 160x600',
  '320x100': 'Biểu ngữ di động 320x100',
  '320x50': 'Biểu ngữ di động 320x50',
  'Feed / Article': 'Nhật ký / Báo Mới',
  'Feed / Video': 'Zalo Video (9:16)',
  'Zalo Network': 'Zalo Network Display',
  'Bảng feed di động (Single Image / Video)': 'Feed di động',
  'Bảng feed máy tính': 'Feed máy tính',
  'Sponsored Messaging (Message Ad)': 'Tin nhắn Sponsored',
  'Right Rail / Spotlight Ad': 'Right Rail / Spotlight',
}

const FIXTURE_PLACEMENT_ID_MAP: Record<string, string> = {
  // Facebook
  'facebook.feed': 'fb_feed',
  'facebook.video_feeds': 'fb_video_feeds',
  'facebook.stories': 'fb_stories',
  'facebook.reels': 'fb_reels',
  'facebook.reels_banner': 'fb_reels_overlay',
  'facebook.in_stream': 'fb_instream',
  'facebook.marketplace': 'fb_marketplace',
  'facebook.search_results': 'fb_search',
  'facebook.right_column': 'fb_right_col',
  'facebook.audience_network': 'fb_audience_network',
  // Instagram
  'instagram.feed': 'ig_feed',
  'instagram.stories': 'ig_stories',
  'instagram.reels': 'ig_reels',
  // Threads
  'threads.feed': 'threads_feed',
  // TikTok
  'tiktok.in_feed': 'tt_infeed',
  'tiktok.topview': 'tt_topview',
  // YouTube
  'youtube.skippable_in_stream': 'yt_instream_skippable',
  'youtube.non_skippable_in_stream': 'yt_instream_nonskip',
  'youtube.bumper': 'yt_bumper',
  'youtube.desktop_in_stream': 'yt_instream_desktop',
  'youtube.in_feed': 'yt_infeed',
  'youtube.shorts': 'yt_shorts',
  // Google Search
  'google.search.mobile': 'gs_mobile',
  'google.search.desktop': 'gs_desktop',
  // Google Display
  'google.display.300x250': 'gdn_300x250',
  'google.display.336x280': 'gdn_336x280',
  'google.display.728x90': 'gdn_728x90',
  'google.display.300x600': 'gdn_300x600',
  'google.display.160x600': 'gdn_160x600',
  'google.display.320x100': 'gdn_320x100',
  'google.display.320x50': 'gdn_320x50',
  'google.display.native_in_article': 'gdn_native',
  // ChatGPT
  'chatgpt.chat_card.web': 'chatgpt_web',
  'chatgpt.chat_card.mobile': 'chatgpt_mobile',
  // Zalo Ads
  'zalo.timeline': 'zalo_timeline',
  'zalo.video': 'zalo_video',
  'zalo.message': 'zalo_message',
  'zalo.article': 'zalo_article',
  // LinkedIn Ads
  'linkedin.mobile_feed': 'li_mobile_feed',
  'linkedin.desktop_feed': 'li_desktop_feed',
  'linkedin.message': 'li_message',
  'linkedin.spotlight': 'li_spotlight',
  // Admicro
  'admicro.cafef_pc': 'admicro_cafef_pc',
  'admicro.kenh14_mobile': 'admicro_kenh14_mobile',
  'admicro.vnexpress_pc': 'admicro_vnexpress_pc',
  'admicro.dantri_mobile': 'admicro_dantri_mobile',
}

function placementLabel(profileOrTitle: UiProfile | string) {
  if (typeof profileOrTitle === 'string') {
    return placementLabels[profileOrTitle] ?? profileOrTitle
  }
  if (profileOrTitle.groupId === 'zalo') {
    if (profileOrTitle.id === 'zalo.timeline' || profileOrTitle.id === 'zalo_timeline') return 'Nhật ký Zalo'
    if (profileOrTitle.id === 'zalo.video' || profileOrTitle.id === 'zalo_video') return 'Zalo Video'
    if (profileOrTitle.id === 'zalo.message' || profileOrTitle.id === 'zalo_message') return 'Tin nhắn OA'
    if (profileOrTitle.id === 'zalo.article' || profileOrTitle.id === 'zalo_article') return 'Báo mới / Khám phá'
    if (profileOrTitle.id === 'zalo.native.single_image') return 'Nhật ký OA (Ảnh)'
    if (profileOrTitle.id === 'zalo.native.album') return 'Zalo Shop / Album'
    if (profileOrTitle.id === 'zalo.form') return 'Zalo Lead Form'
    if (profileOrTitle.id === 'zalo.website') return 'Tin nhắn Zalo OA'
    if (profileOrTitle.id === 'zalo.display.640x360') return 'Báo Mới Native (640×360)'
    if (profileOrTitle.id === 'zalo.display.800x450') return 'Zalo Network (800×450)'
  }
  if (profileOrTitle.groupId === 'linkedin') {
    if (profileOrTitle.id === 'linkedin.mobile_feed' || profileOrTitle.id === 'li_mobile_feed') return 'Bảng tin Di động'
    if (profileOrTitle.id === 'linkedin.desktop_feed' || profileOrTitle.id === 'li_desktop_feed') return 'Bảng tin Máy tính'
    if (profileOrTitle.id === 'linkedin.message' || profileOrTitle.id === 'li_message') return 'Tin nhắn tài trợ'
    if (profileOrTitle.id === 'linkedin.spotlight' || profileOrTitle.id === 'li_spotlight') return 'Cột phải Spotlight'
  }
  if (profileOrTitle.groupId === 'admicro') {
    if (profileOrTitle.id === 'admicro.cafef_pc' || profileOrTitle.id === 'admicro_cafef_pc') return 'CafeF (PC)'
    if (profileOrTitle.id === 'admicro.kenh14_mobile' || profileOrTitle.id === 'admicro_kenh14_mobile') return 'Kenh14 (Mobile)'
    if (profileOrTitle.id === 'admicro.vnexpress_pc' || profileOrTitle.id === 'admicro_vnexpress_pc') return 'VnExpress (Masthead PC)'
    if (profileOrTitle.id === 'admicro.dantri_mobile' || profileOrTitle.id === 'admicro_dantri_mobile') return 'Dân trí (In-Page Mobile)'
  }
  return placementLabels[profileOrTitle.title] ?? profileOrTitle.title
}

function browserUrlFor(profile: UiProfile) {
  if (profile.groupId === 'facebook') return 'facebook.com'
  if (profile.groupId === 'instagram') return 'instagram.com'
  if (profile.groupId === 'threads') return 'threads.net'
  if (profile.groupId === 'tiktok') return 'tiktok.com/@p2pdigital'
  if (profile.groupId === 'youtube') return 'youtube.com/watch?v=adcraft'
  if (profile.groupId === 'google-search') return 'google.com/search?q=digital+marketing'
  if (profile.groupId === 'google-display') return 'tapchiso.vn/xu-huong-ai-marketing'
  if (profile.groupId === 'chatgpt') return 'chatgpt.com'
  if (profile.groupId === 'zalo') {
    return profile.id.startsWith('zalo.display') ? 'baomoi.com/cong-nghe.epi' : 'zalo.me/oa'
  }
  if (profile.groupId === 'linkedin') {
    return profile.id === 'linkedin.message' ? 'linkedin.com/messaging/' : 'linkedin.com/feed/'
  }
  if (profile.groupId === 'admicro') {
    if (profile.id.includes('kenh14')) return 'kenh14.vn'
    if (profile.id.includes('vnexpress')) return 'vnexpress.net'
    if (profile.id.includes('dantri')) return 'dantri.com.vn'
    if (profile.id.includes('vtv')) return 'vtv.vn'
    if (profile.id.includes('genk')) return 'genk.vn'
    if (profile.id.includes('tuoitre')) return 'tuoitre.vn'
    if (profile.id.includes('thanhnien')) return 'thanhnien.vn'
    return 'cafef.vn'
  }
  return 'p2pdigital.vn/cong-cu/xem-truoc-quang-cao'
}

type ReviewIntent = 'png' | 'package'

function captureReviewSettings(
  element: HTMLElement | null,
  base: TargetRenderSettings,
  formStage?: ReviewRenderSettings['formStage'],
): ReviewRenderSettings {
  const videoTime = Number(
    element?.querySelector<HTMLElement>('[data-video-time-ms]')?.dataset.videoTimeMs,
  )
  const cardNumber = Number(
    element?.querySelector<HTMLElement>('[data-renderer][data-preview-card]')?.dataset.previewCard,
  )
  const searchCombinationNumber = Number(
    element?.querySelector<HTMLElement>('[data-preview-combination]')?.dataset.previewCombination,
  )
  return {
    ...base,
    ...capturePresentation(element),
    videoTimeMs: Number.isFinite(videoTime) && videoTime >= 0 ? Math.round(videoTime) : undefined,
    cardIndex: Number.isFinite(cardNumber) && cardNumber > 0 ? cardNumber - 1 : undefined,
    searchCombinationIndex:
      Number.isFinite(searchCombinationNumber) && searchCombinationNumber > 0
        ? searchCombinationNumber - 1
        : undefined,
    formStage,
    deviceMockup: captureDeviceMockup(element),
  }
}

function reviewStateLabel(state?: ReviewManifest['snapshot']['reviewState']) {
  return (
    {
      has_failures: 'Cần sửa trước khi gửi review',
      needs_review: 'Còn mục cần đối chiếu',
      has_warnings: 'Có lưu ý, có thể xuất nội bộ',
      ready: 'Sẵn sàng xuất nội bộ',
    } as Record<ReviewManifest['snapshot']['reviewState'], string>
  )[state ?? 'needs_review']
}

const checkRank = { fail: 0, warn: 1, unknown: 2, pass: 3 } satisfies Record<
  UiCheck['status'],
  number
>

function byCheckSeverity(a: UiCheck, b: UiCheck) {
  return checkRank[a.status] - checkRank[b.status]
}

function Field({
  label,
  value,
  onChange,
  limit,
  area,
  id,
  helper,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  limit?: number
  area?: boolean
  id?: string
  helper?: string
  placeholder?: string
}) {
  const inputId = id ?? `field-${label.replace(/\s/g, '-')}`
  const isDefault = !value || value.trim() === ''
  const statusClass = isDefault ? 'input-default' : 'input-edited'
  return (
    <div className="field">
      <div className="field-heading">
        <label htmlFor={inputId}>{label}</label>
        <span className={limit && count(value) > limit ? 'over-limit' : ''}>
          {count(value)}
          {limit ? ` / ${limit}` : ''}
        </span>
      </div>
      {area ? (
        <textarea
          id={inputId}
          className={statusClass}
          value={value}
          rows={4}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={inputId}
          className={statusClass}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {helper && <small>{helper}</small>}
    </div>
  )
}

export default function App() {
  const history = useHistory(initialDraft)
  const draft = history.value
  const draftRef = useRef(draft)
  draftRef.current = draft
  const [profileId, setProfileId] = useState(profiles[0].id)
  const [view, setView] = useState<'workspace' | 'catalog' | 'compare'>('workspace')
  const [editorTab, setEditorTab] = useState<'copy' | 'media' | 'override'>('copy')
  // Keep the ad-content form visible on first mobile load, matching the source workflow.
  const [editorExpanded, setEditorExpanded] = useState(true)
  const [compareIds, setCompareIds] = useState([
    profiles[0].id,
    profiles.find((item) => item.groupId === 'instagram')!.id,
  ])
  const [comparePicker, setComparePicker] = useState(
    profiles.find((item) => item.groupId === 'tiktok')!.id,
  )
  const [formStage, setFormStage] = useState<'creative' | 'form'>('form')
  const [showCrop, setShowCrop] = useState(false)
  const [allPlacementsInline, setAllPlacementsInline] = useState(false)
  const [previewZoomed, setPreviewZoomed] = useState(false)
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [mockupMode, setMockupMode] = useState<MockupMode>('target')
  const [presentation, setPresentation] = useState<PreviewPresentation>(DEFAULT_PRESENTATION)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  const [reviewIntent, setReviewIntent] = useState<ReviewIntent | null>(null)
  const [reviewManifest, setReviewManifest] = useState<ReviewManifest | null>(null)
  const [reviewError, setReviewError] = useState('')
  const [reviewExportError, setReviewExportError] = useState('')
  const [reviewPreparing, setReviewPreparing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [catalogFilters, setCatalogFilters] = useState({
    platform: '',
    product: '',
    device: '',
    composition: '',
    surface: '',
    evidence: '',
  })
  const [showDeprecated, setShowDeprecated] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [sourceCheck, setSourceCheck] = useState<UiCheck | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const importInput = useRef<HTMLInputElement>(null)
  const reviewSurface = useRef<HTMLDivElement>(null)
  const previewStageRef = useRef<HTMLDivElement>(null)
  const workbenchRef = useRef<HTMLDivElement>(null)
  const zoomBtnRef = useRef<HTMLButtonElement>(null)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)
  const sourceDrawer = useRef<HTMLElement>(null)
  const sourceTrigger = useRef<HTMLElement | null>(null)
  const reviewDrawer = useRef<HTMLElement>(null)
  const reviewTrigger = useRef<HTMLElement | null>(null)
  const exportBusy = useRef(false)
  const exportAbort = useRef<AbortController | null>(null)
  const urls = useRef(new Map<string, number>())
  const uploadBusy = useRef(false)
  const profile = profiles.find((item) => item.id === profileId) ?? profiles[0]
  const mockup = deviceMockupFor(profile, mockupMode)
  const profileSpec = useMemo(() => getPlacementSpec(profile.id), [profile.id])
  const groups = useMemo(
    () => [
      ...new Map(
        profiles.map((item) => [item.groupId, { id: item.groupId, name: item.groupName }]),
      ).values(),
    ],
    [],
  )
  const primaryGroups = groups
  const checks = useMemo(() => runValidation(draft, profile.id), [draft, profile.id])
  const summary = {
    fail: checks.filter((item) => item.status === 'fail').length,
    warn: checks.filter((item) => item.status === 'warn').length,
    unknown: checks.filter((item) => item.status === 'unknown').length,
    pass: checks.filter((item) => item.status === 'pass').length,
  }
  const visibleChecks = [...checks]
    .filter((item) => showPass || item.status !== 'pass')
    .sort(byCheckSeverity)
  const unresolvedChecks = checks.filter((item) => item.status !== 'pass').sort(byCheckSeverity)
  const groupIssueSummary = useMemo(() => {
    return new Map(
      groups.map((group) => {
        const groupProfiles = profiles
          .filter((item) => item.groupId === group.id && item.supportStatus !== 'deprecated')
          .map((item) => runValidation(draft, item.id))
        const fails = groupProfiles.filter((checks) => checks.some((item) => item.status === 'fail')).length
        const warns = groupProfiles.filter((checks) => checks.some((item) => item.status === 'warn')).length
        return [
          group.id,
          {
            fail: fails,
            warn: warns,
            hasWarning: fails > 0 || warns > 0,
          },
        ]
      }),
    )
  }, [draft, groups])
  const reviewSummary = reviewManifest?.validation.summary ?? summary
  const reviewState =
    reviewManifest?.snapshot.reviewState ??
    (summary.fail
      ? 'has_failures'
      : summary.unknown
        ? 'needs_review'
        : summary.warn
          ? 'has_warnings'
          : 'ready')
  const reviewAssets =
    reviewManifest?.assets ??
    draft.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      role: asset.role,
      sha256: asset.sha256,
      bytes: asset.bytes,
    }))
  const reviewAssetBytes = reviewAssets.reduce((total, asset) => total + asset.bytes, 0)
  const copy = resolvedCopy(draft, profile.id)
  const settings = resolvedRenderSettings(draft, profile.id)
  const { fit, safeZone } = settings
  const setDraft = (next: EditorDraft) => {
    draftRef.current = next
    history.set(next)
  }
  const chooseProfile = (id: string, keepAllPlacements = false) => {
    setProfileId(id)
    if (!keepAllPlacements) setAllPlacementsInline(false)
    const publisher = publisherDraftForTarget(draftRef.current, id)
    if (publisher) setDraft({ ...draftRef.current, publisher })
  }
  const setCopy = (key: keyof EditorDraft['copy'] | string, value: any) =>
    setDraft({ ...draft, copy: { ...draft.copy, [key]: value } })

  const updateGdnOverride = (val: string) => {
    const gdnProfiles = profiles.filter((p) => p.groupId === 'google-display')
    const nextOverrides = { ...draft.overrides }
    for (const p of gdnProfiles) {
      nextOverrides[p.id] = {
        ...nextOverrides[p.id],
        headline: val.trim() ? { mode: 'replace', value: val } : { mode: 'inherit', value: '' },
      }
    }
    setDraft({
      ...draft,
      copy: {
        ...draft.copy,
        gdnLongHeadline: val,
        gdn: { longHeadline: val },
      } as any,
      overrides: nextOverrides,
    })
  }

  const updateYoutubeHeadline = (val: string) => {
    const ytProfiles = profiles.filter((p) => p.groupId === 'youtube')
    const nextOverrides = { ...draft.overrides }
    for (const p of ytProfiles) {
      nextOverrides[p.id] = {
        ...nextOverrides[p.id],
        headline: val.trim() ? { mode: 'replace', value: val } : { mode: 'inherit', value: '' },
      }
    }
    setDraft({
      ...draft,
      copy: {
        ...draft.copy,
        youtubeHeadline: val,
        youtube: { headline: val, cta: (draft.copy as any).youtubeCta ?? '' },
      } as any,
      overrides: nextOverrides,
    })
  }

  const updateYoutubeCta = (val: string) => {
    const ytProfiles = profiles.filter((p) => p.groupId === 'youtube')
    const nextOverrides = { ...draft.overrides }
    for (const p of ytProfiles) {
      nextOverrides[p.id] = {
        ...nextOverrides[p.id],
        cta: val.trim() ? { mode: 'replace', value: val } : { mode: 'inherit', value: '' },
      }
    }
    setDraft({
      ...draft,
      copy: {
        ...draft.copy,
        youtubeCta: val,
        youtube: { headline: (draft.copy as any).youtubeHeadline ?? '', cta: val },
      } as any,
      overrides: nextOverrides,
    })
  }

  const updateChatgptTitle = (val: string) => {
    const chatProfiles = profiles.filter((p) => p.groupId === 'chatgpt')
    const nextOverrides = { ...draft.overrides }
    for (const p of chatProfiles) {
      nextOverrides[p.id] = {
        ...nextOverrides[p.id],
        headline: val.trim() ? { mode: 'replace', value: val } : { mode: 'inherit', value: '' },
      }
    }
    setDraft({
      ...draft,
      copy: {
        ...draft.copy,
        chatgptTitle: val,
        chatgpt: { title: val, body: (draft.copy as any).chatgptBody ?? '' },
      } as any,
      overrides: nextOverrides,
    })
  }

  const updateChatgptBody = (val: string) => {
    const chatProfiles = profiles.filter((p) => p.groupId === 'chatgpt')
    const nextOverrides = { ...draft.overrides }
    for (const p of chatProfiles) {
      nextOverrides[p.id] = {
        ...nextOverrides[p.id],
        primaryText: val.trim() ? { mode: 'replace', value: val } : { mode: 'inherit', value: '' },
      }
    }
    setDraft({
      ...draft,
      copy: {
        ...draft.copy,
        chatgptBody: val,
        chatgpt: { title: (draft.copy as any).chatgptTitle ?? '', body: val },
      } as any,
      overrides: nextOverrides,
    })
  }
  const setSettings = (change: Partial<TargetRenderSettings>) =>
    setDraft({
      ...draft,
      renderSettings: { ...draft.renderSettings, [profile.id]: { ...settings, ...change } },
    })

  const compareAllForGroup = (groupId: string) => {
    const ids = profiles
      .filter((item) => item.groupId === groupId && item.supportStatus !== 'deprecated')
      .map((item) => item.id)
    if (!ids.length) return
    setCompareIds(ids)
    setComparePicker(ids[0])
    setView('compare')
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setPreviewFullscreen(Boolean(document.fullscreenElement))
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
        setPreviewFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [previewFullscreen])

  const togglePreviewFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.().catch(() => {})
        setPreviewFullscreen(false)
        return
      }
      const target = workbenchRef.current || previewStageRef.current || document.documentElement
      if (target?.requestFullscreen) {
        await target.requestFullscreen().catch(() => {})
      }
      setPreviewFullscreen(true)
    } catch {
      setPreviewFullscreen((prev) => !prev)
    }
  }

  useEffect(() => {
    if (!sourceCheck) return
    const drawer = sourceDrawer.current
    drawer?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSourceCheck(null)
        return
      }
      if (event.key !== 'Tab') return
      const controls = Array.from(drawer?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
      const first = controls[0],
        last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      sourceTrigger.current?.focus()
    }
  }, [sourceCheck])

  useEffect(() => {
    if (!reviewIntent) return
    const drawer = reviewDrawer.current
    drawer?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeReviewDrawer()
        return
      }
      if (event.key !== 'Tab') return
      const controls = Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('disabled'))
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      reviewTrigger.current?.focus()
    }
  }, [reviewIntent])

  function moveAsset(id: string, direction: -1 | 1) {
    const index = draft.assets.findIndex((item) => item.id === id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= draft.assets.length) return
    const assets = [...draft.assets]
    ;[assets[index], assets[nextIndex]] = [assets[nextIndex], assets[index]]
    setDraft({ ...draft, assets })
  }

  useEffect(
    () => () => {
      for (const url of urls.current.keys()) URL.revokeObjectURL(url)
    },
    [],
  )
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        exportBusy.current ||
        uploadBusy.current ||
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== 'z' ||
        (event.target as HTMLElement).closest('input, textarea, select')
      )
        return
      event.preventDefault()
      if (event.shiftKey) history.redo()
      else history.undo()
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [history.undo, history.redo])

  async function addFiles(files: FileList | File[]) {
    if (uploadBusy.current || exportBusy.current) return
    uploadBusy.current = true
    setUploading(true)
    const errors: string[] = []
    let added = 0
    try {
      const incoming = Array.from(files)
      const currentAssetCount = draftRef.current.assets.length
      if (currentAssetCount >= 10) {
        setNotice('Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ).')
        return
      }

      const allowedCount = 10 - currentAssetCount
      const toProcess = incoming.slice(0, allowedCount)
      if (incoming.length > allowedCount) {
        errors.push(`Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua ${incoming.length - allowedCount} tệp thừa.`)
      }

      const newAssets: InspectedMedia[] = []
      for (const file of toProcess) {
        try {
          if (
            [...urls.current.values()].reduce((total, bytes) => total + bytes, 0) + file.size >
            APP_SESSION_BUDGET
          )
            throw new Error(
              'Vượt ngân sách 512 MB/phiên (gồm asset trong lịch sử). Xuất nháp rồi nhập lại để giải phóng media.',
            )
          const asset = await inspectFile(file)
          if (
            draftRef.current.assets.some((item) => item.sha256 === asset.sha256) ||
            newAssets.some((item) => item.sha256 === asset.sha256)
          ) {
            URL.revokeObjectURL(asset.url)
            errors.push(`${file.name}: tệp đã có.`)
            continue
          }
          urls.current.set(asset.url, asset.bytes)
          newAssets.push(asset)
          added += 1
        } catch (error) {
          errors.push(
            `${file.name}: ${error instanceof Error ? error.message : 'Không đọc được tệp.'}`,
          )
        }
      }

      if (newAssets.length > 0) {
        const nextAssets = [...draftRef.current.assets, ...newAssets]
        const creativeCount = nextAssets.filter((item) => item.role === 'creative').length
        const nextComposition = creativeCount >= 2 ? 'carousel' : draftRef.current.composition
        const nextCardDetails = { ...(draftRef.current.cardDetails ?? {}) }
        for (const asset of newAssets) {
          if (asset.role === 'creative' && !nextCardDetails[asset.id]) {
            nextCardDetails[asset.id] = {
              title: '',
              description: '',
              url: draftRef.current.copy.destinationUrl || '',
            }
          }
        }
        setDraft({
          ...draftRef.current,
          assets: nextAssets,
          composition: nextComposition,
          cardDetails: nextCardDetails,
        })
      }

      setNotice(
        [added ? `Đã thêm ${added} tệp trên thiết bị.` : '', ...errors].filter(Boolean).join(' '),
      )
      setEditorTab('media')
    } finally {
      uploadBusy.current = false
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function saveDraft() {
    const blob = new Blob([JSON.stringify(exportDraft(draft, profile.id), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'adcraft-draft.json'
    anchor.target = '_blank'
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Đã xuất nháp JSON. Binary media không đi kèm; cần chọn lại khi import.')
  }

  async function loadDraft(file?: File) {
    if (!file || uploadBusy.current || exportBusy.current) return
    uploadBusy.current = true
    setImporting(true)
    try {
      const packaged = file.name.toLowerCase().endsWith('.zip')
      if (!packaged && file.size > MAX_DRAFT_BYTES) throw new Error('Nháp JSON vượt 1 MB.')
      const result = packaged
        ? await import('./storage/reviewPackage').then(({ parseReviewPackage }) =>
            parseReviewPackage(file),
          )
        : parseDraft(await file.text())
      if (!compositions.some((item) => item.id === result.draft.composition))
        throw new Error('Composition không được hỗ trợ.')
      const target = profiles.find((item) => item.id === result.profileId)
      const importedDraft =
        target?.groupId === 'admicro'
          ? { ...result.draft, publisher: publisherDraftForTarget(result.draft, target.id) }
          : result.draft
      history.reset(importedDraft)
      draftRef.current = importedDraft
      for (const url of urls.current.keys()) URL.revokeObjectURL(url)
      urls.current.clear()
      for (const asset of result.draft.assets) urls.current.set(asset.url, asset.bytes)
      if (target) setProfileId(target.id)
      setView('workspace')
      setNotice(
        `Đã nhập nháp${packaged ? ` cùng ${result.draft.assets.length} media đã kiểm tra lại` : ''}.${result.missingAssets ? ` Cần chọn lại ${result.missingAssets} asset; metadata import không được dùng để chứng nhận media.` : ''}${!target ? ' Target cũ không có trong catalog; giữ target hiện tại.' : ''}`,
      )
    } catch (error) {
      setNotice(`Không nhập được: ${error instanceof Error ? error.message : 'JSON lỗi.'}`)
    } finally {
      uploadBusy.current = false
      setImporting(false)
      if (importInput.current) importInput.current.value = ''
    }
  }

  function closeReviewDrawer() {
    exportAbort.current?.abort()
    setReviewIntent(null)
    setReviewManifest(null)
    setReviewError('')
    setReviewExportError('')
  }

  async function openReviewDrawer(kind: ReviewIntent, trigger: HTMLElement) {
    if (!reviewSurface.current || exportBusy.current || uploadBusy.current || importing) return
    reviewTrigger.current = trigger
    setReviewIntent(kind)
    setReviewManifest(null)
    setReviewError('')
    setReviewExportError('')
    setReviewPreparing(true)
    try {
      const element = reviewSurface.current
      const rect = element.getBoundingClientRect()
      const viewport = {
        width: Math.max(1, Math.round(element.offsetWidth || rect.width || previewWidth(profile))),
        height: Math.max(
          1,
          Math.round(element.offsetHeight || rect.height || element.scrollHeight),
        ),
      }
      const manifestSettings = captureReviewSettings(
        element,
        settings,
        profile.renderer === 'form' ? formStage : undefined,
      )
      const { buildReviewManifest } = await import('./storage/reviewPackage')
      setReviewManifest(
        buildReviewManifest({
          draft,
          profile,
          settings: manifestSettings,
          preview: new Blob(),
          viewport,
        }),
      )
    } catch (error) {
      setReviewManifest(null)
      setReviewError(error instanceof Error ? error.message : 'Lỗi không rõ.')
    } finally {
      setReviewPreparing(false)
    }
  }

  async function saveReview(kind: 'png' | 'package') {
    if (!reviewSurface.current || exportBusy.current || uploadBusy.current) return
    exportBusy.current = true
    const controller = new AbortController()
    exportAbort.current = controller
    setExporting(true)
    setReviewExportError('')
    try {
      const { exportReview } = await import('./features/reviewExport')
      const result = await exportReview({
        element: reviewSurface.current,
        draft,
        profile,
        settings: {
          ...settings,
          ...presentation,
          formStage: profile.renderer === 'form' ? formStage : undefined,
          deviceMockup: captureDeviceMockup(reviewSurface.current),
        },
        kind,
        signal: controller.signal,
      })
      if (controller.signal.aborted) throw new DOMException('Review export aborted.', 'AbortError')
      const url = URL.createObjectURL(result.blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = result.filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(
        kind === 'png'
          ? 'Đã xuất PNG với trạng thái preflight. Video được chụp tại khung hình hiện tại.'
          : 'Đã xuất gói review: PNG, manifest, nháp và media. Gói chứa nội dung creative; chỉ chia sẻ với người phù hợp.',
      )
      exportAbort.current = null
      closeReviewDrawer()
    } catch (error) {
      if (controller.signal.aborted) {
        setNotice('Đã hủy xuất review. Nội dung creative được giữ nguyên.')
      } else {
        const message = error instanceof Error ? error.message : 'Lỗi tạo snapshot.'
        setReviewExportError(`Không xuất được: ${message} Có thể thử lại hoặc đóng review.`)
      }
    } finally {
      if (exportAbort.current === controller) exportAbort.current = null
      exportBusy.current = false
      setExporting(false)
    }
  }

  function setOverride(field: CopyField, mode: 'inherit' | 'replace' | 'clear', value: string) {
    setDraft({
      ...draft,
      overrides: {
        ...draft.overrides,
        [profile.id]: { ...draft.overrides[profile.id], [field]: { mode, value } },
      },
    })
  }

  function focusCheck(check: UiCheck) {
    setEditorExpanded(true)
    if (check.field.startsWith('publisher.bindings.')) {
      const slotId = check.field.slice('publisher.bindings.'.length)
      window.setTimeout(() => document.getElementById(`binding-${slotId}`)?.focus(), 0)
      return
    }
    const mediaField =
      check.field.includes('asset') ||
      check.field.includes('media') ||
      /form\.(avatar|cover)/.test(check.field)
    setEditorTab(mediaField ? 'media' : 'copy')
    const name = Object.keys(fieldLabels).find((key) =>
      check.field.toLowerCase().includes(key.toLowerCase()),
    )
    window.setTimeout(
      () =>
        document
          .getElementById(mediaField ? 'add-media' : name ? `copy-${name}` : 'composition')
          ?.focus(),
      0,
    )
  }

  const renderAdmicroContext = (targetProfile: UiProfile, targetSettings: any) => {
    const targetCopy = resolvedCopy(draft, targetProfile.id)
    const media = draft.assets.filter((asset) => asset.role === 'creative')
    const creativeAsset = media[0]
    const creativeMedia = (
      <div
        className="ad-media"
        style={{ aspectRatio: targetProfile.ratio ? String(targetProfile.ratio) : '1.91 / 1' }}
      >
        {creativeAsset ? (
          creativeAsset.kind === 'video' ? (
            <video src={creativeAsset.url} controls playsInline />
          ) : (
            <img
              src={creativeAsset.url}
              alt={targetProfile.title}
              style={{ objectFit: targetSettings.fit ?? 'cover' }}
            />
          )
        ) : (
          <div className="media-placeholder source-like-placeholder">
            <span>Chưa có ảnh hoặc video</span>
          </div>
        )}
      </div>
    )
    const brand = targetCopy.brandName || draft.identity.brandName || 'P2P Digital'
    return (
      <ContextPreview
        profile={targetProfile}
        locale={presentation.locale}
        appChrome={presentation.appChrome}
        brandName={brand}
        accountName={draft.identity.handle || '@p2pdigital'}
        headline={targetCopy.headline || 'Tối ưu chiến dịch quảng cáo đa kênh cùng P2P Digital'}
        description={targetCopy.description || 'Khám phá giải pháp tại p2pdigital.vn'}
        primaryText={targetCopy.primaryText}
        domain={browserUrlFor(targetProfile)}
        cta={targetCopy.cta}
        media={creativeMedia}
        identity={
          <div className="ad-identity">
            <div className="avatar">
              <span>{brand.slice(0, 1) || 'P'}</span>
            </div>
            <div>
              <strong>{brand}</strong>
              <small>{presentation.locale === 'vi' ? 'Được tài trợ • Công khai' : 'Sponsored • Public'}</small>
            </div>
          </div>
        }
      />
    )
  }

  const renderedPreview =
    profile.groupId === 'admicro' ? (
      renderAdmicroContext(profile, settings)
    ) : (
      <Preview
        key={`${profile.id}-${draft.composition}`}
        draft={draft}
        profile={profile}
        safeZone={safeZone}
        fit={fit}
        focalX={settings.focalX}
        focalY={settings.focalY}
        formStage={formStage}
        presentation={presentation}
      />
    )
  const groupProfiles = useMemo(
    () =>
      profiles.filter(
        (item) =>
          item.groupId === profile.groupId &&
          (item.supportStatus !== 'deprecated' || item.id === profile.id),
      ),
    [profile.groupId, profile.id],
  )
  const catalogItems = profiles.filter(
    (item) =>
      (showDeprecated || item.supportStatus !== 'deprecated') &&
      (!catalogFilters.platform || item.groupId === catalogFilters.platform) &&
      (!catalogFilters.product || item.product === catalogFilters.product) &&
      (!catalogFilters.device || item.device === catalogFilters.device) &&
      (!catalogFilters.composition || item.composition.includes(catalogFilters.composition)) &&
      (!catalogFilters.surface || item.surface === catalogFilters.surface) &&
      (!catalogFilters.evidence || item.evidence === catalogFilters.evidence) &&
      query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((part) =>
          `${item.groupName} ${item.title} ${item.product} ${item.id}`.toLowerCase().includes(part),
        ),
  )
  const pendingItems = pendingCatalog.filter(
    (item) =>
      (!catalogFilters.platform || item.groupId === catalogFilters.platform) &&
      (!catalogFilters.product || item.productLabel === catalogFilters.product) &&
      (!catalogFilters.device || item.device === catalogFilters.device.toLowerCase()) &&
      (!catalogFilters.composition ||
        item.allowedCompositions.some(
          (composition) => composition === catalogFilters.composition,
        )) &&
      (!catalogFilters.surface || item.surface === catalogFilters.surface) &&
      (!catalogFilters.evidence || item.evidence === catalogFilters.evidence) &&
      query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((part) =>
          `${item.groupTitle} ${item.surface} ${item.placement} ${item.id}`
            .toLowerCase()
            .includes(part),
        ),
  )

  return (
    <div className={`app-shell ${view === 'workspace' ? 'workspace-view' : ''}`}>
      <a
        className="skip-link"
        href="#main"
        inert={!!sourceCheck || !!reviewIntent || reviewPreparing}
      >
        Tới workspace
      </a>
      <header className="topbar" inert={!!sourceCheck || !!reviewIntent || reviewPreparing}>
        <a className="wordmark" href="#main" onClick={() => setView('workspace')}>
          <span className="brand-mark">P</span>P2P Digital
          <span className="wordmark-detail">preview lab</span>
        </a>
        <nav className="topbar-nav" aria-label="Khu vực">
          <button className={view === 'workspace' ? 'active' : ''} onClick={() => setView('workspace')}>Xem trước</button>
          <button className={view === 'compare' ? 'active' : ''} onClick={() => setView('compare')}>So sánh</button>
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => setView('catalog')}>Catalog</button>
        </nav>
        <div className="topbar-context">
          <span className="local-dot" />
          Phiên local<span className="version-pill">MVP</span>
        </div>
        <div className="topbar-actions">
          <button
            className="button ghost"
            onClick={() => importInput.current?.click()}
            disabled={uploading || importing || exporting}
          >
            {importing ? 'Đang nhập...' : 'Nhập nháp / ZIP'}
          </button>
          <button className="button ghost" onClick={saveDraft} disabled={exporting || importing}>
            Xuất JSON
          </button>
          <button
            className="button accent"
            onClick={(event) => {
              setView('workspace')
              void openReviewDrawer('package', event.currentTarget)
            }}
            disabled={
              uploading ||
              importing ||
              exporting ||
              reviewPreparing ||
              reviewIntent !== null ||
              view !== 'workspace'
            }
          >
            {exporting ? 'Đang xuất...' : 'Gói review'}
          </button>
        </div>
      </header>
      <div
        className="main-layout"
        inert={exporting || importing || !!sourceCheck || !!reviewIntent || reviewPreparing}
      >
        <nav className="rail" aria-label="Điều hướng" hidden={view === 'workspace'}>
          <button
            className={view === 'workspace' ? 'active' : ''}
            aria-label="Workspace"
            title="Workspace"
            onClick={() => setView('workspace')}
          >
            WS
          </button>
          <button
            className={view === 'compare' ? 'active' : ''}
            aria-label="So sánh"
            title="So sánh"
            onClick={() => setView('compare')}
          >
            SS
          </button>
          <button
            className={view === 'catalog' ? 'active' : ''}
            aria-label="Catalog"
            title="Catalog"
            onClick={() => setView('catalog')}
          >
            CT
          </button>
          <div className="rail-footer">
            <small>LOCAL</small>
          </div>
        </nav>
        <main id="main" className="main-content">
          <div className="page-heading">
            <div>
              <div className="breadcrumb">
                PREVIEW LAB <span>/</span>{' '}
                {view === 'workspace' ? 'WORKSPACE' : view === 'compare' ? 'COMPARE' : 'CATALOG'}
              </div>
              <h1>
                {view === 'workspace'
                  ? 'Xem trước quảng cáo Facebook, TikTok, YouTube, Google, Zalo, LinkedIn & Admicro'
                  : view === 'compare'
                    ? 'Compare studio'
                    : 'Platform catalog'}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === 'workspace'
                  ? 'Thả ảnh hoặc video quảng cáo vào, nhập chữ một lần, xem ngay nó hiện thế nào ở từng vị trí của 11 nền tảng và phần nào của video bị giao diện che mất.'
                  : view === 'compare'
                     ? 'Cùng creative. Nhiều vị trí. Nhìn rõ khác biệt.'
                    : 'Thông số có nguồn, có phiên bản, có trạng thái xác minh.'}
              </p>
            </div>
            <div className="session-note">
              <div>
                <strong>Media ở trên thiết bị</strong>
                <small>Tải lại trang sẽ mất nháp</small>
              </div>
            </div>
          </div>
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Đóng thông báo" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}
          {view === 'compare' ? (
            <section className="compare-view" aria-label="So sánh creative">
              <div className="compare-toolbar">
                <MockupPicker value={mockupMode} onChange={setMockupMode} />
                <PresentationControls value={presentation} onChange={setPresentation} />
                <div className="compare-picker">
                  <label htmlFor="compare-target">Thêm vị trí</label>
                  <select
                    id="compare-target"
                    value={comparePicker}
                    onChange={(event) => setComparePicker(event.target.value)}
                  >
                    {profiles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.groupName} / {item.title} / {item.device}
                      </option>
                    ))}
                  </select>
                  <button
                    className="button"
                    disabled={compareIds.includes(comparePicker)}
                    onClick={() => setCompareIds([...compareIds, comparePicker])}
                  >
                    Thêm
                  </button>
                  <button
                    className="button ghost"
                    disabled={!profiles.find((entry) => entry.id === comparePicker)}
                    onClick={() => {
                      const item = profiles.find((entry) => entry.id === comparePicker)
                      if (item) compareAllForGroup(item.groupId)
                    }}
                  >
                    Tất cả vị trí
                  </button>
                </div>
                <span>{compareIds.length} vị trí · Copy và crop riêng theo target</span>
              </div>
              {compareIds.length ? (
                <div className="compare-grid">
                  {compareIds.map((id) => {
                    const item = profiles.find((entry) => entry.id === id)!
                    const targetSettings = resolvedRenderSettings(draft, id)
                    const targetChecks = runValidation(draft, id)
                    const targetMockup = deviceMockupFor(item, mockupMode)
                    return (
                      <article key={id} className="compare-card">
                        <div className="compare-card-heading">
                          <div>
                            <strong>{item.groupName}</strong>
                            <span>
                              {item.title} · {item.device}
                            </span>
                          </div>
                          <button
                            className="text-button"
                            aria-label={`Bỏ ${item.groupName} ${item.title}`}
                            disabled={compareIds.length <= 1}
                            onClick={() =>
                              setCompareIds(compareIds.filter((entry) => entry !== id))
                            }
                          >
                            ×
                          </button>
                        </div>
                        <div className="compare-preview">
                          <PreviewSurface width={targetMockup.frame.width} maxHeight={600}>
                            <DeviceMockup
                              spec={targetMockup}
                              contentWidth={mockupContentWidth(item, targetMockup)}
                              immersive={item.renderer === 'vertical'}
                              browserTitle={`${item.groupName} · ${placementLabel(item)}`}
                              browserUrl={browserUrlFor(item)}
                            >
                              {item.groupId === 'admicro' ? (
                                renderAdmicroContext(item, targetSettings)
                              ) : (
                                <Preview
                                  draft={draft}
                                  profile={item}
                                  {...targetSettings}
                                  presentation={presentation}
                                />
                              )}
                            </DeviceMockup>
                          </PreviewSurface>
                        </div>
                        <div className="compare-card-footer">
                          <span className={`evidence-badge ${item.evidence}`}>
                            {evidenceLabel[item.evidence]}
                          </span>
                          <span>
                            {targetChecks.filter((check) => check.status === 'fail').length} lỗi ·{' '}
                            {targetChecks.filter((check) => check.status === 'unknown').length} chưa
                            rõ
                          </span>
                          <button
                            className="button"
                            onClick={() => {
                              chooseProfile(id)
                              setView('workspace')
                            }}
                          >
                            Chỉnh target
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-state">Chọn vị trí rồi bấm Thêm để so sánh.</div>
              )}
              <p className="compare-note">
                Preview mô phỏng; thông số chưa xác minh giữ trạng thái “chưa rõ”. Không phải kết
                quả duyệt quảng cáo.
              </p>
            </section>
          ) : view === 'catalog' ? (
            <section className="catalog-view">
              <div className="catalog-toolbar">
                <div className="search-box">
                  <input
                    aria-label="Tìm catalog"
                    placeholder="Tìm nền tảng, vị trí, product..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <span>
                  {catalogItems.length} preview · {pendingItems.length} mục chờ xác minh
                </span>
              </div>
              <div className="catalog-filters">
                {(
                  [
                    ['platform', 'Nền tảng', groups.map((group) => [group.id, group.name])],
                    [
                      'product',
                      'Product',
                      [
                        ...new Set([
                          ...profiles.map((item) => item.product),
                          ...pendingCatalog.map((item) => item.productLabel),
                        ]),
                      ].map((value) => [value, value]),
                    ],
                    [
                      'surface',
                      'Surface',
                      [
                        ...new Set(
                          [
                            ...profiles.map((item) => item.surface),
                            ...pendingCatalog.map((item) => item.surface),
                          ].filter(Boolean),
                        ),
                      ].map((value) => [value!, value!]),
                    ],
                    [
                      'device',
                      'Thiết bị',
                      [...new Set([...profiles.map((item) => item.device), 'all'])].map((value) => [
                        value,
                        value === 'all' ? 'Chưa phân loại' : value,
                      ]),
                    ],
                    ['composition', 'Bố cục', compositions.map((item) => [item.id, item.label])],
                    [
                      'evidence',
                      'Bằng chứng',
                      Object.entries(evidenceLabel).filter(([value]) =>
                        [
                          'primary_documented',
                          'reference_only',
                          'estimated',
                          'conflict',
                          'unknown',
                        ].includes(value),
                      ),
                    ],
                  ] as [keyof typeof catalogFilters, string, string[][]][]
                ).map(([key, label, options]) => (
                  <label key={key}>
                    {label}
                    <select
                      aria-label={`Lọc ${label}`}
                      value={catalogFilters[key]}
                      onChange={(event) =>
                        setCatalogFilters({ ...catalogFilters, [key]: event.target.value })
                      }
                    >
                      <option value="">Tất cả</option>
                      {options.map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showDeprecated}
                    onChange={(event) => setShowDeprecated(event.target.checked)}
                  />
                  Hiện mục cũ
                </label>
                <button
                  className="text-button"
                  onClick={() => {
                    setQuery('')
                    setCatalogFilters({
                      platform: '',
                      product: '',
                      device: '',
                      composition: '',
                      surface: '',
                      evidence: '',
                    })
                    setShowDeprecated(false)
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
              <div className="catalog-grid">
                {catalogItems.map((item) => (
                  <CatalogCard
                    key={item.id}
                    profile={item}
                    checks={runValidation(draft, item.id)}
                    onSelect={() => {
                      chooseProfile(item.id)
                      setView('workspace')
                    }}
                  />
                ))}
              </div>
              {pendingItems.length > 0 && (
                <section className="pending-catalog" aria-label="Catalog chờ xác minh">
                  <h2>Inventory cần đối chiếu</h2>
                  <p>
                    Các mục này chưa có preview. Điều kiện thị trường, tài khoản và định dạng còn
                    cần xác minh.
                  </p>
                  <div className="catalog-grid">
                    {pendingItems.map((item) => (
                      <article className="catalog-card" key={item.id}>
                        <div className="catalog-card-top">
                          <span className="evidence-badge unknown">Chờ xác minh</span>
                          <span className="version-pill">Chỉ catalog</span>
                        </div>
                        <small>
                          {item.groupTitle} · {item.surface}
                        </small>
                        <h3>{item.placement}</h3>
                        <p>Chưa triển khai preview · Không tính vào coverage đã xác minh.</p>
                        <small>Kiểm tra {item.checkedAt} · Ngày hiệu lực chưa rõ</small>
                        <details>
                          <summary>Bằng chứng và giới hạn</summary>
                          <p>{item.notes?.join(' ')}</p>
                          {item.sources.map((source) => (
                            <p key={source.id}>
                              <a href={source.url} target="_blank" rel="noreferrer">
                                {source.id} · {source.label}
                              </a>
                            </p>
                          ))}
                        </details>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {!catalogItems.length && !pendingItems.length && (
                <div className="empty-state">Không tìm thấy profile phù hợp.</div>
              )}
            </section>
          ) : (
            <>
              <div ref={workbenchRef} className="workbench lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <section className="target-bar min-w-0" aria-label="Chọn nền tảng">
                <div className="platform-tabs">
                  {primaryGroups.map((group) => (
                    <button
                      key={group.id}
                      aria-label={group.name}
                      data-testid={`platform-tab-${group.id === 'google-display' ? 'gdn' : group.id === 'google-search' ? 'google_search' : group.id}`}
                      aria-pressed={group.id === profile.groupId}
                      className={group.id === profile.groupId ? 'selected' : ''}
                      onClick={() =>
                        chooseProfile(
                          profiles.find(
                            (item) =>
                              item.groupId === group.id && item.supportStatus !== 'deprecated',
                          )!.id,
                        )
                      }
                    >
                      <span className={`platform-symbol ${group.id}`}>
                        <PlatformLogo groupId={group.id} label={group.name} size={18} />
                      </span>
                      <span className="platform-tab-label">
                        {group.id === 'google-search'
                          ? 'Google Tìm kiếm'
                          : group.id === 'google-display'
                            ? 'Google Hiển thị'
                            : group.id === 'admicro'
                              ? 'Admicro'
                              : group.name}
                      </span>
                      {(() => {
                        const issue = groupIssueSummary.get(group.id)
                        if (!issue || !issue.hasWarning) return null
                        const status = issue.fail ? 'fail' : 'warn'
                        const count = issue.fail || issue.warn
                        return (
                          <span
                            className={`platform-issue-badge ${status}`}
                            title={`${count} cảnh báo`}
                          >
                            <span
                              aria-hidden="true"
                              className="platform-warning-dot absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e8590c]"
                              style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: status === 'fail' ? '#ed3c47' : '#e8590c',
                              }}
                            />
                          </span>
                        )
                      })()}
                    </button>
                  ))}
                </div>
                <div className="placement-row">
                  <div className="placement-select">
                    <label htmlFor="placement">Vị trí hiển thị</label>
                    <select
                      id="placement"
                      value={profile.id}
                      onChange={(event) => chooseProfile(event.target.value)}
                    >
                      {groupProfiles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} · {item.product}
                        </option>
                      ))}
                    </select>
                    <div className="placement-pills" aria-label="Vị trí hiển thị">
                      {groupProfiles.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`placement-pill-${FIXTURE_PLACEMENT_ID_MAP[item.id] || item.id}`}
                          className={item.id === profile.id && !allPlacementsInline ? 'selected' : ''}
                          aria-pressed={item.id === profile.id && !allPlacementsInline}
                          onClick={() => chooseProfile(item.id)}
                        >
                          {placementLabel(item)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="placement-actions-inline">
                    <button
                      type="button"
                      data-testid="toggle-all-placements"
                      className={`text-button all-placements-button ${allPlacementsInline ? 'selected' : ''}`}
                      aria-pressed={allPlacementsInline}
                      onClick={() => setAllPlacementsInline((prev) => !prev)}
                      title={`Xem tất cả vị trí ${profile.groupName} ngay trong khung preview`}
                    >
                      {allPlacementsInline ? 'Xem 1 vị trí' : `Tất cả vị trí (${groupProfiles.length})`}
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => compareAllForGroup(profile.groupId)}
                      title={`Mở toàn bộ vị trí ${profile.groupName} trong Compare`}
                    >
                      So sánh song song
                    </button>
                  </div>
                  <span className={`evidence-badge ${profile.evidence}`}>
                    {evidenceLabel[profile.evidence] ?? profile.evidence}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => setShowSpecs(!showSpecs)}
                    aria-expanded={showSpecs}
                  >
                    {showSpecs ? 'Ẩn nguồn thông số' : 'Nguồn thông số'}
                  </button>
                </div>
                {profile.groupId === 'admicro' && draft.publisher && (
                  <div className="admicro-target-picker">
                    <PublisherPicker selection={draft.publisher} onSelect={chooseProfile} />
                  </div>
                )}
                {showSpecs && (
                  <div className="spec-drawer">
                    <div>
                      <strong>{profile.version}</strong>
                      <small>
                        Kiểm tra nguồn: {profile.checkedAt} · {profile.device}
                      </small>
                      <span>Bố cục preview cơ bản; hình học và crop chỉ mô phỏng.</span>
                    </div>
                    <ul>
                      {profile.source.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.title} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
                <section className="preview-panel min-w-0 glass" aria-label="Khung xem trước">
                  <div className="panel-title">
                    <h2>
                      <span>02</span>Khung xem trước
                    </h2>
                    <div className="panel-title-right">
                      <button
                        type="button"
                        data-testid="toggle-all-placements"
                        aria-pressed={allPlacementsInline}
                        className={`button ghost compact-btn ${allPlacementsInline ? 'selected' : ''}`}
                        onClick={() => setAllPlacementsInline((prev) => !prev)}
                      >
                        {allPlacementsInline ? 'Đóng lưới vị trí' : 'Tất cả vị trí'}
                      </button>
                      <span className="live-badge">
                        <span />
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="preview-toolbar">
                    <MockupPicker value={mockupMode} onChange={setMockupMode} />
                    <div className="preview-toolbar-buttons">
                      <button
                        className={showCrop ? 'selected' : ''}
                        aria-label="Chỉnh crop target"
                        title="Chỉnh crop riêng cho vị trí này"
                        aria-expanded={showCrop}
                        onClick={() => setShowCrop(!showCrop)}
                      >
                        Crop
                      </button>
                      <button
                        className={fit === 'contain' ? 'selected' : ''}
                        title="Giữ toàn bộ ảnh"
                        aria-label="Contain media"
                        onClick={() =>
                          setSettings({ fit: fit === 'cover' ? 'contain' : 'cover' })
                        }
                      >
                        {fit === 'contain' ? 'Contain' : 'Cover'}
                      </button>
                      <button
                        ref={zoomBtnRef}
                        className={zoomModalOpen ? 'selected' : ''}
                        title="Phóng to preview"
                        aria-label="Phóng to"
                        aria-pressed={zoomModalOpen}
                        onClick={() => setZoomModalOpen(true)}
                      >
                        Phóng to
                      </button>
                      <button
                        className={previewFullscreen ? 'selected' : ''}
                        title={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                        aria-label={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                        aria-pressed={previewFullscreen}
                        onClick={() => void togglePreviewFullscreen()}
                      >
                        {previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                      </button>
                    </div>
                  </div>
                  <PresentationControls
                    value={presentation}
                    onChange={setPresentation}
                    profileId={profile.id}
                    vertical={isVerticalSafeZonePlacement(profile.id)}
                    safeZone={safeZone}
                    onToggleSafeZone={() => setSettings({ safeZone: !safeZone })}
                  />
                  <div className="mockup-description">
                    <span className="mockup-device-tag">
                      {mockup.kind === 'phone' ? 'MOBILE' : 'DESKTOP'}
                    </span>
                    <div>
                      <strong>
                        {mockup.label}
                        {mockup.kind === 'phone' ? ' (6,1 inch)' : ''}
                      </strong>
                      <span>
                        {mockup.viewport.width} × {mockup.viewport.height}{' '}
                        {mockup.kind === 'phone' ? 'điểm' : 'px'} · Thu nhỏ đúng tỉ lệ
                      </span>
                      <small>
                        Target: {profile.device} · Khung xem không đổi thông số quảng cáo.
                      </small>
                    </div>
                  </div>
                  {showCrop && (
                    <div className="crop-controls">
                      <strong>Crop riêng · {profile.title}</strong>
                      <span>
                        {fit === 'cover' ? 'Lấp đầy khung' : 'Giữ toàn bộ media'} · Không đổi file
                        gốc
                      </span>
                      <label htmlFor="focal-x">
                        Vị trí ngang <output>{settings.focalX}%</output>
                      </label>
                      <input
                        id="focal-x"
                        type="range"
                        min={0}
                        max={100}
                        value={settings.focalX}
                        disabled={fit === 'contain'}
                        onChange={(event) => setSettings({ focalX: Number(event.target.value) })}
                      />
                      <label htmlFor="focal-y">
                        Vị trí dọc <output>{settings.focalY}%</output>
                      </label>
                      <input
                        id="focal-y"
                        type="range"
                        min={0}
                        max={100}
                        value={settings.focalY}
                        disabled={fit === 'contain'}
                        onChange={(event) => setSettings({ focalY: Number(event.target.value) })}
                      />
                      <button
                        className="text-button"
                        onClick={() => setSettings({ focalX: 50, focalY: 50 })}
                      >
                        Đặt về giữa
                      </button>
                    </div>
                  )}
                  {profile.renderer === 'form' && (
                    <div className="form-stage-controls" aria-label="Giai đoạn Form">
                      <button
                        className="button"
                        aria-pressed={formStage === 'creative'}
                        onClick={() => setFormStage('creative')}
                      >
                        Quảng cáo trước click
                      </button>
                      <button
                        className="button"
                        aria-pressed={formStage === 'form'}
                        onClick={() => setFormStage('form')}
                      >
                        Form sau click
                      </button>
                    </div>
                  )}
                  <div
                    ref={previewStageRef}
                    className={`preview-stage ${profile.renderer === 'vertical' && !allPlacementsInline ? 'stage-vertical' : ''} ${previewZoomed ? 'preview-stage-zoomed' : ''} ${allPlacementsInline ? 'preview-stage-grid' : ''}`}
                  >
                    {allPlacementsInline ? (
                      <div className="inline-all-placements" aria-label={`Tất cả vị trí ${profile.groupName}`}>
                        <div className="inline-all-placements-header">
                          <div>
                            <strong>
                              {profile.groupName} · Tất cả vị trí ({groupProfiles.length})
                            </strong>
                            <span>Bấm vào bất kỳ thẻ nào để chuyển sang chế độ xem chi tiết vị trí đó</span>
                          </div>
                          <button
                            type="button"
                            className="button ghost"
                            onClick={() => setAllPlacementsInline(false)}
                          >
                            Quay lại 1 vị trí
                          </button>
                        </div>
                        <div className="inline-all-placements-grid">
                          {groupProfiles.map((item) => {
                            const itemSettings = resolvedRenderSettings(draft, item.id)
                            const itemMockup = deviceMockupFor(item, mockupMode)
                            return (
                              <article
                                key={item.id}
                                className={`inline-placement-card ${item.id === profile.id ? 'active' : ''}`}
                              >
                                <div className="inline-placement-card-head">
                                  <div>
                                    <strong>{placementLabel(item)}</strong>
                                    <small>{item.device} · {item.product}</small>
                                  </div>
                                  <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => chooseProfile(item.id)}
                                  >
                                    Chọn vị trí
                                  </button>
                                </div>
                                <div className="inline-placement-card-body">
                                  <PreviewSurface width={itemMockup.frame.width} maxHeight={480}>
                                    <DeviceMockup
                                      spec={itemMockup}
                                      contentWidth={mockupContentWidth(item, itemMockup)}
                                      immersive={item.renderer === 'vertical'}
                                      browserTitle={`${item.groupName} · ${placementLabel(item)}`}
                                      browserUrl={browserUrlFor(item)}
                                      appChrome={presentation.appChrome}
                                    >
                                      {item.groupId === 'admicro' ? (
                                        renderAdmicroContext(item, itemSettings)
                                      ) : (
                                        <Preview
                                          draft={draft}
                                          profile={item}
                                          {...itemSettings}
                                          formStage={formStage}
                                          presentation={presentation}
                                        />
                                      )}
                                    </DeviceMockup>
                                  </PreviewSurface>
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`preview-wrap device-wrap ${profile.renderer}`}>
                          <PreviewSurface
                            width={mockup.frame.width}
                            maxHeight={740}
                            surfaceRef={reviewSurface}
                          >
                            <div className="snapshot-heading">
                              <strong>
                                {profile.groupName} / {profile.title}
                              </strong>
                              <span>
                                {evidenceLabel[profile.evidence]} · {profile.version}
                              </span>
                            </div>
                            <DeviceMockup
                              spec={mockup}
                              contentWidth={mockupContentWidth(profile, mockup)}
                              immersive={profile.renderer === 'vertical'}
                              browserTitle={`${profile.groupName} · ${placementLabel(profile)}`}
                              browserUrl={browserUrlFor(profile)}
                              appChrome={presentation.appChrome}
                            >
                              {renderedPreview}
                            </DeviceMockup>
                            <div
                              className="snapshot-status"
                              data-form-stage={profile.renderer === 'form' ? formStage : undefined}
                            >
                              <strong>
                                {summary.fail} lỗi · {summary.warn} lưu ý · {summary.unknown} chưa rõ
                              </strong>
                              <span>Mô phỏng; không phải phê duyệt quảng cáo.</span>
                            </div>
                          </PreviewSurface>
                        </div>
                        <span className="stage-caption">
                          {profile.groupName} / {profile.title}
                        </span>
                      </>
                    )}
                  </div>
                  <ZoomModal
                    isOpen={zoomModalOpen}
                    onClose={() => setZoomModalOpen(false)}
                    profile={profile}
                    mockup={mockup}
                    triggerRef={zoomBtnRef}
                  >
                    <PreviewSurface
                      width={mockup.frame.width}
                      maxHeight={typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.85) : 800}
                    >
                      <DeviceMockup
                        spec={mockup}
                        contentWidth={mockupContentWidth(profile, mockup)}
                        immersive={profile.renderer === 'vertical'}
                        browserTitle={`${profile.groupName} · ${placementLabel(profile)}`}
                        browserUrl={browserUrlFor(profile)}
                        appChrome={presentation.appChrome}
                      >
                        {renderedPreview}
                      </DeviceMockup>
                    </PreviewSurface>
                  </ZoomModal>
                  <div className="preview-disclaimer">
                    <span>Mô phỏng cơ bản. Không đảm bảo quảng cáo được duyệt.</span>
                  </div>
                  <LivePlacementValidation
                    profile={profile}
                    draft={draft}
                    checks={checks}
                    summary={summary}
                    spec={profileSpec}
                  />
                  <OfficialSpecificationsCard
                    profile={profile}
                    spec={profileSpec}
                  />
                  <div className="export-controls">
                    <button
                      className="button"
                      onClick={(event) => void openReviewDrawer('png', event.currentTarget)}
                      disabled={
                        exporting ||
                        uploading ||
                        importing ||
                        reviewPreparing ||
                        reviewIntent !== null
                      }
                    >
                      Xuất PNG
                    </button>
                    <button
                      className="button accent"
                      onClick={(event) => void openReviewDrawer('package', event.currentTarget)}
                      disabled={
                        exporting ||
                        uploading ||
                        importing ||
                        reviewPreparing ||
                        reviewIntent !== null
                      }
                    >
                      Gói review ZIP
                    </button>
                    <small>
                      ZIP gồm media, PNG và kết quả kiểm tra. Video xuất một khung hình.
                    </small>
                  </div>
                </section>
                <aside className="validation-panel min-w-0" aria-label="Kiểm tra creative">
                  <div className="panel-title">
                    <h2>
                      <span>03</span>Kiểm tra
                    </h2>
                    <span className="check-total">{checks.length}</span>
                  </div>
                  <div className="validation-summary">
                    <div className="summary-heading">
                      <span className={`summary-mark ${summary.fail ? 'fail' : 'unknown'}`}>
                        {summary.fail ? '!' : '?'}
                      </span>
                      <div>
                        <strong>
                          {summary.fail
                            ? 'Có nội dung cần sửa'
                            : summary.unknown
                              ? 'Cần đối chiếu thông số'
                              : summary.warn
                                ? 'Có lưu ý'
                                : 'Đã kiểm tra theo profile'}
                        </strong>
                        <small>Kết quả theo rule, không phải phê duyệt.</small>
                      </div>
                    </div>
                    <div className="summary-counts">
                      <span>
                        <i className="fail" />
                        {summary.fail} lỗi
                      </span>
                      <span>
                        <i className="warn" />
                        {summary.warn} lưu ý
                      </span>
                      <span>
                        <i className="unknown" />
                        {summary.unknown} chưa rõ
                      </span>
                    </div>
                  </div>
                  <div className="check-list">
                    {visibleChecks.map((check) => (
                      <div className="check-entry" key={check.id}>
                        <button
                          className={`check-item ${check.status}`}
                          onClick={() => focusCheck(check)}
                          aria-describedby={`check-source-${check.id}`}
                        >
                          <span className="check-icon">
                            {check.status === 'fail'
                              ? '!'
                              : check.status === 'pass'
                                ? '✓'
                                : check.status === 'unknown'
                                  ? '?'
                                  : 'i'}
                          </span>
                          <div>
                            <span className="check-status">{statusNames[check.status]}</span>
                            <p>{check.message}</p>
                            {(check.actual !== undefined || check.expected !== undefined) && (
                              <small>
                                {check.actual !== undefined ? `Hiện tại: ${check.actual}` : ''}
                                {check.expected !== undefined
                                  ? ` · Yêu cầu: ${check.expected}`
                                  : ''}
                              </small>
                            )}
                            {check.source && (
                              <small id={`check-source-${check.id}`} className="check-source">
                                Nguồn: {check.source}
                              </small>
                            )}
                          </div>
                        </button>
                        <button
                          className="text-button source-button"
                          aria-label={`Nguồn rule ${check.id}`}
                          onClick={(event) => {
                            sourceTrigger.current = event.currentTarget
                            setSourceCheck(check)
                          }}
                        >
                          Nguồn rule
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? 'Ẩn kiểm tra đạt' : `Xem ${summary.pass} kiểm tra đạt`}
                  </button>
                  <div className="validation-foot">
                    <p>Unknown không được tính là pass. Mỗi rule giữ nguồn và spec version.</p>
                  </div>
                </aside>
                <EditorPanel expanded={editorExpanded} onExpandedChange={setEditorExpanded} className="min-w-0">
                  <section aria-label="Nội dung quảng cáo">
                    <div className="panel-title">
                      <h2>
                        <span>01</span>Nội dung quảng cáo
                      </h2>
                      <div className="history-buttons">
                        <button
                          aria-label="Hoàn tác"
                          title="Hoàn tác"
                          disabled={!history.canUndo || uploading}
                          onClick={history.undo}
                        >
                          ↶
                        </button>
                        <button
                          aria-label="Làm lại"
                          title="Làm lại"
                          disabled={!history.canRedo || uploading}
                          onClick={history.redo}
                        >
                          ↷
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          style={{ fontSize: 12, marginLeft: 8 }}
                          title="Về nội dung mặc định"
                          onClick={() => setDraft(initialDraft)}
                        >
                          Về nội dung mặc định
                        </button>
                      </div>
                    </div>
                    <p className="editor-intro">
                      Nhập một lần, xem trên mọi nền tảng. Bộ đếm ký tự và Policy tự động đồng bộ theo <strong>{profile.groupName}</strong>.
                    </p>
                    <div
                      data-testid="channel-policy-banner"
                      style={{
                        borderRadius: 12,
                        border: '1px solid #E5E7EB',
                        background: '#F9FAFB',
                        padding: '8px 12px',
                        marginBottom: 10,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ color: '#18181B' }}>
                          {profile.groupName} • {profile.title} Policy
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              borderRadius: 999,
                              padding: '2px 8px',
                              fontSize: 10.5,
                              fontWeight: 600,
                              background: '#FFFFFF',
                              color: summary.fail > 0 ? '#DC2626' : '#18181B',
                              border: summary.fail > 0 ? '1px solid #FECACA' : '1px solid #E5E7EB',
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: summary.fail > 0 ? '#DC2626' : summary.warn > 0 ? '#F59E0B' : '#10B981',
                              }}
                            />
                            {summary.fail > 0 ? `${summary.fail} lỗi Policy` : summary.warn > 0 ? `${summary.warn} lưu ý tối ưu` : 'Đạt chuẩn Policy'}
                          </span>
                          {(summary.fail > 0 || summary.warn > 0) && (
                            <button
                              type="button"
                              data-testid="btn-autofix-policy"
                              onClick={() => {
                                const pLimit = displayLimit(profile, 'primaryText') || 125
                                const hLimit = displayLimit(profile, 'headline') || 40
                                const dLimit = displayLimit(profile, 'description') || 30
                                const bLimit = profile.limits.brandName || 30
                                setDraft({
                                  ...draft,
                                  identity: {
                                    ...draft.identity,
                                    brandName: (draft.identity.brandName || '').replace(/!/g, '').slice(0, bLimit).trim(),
                                  },
                                  copy: {
                                    ...draft.copy,
                                    primaryText: (draft.copy.primaryText || '').slice(0, pLimit).trim(),
                                    headlines: (draft.copy.headlines || []).map((h) => h.replace(/!/g, '').slice(0, hLimit).trim()),
                                    description: (draft.copy.description || '').slice(0, dLimit).trim(),
                                  },
                                })
                              }}
                              style={{
                                borderRadius: 999,
                                border: '1px solid #18181B',
                                background: '#18181B',
                                color: '#FFFFFF',
                                padding: '2px 10px',
                                fontSize: 10.5,
                                fontWeight: 600,
                              }}
                            >
                              Chuẩn hóa 1 chạm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="editor-file-count">{draft.assets.length} / 10 tệp</span>
                  {profile.groupId === 'admicro' && (
                    <PublisherBindings
                      draft={draft}
                      onChange={(publisher) => setDraft({ ...draft, publisher })}
                      onUpload={() => fileInput.current?.click()}
                      onSource={(check, trigger) => {
                        sourceTrigger.current = trigger
                        setSourceCheck(check)
                      }}
                    />
                  )}
                  <div className="editor-tabs">
                    {(
                      [
                        { id: 'copy', label: 'Nội dung' },
                        { id: 'media', label: 'Media' },
                        { id: 'override', label: 'Copy riêng' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        className={editorTab === tab.id ? 'selected' : ''}
                        onClick={() => setEditorTab(tab.id)}
                      >
                        {tab.label}
                        {tab.id === 'media' && draft.assets.length > 0 && (
                          <span>{draft.assets.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="editor-body">
                    {editorTab === 'copy' && (
                      <div className="default-copy-note">
                        <span>
                          Ô viền nét đứt đang hiện nội dung mặc định của website. Gõ vào để thay
                          bằng nội dung quảng cáo của bạn.
                        </span>
                      </div>
                    )}
                    {editorTab === 'copy' && (
                      <div
                        className={`quick-upload ${dragging ? 'dragging' : ''}`}
                        onDragOver={(event) => {
                          event.preventDefault()
                          setDragging(true)
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(event) => {
                          event.preventDefault()
                          setDragging(false)
                          void addFiles(event.dataTransfer.files)
                        }}
                      >
                        <div>
                          <strong>Ảnh / video quảng cáo</strong>
                          <span>Kéo thả vào đây hoặc bấm chọn. Nhiều tệp = băng chuyền.</span>
                        </div>
                        <button
                          className="button"
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInput.current?.click()}
                        >
                          {uploading ? 'Đang đọc...' : 'Chọn tệp'}
                        </button>
                        <small>Tệp chỉ nằm trong trình duyệt, không tải lên máy chủ.</small>
                      </div>
                    )}
                    {editorTab === 'copy' && (
                      <>
                        {(profile.renderer !== 'form' || formStage === 'creative') &&
                          profile.renderer !== 'banner' && (
                            <>
                              <div className="noti-field-grid">
                                <Field
                                  label="Tên thương hiệu"
                                  id="copy-brandName"
                                  value={draft.identity.brandName}
                                  placeholder="P2P Digital"
                                  limit={profile.limits.brandName}
                                  onChange={(value) =>
                                    setDraft({
                                      ...draft,
                                      identity: { ...draft.identity, brandName: value },
                                    })
                                  }
                                />
                                {profile.renderer !== 'search' && profile.renderer !== 'chat' && (
                                  <Field
                                    label="Tên tài khoản"
                                    value={draft.identity.handle}
                                    placeholder="@p2pdigital"
                                    onChange={(value) =>
                                      setDraft({
                                        ...draft,
                                        identity: { ...draft.identity, handle: value },
                                      })
                                    }
                                  />
                                )}
                              </div>
                              {profile.renderer !== 'search' && profile.renderer !== 'chat' && (
                                <div className="noti-field-grid">
                                  <Field
                                    label="URL đích"
                                    id="copy-destinationUrl"
                                    value={draft.copy.destinationUrl}
                                    placeholder="https://p2pdigital.vn/"
                                    onChange={(value) => setCopy('destinationUrl', value)}
                                    helper="Chỉ hiển thị; không tự tải trang đích."
                                  />
                                  <div className="field">
                                    <label htmlFor="copy-cta">
                                      Nút kêu gọi hành động ({profile.groupName})
                                    </label>
                                    <select
                                      id="copy-cta"
                                      data-testid="select-platform-cta"
                                      value={draft.copy.cta}
                                      onChange={(event) => {
                                        setCopy('cta', event.target.value)
                                        if (profile.groupId === 'youtube') {
                                          updateYoutubeCta(event.target.value)
                                        }
                                      }}
                                    >
                                      {(
                                        {
                                          facebook: [
                                            'Tìm hiểu thêm', 'Mua ngay', 'Gửi tin nhắn', 'Đăng ký', 'Đặt ngay',
                                            'Liên hệ ngay', 'Nhận báo giá', 'Nhận ưu đãi', 'Tải xuống', 'Xem thêm',
                                            'Gọi ngay', 'Gửi tin nhắn WhatsApp', 'Nghe ngay', 'Xem menu', 'Xem giờ chiếu',
                                            'Ứng tuyển ngay', 'Ủng hộ ngay', 'Chơi ngay', 'Theo dõi', '',
                                          ],
                                          instagram: [
                                            'Tìm hiểu thêm', 'Mua ngay', 'Gửi tin nhắn', 'Xem Instagram Profile',
                                            'Đăng ký', 'Đặt ngay', 'Liên hệ với chúng tôi', 'Nhận ưu đãi', 'Xem thêm',
                                            'Tải xuống', 'Nghe ngay', 'Theo dõi', '',
                                          ],
                                          threads: [
                                            'Tìm hiểu thêm', 'Mua ngay', 'Đăng ký', 'Xem thêm',
                                            'Truy cập trang web', 'Liên hệ với chúng tôi', 'Tải xuống', '',
                                          ],
                                          tiktok: [
                                            'Tìm hiểu thêm', 'Mua ngay', 'Đăng ký', 'Tải xuống', 'Đặt ngay',
                                            'Liên hệ với chúng tôi', 'Nhận báo giá', 'Ứng tuyển ngay', 'Xem ngay',
                                            'Cài đặt ngay', 'Chơi ngay', 'Nghe ngay', 'Xem LIVE', 'Đặt trước',
                                            'Ưu đãi giới hạn — Xem ngay', 'Nhận giải pháp AI ngay hôm nay',
                                          ],
                                          youtube: [
                                            'Đăng ký', 'Tìm hiểu', 'Mua ngay', 'Xem ngay', 'Xem thêm', 'Đặt ngay',
                                            'Tải xuống', 'Cài đặt', 'Báo giá', 'Liên hệ', 'Nghe ngay', 'Dùng thử',
                                          ],
                                          'google-search': [
                                            'Tìm hiểu thêm', 'Nhận báo giá', 'Gọi ngay', 'Đăng ký', 'Mua ngay',
                                            'Đặt ngay', 'Liên hệ ngay', 'Tải xuống', 'Truy cập trang web', 'Nhận ưu đãi',
                                          ],
                                          'google-display': [
                                            'Tìm hiểu thêm', 'Đăng ký', 'Mua ngay', 'Tải xuống', 'Liên hệ với chúng tôi',
                                            'Nhận báo giá', 'Đặt ngay', 'Áp dụng ngay', 'Xem thêm', 'Gọi ngay', 'Truy cập trang web',
                                          ],
                                          chatgpt: [
                                            'Tìm hiểu thêm', 'Truy cập trang web', 'Dùng thử ngay', 'Nhận báo giá',
                                            'Đăng ký', 'Xem tài liệu', 'Mua ngay',
                                          ],
                                          zalo: [
                                            'Quan tâm', 'Nhắn tin ngay', 'Gửi thông tin', 'Tìm hiểu thêm',
                                            'Mua ngay', 'Đăng ký', 'Đặt ngay', 'Gọi ngay', 'Xem bài viết',
                                          ],
                                          linkedin: [
                                            'Tìm hiểu thêm', 'Yêu cầu bản Demo', 'Tải xuống', 'Nhận báo giá',
                                            'Đăng ký', 'Đăng ký ngay', 'Đăng ký tham gia', 'Tham dự sự kiện',
                                            'Tham gia ngay', 'Đăng ký theo dõi', 'Xem báo giá', 'Ứng tuyển',
                                          ],
                                          admicro: [
                                            'Tìm hiểu thêm', 'Xem ngay', 'Xem bài viết', 'Nhận ưu đãi',
                                            'Mua ngay', 'Đăng ký', 'Nhận báo giá', 'Liên hệ ngay',
                                          ],
                                        }[profile.groupId] ?? [
                                          'Tìm hiểu thêm',
                                          'Mua ngay',
                                          'Đăng ký',
                                          'Đặt ngay',
                                          'Liên hệ với chúng tôi',
                                        ]
                                      ).map((value) => (
                                        <option key={value} value={value}>
                                          {value || 'Không nút CTA (No Button)'}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                              <div className="logo-upload-row">
                                <div>
                                  <strong>Logo / ảnh đại diện</strong>
                                  <span>
                                    {draft.assets.find((asset) =>
                                      ['logo', 'avatar'].includes(asset.role),
                                    )?.name ?? 'Logo website (mặc định)'}
                                  </span>
                                </div>
                                <button
                                  className="button"
                                  type="button"
                                  onClick={() => fileInput.current?.click()}
                                  disabled={uploading}
                                >
                                  Chọn ảnh
                                </button>
                              </div>
                              {profile.renderer !== 'search' && profile.renderer !== 'chat' && (
                                <Field
                                  label="Văn bản chính"
                                  id="copy-primaryText"
                                  value={draft.copy.primaryText}
                                  placeholder="Chia sẻ về Digital Marketing, AI Automation, AI Agent và Marketing Operations giúp marketer, doanh nghiệp tối ưu tăng trưởng và vận hành."
                                  limit={displayLimit(profile, 'primaryText')}
                                  area
                                  onChange={(value) => setCopy('primaryText', value)}
                                />
                              )}
                              <Field
                                label="Tiêu đề"
                                id="copy-headline"
                                value={draft.copy.headlines[0] ?? ''}
                                placeholder="Tối ưu chiến dịch quảng cáo đa kênh cùng P2P Digital"
                                limit={displayLimit(profile, 'headline')}
                                onChange={(value) =>
                                  setCopy('headlines', [
                                    value,
                                    ...draft.copy.headlines.slice(1),
                                  ])
                                }
                              />
                              <Field
                                label="Mô tả"
                                id="copy-description"
                                value={draft.copy.descriptions[0] ?? ''}
                                placeholder="Khám phá giải pháp tại p2pdigital.vn"
                                limit={displayLimit(profile, 'description')}
                                onChange={(value) =>
                                  setCopy('descriptions', [
                                    value,
                                    ...draft.copy.descriptions.slice(1),
                                  ])
                                }
                              />
                              <div className="field advanced-composition-field">
                                <label htmlFor="composition">Bố cục nội dung</label>
                                <select
                                  id="composition"
                                  value={draft.composition}
                                  onChange={(event) =>
                                    setDraft({ ...draft, composition: event.target.value })
                                  }
                                >
                                  {compositions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.label}
                                      {profile.composition.includes(item.id) ? '' : ' · cần kiểm tra'}
                                    </option>
                                  ))}
                                </select>
                                {!profile.composition.includes(draft.composition) && (
                                  <p className="unsupported-composition" role="status">
                                    Target chưa ghi nhận bố cục này. Giữ nội dung gốc; tạo biến thể riêng
                                    với{' '}
                                    {profile.composition
                                      .map((id) => compositions.find((item) => item.id === id)?.label ?? id)
                                      .join(' / ')}{' '}
                                    rồi kiểm tra lại nguồn.
                                  </p>
                                )}
                                <small>Đổi vị trí giữ nguyên nội dung và asset.</small>
                              </div>
                              {draft.composition === 'carousel' &&
                                draft.assets
                                  .filter((asset) => asset.role === 'creative')
                                  .map((asset, index) => {
                                    const detail = draft.cardDetails?.[asset.id] ?? {
                                      title: '',
                                      description: '',
                                      url: '',
                                    }
                                    return (
                                      <fieldset className="card-detail-fields" key={asset.id}>
                                        <legend>
                                          Card {index + 1} · {asset.name}
                                        </legend>
                                        {(['title', 'description', 'url'] as const).map((key) => (
                                          <Field
                                            key={key}
                                            label={
                                              {
                                                title: 'Tiêu đề card',
                                                description: 'Mô tả card',
                                                url: 'URL card',
                                              }[key]
                                            }
                                            id={`copy-card-${asset.id}-${key}`}
                                            value={detail[key]}
                                            onChange={(value) =>
                                              setDraft({
                                                ...draft,
                                                cardDetails: {
                                                  ...draft.cardDetails,
                                                  [asset.id]: { ...detail, [key]: value },
                                                },
                                              })
                                            }
                                            helper={
                                              key === 'url'
                                                ? 'TikTok Standard Carousel dùng URL chung; URL từng card sẽ được báo không hỗ trợ.'
                                                : undefined
                                            }
                                          />
                                        ))}
                                      </fieldset>
                                    )
                                  })}
                              <Field
                                label="Tên creative"
                                value={draft.name}
                                onChange={(name) => setDraft({ ...draft, name })}
                              />

                              <div className="platform-overrides-section">
                                <h3 className="platform-overrides-heading">
                                  Tùy chỉnh riêng theo nền tảng
                                </h3>

                                <details
                                  className="platform-accordion"
                                  open={profile.groupId === 'google-search' || profile.renderer === 'search'}
                                >
                                  <summary className="platform-accordion-summary">
                                    <span>
                                      <PlatformLogo groupId="google-search" size={16} />
                                      Google Tìm kiếm
                                    </span>
                                    <small>3–15 headlines, 2–4 desc, paths, sitelinks</small>
                                  </summary>
                                  <div className="platform-accordion-content">
                                    <ArrayField
                                      label="Tiêu đề RSA"
                                      values={draft.copy.headlines}
                                      onChange={(value) => setCopy('headlines', value)}
                                      limit={30}
                                      minCount={3}
                                      maxCount={15}
                                      placeholder="Tiêu đề RSA (tối đa 30 ký tự)"
                                    />
                                    <ArrayField
                                      label="Mô tả RSA"
                                      values={draft.copy.descriptions}
                                      onChange={(value) => setCopy('descriptions', value)}
                                      limit={90}
                                      minCount={2}
                                      maxCount={4}
                                      placeholder="Mô tả RSA (tối đa 90 ký tự)"
                                    />
                                    <div className="field-pair">
                                      {draft.copy.paths.map((path, index) => (
                                        <Field
                                          key={index}
                                          label={`Path ${index + 1}`}
                                          value={path}
                                          limit={15}
                                          placeholder={`duong-dan-${index + 1}`}
                                          onChange={(value) =>
                                            setCopy(
                                              'paths',
                                              draft.copy.paths.map((item, i) =>
                                                i === index ? value : item,
                                              ),
                                            )
                                          }
                                        />
                                      ))}
                                    </div>
                                    <ArrayField
                                      label="Sitelinks"
                                      values={
                                        (draft.copy as any).sitelinks ?? [
                                          'Tìm hiểu thêm',
                                          'Bảng giá & Gói dịch vụ',
                                          'Liên hệ tư vấn',
                                          'Tài liệu hướng dẫn',
                                        ]
                                      }
                                      onChange={(value) => setCopy('sitelinks', value)}
                                      limit={25}
                                      minCount={2}
                                      maxCount={8}
                                      placeholder="Tiện ích đường liên kết (tối đa 25 ký tự)"
                                    />
                                    <ArrayField
                                      label="Callouts"
                                      values={
                                        (draft.copy as any).callouts ?? [
                                          'Hỗ trợ 24/7',
                                          'Bắt đầu trong 5 phút',
                                          'Không cần thẻ tín dụng',
                                        ]
                                      }
                                      onChange={(value) => setCopy('callouts', value)}
                                      limit={25}
                                      minCount={1}
                                      maxCount={10}
                                      placeholder="Đoạn chú thích mở rộng (tối đa 25 ký tự)"
                                    />
                                  </div>
                                </details>

                                <details
                                  className="platform-accordion"
                                  open={profile.groupId === 'google-display'}
                                >
                                  <summary className="platform-accordion-summary">
                                    <span>
                                      <PlatformLogo groupId="google-display" size={16} />
                                      Google Hiển thị (GDN)
                                    </span>
                                    <small>Long Headline max 90</small>
                                  </summary>
                                  <div className="platform-accordion-content">
                                    <Field
                                      label="Tiêu đề dài GDN (Long Headline)"
                                      id="override-gdn-long-headline"
                                      value={
                                        (draft.copy as any).gdnLongHeadline ??
                                        (draft.copy as any).gdn?.longHeadline ??
                                        ''
                                      }
                                      limit={90}
                                      placeholder={
                                        draft.copy.headlines[0] ||
                                        'Digital Marketing, AI Automation & Marketing Operations - p2pdigital.vn'
                                      }
                                      onChange={updateGdnOverride}
                                      helper="Tối đa 90 ký tự. Để trống sẽ kế thừa tiêu đề chung."
                                    />
                                  </div>
                                </details>

                                <details
                                  className="platform-accordion"
                                  open={profile.groupId === 'youtube'}
                                >
                                  <summary className="platform-accordion-summary">
                                    <span>
                                      <PlatformLogo groupId="youtube" size={16} />
                                      YouTube
                                    </span>
                                    <small>Headline max 15, CTA max 10</small>
                                  </summary>
                                  <div className="platform-accordion-content">
                                    <Field
                                      label="Tiêu đề YouTube (Headline)"
                                      id="override-youtube-headline"
                                      value={
                                        (draft.copy as any).youtubeHeadline ??
                                        (draft.copy as any).youtube?.headline ??
                                        ''
                                      }
                                      limit={15}
                                      placeholder={
                                        draft.copy.headlines[0]?.slice(0, 15) || 'Xem ngay video'
                                      }
                                      onChange={updateYoutubeHeadline}
                                      helper="Tối đa 15 ký tự."
                                    />
                                    <Field
                                      label="Nút kêu gọi YouTube (CTA)"
                                      id="override-youtube-cta"
                                      value={
                                        (draft.copy as any).youtubeCta ??
                                        (draft.copy as any).youtube?.cta ??
                                        ''
                                      }
                                      limit={10}
                                      placeholder={draft.copy.cta?.slice(0, 10) || 'Xem ngay'}
                                      onChange={updateYoutubeCta}
                                      helper="Tối đa 10 ký tự."
                                    />
                                  </div>
                                </details>

                                <details
                                  className="platform-accordion"
                                  open={profile.groupId === 'chatgpt'}
                                >
                                  <summary className="platform-accordion-summary">
                                    <span>
                                      <PlatformLogo groupId="chatgpt" size={16} />
                                      ChatGPT
                                    </span>
                                    <small>Title 3–50, Body max 100</small>
                                  </summary>
                                  <div className="platform-accordion-content">
                                    <Field
                                      label="Tiêu đề ChatGPT (Title)"
                                      id="override-chatgpt-title"
                                      value={
                                        (draft.copy as any).chatgptTitle ??
                                        (draft.copy as any).chatgpt?.title ??
                                        ''
                                      }
                                      limit={50}
                                      placeholder={
                                        draft.copy.headlines[0] || 'Gợi ý giải pháp từ P2P Digital'
                                      }
                                      onChange={updateChatgptTitle}
                                      helper="Tối thiểu 3 ký tự, tối đa 50 ký tự."
                                    />
                                    <Field
                                      label="Nội dung ChatGPT (Body)"
                                      id="override-chatgpt-body"
                                      area
                                      value={
                                        (draft.copy as any).chatgptBody ??
                                        (draft.copy as any).chatgpt?.body ??
                                        ''
                                      }
                                      limit={100}
                                      placeholder={
                                        draft.copy.primaryText ||
                                        'Nội dung tin nhắn tài trợ hiển thị trong câu trả lời AI.'
                                      }
                                      onChange={updateChatgptBody}
                                      helper="Tối đa 100 ký tự."
                                    />
                                  </div>
                                </details>
                              </div>
                            </>
                          )}
                        {profile.renderer === 'banner' && (
                          <div className="helper-box">
                            <span>
                              Banner dùng file media tải lên. Chọn tab Media để thêm hoặc đổi asset;
                              nội dung chữ nằm trong ảnh.
                            </span>
                          </div>
                        )}
                        {profile.product.toLowerCase().includes('form') && (
                          <div className="form-fields">
                            <h3>Nội dung Form sau click</h3>
                            <Field
                              label="Tên OA"
                              value={draft.form.oaName}
                              limit={profile.limits.formOaName}
                              onChange={(value) =>
                                setDraft({ ...draft, form: { ...draft.form, oaName: value } })
                              }
                            />
                            <Field
                              label="Tiêu đề Form"
                              value={draft.form.title}
                              limit={profile.limits.formTitle}
                              onChange={(value) =>
                                setDraft({ ...draft, form: { ...draft.form, title: value } })
                              }
                            />
                            <Field
                              label="Nội dung Form"
                              value={draft.form.body}
                              limit={profile.limits.formBody}
                              area
                              onChange={(value) =>
                                setDraft({ ...draft, form: { ...draft.form, body: value } })
                              }
                            />
                            <FormQuestions
                              questions={draft.form.questions}
                              onChange={(questions) =>
                                setDraft({ ...draft, form: { ...draft.form, questions } })
                              }
                            />
                          </div>
                        )}
                        <div className="helper-box">
                          <span>
                            Bộ đếm hiển thị dùng grapheme. Rule engine áp cách đếm riêng từng
                            profile.
                          </span>
                        </div>
                      </>
                    )}
                    {editorTab === 'media' && (
                      <>
                        <button
                          id="add-media"
                          className={`upload-zone ${dragging ? 'dragging' : ''}`}
                          disabled={uploading}
                          onClick={() => fileInput.current?.click()}
                          onDragOver={(event) => {
                            event.preventDefault()
                            setDragging(true)
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={(event) => {
                            event.preventDefault()
                            setDragging(false)
                            void addFiles(event.dataTransfer.files)
                          }}
                        >
                          <span className="upload-icon">+</span>
                          <strong>
                            {uploading ? 'Đang đọc metadata...' : 'Thả media vào đây'}
                          </strong>
                          <span>hoặc chọn tệp trên thiết bị</span>
                          <small>Ảnh, video, audio · Không upload server</small>
                        </button>
                        <div className="asset-list">
                          {draft.assets.map((asset, assetIndex) => (
                            <div className="asset-row" key={asset.id}>
                              <div className="asset-thumb">
                                {asset.kind === 'image' ? (
                                  <img src={asset.url} alt="" />
                                ) : asset.kind === 'video' ? (
                                  <span>VID</span>
                                ) : (
                                  <span>AUD</span>
                                )}
                              </div>
                              <div className="asset-info">
                                <strong title={asset.name}>{asset.name}</strong>
                                <small>
                                  {asset.width && asset.height
                                    ? `${asset.width} × ${asset.height} · `
                                    : ''}
                                  {sizeLabel(asset.bytes)}
                                  {asset.durationMs
                                    ? ` · ${(asset.durationMs / 1000).toFixed(1)}s`
                                    : ''}
                                </small>
                                <select
                                  aria-label={`Vai trò ${asset.name}`}
                                  value={asset.role}
                                  onChange={(event) =>
                                    setDraft({
                                      ...draft,
                                      assets: draft.assets.map((item) =>
                                        item.id === asset.id
                                          ? {
                                              ...item,
                                              role: event.target.value as typeof asset.role,
                                            }
                                          : item,
                                      ),
                                    })
                                  }
                                  disabled={asset.kind === 'audio'}
                                >
                                  {['creative', 'logo', 'avatar', 'form_cover', 'audio']
                                    .filter((role) =>
                                      asset.kind === 'audio'
                                        ? role === 'audio'
                                        : role !== 'audio' &&
                                          (asset.kind === 'image' || role === 'creative'),
                                    )
                                    .map((role) => (
                                      <option key={role} value={role}>
                                        {
                                          {
                                            creative: 'Creative',
                                            logo: 'Logo',
                                            avatar: 'Avatar OA',
                                            form_cover: 'Ảnh bìa Form',
                                            audio: 'Audio',
                                          }[role]
                                        }
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div className="asset-actions">
                                <button
                                  aria-label={`Đưa ${asset.name} lên`}
                                  disabled={assetIndex === 0 || uploading}
                                  onClick={() => moveAsset(asset.id, -1)}
                                >
                                  ↑
                                </button>
                                <button
                                  aria-label={`Đưa ${asset.name} xuống`}
                                  disabled={assetIndex === draft.assets.length - 1 || uploading}
                                  onClick={() => moveAsset(asset.id, 1)}
                                >
                                  ↓
                                </button>
                                <button
                                  aria-label={`Xóa ${asset.name}`}
                                  disabled={uploading}
                                  onClick={() =>
                                    setDraft({
                                      ...draft,
                                      assets: draft.assets.filter((item) => item.id !== asset.id),
                                    })
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {!draft.assets.length && (
                          <div className="media-empty">
                            <p>Chưa có media.</p>
                            <small>Thêm file rồi gán vai trò creative, logo hoặc cover.</small>
                          </div>
                        )}
                        {draft.composition === 'carousel' &&
                          draft.assets
                            .filter((asset) => asset.role === 'creative')
                            .map((asset, index) => {
                              const detail = draft.cardDetails?.[asset.id] ?? {
                                title: '',
                                description: '',
                                url: '',
                              }
                              return (
                                <fieldset className="card-detail-fields" key={asset.id}>
                                  <legend>
                                    Card {index + 1} · {asset.name}
                                  </legend>
                                  {(['title', 'description', 'url'] as const).map((key) => (
                                    <Field
                                      key={key}
                                      label={
                                        {
                                          title: 'Tiêu đề card',
                                          description: 'Mô tả card',
                                          url: 'URL card',
                                        }[key]
                                      }
                                      id={`card-${asset.id}-${key}`}
                                      value={detail[key]}
                                      onChange={(value) =>
                                        setDraft({
                                          ...draft,
                                          cardDetails: {
                                            ...draft.cardDetails,
                                            [asset.id]: { ...detail, [key]: value },
                                          },
                                        })
                                      }
                                      helper={
                                        key === 'url'
                                          ? 'TikTok Standard Carousel dùng URL chung; URL từng card sẽ được báo không hỗ trợ.'
                                          : undefined
                                      }
                                    />
                                  ))}
                                </fieldset>
                              )
                            })}
                        <div className="helper-box">
                          <span>
                            Ngân sách app: 256 MB/tệp, 512 MB/phiên. Giới hạn nền tảng kiểm tra
                            riêng.
                          </span>
                        </div>
                      </>
                    )}
                    {editorTab === 'override' && (
                      <>
                        <div className="override-note">
                          <strong>
                            {profile.groupName} · {profile.title}
                          </strong>
                          <p>Copy riêng chỉ áp dụng target này. “Xóa” giữ trống chủ ý.</p>
                        </div>
                        {(Object.keys(fieldLabels) as CopyField[]).map((field) => {
                          const override = draft.overrides[profile.id]?.[field] ?? {
                            mode: 'inherit' as const,
                            value: '',
                          }
                          return (
                            <div className="override-field" key={field}>
                              <div className="field-heading">
                                <label htmlFor={`override-${field}`}>{fieldLabels[field]}</label>
                                <select
                                  aria-label={`Chế độ ${fieldLabels[field]}`}
                                  value={override.mode}
                                  onChange={(event) =>
                                    setOverride(
                                      field,
                                      event.target.value as typeof override.mode,
                                      override.value || copy[field],
                                    )
                                  }
                                >
                                  <option value="inherit">Dùng chung</option>
                                  <option value="replace">Copy riêng</option>
                                  <option value="clear">Xóa</option>
                                </select>
                              </div>
                              {override.mode === 'replace' ? (
                                <textarea
                                  id={`override-${field}`}
                                  rows={2}
                                  value={override.value}
                                  onChange={(event) =>
                                    setOverride(field, 'replace', event.target.value)
                                  }
                                />
                              ) : (
                                <div className="inherited-copy">
                                  {override.mode === 'clear'
                                    ? 'Trống chủ ý'
                                    : copy[field] || 'Chưa có nội dung'}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </>
                    )}
                    {editorTab !== 'copy' && (
                      <div className="field advanced-composition-field">
                        <label htmlFor="composition">Bố cục nội dung</label>
                        <select
                          id="composition"
                          value={draft.composition}
                          onChange={(event) =>
                            setDraft({ ...draft, composition: event.target.value })
                          }
                        >
                          {compositions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                              {profile.composition.includes(item.id) ? '' : ' · cần kiểm tra'}
                            </option>
                          ))}
                        </select>
                        {!profile.composition.includes(draft.composition) && (
                          <p className="unsupported-composition" role="status">
                            Target chưa ghi nhận bố cục này. Giữ nội dung gốc; tạo biến thể riêng với{' '}
                            {profile.composition
                              .map((id) => compositions.find((item) => item.id === id)?.label ?? id)
                              .join(' / ')}{' '}
                            rồi kiểm tra lại nguồn.
                          </p>
                        )}
                        <small>Đổi vị trí giữ nguyên nội dung và asset.</small>
                      </div>
                    )}
                  </div>
                  <ContextFields
                    value={draft.context}
                    onChange={(context) => setDraft({ ...draft, context })}
                  />
                  {profile.groupId === 'admicro' && draft.publisher && (
                    <PublisherPicker selection={draft.publisher} onSelect={chooseProfile} />
                  )}
                  </section>
                </EditorPanel>
              </div>
              <footer className="workspace-footer">
                <span>
                  <span className="local-dot" />
                  Session-only · Không OAuth · Không ad API
                </span>
                <span>Editor · Compare · Preflight · Review export</span>
              </footer>
            </>
          )}
        </main>
      </div>
      {reviewIntent && (
        <div
          className="drawer-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReviewDrawer()
          }}
        >
          <aside
            ref={reviewDrawer}
            className="source-drawer review-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-drawer-title"
          >
            <div className="source-drawer-heading">
              <div>
                <span className="breadcrumb">REVIEW / EXPORT</span>
                <h2 id="review-drawer-title">Review trước khi xuất</h2>
              </div>
              <button
                className="text-button"
                aria-label="Đóng review export"
                onClick={closeReviewDrawer}
              >
                ×
              </button>
            </div>
            <div className="review-drawer-body">
              <section className="review-target-card" aria-label="Target xuất review">
                <span className={`evidence-badge ${profile.evidence}`}>
                  {evidenceLabel[profile.evidence] ?? profile.evidence}
                </span>
                <h3>
                  {profile.groupName} / {profile.title}
                </h3>
                <p>
                  {profile.product} · {profile.device} · spec {profile.version}
                </p>
                <small>
                  Kiểm tra nguồn {profile.checkedAt}. Mô phỏng nội bộ / không phải phê duyệt quảng
                  cáo.
                </small>
              </section>

              <section className="review-state-card" aria-live="polite">
                <div className="summary-heading">
                  <span className={`summary-mark ${reviewSummary.fail ? 'fail' : 'unknown'}`}>
                    {reviewSummary.fail ? '!' : '?'}
                  </span>
                  <div>
                    <strong>
                      {reviewPreparing
                        ? 'Đang chuẩn bị manifest...'
                        : reviewStateLabel(reviewState)}
                    </strong>
                    <small>
                      {reviewIntent === 'package'
                        ? 'ZIP gồm PNG, manifest, nháp và media local.'
                        : 'PNG kèm trạng thái preflight trong ảnh.'}
                    </small>
                  </div>
                </div>
                <div className="review-counts">
                  <span>
                    <i className="fail" />
                    {reviewSummary.fail} lỗi
                  </span>
                  <span>
                    <i className="warn" />
                    {reviewSummary.warn} lưu ý
                  </span>
                  <span>
                    <i className="unknown" />
                    {reviewSummary.unknown} chưa rõ
                  </span>
                  <span>
                    <i className="pass" />
                    {reviewSummary.pass} đạt
                  </span>
                </div>
                {reviewError && (
                  <div className="review-error" role="alert">
                    <span>Không tạo được manifest preview: {reviewError}</span>
                  </div>
                )}
                {reviewExportError && (
                  <div className="review-error" role="alert">
                    <span>{reviewExportError}</span>
                  </div>
                )}
              </section>

              <section className="review-section" aria-label="Manifest review">
                <h3>Manifest</h3>
                <dl className="review-manifest-grid">
                  <div>
                    <dt>Renderer</dt>
                    <dd>{reviewManifest?.rendererVersion ?? 'Đang chuẩn bị'}</dd>
                  </div>
                  <div>
                    <dt>Catalog</dt>
                    <dd>{reviewManifest?.catalogVersion ?? 'Đang chuẩn bị'}</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>{reviewIntent === 'package' ? 'Review package ZIP' : 'Preview PNG'}</dd>
                  </div>
                  <div>
                    <dt>Khung thiết bị</dt>
                    <dd>
                      {mockup.label} · {mockup.viewport.width} × {mockup.viewport.height}
                    </dd>
                  </div>
                  <div>
                    <dt>Render context</dt>
                    <dd>
                      {settings.fit} · safe zone {settings.safeZone ? 'bật' : 'tắt'}
                      {reviewManifest?.renderContext.videoTimeMs !== undefined
                        ? ` · video ${reviewManifest.renderContext.videoTimeMs}ms`
                        : ''}
                      {reviewManifest?.renderContext.searchCombinationIndex !== undefined
                        ? ` · RSA mẫu ${reviewManifest.renderContext.searchCombinationIndex + 1}`
                        : ''}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="review-section" aria-label="Asset trong snapshot">
                <h3>Asset hash</h3>
                <p>
                  {reviewAssets.length} asset · {sizeLabel(reviewAssetBytes)}. Hash dùng để đối
                  chiếu snapshot; binary vẫn ở trên thiết bị cho MVP.
                </p>
                {reviewAssets.length ? (
                  <ul className="review-asset-list">
                    {reviewAssets.slice(0, 5).map((asset) => (
                      <li key={asset.id}>
                        <span>{asset.name}</span>
                        <small>
                          {asset.role} · {asset.sha256.slice(0, 12)}
                        </small>
                      </li>
                    ))}
                    {reviewAssets.length > 5 && (
                      <li>
                        <span>{reviewAssets.length - 5} asset khác</span>
                        <small>Đủ hash trong manifest ZIP.</small>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="empty-state compact">Chưa có asset trong snapshot.</div>
                )}
              </section>

              <section className="review-section" aria-label="Issue chưa giải quyết">
                <h3>Unresolved items</h3>
                {unresolvedChecks.length ? (
                  <ul className="review-issue-list">
                    {unresolvedChecks.slice(0, 8).map((check) => (
                      <li key={check.id} className={check.status}>
                        <strong>{statusNames[check.status]}</strong>
                        <span>{check.message}</span>
                        <small>
                          {check.field}
                          {check.source ? ` · ${check.source}` : ''}
                        </small>
                      </li>
                    ))}
                    {unresolvedChecks.length > 8 && (
                      <li>
                        <strong>{unresolvedChecks.length - 8} mục khác</strong>
                        <span>Đủ kết quả nằm trong manifest.</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="empty-state compact">
                    Không còn fail/warn/unknown theo profile này.
                  </div>
                )}
              </section>
            </div>
            <div className="review-actions">
              <button className="button" onClick={closeReviewDrawer}>
                Hủy
              </button>
              <button
                className="button accent"
                disabled={reviewPreparing || !!reviewError || !reviewManifest || exporting}
                onClick={() => void saveReview(reviewIntent)}
              >
                {exporting
                  ? 'Đang xuất...'
                  : reviewIntent === 'package'
                    ? 'Xuất ZIP review'
                    : 'Xuất PNG'}
              </button>
            </div>
          </aside>
        </div>
      )}
      {sourceCheck && (
        <div
          className="drawer-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSourceCheck(null)
          }}
        >
          <aside
            ref={sourceDrawer}
            className="source-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="source-drawer-title"
          >
            <div className="source-drawer-heading">
              <div>
                <span className="breadcrumb">EVIDENCE / RULE</span>
                <h2 id="source-drawer-title">Nguồn và trạng thái kiểm tra</h2>
              </div>
              <button
                className="text-button"
                aria-label="Đóng nguồn"
                onClick={() => setSourceCheck(null)}
              >
                ×
              </button>
            </div>
            <div className="source-drawer-result">
              <strong>{statusNames[sourceCheck.status]}</strong>
              <p>{sourceCheck.message}</p>
              <small>
                {sourceCheck.field} · evidence: {sourceCheck.evidence ?? 'unknown'}
              </small>
              <small>
                Spec {profile.version} · kiểm tra {profile.checkedAt}
              </small>
              {sourceCheck.actual !== undefined && <small>Hiện tại: {sourceCheck.actual}</small>}
              {sourceCheck.expected !== undefined && <small>Yêu cầu: {sourceCheck.expected}</small>}
              {sourceCheck.notes && <p>{sourceCheck.notes}</p>}
            </div>
            <div className="source-drawer-list">
              {(sourceCheck.sourceRefs ?? []).map((id) => {
                const source = SOURCE_REGISTRY[id as keyof typeof SOURCE_REGISTRY]
                return source ? (
                  <a key={id} href={source.url} target="_blank" rel="noreferrer">
                    <strong>{id}</strong>
                    <span>
                      {source.label} · checked {source.checkedAt}
                    </span>
                    <small>{source.notes ?? 'Nguồn không có ghi chú bổ sung.'}</small>
                    <span>↗</span>
                  </a>
                ) : (
                  <p key={id}>Không tìm thấy source {id}.</p>
                )
              })}
            </div>
            <button className="button" onClick={() => setSourceCheck(null)}>
              Đóng
            </button>
          </aside>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,audio/mpeg,audio/wav"
        hidden
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files)
        }}
      />
      <input
        ref={importInput}
        type="file"
        accept=".json,.zip,application/json,application/zip"
        hidden
        onChange={(event) => void loadDraft(event.target.files?.[0])}
      />
    </div>
  )
}

function previewWidth(profile: UiProfile) {
  if (profile.groupId === 'admicro') return profile.device === 'Mobile' ? 390 : 960
  if (profile.renderer === 'search' && profile.device === 'Desktop') return 600
  if (profile.renderer === 'chat' && profile.device !== 'Mobile') return 520
  if (profile.renderer === 'banner') {
    const dimensions = profile.id.match(/(\d+)x(\d+)/)
    if (dimensions) return Number(dimensions[1])
  }
  return 360
}

function mockupContentWidth(profile: UiProfile, spec: DeviceMockupSpec) {
  if (spec.kind === 'desktop') {
    if (profile.groupId === 'google-display') return 1200
    if (profile.groupId === 'google-search') return 1060
    if (profile.groupId === 'chatgpt') return 1040
    if (profile.groupId === 'youtube' && profile.renderer !== 'vertical') return 1120
    if (profile.groupId === 'linkedin') return 1128
    if (profile.id.startsWith('zalo.display')) return 1160
    if (profile.id === 'facebook.right_column') return 1220
    return profile.renderer === 'vertical' ? 393 : Math.max(520, previewWidth(profile))
  }
  if (profile.renderer === 'banner' && profile.groupId !== 'google-display')
    return Math.min(previewWidth(profile), spec.viewport.width)
  return spec.viewport.width
}

export const VERTICAL_SAFE_ZONE_PROFILES = new Set([
  'facebook.stories',
  'facebook.reels',
  'facebook.stories.carousel',
  'instagram.stories',
  'instagram.reels',
  'tiktok.in_feed',
  'tiktok.in_feed.standard_carousel',
  'tiktok.topview',
  'youtube.shorts',
  'zalo.video',
  'zalo.video.safe_zone',
  // Test fixture IDs:
  'fb_stories',
  'fb_reels',
  'ig_stories',
  'ig_reels',
  'tt_infeed',
  'tt_topview',
  'yt_shorts',
  'zalo_video',
])

export function isVerticalSafeZonePlacement(profileId?: string): boolean {
  if (!profileId) return false
  return VERTICAL_SAFE_ZONE_PROFILES.has(profileId)
}

function PresentationControls({
  value,
  onChange,
  profileId,
  vertical = false,
  safeZone = false,
  onToggleSafeZone,
}: {
  value: PreviewPresentation
  onChange: (value: PreviewPresentation) => void
  profileId?: string
  vertical?: boolean
  safeZone?: boolean
  onToggleSafeZone?: () => void
}) {
  const change = (next: Partial<PreviewPresentation>) => onChange({ ...value, ...next })
  const hasSafeZone =
    isVerticalSafeZonePlacement(profileId) ||
    (Boolean(vertical) && profileId !== 'facebook.reels_banner' && profileId !== 'fb_reels_overlay')
  const isTopView = profileId === 'tiktok.topview' || profileId === 'tt_topview'

  return (
    <div
      className="preview-presentation-controls flex flex-wrap items-center justify-between gap-2.5 p-3"
      aria-label="Giao diện mô phỏng nền tảng"
    >
      {/* Feature 26: Bilingual UI Toggle */}
      <div
        role="group"
        aria-label="Ngôn ngữ giao diện nền tảng"
        className="lang-selector-group inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5"
      >
        <button
          type="button"
          onClick={() => change({ locale: 'vi' })}
          className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
            value.locale === 'vi'
              ? 'bg-white active text-[#101113] shadow-sm'
              : 'text-[#5f6470] hover:text-[#101113]'
          }`}
        >
          Tiếng Việt
        </button>
        <button
          type="button"
          onClick={() => change({ locale: 'en' })}
          className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
            value.locale === 'en'
              ? 'bg-white active text-[#101113] shadow-sm'
              : 'text-[#5f6470] hover:text-[#101113]'
          }`}
        >
          English
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Feature 27: Safe-Zone Overlay Toggle ("Vùng bị che") */}
        {hasSafeZone && (
          <button
            type="button"
            onClick={onToggleSafeZone}
            className={`toolbar-pill-btn inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
              safeZone
                ? 'border-[#18181B] bg-[#18181B] text-white active'
                : 'border-[#E5E7EB] bg-white text-[#525260]'
            }`}
          >
            Vùng bị che
          </button>
        )}

        {/* Feature 28: Native App UI Toggle ("Giao diện app") */}
        {hasSafeZone && (
          <button
            type="button"
            onClick={() => change({ appChrome: !value.appChrome })}
            className={`toolbar-pill-btn inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
              value.appChrome
                ? 'border-[#18181B] bg-[#18181B] text-white active'
                : 'border-[#E5E7EB] bg-white text-[#525260]'
            }`}
          >
            Giao diện app
          </button>
        )}

        {/* Feature 29: TikTok TopView Phase Toggle */}
        {isTopView && (
          <div
            role="group"
            aria-label="Giai đoạn hiển thị TopView"
            className="topview-phase-group inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5"
          >
            <button
              type="button"
              onClick={() => change({ topViewPhase: 'intro' })}
              className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
                value.topViewPhase === 'intro'
                  ? 'bg-white active text-[#101113] shadow-sm'
                  : 'text-[#5f6470] hover:text-[#101113]'
              }`}
            >
              0-3 giây đầu
            </button>
            <button
              type="button"
              onClick={() => change({ topViewPhase: 'feed' })}
              className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
                value.topViewPhase === 'feed'
                  ? 'bg-white active text-[#101113] shadow-sm'
                  : 'text-[#5f6470] hover:text-[#101113]'
              }`}
            >
              Sau 3 giây
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function LivePlacementValidation({
  profile: _profile,
  draft,
  checks,
  summary,
  spec,
}: {
  profile: UiProfile
  draft: EditorDraft
  checks: UiCheck[]
  summary: { fail: number; warn: number; unknown: number; pass: number }
  spec: PlacementSpecData
}) {
  const failChecks = checks.filter((c) => c.status === 'fail')
  const warnChecks = checks.filter((c) => c.status === 'warn')
  const hasCreativeAsset = draft.assets.some((a) => a.role === 'creative' || !a.role)
  const primaryText = draft.copy.primaryText || ''
  const isTruncated = spec.primaryTruncate > 0 && primaryText.length > spec.primaryTruncate

  return (
    <div className="live-validation-section mt-4 grid gap-2.5 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#18181B]">
        <span>Kiểm tra vị trí này</span>
        {summary.fail > 0 ? (
          <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2.5 text-[11px] font-semibold text-[#DC2626]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            <span>{summary.fail} lỗi</span>
          </span>
        ) : summary.warn > 0 ? (
          <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-2.5 text-[11px] font-medium text-[#525260]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
            <span>{summary.warn} cảnh báo</span>
          </span>
        ) : (
          <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-2.5 text-[11px] font-medium text-[#18181B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
            <span>Không có lỗi</span>
          </span>
        )}
      </div>

      <ul className="grid gap-2 text-[13px] leading-snug">
        {failChecks.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            <span className="shrink-0 whitespace-nowrap font-semibold text-[#DC2626]">• Lỗi:</span>
            <span className="text-[#18181B]">{c.message}</span>
          </li>
        ))}
        {warnChecks.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            <span className="shrink-0 whitespace-nowrap font-semibold text-[#475569]">• Cảnh báo:</span>
            <span className="text-[#18181B]">{c.message}</span>
          </li>
        ))}
        {!hasCreativeAsset && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 whitespace-nowrap font-semibold text-[#64748B]">• Lưu ý:</span>
            <span className="text-[#18181B]">
              Chưa có ảnh hoặc video - đang hiện khung giữ chỗ tỉ lệ {spec.ratio} ({spec.recommendedPx}).
            </span>
          </li>
        )}
        {isTruncated && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 whitespace-nowrap font-semibold text-[#64748B]">• Lưu ý:</span>
            <span className="text-[#18181B]">
              Văn bản chính chỉ hiện {spec.primaryTruncate}/{primaryText.length} ký tự trước khi bị cắt (mốc ước lượng) - đưa ý chính lên đầu.
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

function OfficialSpecificationsCard({
  profile,
  spec,
}: {
  profile: UiProfile
  spec: PlacementSpecData
}) {
  return (
    <div className="official-specs-card mt-3 grid gap-2.5 rounded-[14px] border border-[#E5E7EB] bg-[#F8FAFC] p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#18181B]">
          {profile.groupName} · {placementLabel(profile)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-2.5 text-[11px] font-semibold text-[#18181B]">
            Nên dùng {spec.ratio} ({spec.recommendedPx})
          </span>
          <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-2.5 text-[11px] font-medium text-[#64748B]">
            {spec.sourceStatus}
          </span>
        </div>
      </div>

      <ul className="grid gap-1.5 text-[13px] leading-relaxed text-[#5f6470]">
        {spec.specs.map((sp, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5f6470]" />
            <span>{sp}</span>
          </li>
        ))}
        {spec.notes && (
          <li className="mt-1 rounded-lg bg-[#f6f6f7] p-2 text-xs text-[#5f6470]">
            <strong className="text-[#101113]">Lưu ý chính sách: </strong>
            {spec.notes}
          </li>
        )}
      </ul>

      <details className="mt-1 text-xs text-[#5f6470] border-t border-[#e7e7ea] pt-2">
        <summary className="cursor-pointer font-semibold hover:text-[#101113]">
          Nguồn thông số ({profile.source.length || spec.sourceCount || 2})
        </summary>
        <div className="mt-1.5 space-y-1">
          {profile.source.map((src) => (
            <p key={src.url}>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#ed3c47] hover:underline"
              >
                {src.title} ↗
              </a>
            </p>
          ))}
          <p className="text-[11px] text-[#8c919d]">
            Tài liệu hướng dẫn kích thước & thông số kỹ thuật quảng cáo chính thức của {profile.groupName}.
          </p>
        </div>
      </details>
    </div>
  )
}

function MockupPicker({
  value,
  onChange,
}: {
  value: MockupMode
  onChange: (value: MockupMode) => void
}) {
  return (
    <label className="mockup-picker">
      <span>Khung xem</span>
      <select
        aria-label="Khung mockup thiết bị"
        value={value}
        onChange={(event) => onChange(event.target.value as MockupMode)}
      >
        <option value="target">Theo target</option>
        <option value="mobile">Mobile · iPhone 15 / 16</option>
        <option value="pc">PC · 1440 × 900</option>
      </select>
    </label>
  )
}

function ArrayField({
  label,
  values,
  onChange,
  limit,
  minCount = 1,
  maxCount = 15,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  limit: number
  minCount?: number
  maxCount?: number
  placeholder?: string
}) {
  return (
    <div className="array-fields">
      <h3>
        {label}
        <span>{values.length} field</span>
      </h3>
      {values.map((value, index) => (
        <div className="array-row" key={index}>
          <Field
            label={`${label} ${index + 1}`}
            value={value}
            limit={limit}
            placeholder={placeholder}
            onChange={(next) => onChange(values.map((item, i) => (i === index ? next : item)))}
          />
          {values.length > minCount && (
            <button
              aria-label={`Xóa ${label} ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {values.length < maxCount && (
        <button className="add-field" onClick={() => onChange([...values, ''])}>
          + Thêm {label.toLowerCase()}
        </button>
      )}
    </div>
  )
}

function CatalogCard({
  profile,
  checks,
  onSelect,
}: {
  profile: UiProfile
  checks: UiCheck[]
  onSelect: () => void
}) {
  return (
    <article className="catalog-card">
      <div className="catalog-card-top">
        <span className="platform-symbol">
          <PlatformLogo groupId={profile.groupId} label={profile.groupName} size={18} />
        </span>
        <span className={`evidence-badge ${profile.evidence}`}>
          {evidenceLabel[profile.evidence] ?? profile.evidence}
        </span>
      </div>
      <small>{profile.groupName}</small>
      <h2>{profile.title}</h2>
      <p>
        {profile.product} · {profile.device}
      </p>
      <p className="catalog-status">
        {profile.implementation === 'tested'
          ? 'Đã kiểm thử'
          : profile.implementation === 'planned'
            ? 'Chưa triển khai'
            : 'Đã triển khai'}{' '}
        · Renderer mô phỏng
        {profile.supportStatus === 'needs_review'
          ? ' · Cần xác minh'
          : profile.supportStatus === 'deprecated'
            ? ' · Mục cũ'
            : ''}
      </p>
      {profile.supportStatus === 'deprecated' && (
        <details>
          <summary>Lý do và nguồn của mục cũ</summary>
          <p>{profile.notes?.join(' ') || 'Cần đối chiếu lý do trong nguồn.'}</p>
          {profile.source.map((source) => (
            <p key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
              </a>
            </p>
          ))}
        </details>
      )}
      <small>
        {checks.filter((check) => check.status === 'fail').length} lỗi ·{' '}
        {checks.filter((check) => check.status === 'unknown').length} chưa rõ
      </small>
      <div className="catalog-compositions">
        {profile.composition.map((item) => (
          <span key={item}>
            {compositions.find((composition) => composition.id === item)?.label ?? item}
          </span>
        ))}
      </div>
      <div className="catalog-card-bottom">
        <span>{profile.version}</span>
        <button className="text-button" onClick={onSelect}>
          Mở editor ↗
        </button>
      </div>
    </article>
  )
}
