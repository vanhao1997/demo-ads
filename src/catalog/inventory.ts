import type { AdProductId, CompatibilityProfile, CompositionKind, PlatformId } from '../domain'
import { SOURCE_CHECKED_AT } from './sources'

type CatalogOnlyInit = {
  id: string
  platform: PlatformId
  product: AdProductId
  surface: string
  placement: string
  sourceRefIds: CompatibilityProfile['sourceRefIds']
  allowedCompositions?: CompositionKind[]
  notes: string[]
}

function catalogOnly(init: CatalogOnlyInit): CompatibilityProfile {
  return {
    id: init.id,
    platform: init.platform,
    product: init.product,
    surface: init.surface,
    placement: init.placement,
    device: 'all',
    allowedCompositions: init.allowedCompositions ?? [],
    context: {
      objective: 'unknown',
      market: 'VN',
      locale: 'vi-VN',
      effectiveAt: null,
    },
    sourceRefIds: init.sourceRefIds,
    status: 'needs_review',
    implementation: 'planned',
    evidence: 'unknown',
    confidence: 'low',
    effectiveAt: null,
    checkedAt: SOURCE_CHECKED_AT,
    notes: init.notes,
  }
}

export const PENDING_COMPATIBILITY_PROFILES: CompatibilityProfile[] = [
  catalogOnly({
    id: 'meta.catalog.facebook.feed',
    platform: 'facebook',
    product: 'social',
    surface: 'Facebook',
    placement: 'Feed',
    sourceRefIds: ['E14'],
    notes: [
      'Meta objective x placement x format row exists as compatibility input, but row details are not fully extracted.',
      'Catalog-only record; renderer remains gated by verified AD_PROFILES or golden references.',
    ],
  }),
  catalogOnly({
    id: 'meta.catalog.facebook.stories',
    platform: 'facebook',
    product: 'social',
    surface: 'Facebook',
    placement: 'Stories',
    sourceRefIds: ['E14'],
    notes: [
      'Placement compatibility depends on objective, format, account and market.',
      'Catalog-only record; do not count as verified preview coverage.',
    ],
  }),
  catalogOnly({
    id: 'meta.catalog.facebook.reels',
    platform: 'facebook',
    product: 'video',
    surface: 'Facebook',
    placement: 'Reels',
    sourceRefIds: ['E12', 'E14'],
    notes: [
      'Reels creative direction has a reference source, but full objective matrix still needs review.',
      'Catalog-only record; do not publish as a verified renderer.',
    ],
  }),
  catalogOnly({
    id: 'meta.catalog.instagram.feed',
    platform: 'instagram',
    product: 'social',
    surface: 'Instagram',
    placement: 'Feed',
    sourceRefIds: ['E14'],
    notes: [
      'Meta matrix row pending extraction and Ads Manager/golden reference confirmation.',
      'Catalog-only record; renderer remains separate from compatibility catalog.',
    ],
  }),
  catalogOnly({
    id: 'meta.catalog.instagram.stories',
    platform: 'instagram',
    product: 'social',
    surface: 'Instagram',
    placement: 'Stories',
    sourceRefIds: ['E14'],
    notes: [
      'Objective, market and format conditions are unresolved.',
      'Catalog-only record; no renderer contract is attached.',
    ],
  }),
  catalogOnly({
    id: 'meta.catalog.instagram.reels',
    platform: 'instagram',
    product: 'video',
    surface: 'Instagram',
    placement: 'Reels',
    sourceRefIds: ['E12', 'E14'],
    notes: [
      'Reels compatibility is not fully verified for every objective or account condition.',
      'Catalog-only record; keep needs_review until matrix rows are inspected.',
    ],
  }),
  catalogOnly({
    id: 'tiktok.catalog.for_you',
    platform: 'tiktok',
    product: 'video',
    surface: 'TikTok',
    placement: 'For You',
    sourceRefIds: ['E16'],
    notes: [
      'TikTok placement source names surface availability, but market/account conditions still apply.',
      'Catalog-only record; creative renderer remains the existing verified/reference profile.',
    ],
  }),
  catalogOnly({
    id: 'tiktok.catalog.search_results',
    platform: 'tiktok',
    product: 'video',
    surface: 'TikTok',
    placement: 'Search results',
    sourceRefIds: ['E16'],
    notes: [
      'Search placement depends on market/account eligibility and needs a checked claim before renderer work.',
      'Catalog-only record; no creative geometry is inferred.',
    ],
  }),
  catalogOnly({
    id: 'tiktok.catalog.additional_placements',
    platform: 'tiktok',
    product: 'video',
    surface: 'TikTok',
    placement: 'Additional placements',
    sourceRefIds: ['E16'],
    notes: [
      'Additional placements are catalog context, not a single creative spec.',
      'Keep as needs_review until market/account conditions and placement-specific rules are inspected.',
    ],
  }),
  catalogOnly({
    id: 'tiktok.catalog.tray_integration',
    platform: 'tiktok',
    product: 'social',
    surface: 'TikTok TRAY',
    placement: 'TRAY integration',
    sourceRefIds: ['E15'],
    notes: [
      'TRAY is integration-specific reference material, not a general creative placement spec.',
      'Catalog-only record; do not apply as a renderer or validation rule.',
    ],
  }),
]

export const PENDING_COMPATIBILITY_PROFILE_IDS = PENDING_COMPATIBILITY_PROFILES.map(
  (profile) => profile.id,
)

export function resolvePendingCompatibilityProfile(
  profileId: string,
): CompatibilityProfile | undefined {
  return PENDING_COMPATIBILITY_PROFILES.find((profile) => profile.id === profileId)
}
