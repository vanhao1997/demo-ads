import { describe, expect, it } from 'vitest'
import { DEFAULT_CREATIVE, requireProfile } from '../catalog'
import type { Creative, MediaAsset } from '../domain'
import { countTextUnits, validateCreative } from './index'

function asset(id: string, overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id,
    name: `${id}.jpg`,
    kind: 'image',
    mime: 'image/jpeg',
    bytes: 90_000,
    width: 640,
    height: 640,
    metadataStatus: 'ready',
    roles: ['creative'],
    ...overrides,
  }
}

function creativeWithAssets(count: number, composition = 'carousel' as const): Creative {
  const assets = Array.from({ length: count }, (_, index) => asset(`asset-${index + 1}`))
  return {
    ...DEFAULT_CREATIVE,
    assets,
    composition: {
      kind: composition,
      assetIds: assets.map((item) => item.id),
      items: assets.map((item, index) => ({
        id: `card-${index + 1}`,
        order: index + 1,
        assetId: item.id,
      })),
    },
  }
}

function statuses(profileId: string, creative: Creative, ruleId: string) {
  return validateCreative(creative, requireProfile(profileId))
    .filter((result) => result.ruleId === ruleId)
    .map((result) => result.status)
}

describe('text counting', () => {
  it('counts grapheme clusters and CJK weighted units separately', () => {
    expect(countTextUnits('â')).toBe(1)
    expect(countTextUnits('👨‍👩‍👧‍👦')).toBe(1)
    expect(countTextUnits('広告A', 'cjk_weighted')).toBe(5)
  })
})

describe('profile validation', () => {
  it('never promotes unverified source evidence or a byte conflict to pass', () => {
    const profile = requireProfile('zalo.message')
    expect(
      validateCreative(DEFAULT_CREATIVE, profile).every((result) => result.status === 'unknown'),
    ).toBe(true)
    const video = asset('small-video', { kind: 'video', mime: 'video/mp4', bytes: 1000 })
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      assets: [video],
      composition: { kind: 'single_video', assetIds: [video.id], items: [] },
    }
    expect(
      statuses('zalo.video.safe_zone', creative, 'asset.bytes.zalo_video.conflict_10_150mb'),
    ).toEqual(['unknown'])
    expect(
      validateCreative(DEFAULT_CREATIVE, requireProfile('threads.feed')).find(
        (result) => result.ruleId === 'profile.composition.allowed',
      )?.status,
    ).toBe('unknown')
  })
  it('separates uploaded banner MIME rules from native display and TikTok images', () => {
    const gif = asset('gif', { mime: 'image/gif', width: 300, height: 250 })
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      assets: [gif],
      composition: { kind: 'single_image', assetIds: [gif.id], items: [] },
    }
    expect(statuses('google.display.300x250', creative, 'asset.mime.image')).toEqual(['pass'])
    const webp = { ...gif, mime: 'image/webp' }
    expect(
      statuses('google.display.300x250', { ...creative, assets: [webp] }, 'asset.mime.image'),
    ).toEqual(['fail'])
    expect(
      statuses(
        'tiktok.in_feed.standard_carousel',
        { ...creativeWithAssets(2), assets: [{ ...webp, id: 'asset-1' }, asset('asset-2')] },
        'asset.mime.image',
      ),
    ).toEqual(['fail', 'pass'])
    expect(requireProfile('google.display.native_in_article').rules).toHaveLength(0)
  })
  it('requires nonempty RSA fields and checks music metadata separately from images', () => {
    const rsa = {
      ...DEFAULT_CREATIVE,
      copy: { ...DEFAULT_CREATIVE.copy, headlines: [' ', '', 'Valid'] },
    }
    expect(statuses('google.search.mobile', rsa, 'copy.headlines.required')).toEqual([
      'fail',
      'fail',
      'pass',
    ])
    const creative = creativeWithAssets(2)
    const music = asset('music', {
      kind: 'audio',
      mime: 'audio/wav',
      durationMs: 1000,
      roles: ['audio'],
    })
    const withAudio = {
      ...creative,
      assets: [...creative.assets, music],
      composition: { ...creative.composition, audioAssetId: music.id },
    }
    expect(statuses('tiktok.in_feed.standard_carousel', withAudio, 'audio.mime.mp3')).toEqual([
      'fail',
    ])
    expect(
      statuses('tiktok.in_feed.standard_carousel', withAudio, 'audio.duration.min_2s'),
    ).toEqual(['fail'])
    expect(statuses('tiktok.in_feed.standard_carousel', withAudio, 'asset.kind.image')).toEqual([
      'pass',
      'pass',
    ])
  })
  it('validates TikTok Standard Carousel without a global cap of 10 assets', () => {
    const profileId = 'tiktok.in_feed.standard_carousel'
    expect(statuses(profileId, creativeWithAssets(1), 'assets.min_count_2')).toContain('fail')
    expect(statuses(profileId, creativeWithAssets(2), 'assets.max_count_35')).toContain('pass')
    expect(statuses(profileId, creativeWithAssets(35), 'assets.max_count_35')).toContain('pass')
    expect(statuses(profileId, creativeWithAssets(36), 'assets.max_count_35')).toContain('fail')
  })

  it('does not apply the Zalo common 30-char brand limit to Form OA name', () => {
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      form: {
        ...DEFAULT_CREATIVE.form!,
        oaName: 'A'.repeat(40),
        title: 'Lead form',
        body: 'Body',
        questions: [],
      },
    }
    expect(statuses('zalo.form', creative, 'form.oaName.max_40')).toContain('pass')
    const nativeCreative = {
      ...creative,
      identity: { ...creative.identity, brandName: 'A'.repeat(31) },
    }
    expect(
      statuses('zalo.native.single_image', nativeCreative, 'identity.brandName.max_30'),
    ).toContain('fail')
  })

  it('uses CJK weighted counting for Google RSA limits', () => {
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      composition: { kind: 'text_only', assetIds: [], items: [] },
      copy: {
        ...DEFAULT_CREATIVE.copy,
        headlines: ['広告広告広告広告広告広告広告広告', 'Headline 2', 'Headline 3'],
        descriptions: ['Description one', 'Description two'],
      },
    }
    const result = validateCreative(creative, requireProfile('google.search.mobile')).find(
      (item) => item.ruleId === 'copy.headlines._.max_30',
    )
    expect(result?.status).toBe('fail')
    expect(result?.actual).toBe(32)
  })

  it('passes Google RSA CJK weighted headline boundary at 30 and fails at 31', () => {
    const exactBoundary = '広告広告広告広告広告広告広告🙂A'
    const overBoundary = `${exactBoundary}B`
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      composition: { kind: 'text_only', assetIds: [], items: [] },
      copy: {
        ...DEFAULT_CREATIVE.copy,
        headlines: [exactBoundary, overBoundary, 'Headline 3'],
        descriptions: ['Description one', 'Description two'],
      },
    }
    const results = validateCreative(creative, requireProfile('google.search.mobile')).filter(
      (item) => item.ruleId === 'copy.headlines._.max_30',
    )

    expect(countTextUnits(exactBoundary, 'cjk_weighted')).toBe(30)
    expect(countTextUnits(overBoundary, 'cjk_weighted')).toBe(31)
    expect(results).toEqual([
      expect.objectContaining({
        fieldPath: 'copy.headlines[0]',
        status: 'pass',
        actual: 30,
        expected: '30 (cjk_weighted)',
      }),
      expect.objectContaining({
        fieldPath: 'copy.headlines[1]',
        status: 'fail',
        actual: 31,
        expected: '30 (cjk_weighted)',
      }),
      expect.objectContaining({
        fieldPath: 'copy.headlines[2]',
        status: 'pass',
        actual: 10,
        expected: '30 (cjk_weighted)',
      }),
    ])
  })

  it('keeps Zalo video byte conflicts unknown between 10MB and 150MB', () => {
    const video = asset('video', {
      kind: 'video',
      name: 'video.mp4',
      mime: 'video/mp4',
      bytes: 40 * 1024 * 1024,
      width: 1080,
      height: 1920,
      durationMs: 30_000,
      codec: 'h264',
    })
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      assets: [video],
      composition: {
        kind: 'single_video',
        assetIds: [video.id],
        primaryAssetId: video.id,
        items: [],
      },
    }
    const result = validateCreative(creative, requireProfile('zalo.video.safe_zone')).find(
      (item) => item.ruleId === 'asset.bytes.zalo_video.conflict_10_150mb',
    )
    expect(result?.status).toBe('unknown')
  })

  it('marks unverified MP4 codec as unknown instead of pass', () => {
    const video = asset('video', {
      kind: 'video',
      name: 'video.mp4',
      mime: 'video/mp4',
      bytes: 2_000_000,
      width: 1080,
      height: 1920,
      durationMs: 30_000,
      codec: undefined,
    })
    const creative: Creative = {
      ...DEFAULT_CREATIVE,
      assets: [video],
      composition: {
        kind: 'single_video',
        assetIds: [video.id],
        primaryAssetId: video.id,
        items: [],
      },
    }
    const result = validateCreative(creative, requireProfile('zalo.video.safe_zone')).find(
      (item) => item.ruleId === 'asset.codec.h264',
    )
    expect(result?.status).toBe('unknown')
  })
})
