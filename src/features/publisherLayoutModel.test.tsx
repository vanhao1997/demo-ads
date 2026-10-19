import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ADMICRO_PACKAGES, ADMICRO_SLOTS, resolveAdmicroEntry, resolveAdmicroSlots } from '../catalog/admicro'
import type { SlotSpec } from '../domain'
import type { InspectedMedia } from '../media/inspect'
import { initialDraft } from './editorModel'
import { PublisherPreview } from './PublisherStudio'
import { publisherNewsContext, publisherSlotLayout } from './publisherLayoutModel'
import { updatePublisherBinding } from './publisherModel'

const fixture = (label: string, device: SlotSpec['device'] = 'desktop'): SlotSpec => ({ ...ADMICRO_SLOTS[0], label, device })

const asset = (id: string): InspectedMedia => ({
  id, name: `${id}.png`, kind: 'image', mime: 'image/png', bytes: 128,
  width: 1920, height: 1200, sha256: id.padEnd(64, '0'), url: `blob:${id}`,
  metadataStatus: 'ready', role: 'creative',
})

describe('Admicro publisher placement context', () => {
  it('uses format references for documented placement families without changing slot dimensions or evidence', () => {
    const source = fixture('Inpage Fullscreen Mobile', 'mobile')
    const before = structuredClone(source)
    const layout = publisherSlotLayout(source)

    expect(layout).toMatchObject({ placement: 'in_article', basis: 'format_reference', referenceUrl: 'https://admatic.admicro.vn/formats' })
    expect(layout.slot).toBe(source)
    expect(source).toEqual(before)
    expect(publisherSlotLayout(fixture('Top Banner Mobile', 'mobile')).placement).toBe('after_navigation')
    expect(publisherSlotLayout(fixture('Kingsize Article Banner')).placement).toBe('article_foot')
    expect(publisherSlotLayout(fixture('Half Page')).placement).toBe('right_column')
    expect(publisherSlotLayout(fixture('CPD TVC')).placement).toBe('in_video')
  })

  it('keeps unresolved package components unresolved and labels inferred placements honestly', () => {
    expect(publisherSlotLayout(fixture('Full Homepage Plus (source composition pending)'))).toMatchObject({ placement: 'unresolved', basis: 'estimated', referenceUrl: undefined })
    expect(publisherSlotLayout(fixture('Dimension 1'))).toMatchObject({ placement: 'unresolved', basis: 'estimated' })
    expect(publisherSlotLayout(fixture('Unknown slot'))).toMatchObject({ placement: 'unresolved', basis: 'estimated' })
    expect(publisherSlotLayout(fixture('High Banner A'))).toMatchObject({ placement: 'right_column', basis: 'estimated' })
    expect(publisherSlotLayout(fixture('Medium Rectangle', 'mobile')).placement).toBe('in_article')
    expect(publisherSlotLayout(fixture('Mobile Footer', 'mobile')).placement).toBe('page_foot')
  })

  it('renders every multi-slot package component once in its mapped region and preserves per-slot assets and crop', () => {
    const packageSpec = ADMICRO_PACKAGES.find((item) => item.publisherId === 'cafef' && item.packageType === 'billboard_premium')!
    const slots = resolveAdmicroSlots({ packageId: packageSpec.id })
    const top = slots.find((slot) => slot.label === 'Billboard')!
    const background = slots.find((slot) => slot.label === 'Background')!
    const right = slots.find((slot) => slot.label === 'High Banner A')!
    let selection = { publisherId: packageSpec.publisherId, packageId: packageSpec.id, bindings: [] as NonNullable<typeof initialDraft.publisher>['bindings'] }
    selection = updatePublisherBinding(selection, top.id, { assetId: 'top-creative', fit: 'contain' }) as typeof selection
    selection = updatePublisherBinding(selection, background.id, { assetId: 'background-creative', fit: 'cover', focalPoint: { x: .22, y: .77 } }) as typeof selection
    selection = updatePublisherBinding(selection, right.id, { assetId: 'right-creative', fit: 'cover', focalPoint: { x: .65, y: .3 } }) as typeof selection
    const draft = { ...initialDraft, publisher: selection, assets: [asset('top-creative'), asset('background-creative'), asset('right-creative')] }
    const before = structuredClone(draft)
    const html = renderToStaticMarkup(<PublisherPreview draft={draft} targetId={packageSpec.id} />)

    expect(html.match(/data-slot-id=/g)).toHaveLength(slots.length)
    for (const slot of slots) expect(html.split(`data-slot-id="${slot.id}"`)).toHaveLength(2)
    expect(html).toContain(`data-slot-id="${top.id}" data-slot-placement="page_top"`)
    expect(html).toContain(`data-slot-id="${background.id}" data-slot-placement="page_background"`)
    expect(html).toContain(`data-slot-id="${right.id}" data-slot-placement="right_column"`)
    expect(html).toContain('src="blob:top-creative"')
    expect(html).toContain('src="blob:background-creative"')
    expect(html).toContain('object-position:22% 77%')
    expect(html).toContain('object-position:65% 30%')
    expect(html).toContain('Nguồn xung đột')
    expect(html).toContain('Ước lượng / chưa đối chiếu demo')
    expect(html).toContain('Theo mô tả format; bố cục trang ước lượng')
    expect(html).toContain('href="https://admatic.admicro.vn/formats"')
    const demo = resolveAdmicroEntry(top.catalogEntryId)?.demoUrl
    expect(demo).toBeTruthy()
    expect(html).toContain(`href="${demo}"`)
    expect(draft).toEqual(before)
    expect(html).not.toMatch(/<(?:iframe|script)\b/)
    expect(html).not.toMatch(/<img[^>]*src="https?:/)
  })

  it('keeps pending Full Homepage layouts visible without inventing package inventory', () => {
    const packageSpec = ADMICRO_PACKAGES.find((item) => item.packageType === 'homepage_plus')!
    const html = renderToStaticMarkup(<PublisherPreview draft={initialDraft} targetId={packageSpec.id} />)
    expect(html).toContain('data-slot-placement="unresolved"')
    expect(html).toContain('Slot chưa xác định bố cục')
    expect(html.match(/data-slot-id=/g)).toHaveLength(resolveAdmicroSlots({ packageId: packageSpec.id }).length)
  })

  it('uses distinct newsroom context by publisher with no external editorial image dependency', () => {
    const cafef = publisherNewsContext('cafef', 'CafeF')
    const kenh14 = publisherNewsContext('kenh14', 'Kenh14')
    const genk = publisherNewsContext('genk', 'GenK')
    expect(cafef.accent).not.toBe(kenh14.accent)
    expect(cafef.headline).not.toBe(genk.headline)
    expect(kenh14.navigation).toContain('Đời sống')
    expect(genk.scene).toBe('technology')
  })
})
