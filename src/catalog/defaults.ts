import type { Creative } from '../domain'

export const DEFAULT_CREATIVE: Creative = {
  id: 'creative-demo-01',
  name: 'Creative đầu tiên',
  locale: 'vi-VN',
  version: 1,
  identity: {
    brandName: 'P2P Digital',
    handle: '@p2pdigital',
  },
  copy: {
    brandName: 'P2P Digital',
    primaryText:
      'Giải pháp Digital Marketing, AI Automation & CRM giúp doanh nghiệp tối ưu tăng trưởng.',
    headlines: ['Tối ưu Quảng cáo Đa kênh cùng P2P Digital'],
    descriptions: ['Ưu đãi tại p2pdigital.vn'],
    cta: 'Tìm hiểu thêm',
    destinationUrl: 'https://p2pdigital.vn/',
    displayPath: ['giai-phap', 'ai-marketing'],
  },
  assets: [],
  composition: {
    kind: 'single_image',
    assetIds: [],
    items: [],
    crop: { fit: 'cover', focalPoint: { x: 0.5, y: 0.5 } },
  },
  form: {
    oaName: 'P2P Digital',
    title: 'Nhận thông tin tư vấn',
    body: 'Để lại thông tin để đội ngũ hỗ trợ liên hệ với bạn.',
    questions: [
      { key: 'name', label: 'Họ và tên', required: true },
      { key: 'phone', label: 'Số điện thoại', required: true },
    ],
  },
  updatedAt: '2026-10-12T00:00:00.000Z',
}
