import { PROFILE_IDS } from '../catalog'
import type { EditorDraft } from '../features/editorModel'
import { initialDraft, sanitizeRenderSettings } from '../features/editorModel'
import { compositions } from '../features/uiTypes'
import { sanitizePublisher } from '../features/publisherModel'

const VERSION = 1
export const MAX_DRAFT_BYTES = 1024 * 1024
const MAX_JSON_DEPTH = 50
const LIMIT = 10000
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= LIMIT
const strings = (value: unknown, max: number): value is string[] =>
  Array.isArray(value) && value.length <= max && value.every(isString)
const compositionIds = new Set(compositions.map((item) => item.id))
const profileIds = new Set(PROFILE_IDS)

function assertSafeJson(value: unknown, depth = 0): void {
  if (depth > MAX_JSON_DEPTH) throw new Error('Nháp JSON lồng quá sâu.')
  if (Array.isArray(value)) {
    for (const item of value) assertSafeJson(item, depth + 1)
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      throw new Error('Nháp JSON có key không an toàn.')
    assertSafeJson(nested, depth + 1)
  }
}

function exportableDraft(draft: EditorDraft): EditorDraft {
  return {
    ...draft,
    identity: { ...draft.identity },
    copy: {
      ...draft.copy,
      headlines: [...draft.copy.headlines],
      descriptions: [...draft.copy.descriptions],
      paths: [...draft.copy.paths],
    },
    form: { ...draft.form, questions: draft.form.questions?.map((question) => ({ ...question })) },
    cardDetails: draft.cardDetails
      ? Object.fromEntries(Object.entries(draft.cardDetails).map(([id, detail]) => [id, { ...detail }]))
      : undefined,
    context: draft.context ? { ...draft.context } : undefined,
    publisher: draft.publisher ? sanitizePublisher(draft.publisher) : undefined,
    assets: [],
    overrides: Object.fromEntries(
      Object.entries(draft.overrides).map(([profile, values]) => [
        profile,
        Object.fromEntries(
          Object.entries(values).map(([field, override]) => [field, { ...override }]),
        ),
      ]),
    ) as EditorDraft['overrides'],
    renderSettings: draft.renderSettings
      ? Object.fromEntries(
          Object.entries(draft.renderSettings).map(([profile, settings]) => [
            profile,
            { ...settings },
          ]),
        )
      : undefined,
  }
}

export function exportDraft(draft: EditorDraft, profileId: string) {
  return {
    schemaVersion: VERSION,
    exportedAt: new Date().toISOString(),
    profileId,
    notice:
      'JSON chứa nội dung và tham chiếu asset. Không chứa binary; chọn lại media sau khi import.',
    draft: exportableDraft(draft),
    assetReferences: draft.assets.map(({ url: _url, ...asset }) => asset),
  }
}

export function parseDraft(text: string): {
  draft: EditorDraft
  profileId: string
  missingAssets: number
} {
  if (new TextEncoder().encode(text).length > MAX_DRAFT_BYTES)
    throw new Error('Nháp JSON vượt 1 MB.')
  const input: unknown = JSON.parse(text)
  assertSafeJson(input)
  if (!isObject(input) || input.schemaVersion !== VERSION)
    throw new Error('Phiên bản nháp không được hỗ trợ.')
  const d = input.draft
  if (
    !isObject(d) ||
    !isString(d.name) ||
    !isString(d.composition) ||
    !compositionIds.has(d.composition) ||
    !isObject(d.identity) ||
    !isObject(d.copy) ||
    !isObject(d.form)
  )
    throw new Error('Cấu trúc nháp không hợp lệ.')
  const copy = d.copy
  if (
    ![
      d.identity.brandName,
      d.identity.handle,
      copy.primaryText,
      copy.cta,
      copy.destinationUrl,
      d.form.oaName,
      d.form.title,
      d.form.body,
    ].every(isString) ||
    !strings(copy.headlines, 35) ||
    !strings(copy.descriptions, 10) ||
    !strings(copy.paths, 2)
  )
    throw new Error('Field nháp không hợp lệ hoặc quá dài.')
  const overrides: EditorDraft['overrides'] = {}
  let questions: EditorDraft['form']['questions']
  if (d.form.questions !== undefined) {
    if (!Array.isArray(d.form.questions) || d.form.questions.length > 10)
      throw new Error('Câu hỏi Form không hợp lệ hoặc vượt 10 câu hỏi trong phiên.')
    const keys = new Set<string>()
    questions = d.form.questions.map((question) => {
      if (!isObject(question) || typeof question.key !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(question.key) || ['__proto__', 'constructor', 'prototype'].includes(question.key) || keys.has(question.key) || !isString(question.label) || question.label.length > 200 || typeof question.required !== 'boolean')
        throw new Error('Câu hỏi Form không hợp lệ.')
      keys.add(question.key)
      return { key: question.key, label: question.label, required: question.required }
    })
  }
  if (!isObject(d.overrides) || Object.keys(d.overrides).length > 300)
    throw new Error('Copy override không hợp lệ.')
  const fields = ['brandName', 'primaryText', 'headline', 'description', 'cta', 'destinationUrl']
  for (const [profile, values] of Object.entries(d.overrides)) {
    if (!isObject(values)) throw new Error('Copy override không hợp lệ.')
    const safe: EditorDraft['overrides'][string] = {}
    for (const [field, override] of Object.entries(values)) {
      if (
        !fields.includes(field) ||
        !isObject(override) ||
        !['inherit', 'replace', 'clear'].includes(String(override.mode)) ||
        !isString(override.value)
      )
        throw new Error('Copy override không hợp lệ.')
      safe[field as keyof typeof safe] = {
        mode: override.mode as 'inherit' | 'replace' | 'clear',
        value: override.value,
      }
    }
    Object.defineProperty(overrides, profile, { value: safe, enumerable: true, writable: true })
  }
  const renderSettings: EditorDraft['renderSettings'] = {}
  const cardDetails: EditorDraft['cardDetails'] = {}
  if (d.cardDetails !== undefined) {
    if (!isObject(d.cardDetails) || Object.keys(d.cardDetails).length > 80)
      throw new Error('Nội dung carousel không hợp lệ.')
    for (const [id, value] of Object.entries(d.cardDetails)) {
      if (!isString(id) || !isObject(value) || ![value.title, value.description, value.url].every(isString))
        throw new Error('Nội dung carousel không hợp lệ.')
      cardDetails[id] = { title: value.title as string, description: value.description as string, url: value.url as string }
    }
  }
  let context: EditorDraft['context'] = initialDraft.context
  if (d.context !== undefined) {
    if (!isObject(d.context) || !isString(d.context.market) || d.context.market.length > 200)
      throw new Error('Điều kiện chiến dịch không hợp lệ.')
    if (d.context.objective !== undefined && !['awareness', 'traffic', 'leads', 'sales', 'engagement', 'unknown'].includes(String(d.context.objective)))
      throw new Error('Mục tiêu chiến dịch không hợp lệ.')
    for (const key of ['campaignType', 'accountCondition', 'identityMode', 'locale']) {
      if (d.context[key] !== undefined && (!isString(d.context[key]) || (d.context[key] as string).length > 200))
        throw new Error('Điều kiện chiến dịch không hợp lệ.')
    }
    context = {
      market: d.context.market,
      objective: d.context.objective as NonNullable<EditorDraft['context']>['objective'],
      campaignType: d.context.campaignType as string | undefined,
      accountCondition: d.context.accountCondition as string | undefined,
      identityMode: d.context.identityMode as string | undefined,
      locale: d.context.locale as string | undefined,
    }
  }
  if (d.renderSettings !== undefined) {
    if (!isObject(d.renderSettings) || Object.keys(d.renderSettings).length > 300)
      throw new Error('Thiết lập render không hợp lệ.')
    for (const [profile, settings] of Object.entries(d.renderSettings)) {
      if (!profileIds.has(profile)) throw new Error('Thiết lập render không hợp lệ.')
      const safe = sanitizeRenderSettings(settings)
      if (!safe) throw new Error('Thiết lập render không hợp lệ.')
      Object.defineProperty(renderSettings, profile, {
        value: safe,
        enumerable: true,
        writable: true,
      })
    }
  }
  return {
    draft: {
      ...initialDraft,
      name: d.name,
      composition: d.composition,
      identity: { brandName: d.identity.brandName as string, handle: d.identity.handle as string },
      copy: {
        primaryText: copy.primaryText as string,
        headlines: copy.headlines,
        descriptions: copy.descriptions,
        cta: copy.cta as string,
        destinationUrl: copy.destinationUrl as string,
        paths: copy.paths,
      },
      form: {
        oaName: d.form.oaName as string,
        title: d.form.title as string,
        body: d.form.body as string,
        questions,
      },
      assets: [],
      cardDetails,
      context,
      publisher: d.publisher === undefined ? undefined : sanitizePublisher(d.publisher),
      overrides,
      renderSettings,
    },
    profileId: isString(input.profileId) ? input.profileId : '',
    missingAssets: Array.isArray(input.assetReferences) ? input.assetReferences.length : 0,
  }
}
