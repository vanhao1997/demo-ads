import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { describe, expect, it, vi } from 'vitest'
import { requireProfile } from '../catalog'
import { ADMICRO_PACKAGES, resolveAdmicroSlots } from '../catalog/admicro'
import { profiles } from '../features/catalogBridge'
import { initialDraft } from '../features/editorModel'
import type { EditorDraft } from '../features/editorModel'
import type { UiProfile } from '../features/uiTypes'
import type { InspectedMedia } from '../media/inspect'
import { exportDraft } from './draft'
import {
  REVIEW_PACKAGE_KIND,
  REVIEW_PACKAGE_SCHEMA_VERSION,
  buildReviewManifest,
  createReviewPackage,
  parseReviewPackage,
} from './reviewPackage'

const profile = profiles.find((item) => item.id === 'threads.feed') ?? profiles[0]
const settings = { fit: 'cover' as const, safeZone: true, focalX: 42, focalY: 57 }
const fixedNow = () => new Date('2026-10-12T10:00:00.000Z')
const assetBytes = new Uint8Array([1, 2, 3, 4])
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const hashA = '9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a'
const hashB = 'b'.repeat(64)

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function zipFile(bytes: Uint8Array, name = 'review.zip') {
  return new File([arrayBuffer(bytes)], name, { type: 'application/zip' })
}

function imageAsset(overrides: Partial<InspectedMedia> = {}): InspectedMedia {
  return {
    id: 'asset-1',
    name: 'creative.png',
    kind: 'image',
    mime: 'image/png',
    bytes: assetBytes.byteLength,
    width: 640,
    height: 640,
    sha256: hashA,
    url: 'blob:creative',
    metadataStatus: 'ready',
    role: 'creative',
    ...overrides,
  }
}

function draftWithAssets(assets: InspectedMedia[]): EditorDraft {
  return { ...initialDraft, assets, renderSettings: { [profile.id]: settings } }
}

function uiProfile(profileId: string): UiProfile {
  const catalogProfile = requireProfile(profileId)
  return {
    id: catalogProfile.id,
    groupId: catalogProfile.groupId,
    groupName: catalogProfile.groupTitle,
    title: catalogProfile.placement,
    product: catalogProfile.productLabel,
    device: catalogProfile.device,
    evidence: catalogProfile.evidence,
    version: catalogProfile.specVersion,
    checkedAt: catalogProfile.checkedAt,
    implementation: catalogProfile.implementation,
    supportStatus: catalogProfile.supportStatus,
    surface: catalogProfile.surface,
    notes: catalogProfile.notes,
    composition: catalogProfile.allowedCompositions,
    source: catalogProfile.sources.map((source) => ({ title: source.label, url: source.url })),
    renderer: catalogProfile.renderer,
    ratio:
      catalogProfile.rules.some((rule) => rule.operator === 'dimensions') &&
      catalogProfile.device !== 'mobile'
        ? 4
        : 1,
    limits: {},
  }
}

function publisherFixture() {
  const packageValue = ADMICRO_PACKAGES.find((item) => item.slotIds.length >= 2)
  if (!packageValue) throw new Error('Missing multi-slot Admicro package fixture.')
  const [firstSlot, secondSlot] = resolveAdmicroSlots({ packageId: packageValue.id })
  return {
    packageValue,
    firstSlot,
    secondSlot,
    publisher: {
      publisherId: packageValue.publisherId,
      packageId: packageValue.id,
      bindings: [
        {
          id: `${packageValue.id}:${firstSlot.id}`,
          targetId: packageValue.id,
          slotId: firstSlot.id,
          assetId: 'asset-1',
          role: 'creative' as const,
          fit: 'cover' as const,
          focalPoint: { x: 0.25, y: 0.75 },
          order: 0,
          source: 'slot_override' as const,
          createdAt: '2026-10-12T10:00:00.000Z',
        },
        {
          id: `${packageValue.id}:${secondSlot.id}`,
          targetId: packageValue.id,
          slotId: secondSlot.id,
          assetId: 'asset-2',
          role: 'creative' as const,
          fit: 'contain' as const,
          focalPoint: { x: 0.5, y: 0.5 },
          order: 1,
          source: 'target_override' as const,
          createdAt: '2026-10-12T10:01:00.000Z',
        },
      ],
    },
  }
}

async function packageWithAsset(asset = imageAsset()) {
  return createReviewPackage(
    {
      draft: draftWithAssets([asset]),
      profile,
      settings,
      preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
      viewport: { width: 360, height: 640 },
    },
    {
      fetchBlob: async () => new Blob([arrayBuffer(assetBytes)], { type: asset.mime }),
      now: fixedNow,
    },
  )
}

describe('review package', () => {
  it('persists presentation state without changing creative or validation, including false flags', () => {
    const input = {
      draft: initialDraft,
      profile,
      settings,
      preview: new Blob(),
      viewport: { width: 417, height: 876 },
      now: fixedNow,
    }
    const original = buildReviewManifest(input)
    const presentation = {
      locale: 'en',
      appChrome: false,
      captionMask: false,
      topViewPhase: 'intro' as const,
    }
    const updated = buildReviewManifest({ ...input, settings: { ...settings, ...presentation } })
    expect(updated.renderContext).toMatchObject(presentation)
    expect(updated.snapshot.renderSettings).toMatchObject(presentation)
    expect(updated.snapshot.resolvedCopy).toEqual(original.snapshot.resolvedCopy)
    expect(updated.validation.summary).toEqual(original.validation.summary)
    expect(original.renderContext.appChrome).toBeUndefined()
    expect(original.renderContext.captionMask).toBeUndefined()
    expect(original.renderContext.topViewPhase).toBeUndefined()
  })

  it('records mockup viewport and scroll without changing target validation or crop', () => {
    const input = {
      draft: initialDraft,
      profile,
      settings,
      preview: new Blob(),
      viewport: { width: 417, height: 980 },
      now: fixedNow,
    }
    const original = buildReviewManifest(input)
    const deviceMockup = {
      id: 'iphone-15-16' as const,
      viewport: { width: 393, height: 852 },
      scrollTop: 240,
    }
    const framed = buildReviewManifest({ ...input, settings: { ...settings, deviceMockup } })
    expect(framed.renderContext.deviceMockup).toEqual(deviceMockup)
    expect(framed.snapshot.renderSettings.deviceMockup).toEqual(deviceMockup)
    expect(framed.profileId).toBe(original.profileId)
    expect(framed.validation.summary).toEqual(original.validation.summary)
    const withoutTimestamp = (results: typeof framed.validation.results) =>
      results.map(({ createdAt: _timestamp, ...result }) => result)
    expect(withoutTimestamp(framed.validation.results)).toEqual(
      withoutTimestamp(original.validation.results),
    )
    expect(framed.renderContext.focalX).toBe(original.renderContext.focalX)
    expect(framed.renderContext.focalY).toBe(original.renderContext.focalY)
  })

  it('builds manifest with raw validation and never promotes unknown checks to ready', () => {
    const manifest = buildReviewManifest({
      draft: initialDraft,
      profile,
      settings: { ...settings, searchCombinationIndex: 3 },
      preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
      viewport: { width: 360, height: 640 },
      now: fixedNow,
    })

    expect(manifest.packageKind).toBe(REVIEW_PACKAGE_KIND)
    expect(manifest.renderContext).toMatchObject({
      fit: 'cover',
      focalX: 42,
      focalY: 57,
      searchCombinationIndex: 3,
    })
    expect(manifest.snapshot.renderSettings.searchCombinationIndex).toBe(3)
    expect(manifest.validation.results.some((result) => result.status === 'unknown')).toBe(true)
    expect(manifest.validation.summary.unknown).toBeGreaterThan(0)
    expect(manifest.snapshot.reviewState).toBe('needs_review')
  })

  it('packages preview, manifest, draft, and only local blob asset binaries', async () => {
    const localAsset = imageAsset()
    const remoteAsset = imageAsset({
      id: 'remote-1',
      name: 'remote.png',
      sha256: hashB,
      url: 'https://cdn.example/remote.png',
    })
    const result = await createReviewPackage(
      {
        draft: draftWithAssets([localAsset, remoteAsset]),
        profile,
        settings,
        preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
        viewport: { width: 360, height: 640 },
      },
      {
        fetchBlob: async (url) => {
          expect(url).toBe('blob:creative')
          return new Blob([arrayBuffer(assetBytes)], { type: localAsset.mime })
        },
        now: fixedNow,
      },
    )

    const entries = unzipSync(new Uint8Array(await result.blob.arrayBuffer()))
    const paths = Object.keys(entries)
    const manifest = JSON.parse(strFromU8(entries['manifest.json'])) as ReturnType<
      typeof buildReviewManifest
    >

    expect(paths).toContain('preview.png')
    expect(paths).toContain('draft.json')
    expect(paths.filter((path) => path.startsWith('assets/'))).toHaveLength(1)
    expect(manifest.assets).toHaveLength(2)
    expect(manifest.assets.find((asset) => asset.id === remoteAsset.id)?.entry).toBeUndefined()
  })

  it('adds publisher context only for the active Admicro export target', async () => {
    const { packageValue, firstSlot, publisher } = publisherFixture()
    const draft = { ...draftWithAssets([imageAsset()]), publisher }
    const admicroProfile = uiProfile(packageValue.id)

    const result = await createReviewPackage(
      {
        draft,
        profile: admicroProfile,
        settings,
        preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
        viewport: { width: 970, height: 250 },
      },
      {
        fetchBlob: async () => new Blob([arrayBuffer(assetBytes)], { type: 'image/png' }),
        now: fixedNow,
      },
    )
    const regularManifest = buildReviewManifest({
      draft,
      profile,
      settings,
      preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
      viewport: { width: 360, height: 640 },
      now: fixedNow,
    })

    expect(result.manifest.publisher).toMatchObject({
      publisherId: packageValue.publisherId,
      packageId: packageValue.id,
      simulated: true,
      effectiveAt: null,
      slots: expect.arrayContaining([
        expect.objectContaining({
          slotId: firstSlot.id,
          binding: expect.objectContaining({
            assetId: 'asset-1',
            fit: 'cover',
            focalPoint: { x: 0.25, y: 0.75 },
            source: 'slot_override',
          }),
          assetHash: hashA,
          sourceRowNumber: expect.any(Number),
          sourceDimensionText: expect.any(String),
        }),
      ]),
    })
    expect(
      result.manifest.validation.results.some((item) => item.ruleId === 'admicro.source_dates'),
    ).toBe(true)
    expect(regularManifest.publisher).toBeUndefined()
  })

  it('restores packaged assets only after reinspection and hash verification', async () => {
    const asset = imageAsset({ role: 'logo' })
    const result = await packageWithAsset(asset)
    const inspected = imageAsset({ id: 'fresh-id', role: 'creative', url: 'blob:fresh' })
    const inspect = vi.fn(async () => inspected)

    const parsed = await parseReviewPackage(
      zipFile(new Uint8Array(await result.blob.arrayBuffer())),
      {
        inspectFile: inspect,
      },
    )

    expect(parsed.profileId).toBe(profile.id)
    expect(parsed.missingAssets).toBe(0)
    expect(parsed.draft.assets[0]).toMatchObject({
      id: asset.id,
      role: asset.role,
      name: asset.name,
    })
    expect(parsed.draft.assets[0].url).toBe('blob:fresh')
  })

  it('roundtrips publisher bindings through ZIP draft import', async () => {
    const { packageValue, publisher } = publisherFixture()
    const asset = imageAsset()
    const result = await createReviewPackage(
      {
        draft: { ...draftWithAssets([asset]), publisher },
        profile: uiProfile(packageValue.id),
        settings,
        preview: new Blob([arrayBuffer(pngBytes)], { type: 'image/png' }),
        viewport: { width: 970, height: 250 },
      },
      {
        fetchBlob: async () => new Blob([arrayBuffer(assetBytes)], { type: asset.mime }),
        now: fixedNow,
      },
    )
    const inspected = imageAsset({ id: 'fresh-id', url: 'blob:fresh' })
    const inspect = vi.fn(async () => inspected)

    const parsed = await parseReviewPackage(
      zipFile(new Uint8Array(await result.blob.arrayBuffer())),
      {
        inspectFile: inspect,
      },
    )

    expect(parsed.profileId).toBe(packageValue.id)
    expect(parsed.draft.publisher).toEqual(publisher)
    expect(parsed.draft.assets[0]).toMatchObject({
      id: asset.id,
      role: asset.role,
      url: 'blob:fresh',
    })
  })

  it('rejects tampered asset hashes after reinspection', async () => {
    const result = await packageWithAsset()
    const inspect = vi.fn(async () => imageAsset({ sha256: hashB, url: 'blob:fresh' }))

    await expect(
      parseReviewPackage(zipFile(new Uint8Array(await result.blob.arrayBuffer())), {
        inspectFile: inspect,
      }),
    ).rejects.toThrow('SHA-256')
  })

  it('rejects unsafe zip paths and prototype pollution keys', async () => {
    const draft = JSON.stringify(exportDraft(initialDraft, profile.id))
    const manifest = JSON.stringify({
      schemaVersion: REVIEW_PACKAGE_SCHEMA_VERSION,
      packageKind: REVIEW_PACKAGE_KIND,
      profileId: profile.id,
      files: { preview: 'preview.png', draft: 'draft.json' },
      assets: [],
    })
    const unsafePathZip = zipSync({
      'manifest.json': strToU8(manifest),
      'draft.json': strToU8(draft),
      'preview.png': pngBytes,
      '../evil': strToU8('x'),
    })
    const pollutedManifest = `{"schemaVersion":${REVIEW_PACKAGE_SCHEMA_VERSION},"packageKind":"${REVIEW_PACKAGE_KIND}","profileId":"${profile.id}","files":{"preview":"preview.png","draft":"draft.json"},"assets":[],"__proto__":{"polluted":true}}`
    const pollutedZip = zipSync({
      'manifest.json': strToU8(pollutedManifest),
      'draft.json': strToU8(draft),
      'preview.png': pngBytes,
    })

    await expect(parseReviewPackage(zipFile(unsafePathZip))).rejects.toThrow('đường dẫn')
    await expect(parseReviewPackage(zipFile(pollutedZip))).rejects.toThrow('key JSON')
  })
})
