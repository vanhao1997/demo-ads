import type {
  AdProductId,
  CompatibilityProfile,
  CompositionKind,
  Confidence,
  DeviceClass,
  EvidenceLevel,
  ImplementationStatus,
  PlatformGroupId,
  PlatformId,
  Profile,
  ProfileStatus,
  RendererKind,
  SourceRef,
} from '../domain'
import { ADMICRO_PROFILE_IDS, resolveAdmicroProfile } from './admicro'
import { PENDING_COMPATIBILITY_PROFILES } from './inventory'
import { AD_PROFILES, PLATFORM_GROUPS } from './profiles'
import { resolveSources } from './sources'

export type CatalogEntryKind = 'renderer' | 'pending_compatibility'

export interface CatalogAuditEntry {
  kind: CatalogEntryKind
  id: string
  groupId: PlatformGroupId
  groupTitle: string
  platform: PlatformId
  product: AdProductId
  productLabel: string
  surface: string
  placement: string
  device: DeviceClass
  renderer?: RendererKind
  allowedCompositions: CompositionKind[]
  status: ProfileStatus
  implementation: ImplementationStatus
  evidence: EvidenceLevel
  confidence: Confidence
  sourceRefIds: Profile['sourceRefs']
  sources: SourceRef[]
  effectiveAt: string | null
  checkedAt: string
  notes?: string[]
}

export interface CatalogProfileFilterOptions {
  includeDeprecated?: boolean
  platform?: PlatformId
}

export interface CatalogAuditOptions extends CatalogProfileFilterOptions {
  includePending?: boolean
}

const pendingGroupTitles: Partial<Record<PlatformGroupId, string>> = Object.fromEntries(
  PLATFORM_GROUPS.map((group) => [group.id, group.title]),
) as Partial<Record<PlatformGroupId, string>>

function allRendererProfiles(): Profile[] {
  const dynamicAdmicroProfiles = ADMICRO_PROFILE_IDS.flatMap((profileId) => {
    const profile = resolveAdmicroProfile(profileId)
    return profile ? [profile] : []
  })
  const byId = new Map<string, Profile>()
  for (const profile of [...AD_PROFILES, ...dynamicAdmicroProfiles]) {
    byId.set(profile.id, profile)
  }
  return [...byId.values()]
}

export function filterCatalogProfiles(
  profiles: Profile[],
  options: CatalogProfileFilterOptions = {},
): Profile[] {
  return profiles.filter(
    (profile) =>
      (options.includeDeprecated || profile.supportStatus !== 'deprecated') &&
      (!options.platform || profile.platform === options.platform),
  )
}

export function listCatalogRendererProfiles(
  options: CatalogProfileFilterOptions = {},
): Profile[] {
  return filterCatalogProfiles(allRendererProfiles(), options)
}

export function listTargetPickerProfiles(platform?: PlatformId): Profile[] {
  return listCatalogRendererProfiles({ platform })
}

export function listDeprecatedCatalogProfiles(platform?: PlatformId): Profile[] {
  return listCatalogRendererProfiles({ includeDeprecated: true, platform }).filter(
    (profile) => profile.supportStatus === 'deprecated',
  )
}

export function listPendingCompatibilityProfiles(platform?: PlatformId): CompatibilityProfile[] {
  return PENDING_COMPATIBILITY_PROFILES.filter(
    (profile) => !platform || profile.platform === platform,
  )
}

export function toRendererCatalogEntry(profile: Profile): CatalogAuditEntry {
  return {
    kind: 'renderer',
    id: profile.id,
    groupId: profile.groupId,
    groupTitle: profile.groupTitle,
    platform: profile.platform,
    product: profile.product,
    productLabel: profile.productLabel,
    surface: profile.surface,
    placement: profile.placement,
    device: profile.device,
    renderer: profile.renderer,
    allowedCompositions: [...profile.allowedCompositions],
    status: profile.supportStatus,
    implementation: profile.implementation,
    evidence: profile.evidence,
    confidence: profile.confidence,
    sourceRefIds: [...profile.sourceRefs],
    sources: resolveSources(profile.sourceRefs),
    effectiveAt: profile.effectiveAt,
    checkedAt: profile.checkedAt,
    notes: profile.notes ? [...profile.notes] : undefined,
  }
}

export function toPendingCatalogEntry(profile: CompatibilityProfile): CatalogAuditEntry {
  const groupId = profile.platform
  return {
    kind: 'pending_compatibility',
    id: profile.id,
    groupId,
    groupTitle: pendingGroupTitles[groupId] ?? profile.surface,
    platform: profile.platform,
    product: profile.product,
    productLabel: profile.product,
    surface: profile.surface,
    placement: profile.placement,
    device: profile.device,
    allowedCompositions: [...profile.allowedCompositions],
    status: profile.status,
    implementation: profile.implementation,
    evidence: profile.evidence,
    confidence: profile.confidence,
    sourceRefIds: [...profile.sourceRefIds],
    sources: resolveSources(profile.sourceRefIds),
    effectiveAt: profile.effectiveAt,
    checkedAt: profile.checkedAt,
    notes: profile.notes ? [...profile.notes] : undefined,
  }
}

export function listCatalogAuditEntries(options: CatalogAuditOptions = {}): CatalogAuditEntry[] {
  const rendererEntries = listCatalogRendererProfiles(options).map(toRendererCatalogEntry)
  const pendingEntries = options.includePending
    ? listPendingCompatibilityProfiles(options.platform).map(toPendingCatalogEntry)
    : []
  return [...rendererEntries, ...pendingEntries]
}
