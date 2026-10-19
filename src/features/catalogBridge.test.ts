import { describe, expect, it } from 'vitest'
import type { InspectedMedia } from '../media/inspect'
import { buildReviewManifest } from '../storage/reviewPackage'
import { profiles, runValidation, toCreative, validateDraft } from './catalogBridge'
import { initialDraft } from './editorModel'
import type { EditorDraft } from './editorModel'

const imageAsset = (id: string): InspectedMedia => ({
  id,
  name: `${id}.png`,
  kind: 'image',
  mime: 'image/png',
  bytes: 80_000,
  width: 640,
  height: 640,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'ready',
  role: 'creative',
})

const audioAsset = (id: string): InspectedMedia => ({
  id,
  name: `${id}.mp3`,
  kind: 'audio',
  mime: 'audio/mpeg',
  bytes: 500_000,
  durationMs: 3000,
  sha256: id.padEnd(64, '0'),
  url: `blob:${id}`,
  metadataStatus: 'partial',
  role: 'audio',
})

describe('editor validation adapter', () => {
  it('uses the canonical catalog rather than a UI-specific inventory', () => {
    const legacyProfiles = profiles.filter((profile) => profile.groupId !== 'admicro')
    const admicroProfiles = profiles.filter((profile) => profile.groupId === 'admicro')

    expect(legacyProfiles).toHaveLength(50)
    expect(new Set(legacyProfiles.map((profile) => profile.groupId)).size).toBe(10)
    expect(admicroProfiles.length).toBeGreaterThan(0)
    expect(admicroProfiles.every((profile) => profile.supportStatus === 'needs_review')).toBe(true)
    expect(admicroProfiles.every((profile) => profile.evidence === 'conflict')).toBe(true)
    expect(admicroProfiles.every((profile) => profile.implementation === 'planned')).toBe(true)
  })
  it('validates resolved copy and keeps a deliberate clear without fallback', () => {
    const profileId = 'google.search.mobile'
    const draft = {
      ...initialDraft,
      composition: 'text_only',
      overrides: {
        [profileId]: {
          headline: { mode: 'clear' as const, value: 'Ignored' },
          destinationUrl: { mode: 'replace' as const, value: 'javascript:alert(1)' },
        },
      },
    }
    expect(toCreative(draft, profileId).copy.headlines[0]).toBe('')
    expect(
      runValidation(draft, profileId).some(
        (check) => check.id.includes('headlines.required') && check.status === 'fail',
      ),
    ).toBe(true)
    expect(
      runValidation(draft, profileId).some(
        (check) => check.id.includes('destinationUrl.http') && check.status === 'fail',
      ),
    ).toBe(true)
    expect(toCreative(draft, 'google.search.desktop').copy.headlines[0]).toBe(
      initialDraft.copy.headlines[0],
    )
  })
  it('does not manufacture a headline from an empty array', () => {
    const draft = { ...initialDraft, copy: { ...initialDraft.copy, headlines: [] } }
    expect(toCreative(draft, 'google.search.mobile').copy.headlines).toEqual([])
  })

  it('preserves carousel card details and rejects TikTok per-card URLs', () => {
    const first = imageAsset('first')
    const second = imageAsset('second')
    const draft: EditorDraft = {
      ...initialDraft,
      composition: 'carousel',
      assets: [first, second, audioAsset('music')],
      cardDetails: {
        [first.id]: {
          title: 'Card one',
          description: 'First detail',
          url: 'https://example.com/card-one',
        },
        [second.id]: { title: 'Card two', description: '', url: '' },
      },
    }

    const creative = toCreative(draft, 'tiktok.in_feed.standard_carousel')

    expect(creative.composition.items).toMatchObject([
      {
        assetId: first.id,
        title: 'Card one',
        description: 'First detail',
        url: 'https://example.com/card-one',
      },
      { assetId: second.id, title: 'Card two', url: '' },
    ])
    expect(
      validateDraft(draft, 'tiktok.in_feed.standard_carousel').some(
        (result) =>
          result.ruleId === 'composition.items.url.disallowed' &&
          result.fieldPath === 'composition.items.url[0]' &&
          result.status === 'fail' &&
          result.actual === 'https://example.com/card-one',
      ),
    ).toBe(true)
  })

  it('keeps unsupported multi-image grid assets while failing TikTok carousel composition', () => {
    const assets = [
      imageAsset('grid-one'),
      imageAsset('grid-two'),
      imageAsset('grid-three'),
      imageAsset('grid-four'),
    ]
    const draft: EditorDraft = {
      ...initialDraft,
      composition: 'multi_image_grid',
      assets,
    }

    const creative = toCreative(draft, 'tiktok.in_feed.standard_carousel')
    const composition = validateDraft(draft, 'tiktok.in_feed.standard_carousel').find(
      (result) => result.ruleId === 'profile.composition.allowed',
    )

    expect(creative.composition.kind).toBe('multi_image_grid')
    expect(creative.composition.assetIds).toEqual(assets.map((asset) => asset.id))
    expect(composition).toMatchObject({
      status: 'fail',
      actual: 'multi_image_grid',
      expected: ['carousel'],
    })
  })

  it('retains per-card URLs for review while requiring shared URL and valid music on TikTok carousel', () => {
    const first = imageAsset('first-card')
    const second = imageAsset('second-card')
    const music = audioAsset('music')
    const draft: EditorDraft = {
      ...initialDraft,
      composition: 'carousel',
      assets: [first, second, music],
      copy: { ...initialDraft.copy, destinationUrl: 'https://shared.example/landing' },
      cardDetails: {
        [first.id]: {
          title: 'Card one',
          description: 'First card',
          url: 'https://card-one.example/landing',
        },
        [second.id]: {
          title: 'Card two',
          description: 'Second card',
          url: 'https://card-two.example/landing',
        },
      },
    }

    const creative = toCreative(draft, 'tiktok.in_feed.standard_carousel')
    const results = validateDraft(draft, 'tiktok.in_feed.standard_carousel')

    expect(creative.copy.destinationUrl).toBe('https://shared.example/landing')
    expect(creative.composition.audioAssetId).toBe(music.id)
    expect(creative.composition.items.map((item) => item.url)).toEqual([
      'https://card-one.example/landing',
      'https://card-two.example/landing',
    ])
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'copy.destinationUrl.http',
          status: 'pass',
          actual: 'https:',
        }),
        expect.objectContaining({
          ruleId: 'composition.audio.required',
          status: 'pass',
          actual: music.name,
        }),
        expect.objectContaining({
          ruleId: 'audio.mime.mp3',
          status: 'pass',
          actual: 'audio/mpeg',
        }),
        expect.objectContaining({
          ruleId: 'composition.items.url.disallowed',
          fieldPath: 'composition.items.url[0]',
          status: 'fail',
          actual: 'https://card-one.example/landing',
        }),
        expect.objectContaining({
          ruleId: 'composition.items.url.disallowed',
          fieldPath: 'composition.items.url[1]',
          status: 'fail',
          actual: 'https://card-two.example/landing',
        }),
      ]),
    )
  })

  it('keeps campaign context compatibility unknown with platform source refs in validation and manifest', () => {
    const contextDraft: EditorDraft = {
      ...initialDraft,
      context: {
        market: 'Vietnam',
        objective: 'traffic',
        campaignType: 'placements need account review',
        accountCondition: 'not_connected',
        locale: 'vi-VN',
      },
    }
    const cases = [
      ['tiktok.in_feed.standard_carousel', 'E16'],
      ['facebook.feed', 'E14'],
      ['google.search.mobile', 'E13'],
    ] as const

    for (const [profileId, sourceRef] of cases) {
      const validation = validateDraft(contextDraft, profileId).find(
        (result) => result.ruleId === 'context.compatibility',
      )
      const profile = profiles.find((item) => item.id === profileId)!
      const manifest = buildReviewManifest({
        draft: contextDraft,
        profile,
        settings: { fit: 'cover', safeZone: true, focalX: 50, focalY: 50 },
        preview: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' }),
        viewport: { width: 360, height: 640 },
        now: () => new Date('2026-10-12T10:00:00.000Z'),
      })
      const manifestResult = manifest.validation.results.find(
        (result) => result.ruleId === 'context.compatibility',
      )

      expect(validation).toMatchObject({
        status: 'unknown',
        evidence: 'unknown',
        sourceRefs: [sourceRef],
      })
      expect(manifestResult).toMatchObject({
        ruleId: validation?.ruleId,
        profileId,
        fieldPath: 'context',
        status: 'unknown',
        evidence: 'unknown',
        sourceRefs: [sourceRef],
        actual: validation?.actual,
        expected: validation?.expected,
      })
    }
  })
})
