import { describe, expect, it } from 'vitest'
import {
  ADMICRO_ENTRIES,
  ADMICRO_PACKAGES,
  ADMICRO_PUBLISHERS,
  ADMICRO_RAW_ROWS,
  ADMICRO_SNAPSHOT,
  ADMICRO_SLOTS,
  SOURCE_REGISTRY,
  resolveAdmicroSlots,
  resolveProfile,
} from './index'

function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function publisherFor(value: unknown): boolean {
  const compact = normalize(value).replace(/\s+/g, '')
  return ADMICRO_PUBLISHERS.some((publisher) =>
    publisher.sourceLabels.some((label) => compact.includes(normalize(label).replace(/\s+/g, ''))),
  )
}

function namedRawRows() {
  return ADMICRO_RAW_ROWS.filter((row) => {
    const slotLabel = row.cells.C
    const normalizedSlot = normalize(slotLabel)
    return (
      typeof slotLabel === 'string' &&
      Boolean(normalizedSlot) &&
      normalizedSlot !== 'ten vi tri ads position' &&
      normalizedSlot !== 'ten vi tri' &&
      !publisherFor(slotLabel) &&
      publisherFor(row.resolvedCells.B)
    )
  })
}

describe('Admicro source registry', () => {
  it('registers E13-E18 with conservative evidence', () => {
    expect(SOURCE_REGISTRY.E13).toMatchObject({
      authority: 'official',
      evidence: 'primary_documented',
    })
    expect(SOURCE_REGISTRY.E14).toMatchObject({
      authority: 'official',
      evidence: 'primary_documented',
    })
    expect(SOURCE_REGISTRY.E15).toMatchObject({
      authority: 'official',
      evidence: 'reference_only',
    })
    expect(SOURCE_REGISTRY.E16).toMatchObject({
      authority: 'official',
      evidence: 'primary_documented',
    })
    expect(SOURCE_REGISTRY.E17).toMatchObject({
      authority: 'publisher',
      evidence: 'conflict',
    })
    expect(SOURCE_REGISTRY.E17.notes).toContain('2026-05-28')
    expect(SOURCE_REGISTRY.E17.notes).toContain('2025-02-05')
    expect(SOURCE_REGISTRY.E17.notes).toContain('2022-04')
    expect(SOURCE_REGISTRY.E17.notes).toContain('current pricing or availability')
    expect(SOURCE_REGISTRY.E18).toMatchObject({
      authority: 'reference',
      evidence: 'reference_only',
    })
  })
})

describe('Admicro CPD catalog contract', () => {
  it('keeps raw source rows and derives named entries without header rows', () => {
    const sourceRows = namedRawRows()
    expect(ADMICRO_SNAPSHOT).toMatchObject({
      snapshotId: 'admicro-cpd-2026-10-12',
      sourceRefId: 'E17',
      snapshotDate: '2026-10-12',
      effectiveAt: null,
      sheetName: 'CPD ',
      rowCount: 1196,
    })
    expect(ADMICRO_RAW_ROWS).toHaveLength(1196)
    expect(ADMICRO_ENTRIES).toHaveLength(sourceRows.length)
    expect(sourceRows).toHaveLength(253)
    expect(ADMICRO_ENTRIES.some((entry) => normalize(entry.slotLabel) === 'ten vi tri')).toBe(
      false,
    )

    const continuation = ADMICRO_RAW_ROWS.find((row) => row.rowNumber === 14)
    expect(continuation?.resolvedCells.C).toBe('Full Homepage Plus')
    expect(continuation?.mergedFrom.C).toBe('C13')
  })

  it('preserves the 14 publisher labels and stable unique IDs', () => {
    expect(ADMICRO_PUBLISHERS.map((publisher) => publisher.label)).toEqual([
      'CafeF',
      'CafeBiz',
      'VTV',
      'Kenh14',
      'Soha',
      'aFamily',
      'Phu Nu Viet Nam',
      'Gia Dinh & Suc khoe doi song',
      'GameK',
      'GenK',
      'AutoPro',
      'Thanh Nien',
      'Tuoi Tre',
      'VnEconomy',
    ])
    expect(new Set(ADMICRO_ENTRIES.map((entry) => entry.id)).size).toBe(ADMICRO_ENTRIES.length)
    expect(new Set(ADMICRO_SLOTS.map((slot) => slot.id)).size).toBe(ADMICRO_SLOTS.length)
    expect(ADMICRO_ENTRIES.every((entry) => entry.id.startsWith('admicro.entry.'))).toBe(true)
  })

  it('keeps provenance and avoids current pricing or availability claims', () => {
    expect(
      ADMICRO_ENTRIES.every(
        (entry) =>
          entry.sourceRefIds.join(',') === 'E17' &&
          entry.sourceSnapshotDate === '2026-10-12' &&
          entry.effectiveAt === null &&
          entry.pageOrSection === 'publisher_homepage' &&
          entry.conflictNotes.some((note) => note.includes('no current pricing or availability')),
      ),
    ).toBe(true)
    expect(ADMICRO_ENTRIES.some((entry) => entry.evidence === 'primary_documented')).toBe(true)
    expect(ADMICRO_ENTRIES.some((entry) => entry.evidence === 'conflict')).toBe(true)
    expect(
      ADMICRO_ENTRIES.every(
        (entry) =>
          (entry.evidence === 'primary_documented' && entry.status === 'active_reference') ||
          (entry.evidence === 'conflict' && entry.status === 'needs_review'),
      ),
    ).toBe(true)

    expect(
      ADMICRO_ENTRIES.every((entry) =>
        Object.keys(entry.rawCells).every((column) => 'ABCDEFGHIJK'.includes(column)),
      ),
    ).toBe(true)
    expect(
      ADMICRO_ENTRIES.every((entry) =>
        Object.keys(entry.resolvedCells).every((column) => 'ABCDEFGHIJK'.includes(column)),
      ),
    ).toBe(true)
    expect(ADMICRO_ENTRIES.some((entry) => 'price' in entry || 'currentAvailability' in entry)).toBe(
      false,
    )
    expect(
      ADMICRO_ENTRIES.filter((entry) => entry.demoUrl).every(
        (entry) =>
          entry.hyperlinks.F === entry.demoUrl ||
          entry.rawCells.F === entry.demoUrl ||
          entry.resolvedCells.F === entry.demoUrl,
      ),
    ).toBe(true)
  })

  it('models packages as multiple slots with per-slot asset binding', () => {
    const billboardPlus = ADMICRO_PACKAGES.find(
      (item) => item.publisherId === 'cafef' && item.packageType === 'billboard_plus',
    )
    expect(billboardPlus).toBeDefined()
    expect(billboardPlus?.sourceRefIds).toEqual(['E17'])
    expect(billboardPlus?.effectiveAt).toBeNull()
    expect(billboardPlus?.assetAssignment).toBe('per_slot')
    expect(billboardPlus?.evidence).toBe('conflict')
    expect(billboardPlus?.status).toBe('needs_review')

    const slots = resolveAdmicroSlots({ packageId: billboardPlus?.id })
    expect(slots.length).toBeGreaterThan(1)
    expect(slots.every((slot) => slot.publisherId === 'cafef')).toBe(true)
    expect(slots.map((slot) => slot.label)).toEqual(expect.arrayContaining(['Billboard', 'Background']))
    expect(slots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 1920, height: 350 }),
        expect.objectContaining({ width: 1920, height: 1200 }),
      ]),
    )
    expect(slots.some((slot) => slot.id === billboardPlus?.id)).toBe(false)
  })

  it('resolves Admicro slot and package profiles dynamically as conflict references', () => {
    const billboardPremium = ADMICRO_PACKAGES.find(
      (item) => item.publisherId === 'cafef' && item.packageType === 'billboard_premium',
    )
    expect(billboardPremium).toBeDefined()
    const slots = resolveAdmicroSlots({ packageId: billboardPremium?.id })
    const slotProfile = resolveProfile(slots[0].id)
    const packageProfile = billboardPremium ? resolveProfile(billboardPremium.id) : undefined

    expect(slotProfile).toMatchObject({
      groupId: 'admicro',
      groupTitle: 'Admicro',
      platform: 'admicro',
      renderer: 'banner',
      sourceRefs: ['E17'],
      evidence: 'conflict',
      supportStatus: 'needs_review',
      effectiveAt: null,
    })
    expect(slotProfile?.rules).toHaveLength(0)
    expect(packageProfile).toMatchObject({
      groupId: 'admicro',
      productLabel: 'CPD Homepage Package',
      renderer: 'banner',
      sourceRefs: ['E17'],
      evidence: 'conflict',
      supportStatus: 'needs_review',
    })
    expect(packageProfile?.rules).toHaveLength(0)
  })
})
