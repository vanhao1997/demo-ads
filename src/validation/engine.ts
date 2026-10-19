import type {
  AssetRole,
  CompositionKind,
  Confidence,
  Creative,
  EvidenceLevel,
  MediaAsset,
  Profile,
  SourceRefId,
  ValidationResult,
  ValidationRule,
  ValidationStatus,
} from '../domain'
import { requireProfile } from '../catalog'
import { countTextUnits } from './counting'

type RuntimeAsset = MediaAsset & { role?: AssetRole }
type ValueTarget = { value: unknown; label: string; asset?: RuntimeAsset }
type Evaluation = {
  passed: boolean
  actual?: unknown
  expected?: unknown
  status?: ValidationStatus
  notes?: string
}

const DEFAULT_CONFIDENCE: Confidence = 'medium'

function nowIso(): string {
  return new Date().toISOString()
}

function assetRoles(asset: RuntimeAsset): AssetRole[] {
  if (asset.roles?.length) return asset.roles
  return asset.role ? [asset.role] : ['creative']
}

function selectedAssets(creative: Creative): RuntimeAsset[] {
  const ids = new Set(
    [
      ...creative.composition.assetIds,
      creative.composition.primaryAssetId,
      ...creative.composition.items.map((item) => item.assetId),
    ].filter(Boolean),
  )
  return creative.assets.filter((asset) => ids.has(asset.id)) as RuntimeAsset[]
}

function audioAsset(creative: Creative): RuntimeAsset | undefined {
  if (creative.composition.audioAssetId)
    return creative.assets.find((asset) => asset.id === creative.composition.audioAssetId) as
      RuntimeAsset | undefined
  return (creative.assets as RuntimeAsset[]).find(
    (asset) => asset.kind === 'audio' || assetRoles(asset).includes('audio'),
  )
}

function formAsset(creative: Creative, role: 'avatar' | 'form_cover'): RuntimeAsset | undefined {
  const explicitId = role === 'avatar' ? creative.form?.avatarAssetId : creative.form?.coverAssetId
  if (explicitId)
    return creative.assets.find((asset) => asset.id === explicitId) as RuntimeAsset | undefined
  return (creative.assets as RuntimeAsset[]).find((asset) => assetRoles(asset).includes(role))
}

function getPathValue(creative: Creative, path: string): unknown {
  if (path === 'identity.brandName')
    return creative.identity.brandName || creative.copy.brandName || ''
  if (path === 'copy.primaryText') return creative.copy.primaryText
  if (path === 'copy.headlines') return creative.copy.headlines
  if (path === 'copy.headlines.*') return creative.copy.headlines
  if (path === 'copy.headlines.0') return creative.copy.headlines[0] ?? ''
  if (path === 'copy.descriptions') return creative.copy.descriptions
  if (path === 'copy.descriptions.*') return creative.copy.descriptions
  if (path === 'copy.descriptions.0') return creative.copy.descriptions[0] ?? ''
  if (path === 'copy.title') return creative.copy.title ?? creative.copy.headlines[0] ?? ''
  if (path === 'copy.body') return creative.copy.body ?? creative.copy.descriptions[0] ?? ''
  if (path === 'copy.cta') return creative.copy.cta ?? ''
  if (path === 'copy.destinationUrl') return creative.copy.destinationUrl ?? ''
  if (path === 'copy.displayPath') return creative.copy.displayPath
  if (path === 'copy.displayPath.*') return creative.copy.displayPath
  if (path === 'copy.extraText') return creative.copy.extraText ?? ''
  if (path === 'composition.assetIds') return creative.composition.assetIds
  if (path === 'composition.audioAssetId')
    return creative.composition.audioAssetId ?? audioAsset(creative)?.id ?? ''
  if (path === 'composition.items.url')
    return creative.composition.items.map((item) => item.url ?? '')
  if (path === 'form.oaName') return creative.form?.oaName ?? creative.identity.brandName
  if (path === 'form.title') return creative.form?.title ?? ''
  if (path === 'form.body') return creative.form?.body ?? ''
  return undefined
}

function valueTargets(creative: Creative, rule: ValidationRule): ValueTarget[] {
  if (rule.scope === 'all_assets') {
    return selectedAssets(creative).map((asset, index) => ({
      value: assetValue(asset, rule.fieldPath),
      label: `${rule.fieldPath}[${index}]`,
      asset,
    }))
  }
  if (rule.scope === 'form_avatar') {
    const asset = formAsset(creative, 'avatar')
    return [
      {
        value: asset ? assetValue(asset, rule.fieldPath) : undefined,
        label: rule.fieldPath,
        asset,
      },
    ]
  }
  if (rule.scope === 'form_cover') {
    const asset = formAsset(creative, 'form_cover')
    return [
      {
        value: asset ? assetValue(asset, rule.fieldPath) : undefined,
        label: rule.fieldPath,
        asset,
      },
    ]
  }
  if (rule.scope === 'audio_asset') {
    const asset = audioAsset(creative)
    return [
      {
        value: asset ? assetValue(asset, rule.fieldPath) : undefined,
        label: rule.fieldPath,
        asset,
      },
    ]
  }
  if (rule.scope === 'primary_asset') {
    const asset =
      selectedAssets(creative).find((item) => item.id === creative.composition.primaryAssetId) ??
      selectedAssets(creative)[0]
    return [
      {
        value: asset ? assetValue(asset, rule.fieldPath) : undefined,
        label: rule.fieldPath,
        asset,
      },
    ]
  }
  const value = getPathValue(creative, rule.fieldPath)
  if (rule.each && Array.isArray(value))
    return value.map((item, index) => ({
      value: item,
      label: `${rule.fieldPath.replace('.*', '')}[${index}]`,
    }))
  return [{ value, label: rule.fieldPath }]
}

function assetValue(asset: RuntimeAsset, fieldPath: string): unknown {
  if (fieldPath.endsWith('.kind') || fieldPath === 'assets.kind') return asset.kind
  if (fieldPath.endsWith('.mime') || fieldPath === 'assets.mime') return asset.mime
  if (
    fieldPath.endsWith('.bytes') ||
    fieldPath === 'assets.bytes' ||
    fieldPath === 'form.avatar.bytes' ||
    fieldPath === 'form.cover.bytes'
  )
    return asset.bytes
  if (fieldPath.endsWith('.durationMs') || fieldPath === 'assets.durationMs')
    return asset.durationMs
  if (fieldPath.endsWith('.codec') || fieldPath === 'assets.codec') return asset.codec
  if (fieldPath.endsWith('.ratio') || fieldPath === 'assets.ratio')
    return asset.width && asset.height
      ? { width: asset.width, height: asset.height, ratio: asset.width / asset.height }
      : undefined
  if (
    fieldPath.endsWith('.dimensions') ||
    fieldPath.includes('dimensions') ||
    fieldPath === 'form.avatar' ||
    fieldPath === 'form.cover'
  )
    return asset.width && asset.height ? { width: asset.width, height: asset.height } : undefined
  return undefined
}

function ruleApplies(creative: Creative, rule: ValidationRule): boolean {
  return !rule.whenComposition?.length || rule.whenComposition.includes(creative.composition.kind)
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function maxByteExpected(
  rule: ValidationRule,
): { max: number; conflictingMax?: number } | undefined {
  const expected = rule.expected
  if (typeof expected === 'number') return { max: expected }
  if (expected && typeof expected === 'object' && 'max' in expected) {
    const max = asNumber((expected as { max?: unknown }).max)
    const conflictingMax = asNumber((expected as { conflictingMax?: unknown }).conflictingMax)
    return max ? { max, conflictingMax } : undefined
  }
  return undefined
}

function dimensionsMatch(actual: { width: number; height: number }, expected: unknown): boolean {
  const choices = Array.isArray(expected) ? expected : [expected]
  return choices.some((item) => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as { width?: unknown; height?: unknown }
    return actual.width === candidate.width && actual.height === candidate.height
  })
}

function minDimensionsMatch(actual: { width: number; height: number }, expected: unknown): boolean {
  if (!expected || typeof expected !== 'object') return false
  const candidate = expected as { width?: unknown; height?: unknown }
  return actual.width >= Number(candidate.width) && actual.height >= Number(candidate.height)
}

function ratioMatch(actual: { width: number; height: number }, expected: unknown): boolean {
  if (!Array.isArray(expected)) return false
  const actualRatio = actual.width / actual.height
  return expected.some((item) => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as { w?: unknown; h?: unknown }
    const ratio = Number(candidate.w) / Number(candidate.h)
    return Math.abs(actualRatio - ratio) <= 0.025
  })
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && !value.trim())
}

function evaluate(rule: ValidationRule, target: ValueTarget, creative: Creative): Evaluation {
  const value = target.value
  if (rule.operator === 'required')
    return { passed: !isEmpty(value), actual: value ? 'present' : 'missing', expected: 'present' }
  if (rule.operator === 'minCount') {
    const actual = asArray(value).length
    const expected = Number(rule.expected)
    return { passed: actual >= expected, actual, expected }
  }
  if (rule.operator === 'maxCount') {
    const actual = asArray(value).length
    const expected = Number(rule.expected)
    return { passed: actual <= expected, actual, expected }
  }
  if (rule.operator === 'minLength' || rule.operator === 'maxLength') {
    const text = String(value ?? '')
    const actual = countTextUnits(text, rule.countingStrategy)
    const expected = Number(rule.expected)
    return {
      passed: rule.operator === 'minLength' ? actual >= expected : actual <= expected,
      actual,
      expected: `${expected} (${rule.countingStrategy ?? 'grapheme'})`,
    }
  }
  if (rule.operator === 'maxBytes') {
    const actual = asNumber(value)
    const expected = maxByteExpected(rule)
    if (actual === undefined || !expected)
      return { passed: false, status: 'unknown', actual: 'unknown', expected: rule.expected }
    if (expected.conflictingMax && actual > expected.conflictingMax && actual <= expected.max) {
      return {
        passed: false,
        status: 'unknown',
        actual,
        expected: rule.expected,
        notes: 'Actual nam giua hai gioi han source dang xung dot.',
      }
    }
    return { passed: actual <= expected.max, actual, expected: rule.expected }
  }
  if (rule.operator === 'minBytes') {
    const actual = asNumber(value)
    const expected = Number(rule.expected)
    if (actual === undefined)
      return { passed: false, status: 'unknown', actual: 'unknown', expected }
    return { passed: actual >= expected, actual, expected }
  }
  if (rule.operator === 'mimeIn') {
    const expected = Array.isArray(rule.expected) ? rule.expected : []
    if (value === undefined)
      return { passed: false, status: 'unknown', actual: 'unknown', expected }
    return { passed: expected.includes(value), actual: value, expected }
  }
  if (rule.operator === 'allowedValues') {
    const expected = Array.isArray(rule.expected) ? rule.expected : []
    return { passed: expected.includes(value), actual: value, expected }
  }
  if (rule.operator === 'dimensions') {
    if (!value || typeof value !== 'object')
      return { passed: false, status: 'unknown', actual: 'unknown', expected: rule.expected }
    const actual = value as { width: number; height: number }
    return { passed: dimensionsMatch(actual, rule.expected), actual, expected: rule.expected }
  }
  if (rule.operator === 'minDimensions') {
    if (!value || typeof value !== 'object')
      return { passed: false, status: 'unknown', actual: 'unknown', expected: rule.expected }
    const actual = value as { width: number; height: number }
    return { passed: minDimensionsMatch(actual, rule.expected), actual, expected: rule.expected }
  }
  if (rule.operator === 'ratioIn') {
    if (!value || typeof value !== 'object')
      return { passed: false, status: 'unknown', actual: 'unknown', expected: rule.expected }
    const actual = value as { width: number; height: number }
    return { passed: ratioMatch(actual, rule.expected), actual, expected: rule.expected }
  }
  if (rule.operator === 'maxDurationMs') {
    const actual = asNumber(value)
    const expected = Number(rule.expected)
    if (actual === undefined)
      return { passed: false, status: 'unknown', actual: 'unknown', expected }
    return { passed: actual <= expected, actual, expected }
  }
  if (rule.operator === 'minDurationMs') {
    const actual = asNumber(value)
    const expected = Number(rule.expected)
    if (actual === undefined)
      return { passed: false, status: 'unknown', actual: 'unknown', expected }
    return { passed: actual >= expected, actual, expected }
  }
  if (rule.operator === 'codecIn') {
    const actual = typeof value === 'string' ? value.toLowerCase() : ''
    const expected = (Array.isArray(rule.expected) ? rule.expected : []).map((item) =>
      String(item).toLowerCase(),
    )
    if (!actual) return { passed: false, status: 'unknown', actual: 'unknown', expected }
    return { passed: expected.some((codec) => actual.includes(codec)), actual, expected }
  }
  if (rule.operator === 'audioRequired') {
    const asset = audioAsset(creative)
    return { passed: !!asset, actual: asset ? asset.name : 'missing', expected: 'audio metadata' }
  }
  if (rule.operator === 'disallow') {
    return { passed: isEmpty(value), actual: isEmpty(value) ? 'empty' : value, expected: 'empty' }
  }
  if (rule.operator === 'disallowPattern') {
    let pattern: RegExp
    try {
      pattern = new RegExp(String(rule.expected), 'iu')
    } catch {
      pattern = new RegExp(String(rule.expected), 'i')
    }
    const text = String(value ?? '')
    const matches = pattern.test(text)
    return {
      passed: !matches,
      actual: matches ? 'matched' : 'clear',
      expected: rule.expected,
    }
  }
  if (rule.operator === 'url') {
    const text = String(value ?? '')
    if (!text) return { passed: false, actual: 'missing', expected: rule.expected }
    try {
      const url = new URL(text)
      const allowed = Array.isArray(rule.expected) ? rule.expected.map(String) : ['http:', 'https:']
      return { passed: allowed.includes(url.protocol), actual: url.protocol, expected: allowed }
    } catch {
      return { passed: false, actual: text, expected: 'valid URL' }
    }
  }
  return {
    passed: false,
    status: 'unknown',
    actual: value,
    expected: rule.expected,
    notes: `Unsupported operator ${rule.operator}`,
  }
}

function statusFrom(rule: ValidationRule, evaluation: Evaluation): ValidationStatus {
  // A numerical match cannot promote unverified or conflicting evidence to pass.
  if (['unknown', 'conflict', 'reference_only'].includes(rule.evidence)) return 'unknown'
  if (evaluation.status) return evaluation.status
  if (evaluation.passed) return 'pass'
  return rule.severity === 'warn' ? 'warn' : 'fail'
}

function resultFrom(
  rule: ValidationRule,
  profile: Profile,
  target: ValueTarget,
  evaluation: Evaluation,
): ValidationResult {
  return {
    ruleId: rule.ruleId,
    profileId: profile.id,
    fieldPath: target.label,
    severity: rule.severity,
    status: statusFrom(rule, evaluation),
    message: rule.message,
    actual: evaluation.actual,
    expected: evaluation.expected,
    source: rule.sourceRefs,
    sourceRefs: rule.sourceRefs,
    evidence: rule.evidence,
    confidence: rule.confidence ?? profile.confidence ?? DEFAULT_CONFIDENCE,
    createdAt: nowIso(),
    notes: evaluation.notes ?? rule.notes,
  }
}

function compatibilityResult(creative: Creative, profile: Profile): ValidationResult {
  const passed = profile.allowedCompositions.includes(creative.composition.kind)
  const unverified = ['unknown', 'conflict', 'reference_only'].includes(profile.evidence)
  const status: ValidationStatus = unverified ? 'unknown' : passed ? 'pass' : 'fail'
  return {
    ruleId: 'profile.composition.allowed',
    profileId: profile.id,
    fieldPath: 'composition.kind',
    severity: 'fail',
    status,
    message: unverified
      ? 'Khả năng hỗ trợ bố cục cần đối chiếu trên nền tảng.'
      : passed
        ? 'Bố cục nằm trong profile đã ghi nhận.'
        : `Profile ${profile.id} chưa hỗ trợ bố cục ${creative.composition.kind}. Tạo variant riêng với bố cục được hỗ trợ; nội dung hiện tại được giữ nguyên.`,
    actual: creative.composition.kind,
    expected: profile.allowedCompositions,
    source: profile.sourceRefs,
    sourceRefs: profile.sourceRefs,
    evidence: profile.evidence,
    confidence: profile.confidence,
    createdAt: nowIso(),
  }
}

export function validateCreative(creative: Creative, profile: Profile): ValidationResult[] {
  const results: ValidationResult[] = [compatibilityResult(creative, profile)]
  for (const rule of profile.rules) {
    if (!ruleApplies(creative, rule)) continue
    for (const target of valueTargets(creative, rule)) {
      results.push(resultFrom(rule, profile, target, evaluate(rule, target, creative)))
    }
  }
  return results
}

export function validateCreativeByProfileId(
  creative: Creative,
  profileId: string,
): ValidationResult[] {
  return validateCreative(creative, requireProfile(profileId))
}

export function summarizeValidation(results: ValidationResult[]) {
  return results.reduce(
    (summary, result) => ({ ...summary, [result.status]: summary[result.status] + 1 }),
    { pass: 0, warn: 0, fail: 0, unknown: 0 },
  )
}

export function hasBlockingFailures(results: ValidationResult[]): boolean {
  return results.some((result) => result.status === 'fail')
}

export function assertCompositionSupported(
  profile: Profile,
  composition: CompositionKind,
): boolean {
  return profile.allowedCompositions.includes(composition)
}
