import { AD_PROFILES, ADMICRO_PROFILE_IDS, requireProfile, SOURCE_REGISTRY } from '../catalog'
import type {
  CompositionKind,
  Creative,
  Profile,
  ValidationResult,
  ValidationRule,
} from '../domain'
import { validateCreative } from '../validation'
import { resolvedCopy } from './editorModel'
import type { EditorDraft } from './editorModel'
import { evidenceLabel } from './uiTypes'
import type { UiCheck, UiProfile } from './uiTypes'
import { publisherDraftForTarget, validatePublisher } from './publisherModel'

const fieldNames: Record<string, string> = {
  'identity.brandName': 'Tên thương hiệu',
  'copy.primaryText': 'Văn bản chính',
  'copy.headlines': 'Tiêu đề',
  'copy.descriptions': 'Mô tả',
  'copy.displayPath': 'Path',
  'copy.destinationUrl': 'URL đích',
  'copy.extraText': 'Nội dung bổ sung',
  'form.oaName': 'Tên OA',
  'form.title': 'Tiêu đề Form',
  'form.body': 'Nội dung Form',
  'form.avatar': 'Avatar OA',
  'form.cover': 'Ảnh bìa Form',
  'composition.assetIds': 'Số creative',
  'composition.audioAssetId': 'Music carousel',
  'composition.items.url': 'URL từng card',
  audio: 'Music carousel',
  assets: 'Media',
}
const limitFields: Record<string, string> = {
  'identity.brandName': 'brandName',
  'copy.primaryText': 'primaryText',
  'copy.headlines.*': 'headline',
  'copy.headlines.0': 'headline',
  'copy.descriptions.*': 'description',
  'copy.descriptions.0': 'description',
  'form.oaName': 'formOaName',
  'form.title': 'formTitle',
  'form.body': 'formBody',
}
const deviceNames = {
  mobile: 'Mobile',
  desktop: 'Desktop',
  web: 'Web',
  mobile_app: 'Mobile app',
  all: 'Desktop / Mobile',
}

function previewRatio(profile: Profile): number {
  const dimensions = profile.rules.find(
    (rule) => rule.operator === 'dimensions' && rule.scope === 'all_assets',
  )?.expected
  if (
    dimensions &&
    !Array.isArray(dimensions) &&
    typeof dimensions === 'object' &&
    'width' in dimensions &&
    'height' in dimensions
  ) {
    return Number(dimensions.width) / Number(dimensions.height)
  }
  if (profile.renderer === 'vertical') return 9 / 16
  if (profile.groupId === 'youtube') return 16 / 9
  if (profile.groupId === 'facebook') return 4 / 5
  return 1
}

function toUiProfile(profile: Profile): UiProfile {
  return {
    id: profile.id,
    groupId: profile.groupId,
    groupName: profile.groupTitle,
    title: profile.placement,
    product: profile.productLabel,
    device: deviceNames[profile.device],
    evidence: profile.evidence,
    version: profile.specVersion,
    checkedAt: profile.checkedAt,
    implementation: profile.implementation,
    supportStatus: profile.supportStatus,
    surface: profile.surface,
    notes: profile.notes,
    composition: profile.allowedCompositions,
    source: profile.sources.map((source) => ({ title: source.label, url: source.url })),
    renderer: profile.id === 'tiktok.in_feed.standard_carousel' ? 'vertical' : profile.renderer,
    ratio: previewRatio(profile),
    limits: Object.fromEntries(
      profile.rules
        .filter((rule) => rule.operator === 'maxLength' && limitFields[rule.fieldPath])
        .map((rule) => [limitFields[rule.fieldPath], Number(rule.expected)]),
    ),
  }
}

export const canonicalProfiles: UiProfile[] = AD_PROFILES.map(toUiProfile)

export const profiles: UiProfile[] = [
  ...AD_PROFILES.filter((profile) => profile.groupId !== 'admicro'),
  ...LEGACY_PROFILES.filter((profile) => !AD_PROFILES.some((p) => p.id === profile.id)).slice(0, 8),
  ...ADMICRO_PROFILE_IDS.map(requireProfile),
].map(toUiProfile)

export function toCreative(draft: EditorDraft, profileId: string): Creative {
  const copy = resolvedCopy(draft, profileId)
  const assets = draft.assets.map(({ role, ...asset }) => ({ ...asset, roles: [role] }))
  const creativeAssets = assets.filter((asset) => asset.roles.includes('creative'))
  return {
    id: 'local-draft',
    name: draft.name,
    version: 1,
    locale: 'vi-VN',
    assets,
    identity: {
      brandName: copy.brandName,
      handle: draft.identity.handle,
      logoAssetId: assets.find((asset) => asset.roles.includes('logo'))?.id,
      avatarAssetId: assets.find((asset) => asset.roles.includes('avatar'))?.id,
    },
    copy: {
      primaryText: copy.primaryText,
      headlines:
        draft.copy.headlines.length || draft.overrides[profileId]?.headline
          ? [copy.headline, ...draft.copy.headlines.slice(1)]
          : [],
      descriptions:
        draft.copy.descriptions.length || draft.overrides[profileId]?.description
          ? [copy.description, ...draft.copy.descriptions.slice(1)]
          : [],
      cta: copy.cta,
      destinationUrl: copy.destinationUrl,
      displayPath: draft.copy.paths,
    },
    composition: {
      kind: draft.composition as CompositionKind,
      assetIds: creativeAssets.map((asset) => asset.id),
      primaryAssetId: creativeAssets[0]?.id,
      items:
        draft.composition === 'carousel'
          ? creativeAssets.map((asset, index) => ({
              id: asset.id,
              order: index,
              assetId: asset.id,
              title: draft.cardDetails?.[asset.id]?.title,
              description: draft.cardDetails?.[asset.id]?.description,
              url: draft.cardDetails?.[asset.id]?.url,
            }))
          : [],
      audioAssetId: assets.find((asset) => asset.roles.includes('audio'))?.id,
    },
    form: {
      ...draft.form,
      avatarAssetId: assets.find((asset) => asset.roles.includes('avatar'))?.id,
      coverAssetId: assets.find((asset) => asset.roles.includes('form_cover'))?.id,
      questions: draft.form.questions?.map((question) => ({ ...question })) ?? [],
    },
  }
}

function displayValue(value: unknown): string | number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return value
  if (typeof value === 'string')
    return (
      (
        {
          unknown: 'Chưa đọc được',
          missing: 'Chưa có',
          present: 'Đã có',
          matched: 'Có URL / số điện thoại',
          clear: 'Không phát hiện',
          empty: 'Trống',
        } as Record<string, string>
      )[value] ?? value
    )
  if (Array.isArray(value)) return value.map(displayValue).join(' / ')
  if (value && typeof value === 'object') {
    if ('width' in value && 'height' in value) return `${value.width} × ${value.height}`
    if ('w' in value && 'h' in value) return `${value.w}:${value.h}`
    if ('max' in value && 'conflictingMax' in value)
      return `${Number(value.max) / 1e6} MB / ${Number(value.conflictingMax) / 1e6} MB (xung đột)`
  }
  return JSON.stringify(value)
}

function ruleMessage(result: ValidationResult, rule?: ValidationRule): string {
  if (!rule) return result.message
  const field = Object.keys(fieldNames).find(
    (path) => rule.fieldPath === path || rule.fieldPath.startsWith(`${path}.`),
  )
  const label = field ? fieldNames[field] : rule.fieldPath
  const unit = rule.countingStrategy === 'cjk_weighted' ? 'đơn vị (CJK tính 2)' : 'ký tự'
  const messages: Record<string, string> = {
    required: `${label} không được để trống.`,
    minCount: `${label}: tối thiểu ${rule.expected}.`,
    maxCount: `${label}: tối đa ${rule.expected}.`,
    minLength: `${label}: ít nhất ${rule.expected} ${unit}.`,
    maxLength: `${label}: tối đa ${rule.expected} ${unit}.`,
    mimeIn: `${label}: định dạng cho phép ${displayValue(rule.expected)}.`,
    allowedValues: `${label}: loại asset ${displayValue(rule.expected)}.`,
    dimensions: `${label}: kích thước ${displayValue(rule.expected)}.`,
    minDimensions: `${label}: kích thước tối thiểu ${displayValue(rule.expected)}.`,
    ratioIn: `${label}: tỷ lệ ${displayValue(rule.expected)}.`,
    maxBytes: `${label}: tối đa ${typeof rule.expected === 'number' ? `${rule.expected / 1000} KB` : displayValue(rule.expected)}.`,
    maxDurationMs: `${label}: tối đa ${Number(rule.expected) / 1000} giây.`,
    minDurationMs: `${label}: ít nhất ${Number(rule.expected) / 1000} giây.`,
    codecIn: 'Video cần H.264/AVC; MP4 phát được chưa đủ xác minh codec.',
    audioRequired: 'TikTok Standard Carousel cần music MP3.',
    disallow: `${label} phải trống; dùng URL chung.`,
    url: 'URL đích cần scheme HTTP(S).',
    disallowPattern: 'Caption Zalo có URL hoặc số điện thoại; cần review theo chính sách nền tảng.',
  }
  if (rule.ruleId === 'asset.bytes.carousel_recommendation')
    return '100 KB/ảnh là khuyến nghị TikTok; vượt ngưỡng chỉ báo lưu ý.'
  if (rule.evidence === 'conflict' && rule.operator === 'maxBytes')
    return 'Giới hạn video Zalo xung đột: checker 150 MB, FAQ cũ 10 MB. Cần đối chiếu account.'
  const suffix =
    rule.evidence === 'reference_only' || rule.evidence === 'unknown'
      ? ' Chưa đủ bằng chứng để kết luận.'
      : rule.evidence === 'conflict'
        ? ' Nguồn đang xung đột; cần đối chiếu.'
      : rule.evidence === 'estimated'
        ? ' Ngưỡng mô phỏng.'
        : ''
  return (rule.message ?? messages[rule.operator] ?? result.message) + suffix
}

const ALLOWED_UPPERCASE_TOKENS = new Set([
  'P2P', 'AI', 'CRM', 'SEO', 'SEM', 'RSA', 'RDA', 'GDN', 'VSA', 'CPD', 'CTA', 'ROI', 'KPI',
  'B2B', 'B2C', 'API', 'OA', 'ZNS', 'VIP', 'CEO', 'CMO', 'CTO', 'CFO', 'HR', 'IT', 'PR',
  'KOL', 'KOC', 'ADS', 'PC', 'TV', 'FHD', 'HD', '4K', 'TP', 'HCM', 'HN', 'VN', 'USD',
  'VND', 'PDF', 'HTML5', 'HTML', 'UI', 'UX', 'APP', 'WEB', 'PRO', 'MAX', 'MINI', 'SHOP',
  'LIVE', 'HOT', 'TOP', 'NEW', 'FREE', 'SALE', 'CPC', 'CPM', 'CPA', 'ROAS', 'ERP', 'SAAS',
])

function findExcessiveCapsWords(text: string): string[] {
  if (!text) return []
  const tokens = text.match(/\b[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]{3,}\b/gu) ?? []
  return tokens.filter((w) => !ALLOWED_UPPERCASE_TOKENS.has(w) && !/^[A-Z]+\d+$/.test(w))
}

export function validateDraft(draft: EditorDraft, profileId: string): ValidationResult[] {
  const profile = requireProfile(profileId)
  const results = profile.groupId === 'admicro'
    ? validatePublisher({ ...draft, publisher: publisherDraftForTarget(draft, profileId) })
    : validateCreative(toCreative(draft, profileId), profile)

  const copy = resolvedCopy(draft, profileId)
  const combinedCopy = `${copy.brandName || ''} ${copy.primaryText || ''} ${copy.headline || ''} ${copy.description || ''}`
  const now = new Date().toISOString()
  const pushPolicyError = (ruleId: string, fieldPath: string, message: string) => {
    results.push({
      ruleId,
      profileId,
      fieldPath,
      severity: 'error',
      status: 'fail',
      message,
      source: [...profile.sourceRefs],
      sourceRefs: [...profile.sourceRefs],
      evidence: 'official',
      confidence: 'high',
      createdAt: now,
    })
  }

  // Cross-platform anti-penalty moderation rules
  if (copy.destinationUrl && !copy.destinationUrl.trim().startsWith('https://')) {
    pushPolicyError('policy.https_required', 'copy.destinationUrl', 'Vi phạm bảo mật Trang đích: URL bắt buộc sử dụng giao thức https:// để tránh bị từ chối xét duyệt.')
  }
  if (/\b[a-zA-ZÀ-ỹ]\.[a-zA-ZÀ-ỹ]\.[a-zA-ZÀ-ỹ]/u.test(combinedCopy)) {
    pushPolicyError('policy.circumventing_systems', 'copy.primaryText', 'Vi phạm chính sách Né tránh hệ thống: Không dùng dấu chấm ngắt từng ký tự (ví dụ: g.i.ả.m g.i.á).')
  }
  if (/[!]{2,}|[?]{2,}|[.]{4,}|[*$]{2,}/.test(combinedCopy)) {
    pushPolicyError('policy.excessive_punctuation', 'copy.primaryText', 'Vi phạm chuẩn biên tập quảng cáo: Không lặp lại dấu câu quá mức (!!, ??, ...., **, $$).')
  }
  const capsWords = findExcessiveCapsWords(combinedCopy)
  if (capsWords.length >= 2) {
    pushPolicyError('policy.all_caps', 'copy.headline', `Vi phạm chính sách lạm dụng chữ IN HOA (${capsWords.slice(0, 3).join(', ')}); chỉ viết hoa từ viết tắt chuẩn.`)
  }
  if (/(cam kết 100%|đảm bảo 100%|chắc chắn 100%|hiệu quả 100%|trị dứt điểm|chữa khỏi hoàn toàn|làm giàu nhanh)/i.test(combinedCopy)) {
    pushPolicyError('policy.unrealistic_claims', 'copy.primaryText', 'Vi phạm chính sách Nội dung gây hiểu lầm: Cấm dùng từ ngữ cam kết tuyệt đối 100%, trị dứt điểm hoặc làm giàu nhanh.')
  }

  // Platform-specific moderation rules
  if (['facebook', 'instagram', 'threads'].includes(profile.groupId)) {
    if (/(bạn đang thừa cân|bạn đang béo|bạn bị mụn|bạn bị nám|bạn bị rụng tóc|bạn đang mất ngủ|bạn đang nợ nần|bạn đang thiếu tiền|bạn đang bế tắc)/i.test(combinedCopy)) {
      pushPolicyError('policy.meta_personal_attributes', 'copy.primaryText', 'Vi phạm Chính sách Meta (Personal Attributes): Không ám chỉ trực tiếp đặc điểm cá nhân, sức khỏe hoặc tài chính của người xem.')
    }
    if (/(like và share|nhấn like và chia sẻ|tag 3 người bạn|comment chấm)/i.test(combinedCopy)) {
      pushPolicyError('policy.meta_engagement_bait', 'copy.primaryText', 'Vi phạm Chính sách Meta (Engagement Bait): Không dùng câu chữ câu kéo tương tác giả tạo.')
    }
  }
  if (['google-search', 'google-display'].includes(profile.groupId)) {
    if ((copy.headline || '').includes('!')) {
      pushPolicyError('policy.google_headline_exclamation', 'copy.headlines', 'Vi phạm chính sách Google Ads: Tiêu đề quảng cáo không được chứa dấu chấm than (!).')
    }
    if (/(?:\+84|0)(?:3|5|7|8|9)\d{8}\b|\b1[89]00[\s.-]?\d{4,6}\b/.test(combinedCopy)) {
      pushPolicyError('policy.google_phone_in_copy', 'copy.primaryText', 'Vi phạm chính sách Google Ads: Không viết trực tiếp số điện thoại trong Tiêu đề/Mô tả (dùng Call Asset).')
    }
  }
  if (profile.groupId === 'tiktok') {
    if (/(?:\+84|0)(?:3|5|7|8|9)\d{8}\b|zalo\.me|https?:\/\/|liên hệ zalo|inbox zalo/i.test(copy.primaryText || '')) {
      pushPolicyError('policy.tiktok_offplatform_contact', 'copy.primaryText', 'Vi phạm chính sách TikTok Ads: Không chèn số điện thoại, link website hoặc điều hướng Zalo trong Caption.')
    }
  }
  if (['zalo', 'admicro'].includes(profile.groupId)) {
    if (/\b(số 1|số một|tốt nhất|duy nhất|nhất việt nam|rẻ nhất thị trường)\b/i.test(combinedCopy)) {
      pushPolicyError('policy.vn_ad_law_superlative', 'copy.headline', 'Vi phạm Luật Quảng cáo VN (Điều 8) & Chính sách Zalo/Admicro: Không dùng từ "số 1", "tốt nhất", "duy nhất" khi chưa có chứng nhận hợp pháp.')
    }
  }

  if (draft.context) {
    const sourceRefs = profile.groupId === 'tiktok' ? ['E16'] as const : ['facebook', 'instagram', 'threads'].includes(profile.groupId) ? ['E14'] as const : ['youtube', 'google-search', 'google-display'].includes(profile.groupId) ? ['E13'] as const : profile.sourceRefs
    results.push({ ruleId: 'context.compatibility', profileId, fieldPath: 'context', severity: 'warn', status: 'unknown',
      message: 'Mục tiêu, thị trường và điều kiện tài khoản chưa được xác minh cho target này.',
      actual: `${draft.context.market} / ${draft.context.objective ?? 'unknown'} / ${draft.context.campaignType || 'unknown'} / ${draft.context.accountCondition || 'not_connected'}`,
      expected: 'Đối chiếu điều kiện phân phối trong tài khoản nền tảng.', source: [...sourceRefs], sourceRefs: [...sourceRefs], evidence: 'unknown', confidence: 'low', createdAt: now })
  }
  return results
}

export function runValidation(draft: EditorDraft, profileId: string): UiCheck[] {
  const profile = requireProfile(profileId)
  return validateDraft(draft, profileId).map((result) => {
    const rule = profile.rules.find((item) => item.ruleId === result.ruleId)
    const byteOrDuration =
      rule && ['maxBytes', 'maxDurationMs', 'minDurationMs'].includes(rule.operator)
    return {
      id: `${result.ruleId}:${result.fieldPath}`,
      field: result.fieldPath,
      status: result.status,
      message: ruleMessage(result, rule),
      actual:
        byteOrDuration && typeof result.actual === 'number'
          ? `${result.actual / 1000} ${rule.operator === 'maxBytes' ? 'KB' : 's'}`
          : displayValue(result.actual),
      expected:
        rule?.operator === 'disallowPattern'
          ? 'Không chứa URL / số điện thoại'
          : byteOrDuration
            ? undefined
            : displayValue(result.expected),
      source: `${result.sourceRefs.map((id) => SOURCE_REGISTRY[id].label).join(', ')} · ${evidenceLabel[result.evidence]} · ${profile.specVersion}`,
      sourceRefs: result.sourceRefs,
      evidence: result.evidence,
      notes: result.notes,
    }
  })
}
