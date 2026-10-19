export const PLATFORM_GROUP_IDS = [
  'facebook',
  'instagram',
  'threads',
  'tiktok',
  'youtube',
  'google-search',
  'google-display',
  'chatgpt',
  'zalo',
  'linkedin',
  'admicro',
] as const

export type PlatformGroupId = (typeof PLATFORM_GROUP_IDS)[number]
export type PlatformId = PlatformGroupId

export type RendererKind = 'feed' | 'vertical' | 'search' | 'banner' | 'form' | 'chat'

export type DeviceClass = 'mobile' | 'desktop' | 'web' | 'mobile_app' | 'all'

export type AdProductId =
  | 'social'
  | 'video'
  | 'search'
  | 'display'
  | 'chat'
  | 'form'
  | 'message'
  | 'commerce'
  | 'website'
  | 'oa'
  | 'article'

export type CompositionKind =
  | 'single_image'
  | 'multi_image_grid'
  | 'single_video'
  | 'carousel'
  | 'text_only'
  | 'responsive_asset_set'

export type CompositionType = CompositionKind

export type CampaignObjective =
  'awareness' | 'traffic' | 'leads' | 'sales' | 'engagement' | 'unknown'

export interface CampaignContext {
  objective?: CampaignObjective
  campaignType?: string
  market: string
  accountCondition?: string
  identityMode?: string
  device?: DeviceClass
  locale?: string
  effectiveAt?: string | null
}

export type MediaKind = 'image' | 'video' | 'audio'

export type AssetRole =
  'creative' | 'logo' | 'avatar' | 'thumbnail' | 'form_cover' | 'audio' | 'product'

export type MetadataStatus = 'ready' | 'partial' | 'pending' | 'unreadable' | 'unknown'

export interface MediaAsset {
  id: string
  name: string
  kind: MediaKind
  mime: string
  bytes: number
  width?: number
  height?: number
  durationMs?: number
  codec?: string
  hasAudio?: boolean
  sha256?: string
  url?: string
  metadataStatus: MetadataStatus
  roles: AssetRole[]
}

export type Asset = MediaAsset

export type AssetRef = Pick<MediaAsset, 'id' | 'kind'> & {
  role?: AssetRole
}

export interface Identity {
  brandName: string
  handle?: string
  logoAssetId?: string
  avatarAssetId?: string
}

export interface CopySet {
  brandName?: string
  handle?: string
  primaryText: string
  headlines: string[]
  descriptions: string[]
  title?: string
  body?: string
  cta?: string
  destinationUrl?: string
  displayPath: string[]
  disclaimer?: string
  extraText?: string
}

export interface FormQuestion {
  key: string
  label: string
  required: boolean
}

export interface FormExperience {
  oaName?: string
  title: string
  body: string
  avatarAssetId?: string
  coverAssetId?: string
  questions: FormQuestion[]
}

export interface MessageExperience {
  greeting?: string
  body: string
  assetId?: string
  buttons: Array<{ id: string; label: string }>
}

export interface CompositionItem {
  id: string
  order: number
  assetId: string
  title?: string
  description?: string
  url?: string
}

export interface CropSettings {
  fit: 'cover' | 'contain'
  focalPoint?: { x: number; y: number }
}

export interface Composition {
  kind: CompositionKind
  primaryAssetId?: string
  assetIds: string[]
  items: CompositionItem[]
  audioAssetId?: string
  thumbnailAssetId?: string
  crop?: CropSettings
}

export interface Creative {
  id: string
  name: string
  locale: string
  version: number
  identity: Identity
  copy: CopySet
  assets: MediaAsset[]
  composition: Composition
  form?: FormExperience
  message?: MessageExperience
  createdAt?: string
  updatedAt?: string
}

export type CreativeInput = Creative

export interface PlacementTarget {
  profileId: string
  platform: PlatformId
  product: AdProductId
  placement: string
  device: DeviceClass
  composition: CompositionKind
  locale?: string
}

export interface CompatibilityProfile {
  id: string
  platform: PlatformId
  product: AdProductId
  surface: string
  placement: string
  device: DeviceClass
  allowedCompositions: CompositionKind[]
  context: CampaignContext
  sourceRefIds: SourceRefId[]
  status: ProfileStatus
  implementation: ImplementationStatus
  evidence: EvidenceLevel
  confidence: Confidence
  effectiveAt: string | null
  checkedAt: string
  notes?: string[]
}

export type EvidenceLevel =
  'primary_documented' | 'reference_only' | 'estimated' | 'conflict' | 'unknown'

export type ImplementationStatus = 'planned' | 'implemented' | 'tested'
export type ProfileStatus = 'active' | 'deprecated' | 'needs_review'
export type Confidence = 'high' | 'medium' | 'low'

export type SourceRefId =
  | 'E01'
  | 'E02'
  | 'E03'
  | 'E04'
  | 'E05'
  | 'E06'
  | 'E07'
  | 'E08'
  | 'E09'
  | 'E10'
  | 'E11'
  | 'E12'
  | 'E13'
  | 'E14'
  | 'E15'
  | 'E16'
  | 'E17'
  | 'E18'
  | 'E19'

export interface SourceRef {
  id: SourceRefId
  label: string
  url: string
  checkedAt: string
  authority: 'official' | 'publisher' | 'reference' | 'internal'
  evidence: EvidenceLevel
  notes?: string
}

export type PackageType =
  'homepage_plus' | 'homepage_premium' | 'billboard_plus' | 'billboard_premium' | 'other'

export type AssetAssignmentPolicy = 'per_slot' | 'shared' | 'mixed'

export type BindingSource = 'inherited' | 'target_override' | 'slot_override'

export interface SlotSpec {
  id: string
  catalogEntryId: string
  publisherId?: string
  label: string
  surface: string
  placement: string
  device: DeviceClass
  width?: number
  height?: number
  ratio?: { w: number; h: number }
  allowedCompositions: CompositionKind[]
  assetRoles: AssetRole[]
  copyFields: string[]
  safeZone?: boolean
  evidenceClaimIds: string[]
  rendererReferenceIds: string[]
  status: ProfileStatus
  sourceRefIds: SourceRefId[]
  evidence: EvidenceLevel
  confidence: Confidence
  effectiveAt: string | null
  checkedAt: string
}

export interface PackageSpec {
  id: string
  publisherId: string
  label: string
  packageType: PackageType
  slotIds: string[]
  assetAssignment: AssetAssignmentPolicy
  context: CampaignContext
  sourceRefIds: SourceRefId[]
  status: ProfileStatus
  evidence: EvidenceLevel
  confidence: Confidence
  effectiveAt: string | null
  checkedAt: string
}

export interface TargetAssetBinding {
  id: string
  targetId: string
  slotId?: string
  assetId?: string
  role: AssetRole
  fit: CropSettings['fit']
  focalPoint?: { x: number; y: number }
  order?: number
  source: BindingSource
  createdAt: string
}

export type ValidationSeverity = 'fail' | 'warn'
export type ValidationStatus = 'pass' | 'warn' | 'fail' | 'unknown'

export type CountingStrategy = 'grapheme' | 'code_point' | 'utf16' | 'cjk_weighted'

export type RuleOperator =
  | 'required'
  | 'minCount'
  | 'maxCount'
  | 'minLength'
  | 'maxLength'
  | 'maxBytes'
  | 'minBytes'
  | 'mimeIn'
  | 'dimensions'
  | 'minDimensions'
  | 'ratioIn'
  | 'maxDurationMs'
  | 'minDurationMs'
  | 'codecIn'
  | 'audioRequired'
  | 'allowedValues'
  | 'disallow'
  | 'disallowPattern'
  | 'url'

export type RuleScope =
  | 'creative'
  | 'composition'
  | 'primary_asset'
  | 'all_assets'
  | 'composition_items'
  | 'form_avatar'
  | 'form_cover'
  | 'audio_asset'

export interface ValidationRule {
  ruleId: string
  fieldPath: string
  operator: RuleOperator
  expected?: unknown
  severity: ValidationSeverity
  message: string
  sourceRefs: SourceRefId[]
  evidence: EvidenceLevel
  confidence?: Confidence
  scope?: RuleScope
  each?: boolean
  countingStrategy?: CountingStrategy
  whenComposition?: CompositionKind[]
  notes?: string
}

export type FieldRule = ValidationRule

export interface Profile {
  id: string
  groupId: PlatformGroupId
  groupTitle: string
  platform: PlatformId
  product: AdProductId
  productLabel: string
  surface: string
  placement: string
  device: DeviceClass
  renderer: RendererKind
  allowedCompositions: CompositionKind[]
  supportStatus: ProfileStatus
  implementation: ImplementationStatus
  evidence: EvidenceLevel
  confidence: Confidence
  sourceRefs: SourceRefId[]
  sources: SourceRef[]
  specVersion: string
  effectiveAt: string | null
  checkedAt: string
  rules: ValidationRule[]
  fieldRules: ValidationRule[]
  notes?: string[]
}

export type SpecProfile = Profile

export interface ValidationResult {
  ruleId: string
  profileId?: string
  fieldPath: string
  severity: ValidationSeverity
  status: ValidationStatus
  message: string
  actual?: unknown
  expected?: unknown
  source: SourceRefId[]
  sourceRefs: SourceRefId[]
  evidence: EvidenceLevel
  confidence: Confidence
  createdAt: string
  notes?: string
}

export interface ValidationSummary {
  pass: number
  warn: number
  fail: number
  unknown: number
}

export interface DeviceMockupContext {
  id: 'iphone-15-16' | 'pc-1440' | 'pc-1920'
  viewport: { width: number; height: number }
  scrollTop: number
}

export interface ReviewSnapshot {
  creativeId: string
  creativeVersion: number
  selectedProfileIds: string[]
  assetHashes: Record<string, string | undefined>
  rendererVersion: string
  specVersions: Record<string, string>
  renderSettings: {
    viewport: { width: number; height: number }
    locale: string
    appChrome?: boolean
    captionMask?: boolean
    topViewPhase?: 'intro' | 'feed'
    videoTimeMs?: number
    cardIndex?: number
    searchCombinationIndex?: number
    formStage?: 'creative' | 'form'
    safeZone: boolean
    deviceMockup?: DeviceMockupContext
  }
  validationSummary: ValidationSummary
  createdAt: string
  createdBy?: string
}
