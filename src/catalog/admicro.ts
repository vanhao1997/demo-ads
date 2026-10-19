import rawSnapshot from './data/admicro-cpd-2026-10-12.json'
import type {
  AssetAssignmentPolicy,
  CampaignContext,
  CompositionKind,
  Confidence,
  DeviceClass,
  EvidenceLevel,
  PackageSpec,
  PackageType,
  Profile,
  ProfileStatus,
  SlotSpec,
  SourceRefId,
} from '../domain'
import { resolveSources } from './sources'

type CellValue = string | number | boolean | null

export type AdmicroCatalogStatus = 'active_reference' | 'needs_review' | 'deprecated'

export interface AdmicroRawRow {
  rowNumber: number
  cells: Record<string, CellValue>
  resolvedCells: Record<string, CellValue>
  mergedFrom: Record<string, string>
  hyperlinks: Record<string, string>
  formulas: Record<string, string>
}

export interface AdmicroPublisher {
  id: string
  label: string
  sourceLabels: string[]
}

export interface AdmicroCatalogEntry {
  id: string
  publisherId: string
  publisherLabel: string
  pageOrSection?: string
  slotLabel: string
  packageId?: string
  device?: DeviceClass
  width?: number
  height?: number
  ratio?: { w: number; h: number }
  dimensionsText?: string
  demoUrl?: string
  rawRowNumber: number
  rawCells: Record<string, CellValue>
  resolvedCells: Record<string, CellValue>
  mergedFrom: Record<string, string>
  hyperlinks: Record<string, string>
  formulas: Record<string, string>
  sourceRefIds: SourceRefId[]
  sourceSnapshotDate: string
  effectiveAt: string | null
  evidence: EvidenceLevel
  status: AdmicroCatalogStatus
  conflictNotes: string[]
}

export interface AdmicroSnapshot {
  snapshotId: string
  sourceRefId: SourceRefId
  snapshotDate: string
  effectiveAt: string | null
  sourceUrl: string
  workbookSha256: string
  sheetName: string
  rowCount: number
  columnCount: number
  mergedRanges: string[]
  sourceDates: string[]
  rows: AdmicroRawRow[]
}

const SNAPSHOT = rawSnapshot as unknown as AdmicroSnapshot

export const ADMICRO_SNAPSHOT = SNAPSHOT
export const ADMICRO_CATALOG_VERSION = SNAPSHOT.snapshotId
export const ADMICRO_RAW_ROWS = SNAPSHOT.rows

const SOURCE_REFS: SourceRefId[] = ['E17']
const DEFAULT_CONTEXT: CampaignContext = {
  market: 'VN',
  locale: 'vi-VN',
  effectiveAt: null,
}

const publisherDefinitions: Array<{ id: string; label: string; aliases: string[] }> = [
  { id: 'cafef', label: 'CafeF', aliases: ['cafef.vn', 'cafef'] },
  { id: 'cafebiz', label: 'CafeBiz', aliases: ['cafebiz.vn', 'cafebiz'] },
  { id: 'vtv', label: 'VTV', aliases: ['vtv.vn', 'vtv'] },
  { id: 'kenh14', label: 'Kenh14', aliases: ['kenh14.vn', 'kenh14'] },
  { id: 'soha', label: 'Soha', aliases: ['soha.vn', 'soha'] },
  { id: 'afamily', label: 'aFamily', aliases: ['afamily.vn', 'afamily'] },
  {
    id: 'phu-nu-viet-nam',
    label: 'Phu Nu Viet Nam',
    aliases: ['phunuvietnam.vn', 'phunuvietnam'],
  },
  {
    id: 'giadinh',
    label: 'Gia Dinh & Suc khoe doi song',
    aliases: ['giadinh.suckhoedoisong.vn', 'giadinh.suckhoedoisong'],
  },
  { id: 'gamek', label: 'GameK', aliases: ['gamek.vn', 'gamek'] },
  { id: 'genk', label: 'GenK', aliases: ['genk.vn', 'genk'] },
  { id: 'autopro', label: 'AutoPro', aliases: ['autopro.com.vn', 'autopro'] },
  { id: 'thanh-nien', label: 'Thanh Nien', aliases: ['thanhnien.vn', 'thanhnien'] },
  { id: 'tuoi-tre', label: 'Tuoi Tre', aliases: ['tuoitre.vn', 'tuoitre'] },
  { id: 'vneconomy', label: 'VnEconomy', aliases: ['vneconomy.vn', 'vneconomy'] },
]

export const ADMICRO_PUBLISHERS: AdmicroPublisher[] = publisherDefinitions.map(
  ({ id, label, aliases }) => ({
    id,
    label,
    sourceLabels: aliases,
  }),
)

const packageDefinitions: Array<{
  type: Exclude<PackageType, 'other'>
  label: string
  aliases: string[]
}> = [
  {
    type: 'homepage_plus',
    label: 'Full Homepage Plus',
    aliases: ['full homepage plus'],
  },
  {
    type: 'homepage_premium',
    label: 'Full Homepage Premium',
    aliases: ['full homepage premium'],
  },
  {
    type: 'billboard_plus',
    label: 'Billboard Plus',
    aliases: ['billboard plus'],
  },
  {
    type: 'billboard_premium',
    label: 'Billboard Premium',
    aliases: ['billboard premium'],
  },
]

function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slug(value: unknown): string {
  return normalize(value).replace(/\s+/g, '-')
}

function shortHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.replace(/\u00a0/g, ' ').trim()
  return trimmed || undefined
}

function pickColumns<T>(values: Record<string, T>, columns: string): Record<string, T> {
  return Object.fromEntries(
    Object.entries(values).filter(([column]) => columns.includes(column)),
  ) as Record<string, T>
}

function cell(row: AdmicroRawRow, column: string, resolved = false): CellValue | undefined {
  const values = resolved ? row.resolvedCells : row.cells
  return values[column] as CellValue | undefined
}

function publisherFor(value: unknown): (typeof publisherDefinitions)[number] | undefined {
  const candidate = normalize(value).replace(/\s+/g, '')
  return publisherDefinitions.find((publisher) =>
    publisher.aliases.some((alias) => candidate.includes(normalize(alias).replace(/\s+/g, ''))),
  )
}

function packageFor(value: unknown): (typeof packageDefinitions)[number] | undefined {
  const candidate = normalize(value)
  return packageDefinitions.find((definition) =>
    definition.aliases.some((alias) => candidate === normalize(alias)),
  )
}

function deviceFor(value: unknown): DeviceClass | undefined {
  const candidate = normalize(value)
  if (!candidate) return undefined
  if (candidate.includes('mobile')) return 'mobile'
  if (candidate === 'pc' || candidate.includes('desktop')) return 'desktop'
  if (candidate.includes('all') || candidate.includes('/')) return 'all'
  return undefined
}

function httpUrl(value: unknown): string | undefined {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
    ? value.trim()
    : undefined
}

function firstUrl(row: AdmicroRawRow): string | undefined {
  return httpUrl(row.hyperlinks?.F) ?? httpUrl(cell(row, 'F'))
}

function parseDimensions(value: unknown): Array<{ w: number; h: number }> {
  const matches = String(value ?? '').matchAll(/(\d{2,5})\s*[x×]\s*(\d{2,5})/gi)
  const seen = new Set<string>()
  const dimensions: Array<{ w: number; h: number }> = []
  for (const match of matches) {
    const w = Number(match[1])
    const h = Number(match[2])
    const key = `${w}x${h}`
    if (!seen.has(key)) {
      seen.add(key)
      dimensions.push({ w, h })
    }
  }
  return dimensions
}

function parseRatios(value: unknown): Array<{ w: number; h: number }> {
  const matches = String(value ?? '').matchAll(/(\d{1,2})\s*:\s*(\d{1,2})/g)
  const seen = new Set<string>()
  const ratios: Array<{ w: number; h: number }> = []
  for (const match of matches) {
    const w = Number(match[1])
    const h = Number(match[2])
    const key = `${w}:${h}`
    if (!seen.has(key)) {
      seen.add(key)
      ratios.push({ w, h })
    }
  }
  return ratios
}

function parseDimensionLabels(value: unknown): Array<{ label: string; width?: number; height?: number }> {
  const source = String(value ?? '')
  const result: Array<{ label: string; width?: number; height?: number }> = []
  for (const line of source.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
    const pairs = parseDimensions(line)
    if (!pairs.length) {
      const heightMatch = line.match(/^(.*?)\s+(?:cao|high)\s+(\d{2,5})\s*px/i)
      if (heightMatch) result.push({ label: heightMatch[1].trim(), height: Number(heightMatch[2]) })
      continue
    }
    const colon = line.indexOf(':')
    const label = colon > 0 ? line.slice(0, colon).trim() : undefined
    if (label && pairs.length === 1) {
      result.push({ label, width: pairs[0].w, height: pairs[0].h })
    } else {
      pairs.forEach((pair, index) =>
        result.push({
          label: label ? `${label} ${index + 1}` : `Dimension ${index + 1}`,
          width: pair.w,
          height: pair.h,
        }),
      )
    }
  }
  return result
}

function isSlotHeader(value: unknown): boolean {
  const candidate = normalize(value)
  return (
    candidate === 'ten vi tri ads position' ||
    candidate === 'ten vi tri' ||
    candidate === 'ads position' ||
    candidate === 'website' ||
    publisherFor(value) !== undefined
  )
}

function isSourceNote(value: unknown): boolean {
  const candidate = normalize(value)
  return (
    candidate.startsWith('bao gia tren') ||
    candidate.startsWith('vui long dat booking') ||
    candidate.startsWith('danh muc o tren') ||
    candidate.startsWith('(*) dinh nghia')
  )
}

function isTvc(entry: Pick<AdmicroCatalogEntry, 'slotLabel' | 'dimensionsText'>): boolean {
  return normalize(entry.slotLabel).includes('tvc') || /video|ti le/i.test(entry.dimensionsText ?? '')
}

function packageIdFor(publisherId: string, packageType: PackageType): string {
  return `admicro.package.${publisherId}.${packageType}`
}

function primarySlotId(entry: AdmicroCatalogEntry): string {
  return `admicro.slot.${entry.id}`
}

const namedRows = ADMICRO_RAW_ROWS.filter((row) => {
  const publisher = publisherFor(cell(row, 'B', true))
  const slotLabel = text(cell(row, 'C'))
  return Boolean(publisher && slotLabel && !isSlotHeader(slotLabel) && !isSourceNote(slotLabel))
})

const duplicateOrdinals = new Map<string, number>()

function entryFromRow(row: AdmicroRawRow): AdmicroCatalogEntry {
  const publisher = publisherFor(cell(row, 'B', true))
  if (!publisher) throw new Error(`Unknown Admicro publisher at row ${row.rowNumber}`)
  const slotLabel = text(cell(row, 'C'))
  if (!slotLabel) throw new Error(`Missing Admicro slot label at row ${row.rowNumber}`)

  const dimensionsText = text(cell(row, 'D', true))
  const dimensions = parseDimensions(dimensionsText)
  const ratios = parseRatios(dimensionsText)
  const device = deviceFor(cell(row, 'E', true))
  const packageDefinition = packageFor(slotLabel)
  const packageId = packageDefinition
    ? packageIdFor(publisher.id, packageDefinition.type)
    : undefined
  const key = [
    publisher.id,
    normalize(slotLabel),
    normalize(dimensionsText),
    device ?? 'unknown',
    firstUrl(row) ?? '',
  ].join('|')
  const ordinal = (duplicateOrdinals.get(key) ?? 0) + 1
  duplicateOrdinals.set(key, ordinal)
  const id = [
    'admicro.entry',
    SNAPSHOT.snapshotId,
    publisher.id,
    slug(slotLabel),
    slug(dimensionsText || 'unspecified'),
    device ?? 'all',
    shortHash(key),
    ordinal,
  ].join('.')
  const sourceConflict = Boolean(packageDefinition || dimensions.length > 1 || ratios.length > 1)
  const conflictNotes = [
    'Source dates conflict across landing page, PDF pages and spreadsheet footnote; no current pricing or availability claim.',
  ]
  if (sourceConflict) {
    conflictNotes.push(
      packageDefinition
        ? 'Package geometry or composition requires reviewer confirmation.'
        : 'Multiple source dimensions or ratios are retained; do not auto-select a single geometry.',
    )
  }
  const entry: AdmicroCatalogEntry = {
    id,
    publisherId: publisher.id,
    publisherLabel: publisher.label,
    pageOrSection: 'publisher_homepage',
    slotLabel,
    packageId,
    device,
    width: dimensions.length === 1 ? dimensions[0].w : undefined,
    height: dimensions.length === 1 ? dimensions[0].h : undefined,
    ratio: ratios.length === 1 ? ratios[0] : undefined,
    dimensionsText,
    demoUrl: firstUrl(row),
    rawRowNumber: row.rowNumber,
    rawCells: pickColumns(row.cells, 'ABCDEFGHIJK'),
    resolvedCells: pickColumns(row.resolvedCells, 'ABCDEFGHIJK'),
    mergedFrom: pickColumns(row.mergedFrom, 'ABCDEFGHIJK'),
    hyperlinks: pickColumns(row.hyperlinks, 'ABCDEFGHIJK'),
    formulas: pickColumns(row.formulas, 'ABCDEFGHIJK'),
    sourceRefIds: SOURCE_REFS,
    sourceSnapshotDate: SNAPSHOT.snapshotDate,
    effectiveAt: null,
    evidence: sourceConflict ? 'conflict' : 'primary_documented',
    status: sourceConflict ? 'needs_review' : 'active_reference',
    conflictNotes,
  }
  return entry
}

export const ADMICRO_ENTRIES: AdmicroCatalogEntry[] = namedRows.map(entryFromRow)

const entriesByPackage = new Map<string, AdmicroCatalogEntry[]>()
for (const entry of ADMICRO_ENTRIES) {
  if (!entry.packageId) continue
  const existing = entriesByPackage.get(entry.packageId) ?? []
  existing.push(entry)
  entriesByPackage.set(entry.packageId, existing)
}

function baseSlot(entry: AdmicroCatalogEntry): SlotSpec {
  const composition: CompositionKind = isTvc(entry) ? 'single_video' : 'single_image'
  const status: ProfileStatus =
    entry.status === 'active_reference'
      ? 'active'
      : entry.status === 'deprecated'
        ? 'deprecated'
        : 'needs_review'
  return {
    id: primarySlotId(entry),
    catalogEntryId: entry.id,
    publisherId: entry.publisherId,
    label: entry.slotLabel,
    surface: 'publisher_homepage',
    placement: entry.slotLabel,
    device: entry.device ?? 'all',
    width: entry.width,
    height: entry.height,
    ratio: entry.ratio,
    allowedCompositions: [composition],
    assetRoles: ['creative'],
    copyFields: [],
    evidenceClaimIds: [],
    rendererReferenceIds: [],
    status,
    sourceRefIds: entry.sourceRefIds,
    evidence: entry.evidence,
    confidence: entry.evidence === 'conflict' ? 'low' : 'medium',
    effectiveAt: entry.effectiveAt,
    checkedAt: entry.sourceSnapshotDate,
  }
}

const primarySlots = ADMICRO_ENTRIES.filter((entry) => !entry.packageId).map(baseSlot)

function packageChildSlots(entry: AdmicroCatalogEntry): SlotSpec[] {
  if (
    entry.packageId?.endsWith('.homepage_plus') ||
    entry.packageId?.endsWith('.homepage_premium')
  ) {
    return [
      {
        ...baseSlot(entry),
        id: `${primarySlotId(entry)}.pending`,
        label: `${entry.slotLabel} (source composition pending)`,
        width: undefined,
        height: undefined,
        ratio: undefined,
        status: 'needs_review',
        evidence: 'unknown',
        confidence: 'low',
      },
    ]
  }
  const descriptors = parseDimensionLabels(entry.dimensionsText)
  if (!descriptors.length) {
    return [
      {
        ...baseSlot(entry),
        id: `${primarySlotId(entry)}.pending`,
        label: `${entry.slotLabel} (composition pending)`,
        width: undefined,
        height: undefined,
        ratio: undefined,
        status: 'needs_review',
        evidence: 'unknown',
        confidence: 'low',
      },
    ]
  }
  return descriptors.map((descriptor, index) => ({
    ...baseSlot(entry),
    id: `${primarySlotId(entry)}.${slug(descriptor.label)}.${index + 1}`,
    label: descriptor.label,
    width: descriptor.width,
    height: descriptor.height,
    status: 'needs_review',
    evidence: 'conflict',
    confidence: 'low',
  }))
}

const packageSlots: SlotSpec[] = []
const packageSlotIds = new Map<string, string[]>()
for (const [packageId, entries] of entriesByPackage) {
  const slots: SlotSpec[] = []
  for (const entry of entries) {
    const children = packageChildSlots(entry)
    packageSlots.push(...children)
    slots.push(...children)
  }
  packageSlotIds.set(packageId, slots.map((slot) => slot.id))
}

export const ADMICRO_SLOTS: SlotSpec[] = [...primarySlots, ...packageSlots]

function packageSpec(
  packageId: string,
  packageType: Exclude<PackageType, 'other'>,
  publisherId: string,
  slotIds: string[],
): PackageSpec {
  return {
    id: packageId,
    publisherId,
    label: packageDefinitions.find((item) => item.type === packageType)?.label ?? packageType,
    packageType,
    slotIds,
    assetAssignment: 'per_slot' satisfies AssetAssignmentPolicy,
    context: { ...DEFAULT_CONTEXT },
    sourceRefIds: SOURCE_REFS,
    status: 'needs_review',
    evidence: 'conflict',
    confidence: 'low' satisfies Confidence,
    effectiveAt: null,
    checkedAt: SNAPSHOT.snapshotDate,
  }
}

export const ADMICRO_PACKAGES: PackageSpec[] = packageDefinitions.flatMap((definition) => {
  const packages: PackageSpec[] = []
  for (const publisher of ADMICRO_PUBLISHERS) {
    const packageId = packageIdFor(publisher.id, definition.type)
    const slotIds = packageSlotIds.get(packageId)
    if (!slotIds?.length) continue
    packages.push(packageSpec(packageId, definition.type, publisher.id, slotIds))
  }
  return packages
})

export interface ResolveAdmicroSlotsInput {
  publisherId?: string
  slotId?: string
  packageId?: string
}

export function resolveAdmicroSlots(input: ResolveAdmicroSlotsInput = {}): SlotSpec[] {
  if (input.packageId) {
    const packageSpecValue = ADMICRO_PACKAGES.find((item) => item.id === input.packageId)
    if (!packageSpecValue) return []
    const packageSlotsById = new Set(packageSpecValue.slotIds)
    return ADMICRO_SLOTS.filter(
      (slot) =>
        packageSlotsById.has(slot.id) &&
        (!input.publisherId || slot.publisherId === input.publisherId),
    )
  }
  return ADMICRO_SLOTS.filter(
    (slot) =>
      (!input.publisherId || slot.publisherId === input.publisherId) &&
      (!input.slotId || slot.id === input.slotId),
  )
}

export function resolveAdmicroEntry(entryId: string): AdmicroCatalogEntry | undefined {
  return ADMICRO_ENTRIES.find((entry) => entry.id === entryId)
}

export function resolveAdmicroPackage(packageId: string): PackageSpec | undefined {
  return ADMICRO_PACKAGES.find((item) => item.id === packageId)
}

function uniqueCompositions(slots: SlotSpec[]): CompositionKind[] {
  const values = new Set<CompositionKind>()
  slots.forEach((slot) => slot.allowedCompositions.forEach((composition) => values.add(composition)))
  return [...values]
}

function commonDevice(slots: SlotSpec[]): DeviceClass {
  const devices = new Set(slots.map((slot) => slot.device))
  return devices.size === 1 ? [...devices][0] : 'all'
}

function profileFromSlot(slot: SlotSpec): Profile {
  const publisherLabel =
    ADMICRO_PUBLISHERS.find((publisher) => publisher.id === slot.publisherId)?.label ??
    slot.publisherId ??
    'Admicro'
  return {
    id: slot.id,
    groupId: 'admicro',
    groupTitle: 'Admicro',
    platform: 'admicro',
    product: 'display',
    productLabel: 'CPD Homepage',
    surface: slot.surface,
    placement: `${publisherLabel} · ${slot.label}`,
    device: slot.device,
    renderer: 'banner',
    allowedCompositions: slot.allowedCompositions,
    supportStatus: 'needs_review',
    implementation: 'planned',
    evidence: 'conflict',
    confidence: 'low',
    sourceRefs: SOURCE_REFS,
    sources: resolveSources(SOURCE_REFS),
    specVersion: ADMICRO_CATALOG_VERSION,
    effectiveAt: null,
    checkedAt: SNAPSHOT.snapshotDate,
    rules: [],
    fieldRules: [],
    notes: [
      'Admicro CPD source snapshot only; no current pricing or availability claim.',
      `Catalog entry ${slot.catalogEntryId}.`,
    ],
  }
}

function profileFromPackage(packageSpecValue: PackageSpec): Profile {
  const slots = resolveAdmicroSlots({ packageId: packageSpecValue.id })
  const publisherLabel =
    ADMICRO_PUBLISHERS.find((publisher) => publisher.id === packageSpecValue.publisherId)?.label ??
    packageSpecValue.publisherId
  return {
    id: packageSpecValue.id,
    groupId: 'admicro',
    groupTitle: 'Admicro',
    platform: 'admicro',
    product: 'display',
    productLabel: 'CPD Homepage Package',
    surface: 'publisher_homepage',
    placement: `${publisherLabel} · ${packageSpecValue.label}`,
    device: commonDevice(slots),
    renderer: 'banner',
    allowedCompositions: uniqueCompositions(slots),
    supportStatus: 'needs_review',
    implementation: 'planned',
    evidence: 'conflict',
    confidence: 'low',
    sourceRefs: SOURCE_REFS,
    sources: resolveSources(SOURCE_REFS),
    specVersion: ADMICRO_CATALOG_VERSION,
    effectiveAt: null,
    checkedAt: SNAPSHOT.snapshotDate,
    rules: [],
    fieldRules: [],
    notes: [
      'Package renders multiple SlotSpec records; asset binding remains per slot.',
      'Admicro CPD source snapshot only; no current pricing or availability claim.',
    ],
  }
}

export function resolveAdmicroProfile(profileId: string): Profile | undefined {
  const slot = ADMICRO_SLOTS.find((item) => item.id === profileId)
  if (slot) return profileFromSlot(slot)
  const packageSpecValue = resolveAdmicroPackage(profileId)
  if (packageSpecValue) return profileFromPackage(packageSpecValue)
  return undefined
}

export const ADMICRO_PROFILE_IDS = [
  ...ADMICRO_SLOTS.map((slot) => slot.id),
  ...ADMICRO_PACKAGES.map((packageSpecValue) => packageSpecValue.id),
]
