import { describe, expect, it } from 'vitest'
import type { Profile } from '../domain'
import {
  filterCatalogProfiles,
  listCatalogAuditEntries,
  listCatalogRendererProfiles,
  listDeprecatedCatalogProfiles,
  listPendingCompatibilityProfiles,
  listTargetPickerProfiles,
  toRendererCatalogEntry,
} from './audit'
import { PENDING_COMPATIBILITY_PROFILE_IDS } from './inventory'

describe('catalog audit listings', () => {
  it('keeps pending compatibility records out of target-picker profiles', () => {
    const targetProfiles = listTargetPickerProfiles()
    const pending = listPendingCompatibilityProfiles()

    expect(targetProfiles.length).toBeGreaterThan(0)
    expect(targetProfiles.every((profile) => !PENDING_COMPATIBILITY_PROFILE_IDS.includes(profile.id))).toBe(
      true,
    )
    expect(pending.every((profile) => profile.status === 'needs_review')).toBe(true)
    expect(pending.every((profile) => profile.implementation === 'planned')).toBe(true)
    expect(pending.every((profile) => profile.evidence === 'unknown')).toBe(true)
  })

  it('exposes pending-only entries with source and no renderer claim', () => {
    const entries = listCatalogAuditEntries({ includePending: true }).filter(
      (entry) => entry.kind === 'pending_compatibility',
    )

    expect(entries).toHaveLength(PENDING_COMPATIBILITY_PROFILE_IDS.length)
    expect(
      entries.every(
        (entry) =>
          entry.status === 'needs_review' &&
          entry.implementation === 'planned' &&
          entry.evidence === 'unknown' &&
          entry.sources.length === entry.sourceRefIds.length &&
          entry.renderer === undefined,
      ),
    ).toBe(true)
  })

  it('does not invent deprecated catalog rows when snapshot has none', () => {
    expect(listDeprecatedCatalogProfiles()).toEqual([])
  })

  it('supports default-hidden and explicit reveal for a source-backed deprecated fixture', () => {
    const sourceProfile = listCatalogRendererProfiles()[0]
    const deprecatedFixture: Profile = {
      ...sourceProfile,
      id: 'test.deprecated.fixture',
      supportStatus: 'deprecated',
      notes: ['Test-only fixture: retired by source E01.'],
    }

    expect(filterCatalogProfiles([deprecatedFixture])).toEqual([])
    expect(filterCatalogProfiles([deprecatedFixture], { includeDeprecated: true })).toEqual([
      deprecatedFixture,
    ])

    const entry = toRendererCatalogEntry(deprecatedFixture)
    expect(entry).toMatchObject({
      kind: 'renderer',
      status: 'deprecated',
      sourceRefIds: sourceProfile.sourceRefs,
      notes: ['Test-only fixture: retired by source E01.'],
    })
    expect(entry.sources).toHaveLength(sourceProfile.sourceRefs.length)
  })

  it('filters audit entries by platform without mixing pending renderer claims', () => {
    const entries = listCatalogAuditEntries({ includePending: true, platform: 'tiktok' })

    expect(entries.every((entry) => entry.platform === 'tiktok')).toBe(true)
    expect(entries.some((entry) => entry.kind === 'pending_compatibility')).toBe(true)
    expect(entries.some((entry) => entry.kind === 'renderer')).toBe(true)
  })
})
