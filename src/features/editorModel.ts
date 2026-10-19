import type { InspectedMedia } from '../media/inspect'
import type { CampaignContext, FormQuestion, TargetAssetBinding } from '../domain'

export type CopyField =
  'brandName' | 'primaryText' | 'headline' | 'description' | 'cta' | 'destinationUrl'
export type CopyOverride = { mode: 'inherit' | 'replace' | 'clear'; value: string }
export type TargetRenderSettings = {
  fit: 'cover' | 'contain'
  safeZone: boolean
  focalX: number
  focalY: number
}
export type EditorDraft = {
  name: string
  composition: string
  identity: { brandName: string; handle: string }
  copy: {
    primaryText: string
    headlines: string[]
    descriptions: string[]
    cta: string
    destinationUrl: string
    paths: string[]
  }
  form: { oaName: string; title: string; body: string; questions?: FormQuestion[] }
  assets: InspectedMedia[]
  cardDetails?: Record<string, { title: string; description: string; url: string }>
  context?: CampaignContext
  publisher?: { publisherId: string; slotId?: string; packageId?: string; bindings: TargetAssetBinding[] }
  overrides: Record<string, Partial<Record<CopyField, CopyOverride>>>
  renderSettings?: Record<string, TargetRenderSettings>
}

export const DEFAULT_RENDER_SETTINGS: TargetRenderSettings = {
  fit: 'cover',
  safeZone: false,
  focalX: 50,
  focalY: 50,
}

export const initialDraft: EditorDraft = {
  name: 'Creative đầu tiên',
  composition: 'single_image',
  // Empty values intentionally render the source tool's editable placeholders.
  identity: { brandName: '', handle: '' },
  copy: {
    primaryText: '',
    headlines: [''],
    descriptions: [''],
    cta: 'Tìm hiểu thêm',
    destinationUrl: '',
    paths: ['', ''],
  },
  form: {
    oaName: '',
    title: 'Nhận thông tin tư vấn',
    body: 'Để lại thông tin để đội ngũ hỗ trợ liên hệ với bạn.',
  },
  assets: [],
  context: { market: 'Vietnam', objective: 'unknown', accountCondition: 'not_connected', locale: 'vi-VN' },
  overrides: {},
  renderSettings: {},
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const renderSettingFields = new Set(['fit', 'safeZone', 'focalX', 'focalY'])

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

export function sanitizeRenderSettings(value: unknown): TargetRenderSettings | undefined {
  if (!isObject(value)) return undefined
  if (Object.keys(value).some((key) => !renderSettingFields.has(key))) return undefined

  const fit =
    value.fit === undefined
      ? DEFAULT_RENDER_SETTINGS.fit
      : value.fit === 'cover' || value.fit === 'contain'
        ? value.fit
        : undefined
  const safeZone =
    value.safeZone === undefined
      ? DEFAULT_RENDER_SETTINGS.safeZone
      : typeof value.safeZone === 'boolean'
        ? value.safeZone
        : undefined
  const focalX =
    value.focalX === undefined
      ? DEFAULT_RENDER_SETTINGS.focalX
      : typeof value.focalX === 'number' && Number.isFinite(value.focalX)
        ? clampPercent(value.focalX)
        : undefined
  const focalY =
    value.focalY === undefined
      ? DEFAULT_RENDER_SETTINGS.focalY
      : typeof value.focalY === 'number' && Number.isFinite(value.focalY)
        ? clampPercent(value.focalY)
        : undefined

  if (!fit || safeZone === undefined || focalX === undefined || focalY === undefined) {
    return undefined
  }

  return { fit, safeZone, focalX, focalY }
}

export function resolvedCopy(draft: EditorDraft, profileId: string) {
  const base: Record<CopyField, string> = {
    brandName: draft.identity.brandName,
    primaryText: draft.copy.primaryText,
    headline: draft.copy.headlines[0] ?? '',
    description: draft.copy.descriptions[0] ?? '',
    cta: draft.copy.cta,
    destinationUrl: draft.copy.destinationUrl,
  }
  for (const [key, override] of Object.entries(draft.overrides[profileId] ?? {})) {
    if (override?.mode === 'clear') base[key as CopyField] = ''
    if (override?.mode === 'replace') base[key as CopyField] = override.value
  }
  return base
}

export function resolvedRenderSettings(
  draft: EditorDraft,
  profileId: string,
): TargetRenderSettings {
  return {
    ...DEFAULT_RENDER_SETTINGS,
    ...(sanitizeRenderSettings(draft.renderSettings?.[profileId]) ?? {}),
  }
}
