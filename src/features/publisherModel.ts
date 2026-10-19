import { ADMICRO_PACKAGES, ADMICRO_PUBLISHERS, ADMICRO_SLOTS, ADMICRO_SNAPSHOT, resolveAdmicroEntry, resolveAdmicroSlots } from '../catalog/admicro'
import type { TargetAssetBinding, ValidationResult } from '../domain'
import type { EditorDraft } from './editorModel'

export type PublisherDraft = NonNullable<EditorDraft['publisher']>

export function defaultPublisher(): PublisherDraft {
  const publisherId = ADMICRO_PUBLISHERS[0].id
  const packageId = ADMICRO_PACKAGES.find((item) => item.publisherId === publisherId && item.packageType === 'billboard_premium')?.id
  const slotId = packageId ? undefined : ADMICRO_SLOTS.find((item) => item.publisherId === publisherId)?.id
  return { publisherId, packageId, slotId, bindings: [] }
}

export function publisherTarget(selection: PublisherDraft): string {
  return selection.packageId ?? selection.slotId ?? ''
}

export function publisherDraftForTarget(draft: EditorDraft, targetId: string): PublisherDraft | undefined {
  const packageSpec = ADMICRO_PACKAGES.find((item) => item.id === targetId)
  const slot = ADMICRO_SLOTS.find((item) => item.id === targetId)
  const publisherId = packageSpec?.publisherId ?? slot?.publisherId
  if (!publisherId) return undefined
  return { publisherId, packageId: packageSpec?.id, slotId: slot?.id, bindings: draft.publisher?.bindings ?? [] }
}

export function publisherBinding(selection: PublisherDraft, slotId: string): TargetAssetBinding | undefined {
  return selection.bindings.find((binding) => binding.targetId === publisherTarget(selection) && binding.slotId === slotId)
}

export function updatePublisherBinding(selection: PublisherDraft, slotId: string, change: Partial<TargetAssetBinding>): PublisherDraft {
  const targetId = publisherTarget(selection)
  const current = publisherBinding(selection, slotId) ?? {
    id: `${targetId}:${slotId}`, targetId, slotId, role: 'creative', fit: 'contain',
    focalPoint: { x: 0.5, y: 0.5 }, source: 'slot_override', createdAt: new Date().toISOString(),
  }
  const next: TargetAssetBinding = { ...current, ...change }
  return { ...selection, bindings: [...selection.bindings.filter((binding) => binding.id !== current.id), next] }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function sanitizePublisher(value: unknown): PublisherDraft {
  const invalid = (): never => { throw new Error('Thiết lập publisher/slot/package không hợp lệ.') }
  if (!isObject(value) || typeof value.publisherId !== 'string' || !ADMICRO_PUBLISHERS.some((item) => item.id === value.publisherId) || !Array.isArray(value.bindings) || value.bindings.length > 500) return invalid()
  const selection: PublisherDraft = { publisherId: value.publisherId, bindings: [] }
  if (value.packageId !== undefined && value.slotId !== undefined) return invalid()
  if (value.packageId !== undefined) {
    if (typeof value.packageId !== 'string' || !ADMICRO_PACKAGES.some((item) => item.id === value.packageId && item.publisherId === value.publisherId)) return invalid()
    selection.packageId = value.packageId
  } else if (value.slotId !== undefined) {
    if (typeof value.slotId !== 'string' || !ADMICRO_SLOTS.some((item) => item.id === value.slotId && item.publisherId === value.publisherId)) return invalid()
    selection.slotId = value.slotId
  } else return invalid()
  const ids = new Set<string>()
  const slotTargets = new Set<string>()
  for (const binding of value.bindings) {
    if (!isObject(binding) || typeof binding.id !== 'string' || binding.id.length > 4000 || ids.has(binding.id) || typeof binding.targetId !== 'string' || typeof binding.slotId !== 'string' || binding.role !== 'creative' || !['contain', 'cover'].includes(String(binding.fit)) || !['inherited', 'target_override', 'slot_override'].includes(String(binding.source)) || typeof binding.createdAt !== 'string' || !Number.isFinite(Date.parse(binding.createdAt))) return invalid()
    const targetSlots = ADMICRO_PACKAGES.some((item) => item.id === binding.targetId)
      ? resolveAdmicroSlots({ packageId: binding.targetId })
      : resolveAdmicroSlots({ slotId: binding.targetId })
    if (!targetSlots.some((slot) => slot.id === binding.slotId)) return invalid()
    const key = `${binding.targetId}/${binding.slotId}`
    if (slotTargets.has(key)) return invalid()
    slotTargets.add(key); ids.add(binding.id)
    if (binding.assetId !== undefined && (typeof binding.assetId !== 'string' || binding.assetId.length > 200)) return invalid()
    let focalPoint: { x: number; y: number } | undefined
    if (binding.focalPoint !== undefined) {
      if (!isObject(binding.focalPoint) || ![binding.focalPoint.x, binding.focalPoint.y].every((part) => typeof part === 'number' && Number.isFinite(part) && part >= 0 && part <= 1)) return invalid()
      focalPoint = { x: binding.focalPoint.x as number, y: binding.focalPoint.y as number }
    }
    if (binding.order !== undefined && (!Number.isSafeInteger(binding.order) || (binding.order as number) < 0 || (binding.order as number) > 500)) return invalid()
    selection.bindings.push({ id: binding.id, targetId: binding.targetId, slotId: binding.slotId, role: 'creative', fit: binding.fit as 'cover' | 'contain', focalPoint, assetId: binding.assetId as string | undefined, order: binding.order as number | undefined, source: binding.source as TargetAssetBinding['source'], createdAt: binding.createdAt })
  }
  return selection
}

export function publisherReviewContext(draft: EditorDraft, profileId?: string) {
  const selection = profileId ? publisherDraftForTarget(draft, profileId) : draft.publisher
  if (!selection) return undefined
  return {
    publisherId: selection.publisherId, packageId: selection.packageId, slotId: selection.slotId,
    sourceSnapshotId: ADMICRO_SNAPSHOT.snapshotId, sourceSnapshotDate: ADMICRO_SNAPSHOT.snapshotDate,
    sourceWorkbookSha256: ADMICRO_SNAPSHOT.workbookSha256, effectiveAt: null,
    simulated: true,
    slots: resolveAdmicroSlots(selection).map((slot) => {
      const binding = publisherBinding(selection, slot.id)
      const asset = draft.assets.find((item) => item.id === binding?.assetId)
      const entry = resolveAdmicroEntry(slot.catalogEntryId)
      return { slotId: slot.id, label: slot.label, dimensions: slot.width && slot.height ? { width: slot.width, height: slot.height } : undefined, evidence: slot.evidence, binding, assetHash: asset?.sha256, sourceRowNumber: entry?.rawRowNumber, sourceDimensionText: entry?.dimensionsText }
    }),
  }
}

export function validatePublisher(draft: EditorDraft): ValidationResult[] {
  if (!draft.publisher) return []
  const selection = draft.publisher
  const result = (id: string, fieldPath: string, status: ValidationResult['status'], message: string, actual: unknown, expected: unknown): ValidationResult => ({
    ruleId: id, profileId: publisherTarget(selection), fieldPath, severity: status === 'fail' ? 'fail' : 'warn', status, message, actual, expected,
    source: ['E17'], sourceRefs: ['E17'], evidence: 'conflict', confidence: 'low', createdAt: new Date().toISOString(),
  })
  return [result('admicro.source_dates', 'publisher.source', 'unknown', 'Ngày nguồn Admicro xung đột. Chưa xác minh giá, inventory hoặc vị trí hiện hành.', ADMICRO_SNAPSHOT.sourceDates, 'Đối chiếu với publisher trước khi sử dụng.'),
    ...resolveAdmicroSlots(selection).map((slot) => {
      const binding = publisherBinding(selection, slot.id)
      const asset = draft.assets.find((item) => item.id === binding?.assetId)
      const actual = asset ? `${asset.kind} ${asset.width ?? '?'}x${asset.height ?? '?'}` : 'Chưa gán asset'
      const expected = slot.width && slot.height ? `${slot.width}x${slot.height}` : 'Kích thước cần xác minh'
      const invalidKind = asset && (asset.role !== 'creative' || !slot.allowedCompositions.includes(asset.kind === 'video' ? 'single_video' : 'single_image') || asset.kind === 'audio')
      return result(`admicro.slot.${slot.id}`, `publisher.bindings.${slot.id}`, !asset || invalidKind ? 'fail' : 'unknown',
        !asset ? `${slot.label}: giữ placeholder, cần gán asset riêng.` : invalidKind ? `${slot.label}: loại media không phù hợp với slot trong snapshot.` : `${slot.label}: so sánh với source snapshot; không xác nhận current spec.`, actual, expected)
    }),
  ]
}
