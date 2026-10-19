import { describe, expect, it } from 'vitest'
import { ADMICRO_PACKAGES, resolveAdmicroSlots } from '../catalog/admicro'
import { exportDraft, parseDraft } from './draft'
import { initialDraft, resolvedCopy, resolvedRenderSettings } from '../features/editorModel'

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
          assetId: 'asset-a',
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
          assetId: 'asset-b',
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

function exportedWithFormQuestions(questions: unknown) {
  const exported = exportDraft(initialDraft, 'zalo.form')
  ;(exported.draft.form as { questions?: unknown }).questions = questions
  return exported
}

describe('draft interchange', () => {
  it('roundtrips explicit clear and never imports binary URLs or trusted metadata', () => {
    const draft = {
      ...initialDraft,
      overrides: { target: { primaryText: { mode: 'clear' as const, value: '' } } },
    }
    const exported = exportDraft(draft, 'target')
    exported.draft.assets = [{ url: 'https://malicious.test', width: 5000 } as never]
    const result = parseDraft(JSON.stringify(exported))
    expect(result.draft.assets).toEqual([])
    expect(resolvedCopy(result.draft, 'target').primaryText).toBe('')
    expect(resolvedCopy(result.draft, 'other').primaryText).toBe(draft.copy.primaryText)
  })

  it('roundtrips render settings per target and clamps imported focal points', () => {
    const exported = exportDraft(
      {
        ...initialDraft,
        renderSettings: {
          'facebook.feed': { fit: 'contain', safeZone: false, focalX: -10, focalY: 140 },
          'instagram.feed': { fit: 'cover', safeZone: true, focalX: 20, focalY: 80 },
        },
      },
      'instagram.feed',
    )
    const result = parseDraft(JSON.stringify(exported))

    expect(resolvedRenderSettings(result.draft, 'facebook.feed')).toEqual({
      fit: 'contain',
      safeZone: false,
      focalX: 0,
      focalY: 100,
    })
    expect(resolvedRenderSettings(result.draft, 'instagram.feed').focalY).toBe(80)
  })

  it('imports older drafts without render settings', () => {
    const exported = exportDraft(initialDraft, 'facebook.feed')
    delete (exported.draft as Partial<typeof exported.draft>).renderSettings

    const result = parseDraft(JSON.stringify(exported))

    expect(resolvedRenderSettings(result.draft, 'facebook.feed')).toEqual({
      fit: 'cover',
      safeZone: true,
      focalX: 50,
      focalY: 50,
    })
  })

  it('roundtrips card details and campaign context without trusting asset binaries', () => {
    const draft = {
      ...initialDraft,
      cardDetails: {
        'asset-1': {
          title: 'Card title',
          description: 'Card description',
          url: 'https://example.com/card',
        },
      },
      context: {
        market: 'Vietnam',
        objective: 'traffic' as const,
        campaignType: 'Traffic campaign',
        accountCondition: 'not_connected',
        identityMode: 'brand-owned',
        locale: 'vi-VN',
      },
    }
    const exported = exportDraft(draft, 'tiktok.in_feed.standard_carousel')
    exported.draft.assets = [
      { id: 'asset-1', url: 'blob:unsafe', width: 640, height: 640 } as never,
    ]

    const result = parseDraft(JSON.stringify(exported))

    expect(result.profileId).toBe('tiktok.in_feed.standard_carousel')
    expect(result.draft.assets).toEqual([])
    expect(result.draft.cardDetails).toEqual(draft.cardDetails)
    expect(result.draft.context).toEqual(draft.context)
    expect(result.missingAssets).toBe(0)
  })

  it('roundtrips canonical FormQuestion JSON without non-canonical fields', () => {
    const questions = [
      { key: 'email', label: 'Email nhận tư vấn', required: true },
      { key: 'budget_range', label: 'Ngân sách dự kiến', required: false },
      { key: 'city-1', label: 'Khu vực'.padEnd(200, '.'), required: true },
    ]
    const exported = exportDraft(
      {
        ...initialDraft,
        form: {
          ...initialDraft.form,
          questions,
        },
      },
      'zalo.form',
    )

    const result = parseDraft(JSON.stringify(exported))

    expect(result.profileId).toBe('zalo.form')
    expect(result.draft.form.questions).toEqual(questions)
  })

  it('rejects malformed FormQuestion version and type shapes', () => {
    const unsupportedVersion = exportDraft(initialDraft, 'zalo.form')
    unsupportedVersion.schemaVersion = 2
    expect(() => parseDraft(JSON.stringify(unsupportedVersion))).toThrow('Phiên bản')

    expect(() => parseDraft(JSON.stringify(exportedWithFormQuestions({ key: 'email' })))).toThrow(
      'Câu hỏi Form',
    )
    expect(() =>
      parseDraft(
        JSON.stringify(
          exportedWithFormQuestions([{ key: 123, label: 'Email nhận tư vấn', required: true }]),
        ),
      ),
    ).toThrow('Câu hỏi Form')
    expect(() =>
      parseDraft(
        JSON.stringify(exportedWithFormQuestions([{ key: 'email', label: 123, required: true }])),
      ),
    ).toThrow('Câu hỏi Form')
    expect(() =>
      parseDraft(
        JSON.stringify(
          exportedWithFormQuestions([{ key: 'email', label: 'Email nhận tư vấn', required: 'yes' }]),
        ),
      ),
    ).toThrow('Câu hỏi Form')
  })

  it('rejects FormQuestion limits, duplicate keys, and unsafe keys', () => {
    const elevenQuestions = Array.from({ length: 11 }, (_, index) => ({
      key: `question-${index + 1}`,
      label: `Câu hỏi ${index + 1}`,
      required: false,
    }))
    expect(() => parseDraft(JSON.stringify(exportedWithFormQuestions(elevenQuestions)))).toThrow(
      'vượt 10',
    )

    expect(() =>
      parseDraft(
        JSON.stringify(exportedWithFormQuestions([{ key: 'email', label: 'x'.repeat(201), required: true }])),
      ),
    ).toThrow('Câu hỏi Form')

    expect(() =>
      parseDraft(
        JSON.stringify(
          exportedWithFormQuestions([
            { key: 'email', label: 'Email', required: true },
            { key: 'email', label: 'Email duplicate', required: false },
          ]),
        ),
      ),
    ).toThrow('Câu hỏi Form')

    for (const key of ['has space', 'has.dot', '../path', '__proto__', 'constructor', 'prototype']) {
      expect(() =>
        parseDraft(
          JSON.stringify(exportedWithFormQuestions([{ key, label: 'Unsafe key', required: false }])),
        ),
      ).toThrow('Câu hỏi Form')
    }
  })

  it('roundtrips Admicro publisher package bindings with per-slot crop provenance', () => {
    const { publisher } = publisherFixture()
    const exported = exportDraft({ ...initialDraft, publisher }, publisher.packageId)

    const result = parseDraft(JSON.stringify(exported))

    expect(result.profileId).toBe(publisher.packageId)
    expect(result.draft.publisher).toEqual(publisher)
  })

  it('rejects unknown versions and wrong field shapes', () => {
    expect(() => parseDraft('{"schemaVersion":99}')).toThrow('Phiên bản')
    const exported = exportDraft(initialDraft, 'target')
    exported.draft.copy.headlines = [123 as never]
    expect(() => parseDraft(JSON.stringify(exported))).toThrow('Field')
  })

  it('rejects unsupported compositions and malformed render settings', () => {
    const badComposition = exportDraft(initialDraft, 'facebook.feed')
    badComposition.draft.composition = 'unknown_layout'
    expect(() => parseDraft(JSON.stringify(badComposition))).toThrow('Cấu trúc')

    const badProfile = exportDraft(
      {
        ...initialDraft,
        renderSettings: {
          'missing.profile': { fit: 'cover', safeZone: true, focalX: 50, focalY: 50 },
        },
      },
      'facebook.feed',
    )
    expect(() => parseDraft(JSON.stringify(badProfile))).toThrow('Thiết lập render')

    const badField = exportDraft(
      {
        ...initialDraft,
        renderSettings: {
          'facebook.feed': {
            fit: 'cover',
            safeZone: true,
            focalX: 50,
            focalY: 50,
            extra: true,
          } as never,
        },
      },
      'facebook.feed',
    )
    expect(() => parseDraft(JSON.stringify(badField))).toThrow('Thiết lập render')
  })

  it('rejects unsafe keys and excessive JSON depth before schema use', () => {
    expect(() => parseDraft('{"schemaVersion":1,"draft":{"overrides":{"__proto__":{}}}}')).toThrow(
      'key không an toàn',
    )

    const tooDeep = Array.from({ length: 51 }).reduce<unknown>((value) => [value], 'leaf')
    expect(() => parseDraft(JSON.stringify(tooDeep))).toThrow('lồng quá sâu')

    const nestedKey = { schemaVersion: 1, draft: { copy: [{ constructor: true }] } }
    expect(() => parseDraft(JSON.stringify(nestedKey))).toThrow('key không an toàn')
  })

  it('rejects malformed card details and campaign context', () => {
    const badCard = exportDraft(initialDraft, 'facebook.feed')
    badCard.draft.cardDetails = {
      'asset-1': { title: 'ok', description: 'ok', url: 123 as never },
    }
    expect(() => parseDraft(JSON.stringify(badCard))).toThrow('Nội dung carousel')

    const badContext = exportDraft(initialDraft, 'facebook.feed')
    badContext.draft.context = {
      market: 'Vietnam',
      objective: 'retargeting' as never,
      accountCondition: 'not_connected',
    }
    expect(() => parseDraft(JSON.stringify(badContext))).toThrow('Mục tiêu chiến dịch')
  })

  it('rejects malformed publisher bindings before they can enter review packages', () => {
    const { publisher, secondSlot } = publisherFixture()
    const duplicate = exportDraft({ ...initialDraft, publisher }, publisher.packageId)
    duplicate.draft.publisher = {
      ...publisher,
      bindings: [
        publisher.bindings[0],
        { ...publisher.bindings[0], id: `${publisher.bindings[0].id}:duplicate` },
      ],
    }
    expect(() => parseDraft(JSON.stringify(duplicate))).toThrow('publisher/slot/package')

    const badFocal = exportDraft({ ...initialDraft, publisher }, publisher.packageId)
    badFocal.draft.publisher = {
      ...publisher,
      bindings: [{ ...publisher.bindings[0], slotId: secondSlot.id, focalPoint: { x: 1.5, y: 0.5 } }],
    }
    expect(() => parseDraft(JSON.stringify(badFocal))).toThrow('publisher/slot/package')
  })
})
