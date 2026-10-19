import { describe, expect, it } from 'vitest'
import { ADMICRO_PACKAGES, ADMICRO_PUBLISHERS, resolveAdmicroSlots } from '../catalog/admicro'
import type { InspectedMedia } from '../media/inspect'
import { initialDraft } from './editorModel'
import {
  defaultPublisher,
  publisherBinding,
  publisherReviewContext,
  publisherTarget,
  sanitizePublisher,
  updatePublisherBinding,
  validatePublisher,
} from './publisherModel'

const firstPackage = () => {
  const packageValue = ADMICRO_PACKAGES.find((item) => item.slotIds.length >= 2)
  if (!packageValue) throw new Error('Missing multi-slot Admicro package fixture.')
  return packageValue
}

const imageAsset = (id: string): InspectedMedia => ({
  id,
  name: `${id}.png`,
  kind: 'image',
  mime: 'image/png',
  bytes: 1000,
  width: 970,
  height: 250,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'creative',
})

describe('publisher model', () => {
  it('creates and updates per-slot package bindings without collapsing package slots', () => {
    const packageValue = firstPackage()
    const [firstSlot, secondSlot] = resolveAdmicroSlots({ packageId: packageValue.id })
    const selection = {
      publisherId: packageValue.publisherId,
      packageId: packageValue.id,
      bindings: [],
    }

    const withFirst = updatePublisherBinding(selection, firstSlot.id, {
      assetId: 'asset-a',
      fit: 'cover',
      focalPoint: { x: 0.25, y: 0.75 },
      order: 1,
      source: 'slot_override',
    })
    const withSecond = updatePublisherBinding(withFirst, secondSlot.id, {
      assetId: 'asset-b',
      fit: 'contain',
      focalPoint: { x: 0.5, y: 0.5 },
      order: 2,
      source: 'target_override',
    })

    expect(publisherTarget(withSecond)).toBe(packageValue.id)
    expect(publisherBinding(withSecond, firstSlot.id)).toMatchObject({
      targetId: packageValue.id,
      slotId: firstSlot.id,
      assetId: 'asset-a',
      fit: 'cover',
      focalPoint: { x: 0.25, y: 0.75 },
      source: 'slot_override',
    })
    expect(publisherBinding(withSecond, secondSlot.id)).toMatchObject({
      targetId: packageValue.id,
      slotId: secondSlot.id,
      assetId: 'asset-b',
      fit: 'contain',
      source: 'target_override',
    })
    expect(withSecond.bindings).toHaveLength(2)
  })

  it('sanitizes publisher selections and rejects cross-publisher, duplicate, or invalid bindings', () => {
    const packageValue = firstPackage()
    const [slot] = resolveAdmicroSlots({ packageId: packageValue.id })
    const valid = {
      publisherId: packageValue.publisherId,
      packageId: packageValue.id,
      bindings: [
        {
          id: `${packageValue.id}:${slot.id}`,
          targetId: packageValue.id,
          slotId: slot.id,
          role: 'creative',
          fit: 'cover',
          focalPoint: { x: 0.1, y: 0.9 },
          assetId: 'asset-a',
          order: 0,
          source: 'slot_override',
          createdAt: '2026-10-12T10:00:00.000Z',
        },
      ],
    }

    expect(sanitizePublisher(valid)).toEqual(valid)
    expect(() =>
      sanitizePublisher({ ...valid, publisherId: ADMICRO_PUBLISHERS.find((item) => item.id !== packageValue.publisherId)?.id }),
    ).toThrow('publisher/slot/package')
    expect(() =>
      sanitizePublisher({
        ...valid,
        bindings: [
          valid.bindings[0],
          { ...valid.bindings[0], id: `${valid.bindings[0].id}:duplicate` },
        ],
      }),
    ).toThrow('publisher/slot/package')
    expect(() =>
      sanitizePublisher({
        ...valid,
        bindings: [{ ...valid.bindings[0], focalPoint: { x: -0.1, y: 0.5 } }],
      }),
    ).toThrow('publisher/slot/package')
  })

  it('builds review context and validation from raw source provenance without promoting package slots to pass', () => {
    const packageValue = firstPackage()
    const [firstSlot, secondSlot] = resolveAdmicroSlots({ packageId: packageValue.id })
    const draft = {
      ...initialDraft,
      assets: [imageAsset('asset-a')],
      publisher: {
        publisherId: packageValue.publisherId,
        packageId: packageValue.id,
        bindings: [
          {
            id: `${packageValue.id}:${firstSlot.id}`,
            targetId: packageValue.id,
            slotId: firstSlot.id,
            role: 'creative' as const,
            fit: 'cover' as const,
            focalPoint: { x: 0.2, y: 0.8 },
            assetId: 'asset-a',
            source: 'slot_override' as const,
            createdAt: '2026-10-12T10:00:00.000Z',
          },
        ],
      },
    }

    const context = publisherReviewContext(draft)
    const validation = validatePublisher(draft)

    expect(context).toMatchObject({
      publisherId: packageValue.publisherId,
      packageId: packageValue.id,
      sourceSnapshotId: expect.stringContaining('admicro-cpd'),
      effectiveAt: null,
      simulated: true,
    })
    expect(context?.slots.find((slot) => slot.slotId === firstSlot.id)).toMatchObject({
      binding: expect.objectContaining({ assetId: 'asset-a', fit: 'cover' }),
      assetHash: 'asset-a'.padEnd(64, '0'),
      sourceRowNumber: expect.any(Number),
    })
    expect(context?.slots.find((slot) => slot.slotId === secondSlot.id)).toMatchObject({
      binding: undefined,
      assetHash: undefined,
      sourceDimensionText: expect.any(String),
    })
    expect(validation.every((result) => result.sourceRefs.includes('E17'))).toBe(true)
    expect(validation.find((result) => result.ruleId === 'admicro.source_dates')).toMatchObject({
      status: 'unknown',
      evidence: 'conflict',
    })
    expect(validation.find((result) => result.fieldPath === `publisher.bindings.${firstSlot.id}`)).toMatchObject({
      status: 'unknown',
      actual: expect.stringContaining('image'),
    })
    expect(validation.find((result) => result.fieldPath === `publisher.bindings.${secondSlot.id}`)).toMatchObject({
      status: 'fail',
      actual: 'Chưa gán asset',
    })
    expect(validation.map((result) => result.fieldPath)).toContain(`publisher.bindings.${secondSlot.id}`)
  })

  it('defaults to a valid active publisher target from the Admicro catalog', () => {
    const selection = defaultPublisher()
    const slots = resolveAdmicroSlots(selection)

    expect(ADMICRO_PUBLISHERS.some((item) => item.id === selection.publisherId)).toBe(true)
    expect(publisherTarget(selection)).toMatch(/^admicro\.(package|slot)\./)
    expect(slots.length).toBeGreaterThan(0)
  })
})
