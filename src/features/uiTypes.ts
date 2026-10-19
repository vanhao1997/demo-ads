export type UiProfile = {
  id: string
  groupId: string
  groupName: string
  title: string
  product: string
  device: string
  evidence: string
  version: string
  checkedAt: string
  implementation?: 'planned' | 'implemented' | 'tested'
  supportStatus?: 'active' | 'deprecated' | 'needs_review'
  surface?: string
  notes?: string[]
  composition: string[]
  source: { title: string; url: string }[]
  renderer: 'feed' | 'vertical' | 'search' | 'banner' | 'form' | 'chat'
  ratio: number
  limits: Record<string, number>
}
export type UiCheck = {
  id: string
  field: string
  status: 'pass' | 'warn' | 'fail' | 'unknown'
  message: string
  actual?: string | number
  expected?: string | number
  source?: string
  sourceRefs?: string[]
  evidence?: string
  notes?: string
}
export const compositions = [
  { id: 'single_image', label: 'Ảnh đơn' },
  { id: 'multi_image_grid', label: 'Nhiều ảnh' },
  { id: 'single_video', label: 'Video' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'text_only', label: 'Text / RSA' },
  { id: 'responsive_asset_set', label: 'Asset set' },
]
export const evidenceLabel: Record<string, string> = {
  primary_documented: 'Có tài liệu',
  documented: 'Có tài liệu',
  official: 'Có tài liệu',
  reference_only: 'Tham khảo',
  reference: 'Tham khảo',
  estimated: 'Ước lượng',
  conflict: 'Nguồn xung đột',
  unknown: 'Chờ xác minh',
}
