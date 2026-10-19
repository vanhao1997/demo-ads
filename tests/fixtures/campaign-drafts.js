/**
 * Campaign Drafts & Specifications Fixture Data for Ad Preview Test Suite
 * Authoritative source: Webpack Bundle 20929 (steps/26/output.txt), steps/203, steps/209, ORIGINAL_REQUEST.md
 */

export const PLATFORMS_FIXTURE = [
  { id: 'facebook', name: 'Facebook', placementsCount: 10, hasWarning: false },
  { id: 'instagram', name: 'Instagram', placementsCount: 3, hasWarning: false },
  { id: 'threads', name: 'Threads', placementsCount: 1, hasWarning: false },
  { id: 'tiktok', name: 'TikTok', placementsCount: 2, hasWarning: true },
  { id: 'youtube', name: 'YouTube', placementsCount: 6, hasWarning: false },
  { id: 'google_search', name: 'Google Tìm kiếm', placementsCount: 2, hasWarning: false },
  { id: 'gdn', name: 'Google Hiển thị', placementsCount: 8, hasWarning: true },
  { id: 'chatgpt', name: 'ChatGPT', placementsCount: 2, hasWarning: false },
  { id: 'zalo', name: 'Zalo Ads', placementsCount: 4, hasWarning: false },
  { id: 'linkedin', name: 'LinkedIn Ads', placementsCount: 4, hasWarning: false },
  { id: 'admicro', name: 'Admicro', placementsCount: 4, hasWarning: false },
];

export const PLACEMENTS_FIXTURE = [
  // Facebook (10)
  { id: 'fb_feed', platform: 'facebook', name: 'Bảng feed', device: 'mobile', ratio: '4:5', primaryLimit: 150, primaryTruncate: 124, headlineLimit: 27, descLimit: 30, safeZone: false },
  { id: 'fb_video_feeds', platform: 'facebook', name: 'Video Feeds', device: 'mobile', ratio: '4:5', primaryLimit: 150, primaryTruncate: 124, headlineLimit: 27, descLimit: 30, safeZone: false },
  { id: 'fb_stories', platform: 'facebook', name: 'Stories', device: 'mobile', ratio: '9:16', primaryLimit: 125, primaryTruncate: 72, headlineLimit: 40, descLimit: 0, safeZone: true },
  { id: 'fb_reels', platform: 'facebook', name: 'Reels', device: 'mobile', ratio: '9:16', primaryLimit: 125, primaryTruncate: 72, headlineLimit: 40, descLimit: 0, safeZone: true },
  { id: 'fb_reels_overlay', platform: 'facebook', name: 'Banner trên Reels', device: 'mobile', ratio: '1:1', primaryLimit: 90, primaryTruncate: 50, headlineLimit: 27, descLimit: 25, safeZone: false },
  { id: 'fb_instream', platform: 'facebook', name: 'Video trong luồng', device: 'mobile', ratio: '16:9', primaryLimit: 125, primaryTruncate: 90, headlineLimit: 27, descLimit: 30, safeZone: false },
  { id: 'fb_marketplace', platform: 'facebook', name: 'Marketplace', device: 'mobile', ratio: '1:1', primaryLimit: 125, primaryTruncate: 60, headlineLimit: 27, descLimit: 30, safeZone: false },
  { id: 'fb_search', platform: 'facebook', name: 'Kết quả tìm kiếm', device: 'mobile', ratio: '1.91:1', primaryLimit: 125, primaryTruncate: 90, headlineLimit: 27, descLimit: 30, safeZone: false },
  { id: 'fb_right_col', platform: 'facebook', name: 'Cột bên phải', device: 'desktop', ratio: '1:1', primaryLimit: 0, primaryTruncate: 0, headlineLimit: 40, descLimit: 30, safeZone: false },
  { id: 'fb_audience_network', platform: 'facebook', name: 'Audience Network', device: 'mobile', ratio: '16:9', primaryLimit: 125, primaryTruncate: 90, headlineLimit: 40, descLimit: 30, safeZone: false },

  // Instagram (3)
  { id: 'ig_feed', platform: 'instagram', name: 'Bảng feed', device: 'mobile', ratio: '4:5', primaryLimit: 125, primaryTruncate: 115, headlineLimit: 40, descLimit: 0, safeZone: false },
  { id: 'ig_stories', platform: 'instagram', name: 'Stories', device: 'mobile', ratio: '9:16', primaryLimit: 125, primaryTruncate: 70, headlineLimit: 40, descLimit: 0, safeZone: true },
  { id: 'ig_reels', platform: 'instagram', name: 'Reels', device: 'mobile', ratio: '9:16', primaryLimit: 125, primaryTruncate: 72, headlineLimit: 40, descLimit: 0, safeZone: true },

  // Threads (1)
  { id: 'threads_feed', platform: 'threads', name: 'Bảng feed', device: 'mobile', ratio: '4:5', primaryLimit: 500, primaryTruncate: 200, headlineLimit: 40, descLimit: 30, safeZone: false },

  // TikTok (2)
  { id: 'tt_infeed', platform: 'tiktok', name: 'In-Feed', device: 'mobile', ratio: '9:16', primaryLimit: 100, primaryTruncate: 88, headlineLimit: 40, descLimit: 0, safeZone: true },
  { id: 'tt_topview', platform: 'tiktok', name: 'TopView', device: 'mobile', ratio: '9:16', primaryLimit: 100, primaryTruncate: 88, headlineLimit: 40, descLimit: 0, safeZone: true },

  // YouTube (6)
  { id: 'yt_instream_skippable', platform: 'youtube', name: 'Trong luồng (bỏ qua được)', device: 'mobile', ratio: '16:9', primaryLimit: 90, primaryTruncate: 70, headlineLimit: 15, descLimit: 35, safeZone: false },
  { id: 'yt_instream_nonskip', platform: 'youtube', name: 'Trong luồng (không bỏ qua)', device: 'mobile', ratio: '16:9', primaryLimit: 90, primaryTruncate: 70, headlineLimit: 15, descLimit: 35, safeZone: false },
  { id: 'yt_bumper', platform: 'youtube', name: 'Bumper 6 giây', device: 'mobile', ratio: '16:9', primaryLimit: 90, primaryTruncate: 70, headlineLimit: 15, descLimit: 35, safeZone: false },
  { id: 'yt_instream_desktop', platform: 'youtube', name: 'Trong luồng (máy tính)', device: 'desktop', ratio: '16:9', primaryLimit: 90, primaryTruncate: 70, headlineLimit: 15, descLimit: 35, safeZone: false },
  { id: 'yt_infeed', platform: 'youtube', name: 'Trong nguồn cấp', device: 'mobile', ratio: '16:9', primaryLimit: 90, primaryTruncate: 80, headlineLimit: 70, descLimit: 35, safeZone: false },
  { id: 'yt_shorts', platform: 'youtube', name: 'Shorts', device: 'mobile', ratio: '9:16', primaryLimit: 90, primaryTruncate: 70, headlineLimit: 40, descLimit: 0, safeZone: true },

  // Google Tìm kiếm (2)
  { id: 'gs_mobile', platform: 'google_search', name: 'Di động', device: 'mobile', ratio: '1:1', primaryLimit: 180, primaryTruncate: 160, headlineLimit: 90, descLimit: 90, safeZone: false },
  { id: 'gs_desktop', platform: 'google_search', name: 'Máy tính', device: 'desktop', ratio: '1.91:1', primaryLimit: 180, primaryTruncate: 160, headlineLimit: 90, descLimit: 90, safeZone: false },

  // Google Hiển thị (8)
  { id: 'gdn_300x250', platform: 'gdn', name: 'Hình chữ nhật 300×250', device: 'mobile', ratio: '1.91:1', size: [300, 250], headlineLimit: 30, descLimit: 90, safeZone: false },
  { id: 'gdn_336x280', platform: 'gdn', name: 'Hình chữ nhật lớn 336×280', device: 'mobile', ratio: '1.91:1', size: [336, 280], headlineLimit: 30, descLimit: 90, safeZone: false },
  { id: 'gdn_728x90', platform: 'gdn', name: 'Leaderboard 728×90', device: 'desktop', ratio: '1.91:1', size: [728, 90], headlineLimit: 30, descLimit: 60, safeZone: false },
  { id: 'gdn_300x600', platform: 'gdn', name: 'Nửa trang 300×600', device: 'desktop', ratio: '4:5', size: [300, 600], headlineLimit: 30, descLimit: 90, safeZone: false },
  { id: 'gdn_160x600', platform: 'gdn', name: 'Skyscraper 160×600', device: 'desktop', ratio: '1:1', size: [160, 600], headlineLimit: 30, descLimit: 60, safeZone: false },
  { id: 'gdn_320x100', platform: 'gdn', name: 'Biểu ngữ di động 320×100', device: 'mobile', ratio: '1:1', size: [320, 100], headlineLimit: 30, descLimit: 60, safeZone: false },
  { id: 'gdn_320x50', platform: 'gdn', name: 'Biểu ngữ di động 320×50', device: 'mobile', ratio: '1:1', size: [320, 50], headlineLimit: 30, descLimit: 0, safeZone: false },
  { id: 'gdn_native', platform: 'gdn', name: 'Native trong bài viết', device: 'mobile', ratio: '1.91:1', size: null, headlineLimit: 30, descLimit: 90, safeZone: false },

  // ChatGPT (2)
  { id: 'chatgpt_web', platform: 'chatgpt', name: 'Web', device: 'desktop', ratio: '1:1', primaryLimit: 160, headlineLimit: 50, descLimit: 60, safeZone: false },
  { id: 'chatgpt_mobile', platform: 'chatgpt', name: 'Ứng dụng di động', device: 'mobile', ratio: '1:1', primaryLimit: 160, headlineLimit: 50, descLimit: 60, safeZone: false },

  // Zalo Ads (4)
  { id: 'zalo_timeline', platform: 'zalo', name: 'Nhật ký Zalo', device: 'mobile', ratio: '1.91:1', primaryLimit: 150, headlineLimit: 60, descLimit: 40, safeZone: false },
  { id: 'zalo_video', platform: 'zalo', name: 'Zalo Video', device: 'mobile', ratio: '9:16', primaryLimit: 120, headlineLimit: 60, descLimit: 0, safeZone: true },
  { id: 'zalo_message', platform: 'zalo', name: 'Tin nhắn OA', device: 'mobile', ratio: '1.91:1', primaryLimit: 160, headlineLimit: 60, descLimit: 40, safeZone: false },
  { id: 'zalo_article', platform: 'zalo', name: 'Báo mới / Khám phá', device: 'mobile', ratio: '1.91:1', primaryLimit: 150, headlineLimit: 60, descLimit: 40, safeZone: false },

  // LinkedIn Ads (4)
  { id: 'li_mobile_feed', platform: 'linkedin', name: 'Bảng tin Di động', device: 'mobile', ratio: '1.91:1', primaryLimit: 150, headlineLimit: 70, descLimit: 40, safeZone: false },
  { id: 'li_desktop_feed', platform: 'linkedin', name: 'Bảng tin Máy tính', device: 'desktop', ratio: '1.91:1', primaryLimit: 150, headlineLimit: 70, descLimit: 40, safeZone: false },
  { id: 'li_message', platform: 'linkedin', name: 'Tin nhắn tài trợ', device: 'mobile', ratio: '1:1', primaryLimit: 200, headlineLimit: 60, descLimit: 40, safeZone: false },
  { id: 'li_spotlight', platform: 'linkedin', name: 'Cột phải Spotlight', device: 'desktop', ratio: '1:1', primaryLimit: 150, headlineLimit: 70, descLimit: 40, safeZone: false },

  // Admicro (4)
  { id: 'admicro_cafef_pc', platform: 'admicro', name: 'CafeF (PC)', device: 'desktop', ratio: '1.91:1', primaryLimit: 160, headlineLimit: 65, descLimit: 45, safeZone: false },
  { id: 'admicro_kenh14_mobile', platform: 'admicro', name: 'Kenh14 (Mobile)', device: 'mobile', ratio: '1.91:1', primaryLimit: 160, headlineLimit: 65, descLimit: 45, safeZone: false },
  { id: 'admicro_vnexpress_pc', platform: 'admicro', name: 'VnExpress (Masthead PC)', device: 'desktop', ratio: '1.91:1', primaryLimit: 160, headlineLimit: 65, descLimit: 45, safeZone: false },
  { id: 'admicro_dantri_mobile', platform: 'admicro', name: 'Dân trí (In-Page Mobile)', device: 'mobile', ratio: '4:5', primaryLimit: 160, headlineLimit: 65, descLimit: 45, safeZone: false }
];

export const CANONICAL_CTA_MAP = {
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
};

export const SPONSORED_LABELS = {
  facebook: { vi: 'Được tài trợ', en: 'Sponsored' },
  instagram: { vi: 'Được tài trợ', en: 'Sponsored' },
  threads: { vi: 'Được tài trợ', en: 'Sponsored' },
  tiktok: { vi: 'Được tài trợ', en: 'Sponsored' },
  youtube: { vi: 'Được tài trợ', en: 'Sponsored' },
  google_search: { vi: 'Kết quả được tài trợ', en: 'Sponsored results' },
  gdn: { vi: 'Quảng cáo', en: 'Ad' },
  chatgpt: { vi: 'Được tài trợ', en: 'Sponsored' },
  zalo: { vi: 'Được tài trợ', en: 'Sponsored' },
  linkedin: { vi: 'Được quảng bá', en: 'Promoted' },
  admicro: { vi: 'Quảng cáo', en: 'Ad' },
};

export const SEE_MORE_LABELS = {
  facebook: { vi: 'Xem thêm', en: 'See more' },
  instagram: { vi: 'xem thêm', en: 'more' },
  threads: { vi: 'Xem thêm', en: 'More' },
  tiktok: { vi: 'Xem thêm', en: 'See more' },
  zalo: { vi: 'Xem thêm', en: 'See more' },
  linkedin: { vi: 'Xem thêm', en: 'See more' },
};

export const DEFAULT_CAMPAIGN_DRAFT = {
  brandName: 'noit.vn',
  handle: '@noti.vn',
  primaryText: 'Chia sẻ về Digital Marketing, AI Automation, AI Agent và Marketing Operations giúp marketer, doanh nghiệp tối ưu tăng trưởng và vận hành.',
  headline: 'Digital Marketing, AI Automation & AI Agent - Blog noti.vn',
  description: 'Xem ngay tại go.noti.vn',
  url: 'https://go.noti.vn/',
  cta: 'Tìm hiểu thêm',
  mediaUrl: null,
};

export const ECOMMERCE_CAMPAIGN_DRAFT = {
  brandName: 'ChicStyle Studio',
  handle: '@chicstyle',
  primaryText: 'Bộ sưu tập Mùa Hè 2026 đã chính thức ra mắt! Ưu đãi giảm đến 40% cho 100 đơn hàng đầu tiên hôm nay.',
  headline: 'BST Hè 2026 - Thời trang thanh lịch & năng động',
  description: 'Giao hàng hỏa tốc trong 2h tại TP.HCM & Hà Nội',
  url: 'https://chicstyle.vn/summer',
  cta: 'Mua ngay',
  mediaCount: 3,
};

export const B2B_SAAS_CAMPAIGN_DRAFT = {
  brandName: 'CloudSync Enterprise',
  handle: '@cloudsync',
  primaryText: 'Nâng tầm hiệu suất doanh nghiệp với nền tảng tích hợp AI Agent tự động hóa báo cáo và phân tích vận hành tức thì.',
  headline: 'Tối ưu hóa quy trình làm việc đám mây với AI',
  description: 'Dùng thử 14 ngày miễn phí. Không cần thẻ tín dụng.',
  url: 'https://cloudsync.io/enterprise',
  cta: 'Đăng ký',
  mediaRatio: '1.91:1',
};

export const GAMING_VIDEO_CAMPAIGN_DRAFT = {
  brandName: 'CyberWar 2099',
  handle: '@cyberwar2099',
  primaryText: 'Trải nghiệm siêu phẩm MMORPG đồ họa Unreal Engine 5 đỉnh cao trên di động! Tải ngay để nhận skin độc quyền!',
  headline: 'Chiến trường CyberWar 2099 mở cửa',
  description: 'Miễn phí trên iOS & Android',
  url: 'https://cyberwar2099.game/play',
  cta: 'Cài đặt ngay',
  videoDurationSec: 15,
};
