export type SupportedLocale = 'vi' | 'en'

export interface LocaleDict {
  locale: SupportedLocale
  sponsored: Record<string, string>
  seeMore: Record<string, string>
  ctas: Record<string, string>
  ui: Record<string, string>
}

export const CANONICAL_CTA_MAP: Record<string, { vi: string; en: string }> = {
  learn_more: { vi: 'Tìm hiểu thêm', en: 'Learn more' },
  shop_now: { vi: 'Mua ngay', en: 'Shop now' },
  sign_up: { vi: 'Đăng ký', en: 'Sign up' },
  book_now: { vi: 'Đặt ngay', en: 'Book now' },
  contact_us: { vi: 'Liên hệ với chúng tôi', en: 'Contact us' },
  download: { vi: 'Tải xuống', en: 'Download' },
  get_offer: { vi: 'Nhận ưu đãi', en: 'Get offer' },
  order_now: { vi: 'Đặt hàng ngay', en: 'Order now' },
  send_message: { vi: 'Gửi tin nhắn', en: 'Send message' },
  subscribe: { vi: 'Đăng ký theo dõi', en: 'Subscribe' },
  watch_more: { vi: 'Xem thêm', en: 'Watch more' },
  watch_now: { vi: 'Xem ngay', en: 'Watch now' },
  apply_now: { vi: 'Ứng tuyển ngay', en: 'Apply now' },
  get_quote: { vi: 'Nhận báo giá', en: 'Get quote' },
  call_now: { vi: 'Gọi ngay', en: 'Call now' },
  install_now: { vi: 'Cài đặt ngay', en: 'Install now' },
  visit_site: { vi: 'Truy cập trang web', en: 'Visit site' },
  none: { vi: 'Không có nút', en: 'No button' },
}

export const SPONSORED_LABELS: Record<string, { vi: string; en: string }> = {
  facebook: { vi: 'Được tài trợ', en: 'Sponsored' },
  instagram: { vi: 'Được tài trợ', en: 'Sponsored' },
  threads: { vi: 'Được tài trợ', en: 'Sponsored' },
  tiktok: { vi: 'Được tài trợ', en: 'Sponsored' },
  youtube: { vi: 'Được tài trợ', en: 'Sponsored' },
  google_search: { vi: 'Kết quả được tài trợ', en: 'Sponsored results' },
  'google-search': { vi: 'Kết quả được tài trợ', en: 'Sponsored results' },
  gdn: { vi: 'Quảng cáo', en: 'Ad' },
  'google-display': { vi: 'Quảng cáo', en: 'Ad' },
  chatgpt: { vi: 'Được tài trợ', en: 'Sponsored' },
  zalo: { vi: 'Được tài trợ', en: 'Sponsored' },
  linkedin: { vi: 'Được quảng bá', en: 'Promoted' },
  admicro: { vi: 'Quảng cáo', en: 'Ad' },
}

export const SEE_MORE_LABELS: Record<string, { vi: string; en: string }> = {
  facebook: { vi: 'Xem thêm', en: 'See more' },
  instagram: { vi: 'xem thêm', en: 'more' },
  threads: { vi: 'Xem thêm', en: 'More' },
  tiktok: { vi: 'Xem thêm', en: 'See more' },
  zalo: { vi: 'Xem thêm', en: 'See more' },
  linkedin: { vi: 'Xem thêm', en: 'See more' },
}

export function translateCta(value: string, locale: SupportedLocale): string {
  if (!value) return ''
  if (CANONICAL_CTA_MAP[value]) {
    return CANONICAL_CTA_MAP[value][locale]
  }
  if (value === 'Liên hệ') return locale === 'vi' ? 'Liên hệ' : 'Contact us'
  for (const entry of Object.values(CANONICAL_CTA_MAP)) {
    if (value === entry.vi || value === entry.en) {
      return entry[locale]
    }
  }
  return value
}

export function translateSponsored(platformOrGroup: string, locale: SupportedLocale): string {
  const normKey = platformOrGroup.toLowerCase().replace(/_/g, '-')
  const altKey = platformOrGroup.toLowerCase().replace(/-/g, '_')
  const entry = SPONSORED_LABELS[normKey] ?? SPONSORED_LABELS[altKey]
  return entry?.[locale] ?? (locale === 'vi' ? 'Được tài trợ' : 'Sponsored')
}

export function translateSeeMore(platformOrGroup: string, locale: SupportedLocale): string {
  const normKey = platformOrGroup.toLowerCase().replace(/_/g, '-')
  const altKey = platformOrGroup.toLowerCase().replace(/-/g, '_')
  const entry = SEE_MORE_LABELS[normKey] ?? SEE_MORE_LABELS[altKey]
  return entry?.[locale] ?? (locale === 'vi' ? 'Xem thêm' : 'See more')
}
