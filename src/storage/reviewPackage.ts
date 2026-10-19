import { CATALOG_VERSION, SOURCE_REGISTRY, requireProfile } from '../catalog'
import type {
  DeviceMockupContext,
  ReviewSnapshot,
  ValidationResult,
  ValidationSummary,
} from '../domain'
import type { EditorDraft } from '../features/editorModel'
import { resolvedCopy } from '../features/editorModel'
import { toCreative, validateDraft } from '../features/catalogBridge'
import { publisherReviewContext } from '../features/publisherModel'
import type { UiProfile } from '../features/uiTypes'
import { APP_SESSION_BUDGET, inspectFile } from '../media/inspect'
import type { InspectedMedia } from '../media/inspect'
import { summarizeValidation } from '../validation'
import { exportDraft, parseDraft } from './draft'

export const REVIEW_PACKAGE_SCHEMA_VERSION = 1
export const REVIEW_PACKAGE_KIND = 'adcraft.review-package'
export const REVIEW_RENDERER_VERSION = 'adcraft-renderer/0.5'
const MANIFEST_FILE = 'manifest.json'
const DRAFT_FILE = 'draft.json'
const PREVIEW_FILE = 'preview.png'
const MAX_PACKAGE_BYTES = APP_SESSION_BUDGET + 32 * 1024 * 1024
const MAX_FILES = 80
const MAX_JSON_BYTES = 1024 * 1024
const SAFE_ROLES: InspectedMedia['role'][] = ['creative', 'logo', 'avatar', 'form_cover', 'audio']

export type ReviewRenderSettings = {
  fit: 'cover' | 'contain'
  safeZone: boolean
  focalX: number
  focalY: number
  videoTimeMs?: number
  cardIndex?: number
  searchCombinationIndex?: number
  formStage?: 'creative' | 'form'
  locale?: string
  appChrome?: boolean
  captionMask?: boolean
  topViewPhase?: 'intro' | 'feed'
  deviceMockup?: DeviceMockupContext
}

export type ReviewAssetManifest = {
  id: string
  name: string
  kind: InspectedMedia['kind']
  role: InspectedMedia['role']
  mime: string
  bytes: number
  sha256: string
  width?: number
  height?: number
  durationMs?: number
  entry?: string
}

export type ReviewManifest = {
  publisher?: ReturnType<typeof publisherReviewContext>
  schemaVersion: typeof REVIEW_PACKAGE_SCHEMA_VERSION
  packageKind: typeof REVIEW_PACKAGE_KIND
  createdAt: string
  catalogVersion: string
  rendererVersion: string
  profileId: string
  profile: {
    id: string
    groupName: string
    title: string
    product: string
    device: string
    evidence: string
    version: string
    checkedAt: string
    sources: Array<{
      id: string
      label: string
      url: string
      checkedAt: string
      evidence: string
    }>
  }
  files: {
    preview: typeof PREVIEW_FILE
    draft: typeof DRAFT_FILE
  }
  assets: ReviewAssetManifest[]
  renderContext: ReviewRenderSettings
  snapshot: ReviewSnapshot & {
    resolvedCopy: ReturnType<typeof resolvedCopy>
    reviewState: 'has_failures' | 'needs_review' | 'has_warnings' | 'ready'
  }
  validation: {
    summary: ValidationSummary
    results: ValidationResult[]
  }
}

type ByteEntries = Record<string, Uint8Array>
type ZipCodec = {
  zipSync: (entries: ByteEntries, options?: { level?: number }) => Uint8Array
  unzipSync: (bytes: Uint8Array) => ByteEntries
  strToU8: (text: string) => Uint8Array
  strFromU8: (bytes: Uint8Array) => string
}

export type ReviewPackageDeps = Partial<ZipCodec> & {
  fetchBlob?: (url: string) => Promise<Blob>
  inspectFile?: typeof inspectFile
  now?: () => Date
  timeoutMs?: number
  signal?: AbortSignal
}

export type CreateReviewPackageInput = {
  draft: EditorDraft
  profile: UiProfile
  settings: ReviewRenderSettings
  preview: Blob
  viewport: { width: number; height: number }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Review package export aborted.', 'AbortError')
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000, message: string): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function loadZipCodec(deps: ReviewPackageDeps = {}): Promise<ZipCodec> {
  if (deps.zipSync && deps.unzipSync && deps.strToU8 && deps.strFromU8) return deps as ZipCodec
  const codec = (await import('fflate')) as ZipCodec
  return {
    zipSync: deps.zipSync ?? codec.zipSync,
    unzipSync: deps.unzipSync ?? codec.unzipSync,
    strToU8: deps.strToU8 ?? codec.strToU8,
    strFromU8: deps.strFromU8 ?? codec.strFromU8,
  }
}

function sanitizeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return cleaned || 'asset.bin'
}

function assetEntry(asset: InspectedMedia, index: number): string | undefined {
  if (!asset.url?.startsWith('blob:')) return undefined
  return `assets/${String(index + 1).padStart(2, '0')}-${asset.id}-${sanitizeFilename(asset.name)}`
}

function reviewState(summary: ValidationSummary): ReviewManifest['snapshot']['reviewState'] {
  if (summary.fail) return 'has_failures'
  if (summary.unknown) return 'needs_review'
  if (summary.warn) return 'has_warnings'
  return 'ready'
}

function assetManifest(asset: InspectedMedia, index: number): ReviewAssetManifest {
  return {
    id: asset.id,
    name: asset.name,
    kind: asset.kind,
    role: asset.role,
    mime: asset.mime,
    bytes: asset.bytes,
    sha256: asset.sha256,
    width: asset.width,
    height: asset.height,
    durationMs: asset.durationMs,
    entry: assetEntry(asset, index),
  }
}

export function buildReviewManifest({
  draft,
  profile,
  settings,
  viewport,
  now = () => new Date(),
}: CreateReviewPackageInput & { now?: () => Date }): ReviewManifest {
  const catalogProfile = requireProfile(profile.id)
  const creative = toCreative(draft, profile.id)
  const results = validateDraft(draft, profile.id)
  const summary = summarizeValidation(results)
  const createdAt = now().toISOString()
  const assets = draft.assets.map(assetManifest)
  const snapshot: ReviewManifest['snapshot'] = {
    creativeId: creative.id,
    creativeVersion: creative.version,
    selectedProfileIds: [profile.id],
    assetHashes: Object.fromEntries(assets.map((asset) => [asset.id, asset.sha256])),
    rendererVersion: REVIEW_RENDERER_VERSION,
    specVersions: { [profile.id]: catalogProfile.specVersion },
    renderSettings: {
      viewport,
      locale: settings.locale ?? creative.locale,
      appChrome: settings.appChrome,
      captionMask: settings.captionMask,
      topViewPhase: settings.topViewPhase,
      videoTimeMs: settings.videoTimeMs,
      cardIndex: settings.cardIndex,
      searchCombinationIndex: settings.searchCombinationIndex,
      safeZone: settings.safeZone,
      deviceMockup: settings.deviceMockup,
      formStage: settings.formStage,
    },
    validationSummary: summary,
    createdAt,
    resolvedCopy: resolvedCopy(draft, profile.id),
    reviewState: reviewState(summary),
  }

  return {
    schemaVersion: REVIEW_PACKAGE_SCHEMA_VERSION,
    packageKind: REVIEW_PACKAGE_KIND,
    createdAt,
    catalogVersion: CATALOG_VERSION,
    rendererVersion: REVIEW_RENDERER_VERSION,
    profileId: profile.id,
    publisher:
      catalogProfile.groupId === 'admicro' ? publisherReviewContext(draft, profile.id) : undefined,
    profile: {
      id: profile.id,
      groupName: profile.groupName,
      title: profile.title,
      product: profile.product,
      device: profile.device,
      evidence: profile.evidence,
      version: catalogProfile.specVersion,
      checkedAt: catalogProfile.checkedAt,
      sources: catalogProfile.sourceRefs.map((id) => {
        const source = SOURCE_REGISTRY[id]
        return {
          id,
          label: source.label,
          url: source.url,
          checkedAt: source.checkedAt,
          evidence: source.evidence,
        }
      }),
    },
    files: {
      preview: PREVIEW_FILE,
      draft: DRAFT_FILE,
    },
    assets,
    renderContext: {
      fit: settings.fit,
      safeZone: settings.safeZone,
      focalX: settings.focalX,
      focalY: settings.focalY,
      videoTimeMs: settings.videoTimeMs,
      cardIndex: settings.cardIndex,
      searchCombinationIndex: settings.searchCombinationIndex,
      formStage: settings.formStage,
      locale: settings.locale,
      appChrome: settings.appChrome,
      captionMask: settings.captionMask,
      topViewPhase: settings.topViewPhase,
      deviceMockup: settings.deviceMockup,
    },
    snapshot,
    validation: { summary, results },
  }
}

async function defaultFetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Không đọc được asset local: ${response.status}.`)
  return response.blob()
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes))
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('')
}

async function collectAssetEntries(
  assets: ReviewAssetManifest[],
  draftAssets: InspectedMedia[],
  deps: ReviewPackageDeps,
): Promise<ByteEntries> {
  const entries: ByteEntries = {}
  const fetchBlob = deps.fetchBlob ?? defaultFetchBlob
  for (const asset of assets) {
    assertNotAborted(deps.signal)
    if (!asset.entry) continue
    const source = draftAssets.find((item) => item.id === asset.id)
    if (!source?.url?.startsWith('blob:')) continue
    const blob = await withTimeout(
      fetchBlob(source.url),
      deps.timeoutMs,
      `Hết thời gian đọc asset ${asset.name}.`,
    )
    const bytes = new Uint8Array(await blob.arrayBuffer())
    if (bytes.byteLength !== asset.bytes)
      throw new Error(`Asset ${asset.name} thay đổi kích thước khi đóng gói.`)
    if ((await sha256Hex(bytes)) !== asset.sha256)
      throw new Error(`Asset ${asset.name} thay đổi SHA-256 khi đóng gói.`)
    entries[asset.entry] = bytes
  }
  return entries
}

export async function createReviewPackage(
  input: CreateReviewPackageInput,
  deps: ReviewPackageDeps = {},
): Promise<{ blob: Blob; filename: string; manifest: ReviewManifest }> {
  assertNotAborted(deps.signal)
  const codec = await loadZipCodec(deps)
  const manifest = buildReviewManifest({ ...input, now: deps.now })
  const entries: ByteEntries = {
    [MANIFEST_FILE]: codec.strToU8(JSON.stringify(manifest, null, 2)),
    [DRAFT_FILE]: codec.strToU8(
      JSON.stringify(exportDraft(input.draft, input.profile.id), null, 2),
    ),
    [PREVIEW_FILE]: new Uint8Array(await input.preview.arrayBuffer()),
    ...(await collectAssetEntries(manifest.assets, input.draft.assets, deps)),
  }
  const bytes = codec.zipSync(entries, { level: 6 })
  if (bytes.byteLength > MAX_PACKAGE_BYTES) throw new Error('Gói review vượt giới hạn phiên.')
  return {
    blob: new Blob([toArrayBuffer(bytes)], { type: 'application/zip' }),
    filename: `adcraft-review-${input.profile.id}-${Date.now()}.zip`,
    manifest,
  }
}

function assertSafePath(path: string) {
  if (
    !path ||
    path.startsWith('/') ||
    path.startsWith('\\') ||
    path.includes('..') ||
    path.includes('\\') ||
    /[\u0000-\u001f]/.test(path)
  )
    throw new Error('Review package có đường dẫn file không an toàn.')
}

function assertKnownPath(path: string) {
  assertSafePath(path)
  if (
    path !== MANIFEST_FILE &&
    path !== DRAFT_FILE &&
    path !== PREVIEW_FILE &&
    !path.startsWith('assets/')
  )
    throw new Error('Review package có file không được hỗ trợ.')
}

function assertPngSignature(bytes: Uint8Array) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.length < signature.length || signature.some((value, index) => bytes[index] !== value))
    throw new Error('Review package thiếu preview PNG hợp lệ.')
}

function assertSafeObject(value: unknown, path = 'root', depth = 0) {
  if (depth > 100) throw new Error('Review package JSON lồng quá sâu.')
  if (Array.isArray(value)) {
    for (const item of value) assertSafeObject(item, path, depth + 1)
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype')
      throw new Error(`Review package có key JSON không an toàn tại ${path}.`)
    assertSafeObject(nested, `${path}.${key}`, depth + 1)
  }
}

function readU16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  )
}

function preflightZip(bytes: Uint8Array) {
  const minEnd = Math.max(0, bytes.length - (0xffff + 22))
  let eocd = -1
  for (let index = bytes.length - 22; index >= minEnd; index -= 1) {
    if (readU32(bytes, index) === 0x06054b50) {
      eocd = index
      break
    }
  }
  if (eocd < 0) throw new Error('Review package ZIP không hợp lệ.')
  const count = readU16(bytes, eocd + 10)
  const directorySize = readU32(bytes, eocd + 12)
  const directoryOffset = readU32(bytes, eocd + 16)
  if (
    count > MAX_FILES ||
    directoryOffset === 0xffffffff ||
    directorySize === 0xffffffff ||
    directoryOffset + directorySize > bytes.length
  )
    throw new Error('Review package ZIP không hợp lệ hoặc quá lớn.')

  let offset = directoryOffset
  let unpackedBytes = 0
  const names = new Set<string>()
  const decoder = new TextDecoder()
  for (let index = 0; index < count; index += 1) {
    if (readU32(bytes, offset) !== 0x02014b50)
      throw new Error('Review package ZIP central directory không hợp lệ.')
    const compressedSize = readU32(bytes, offset + 20)
    const uncompressedSize = readU32(bytes, offset + 24)
    const nameLength = readU16(bytes, offset + 28)
    const extraLength = readU16(bytes, offset + 30)
    const commentLength = readU16(bytes, offset + 32)
    const localOffset = readU32(bytes, offset + 42)
    if (
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      localOffset === 0xffffffff
    )
      throw new Error('Review package ZIP64 chưa được hỗ trợ.')
    const nameStart = offset + 46
    const nameEnd = nameStart + nameLength
    if (nameEnd > bytes.length) throw new Error('Review package ZIP không hợp lệ.')
    const name = decoder.decode(bytes.slice(nameStart, nameEnd))
    assertKnownPath(name)
    if (names.has(name)) throw new Error('Review package có file trùng tên.')
    names.add(name)
    unpackedBytes += uncompressedSize
    if (unpackedBytes > MAX_PACKAGE_BYTES || compressedSize > MAX_PACKAGE_BYTES)
      throw new Error('Review package giải nén vượt giới hạn phiên.')
    offset = nameEnd + extraLength + commentLength
  }
  if (!names.has(MANIFEST_FILE) || !names.has(DRAFT_FILE))
    throw new Error('Review package thiếu manifest hoặc draft.')
}

function parseJson<T>(text: string): T {
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES)
    throw new Error('Review package có JSON vượt giới hạn.')
  const parsed = JSON.parse(text) as T
  assertSafeObject(parsed)
  return parsed
}

function assertManifest(value: unknown): asserts value is ReviewManifest {
  if (!value || typeof value !== 'object') throw new Error('Review manifest không hợp lệ.')
  const manifest = value as ReviewManifest
  if (
    manifest.schemaVersion !== REVIEW_PACKAGE_SCHEMA_VERSION ||
    manifest.packageKind !== REVIEW_PACKAGE_KIND ||
    typeof manifest.profileId !== 'string' ||
    !Array.isArray(manifest.assets) ||
    !manifest.files ||
    manifest.files.preview !== PREVIEW_FILE ||
    manifest.files.draft !== DRAFT_FILE
  )
    throw new Error('Review manifest không hợp lệ.')
  requireProfile(manifest.profileId)
  const assetIds = new Set<string>()
  const assetEntries = new Set<string>()
  let declaredAssetBytes = 0
  for (const asset of manifest.assets) {
    if (
      typeof asset.id !== 'string' ||
      typeof asset.name !== 'string' ||
      typeof asset.sha256 !== 'string' ||
      !Number.isSafeInteger(asset.bytes) ||
      asset.bytes < 0 ||
      asset.bytes > APP_SESSION_BUDGET ||
      !/^[a-f0-9]{64}$/i.test(asset.sha256) ||
      !SAFE_ROLES.includes(asset.role) ||
      !['image', 'video', 'audio'].includes(asset.kind)
    )
      throw new Error('Review manifest có asset không hợp lệ.')
    if (
      (asset.role === 'audio' && asset.kind !== 'audio') ||
      (asset.role !== 'audio' && asset.kind === 'audio') ||
      (['logo', 'avatar', 'form_cover'].includes(asset.role) && asset.kind !== 'image')
    )
      throw new Error('Review manifest có role asset không khớp loại media.')
    if (assetIds.has(asset.id)) throw new Error('Review manifest bị trùng asset id.')
    assetIds.add(asset.id)
    declaredAssetBytes += asset.bytes
    if (declaredAssetBytes > APP_SESSION_BUDGET)
      throw new Error('Review package vượt ngân sách media của phiên.')
    if (asset.entry) {
      assertSafePath(asset.entry)
      if (!asset.entry.startsWith('assets/'))
        throw new Error('Review manifest có asset path không hợp lệ.')
      if (assetEntries.has(asset.entry)) throw new Error('Review manifest bị trùng asset path.')
      assetEntries.add(asset.entry)
    }
  }
}

function blobFromEntry(bytes: Uint8Array, type: string): Blob {
  return new Blob([toArrayBuffer(bytes)], { type })
}

async function restoreAsset(
  manifestAsset: ReviewAssetManifest,
  bytes: Uint8Array,
  inspect: typeof inspectFile,
): Promise<InspectedMedia> {
  const inspected = await inspect(
    new File([blobFromEntry(bytes, manifestAsset.mime)], manifestAsset.name, {
      type: manifestAsset.mime,
    }),
  )
  const revokeAndThrow = (message: string): never => {
    URL.revokeObjectURL(inspected.url)
    throw new Error(message)
  }
  if (inspected.sha256 !== manifestAsset.sha256)
    revokeAndThrow(`Asset ${manifestAsset.name} không khớp SHA-256 trong manifest.`)
  if (
    (manifestAsset.role === 'audio' && inspected.kind !== 'audio') ||
    (manifestAsset.role !== 'audio' && inspected.kind === 'audio') ||
    (['logo', 'avatar', 'form_cover'].includes(manifestAsset.role) && inspected.kind !== 'image')
  )
    revokeAndThrow(`Asset ${manifestAsset.name} có role không khớp loại media.`)
  if (
    inspected.kind !== manifestAsset.kind ||
    inspected.mime !== manifestAsset.mime ||
    inspected.bytes !== manifestAsset.bytes
  )
    revokeAndThrow(`Asset ${manifestAsset.name} không khớp metadata sau khi đọc lại.`)
  return {
    ...inspected,
    id: manifestAsset.id,
    name: manifestAsset.name,
    role: manifestAsset.role,
  }
}

export async function parseReviewPackage(
  file: File,
  deps: ReviewPackageDeps = {},
): Promise<{ draft: EditorDraft; profileId: string; missingAssets: number }> {
  assertNotAborted(deps.signal)
  const zipTypes = new Set(['', 'application/zip', 'application/x-zip-compressed'])
  if (!file.name.toLowerCase().endsWith('.zip') || !zipTypes.has(file.type))
    throw new Error('Review package phải là file ZIP hợp lệ.')
  if (file.size > MAX_PACKAGE_BYTES) throw new Error('Review package vượt giới hạn phiên.')
  const codec = await loadZipCodec(deps)
  const zipBytes = new Uint8Array(await file.arrayBuffer())
  preflightZip(zipBytes)
  let entries: ByteEntries
  try {
    entries = codec.unzipSync(zipBytes)
  } catch {
    throw new Error('Review package ZIP không hợp lệ.')
  }
  const paths = Object.keys(entries)
  if (paths.length > MAX_FILES) throw new Error('Review package có quá nhiều file.')
  const unpackedBytes = paths.reduce((total, path) => total + entries[path].byteLength, 0)
  if (unpackedBytes > MAX_PACKAGE_BYTES)
    throw new Error('Review package giải nén vượt giới hạn phiên.')
  for (const path of paths) assertKnownPath(path)
  if (!entries[MANIFEST_FILE] || !entries[DRAFT_FILE] || !entries[PREVIEW_FILE])
    throw new Error('Review package thiếu manifest, draft hoặc preview.')
  assertPngSignature(entries[PREVIEW_FILE])

  const manifest = parseJson<ReviewManifest>(codec.strFromU8(entries[MANIFEST_FILE]))
  assertManifest(manifest)
  for (const asset of manifest.assets) {
    if (asset.entry && !entries[asset.entry]) continue
    if (asset.entry && entries[asset.entry].byteLength !== asset.bytes)
      throw new Error(`Asset ${asset.name} không khớp kích thước trong manifest.`)
  }
  parseJson(codec.strFromU8(entries[DRAFT_FILE]))
  const parsed = parseDraft(codec.strFromU8(entries[DRAFT_FILE]))
  const inspect = deps.inspectFile ?? inspectFile
  const restored: InspectedMedia[] = []
  let missingAssets = 0

  try {
    for (const asset of manifest.assets) {
      assertNotAborted(deps.signal)
      if (!asset.entry || !entries[asset.entry]) {
        missingAssets += 1
        continue
      }
      restored.push(await restoreAsset(asset, entries[asset.entry], inspect))
    }
  } catch (error) {
    for (const asset of restored) URL.revokeObjectURL(asset.url)
    throw error
  }

  return {
    draft: { ...parsed.draft, assets: restored },
    profileId: manifest.profileId,
    missingAssets,
  }
}
