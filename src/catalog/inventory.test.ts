import { describe, expect, it } from 'vitest'
import {
  PENDING_COMPATIBILITY_PROFILES,
  PENDING_COMPATIBILITY_PROFILE_IDS,
  resolvePendingCompatibilityProfile,
} from './index'

describe('pending Meta/TikTok compatibility inventory', () => {
  it('keeps catalog-only records separate from renderer profiles', () => {
    expect(PENDING_COMPATIBILITY_PROFILES.length).toBeGreaterThan(0)
    expect(new Set(PENDING_COMPATIBILITY_PROFILE_IDS).size).toBe(
      PENDING_COMPATIBILITY_PROFILES.length,
    )
    expect(
      PENDING_COMPATIBILITY_PROFILES.every(
        (profile) =>
          profile.status === 'needs_review' &&
          profile.implementation === 'planned' &&
          profile.evidence === 'unknown' &&
          profile.effectiveAt === null &&
          !('renderer' in profile),
      ),
    ).toBe(true)
  })

  it('preserves Meta matrix and TikTok placement/TRAY provenance', () => {
    const meta = PENDING_COMPATIBILITY_PROFILES.filter((profile) =>
      profile.id.startsWith('meta.'),
    )
    const tiktok = PENDING_COMPATIBILITY_PROFILES.filter((profile) =>
      profile.id.startsWith('tiktok.'),
    )
    expect(meta.length).toBeGreaterThan(0)
    expect(tiktok.length).toBeGreaterThan(0)
    expect(meta.every((profile) => profile.sourceRefIds.includes('E14'))).toBe(true)
    expect(tiktok.some((profile) => profile.sourceRefIds.includes('E15'))).toBe(true)
    expect(
      tiktok
        .filter((profile) => profile.sourceRefIds.includes('E16'))
        .every((profile) => profile.notes?.some((note) => /market|account/i.test(note))),
    ).toBe(true)
    expect(resolvePendingCompatibilityProfile('tiktok.catalog.tray_integration')).toMatchObject({
      sourceRefIds: ['E15'],
      status: 'needs_review',
      implementation: 'planned',
    })
  })
})
