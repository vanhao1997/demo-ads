import type { SlotSpec } from '../domain'

export type PublisherPlacement = 'page_top' | 'after_navigation' | 'right_column' | 'left_rail' | 'in_article' | 'article_foot' | 'page_foot' | 'in_video' | 'page_background' | 'unresolved'
export type PublisherPlacementBasis = 'format_reference' | 'snapshot_label' | 'estimated'

export interface PublisherSlotLayout {
  slot: SlotSpec
  placement: PublisherPlacement
  placementLabel: string
  basis: PublisherPlacementBasis
  explanation: string
  referenceUrl?: string
}

const FORMAT_REFERENCE = 'https://admatic.admicro.vn/formats'
const CPD_REFERENCE = 'https://adnetwork.admicro.vn/demo/'

const placementLabels: Record<PublisherPlacement, string> = {
  page_top: 'Đầu trang',
  after_navigation: 'Dưới thanh chuyên mục',
  right_column: 'Cột phải',
  left_rail: 'Lề trái',
  in_article: 'Giữa nội dung',
  article_foot: 'Cuối bài',
  page_foot: 'Cuối trang',
  in_video: 'Trong trình phát video',
  page_background: 'Nền trang',
  unresolved: 'Chưa xác định bố cục',
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Placement references never replace the source dimensions or upgrade catalog evidence. */
export function publisherSlotLayout(slot: SlotSpec): PublisherSlotLayout {
  const label = normalize(slot.label)
  const result = (placement: PublisherPlacement, basis: PublisherPlacementBasis, explanation: string, referenceUrl?: string): PublisherSlotLayout => ({ slot, placement, placementLabel: placementLabels[placement], basis, explanation, referenceUrl })

  if (/pending|full homepage|^dimension\b/.test(label)) return result('unresolved', 'estimated', 'Nguồn chưa tách đủ thành phần. Không suy ra danh sách vị trí của package.')
  if (/background/.test(label)) return result('page_background', 'snapshot_label', 'Tên thành phần trong snapshot là Background; nền được đặt sau trang báo minh họa.', CPD_REFERENCE)
  if (/tvc|instream/.test(label)) return result('in_video', 'format_reference', 'Format instream được mô tả trong video trước, giữa hoặc sau nội dung. Mẫu này minh họa một lần ngắt quảng cáo.', FORMAT_REFERENCE)
  if (/inpage fullscreen|inpage full screen/.test(label)) return result('in_article', 'format_reference', 'Inpage Fullscreen Mobile được mô tả ở giữa bài viết. Khung trang và khoảng cuộn chưa đối chiếu demo theo publisher.', FORMAT_REFERENCE)
  if (/top banner mobile|^masthead$/.test(label) && slot.device === 'mobile') return result('after_navigation', 'format_reference', 'Top Banner Mobile được mô tả ở đầu trang. Preview chọn vị trí sau thanh chuyên mục.', FORMAT_REFERENCE)
  if (/big article|kingsize article/.test(label)) return result('article_foot', 'format_reference', 'Format Article Banner được mô tả ở chân bài viết.', FORMAT_REFERENCE)
  if (/hookeye|half page/.test(label) && slot.device !== 'mobile') return result('right_column', 'format_reference', 'Hookeye và Half Page được mô tả ở cột phải. Hành vi sticky chưa được tái tạo.', FORMAT_REFERENCE)
  if (/hookeye/.test(label)) return result('in_article', 'format_reference', 'Hookeye Mobile được mô tả ở giữa nội dung.', FORMAT_REFERENCE)
  if (/billboard|super leaderboard|kingsize leaderboard/.test(label) && slot.device !== 'mobile') return result('page_top', 'format_reference', 'Format Billboard/Leaderboard có vị trí đầu, giữa hoặc cuối trang. Mẫu này chọn đầu trang; không xác nhận vị trí booking.', FORMAT_REFERENCE)
  if (/mobile footer|bottom banner|catfish/.test(label)) return result('page_foot', 'snapshot_label', 'Tên slot chỉ vùng cuối trang; dạng nổi hoặc sticky chưa được đối chiếu demo riêng.')
  if (/floating left|float banner/.test(label)) return result('left_rail', 'snapshot_label', 'Tên slot và chiều rộng gợi ý lề trang. Mẫu dùng lề trái; chưa đối chiếu demo theo publisher.')
  if (/top banner|top billboard|super masthead/.test(label)) return result('page_top', 'snapshot_label', 'Tên slot chỉ vùng đầu trang. Thứ tự so với masthead là ước lượng.')
  if (/billboard/.test(label)) return result('after_navigation', 'estimated', 'Billboard Mobile được minh họa đầu nội dung; chưa đối chiếu demo riêng.')
  if (/high banner|hot banner|big banner|large skyscraper|right banner|sticky banner|rectangle/.test(label)) return result(slot.device === 'mobile' ? 'in_article' : 'right_column', 'estimated', 'Tên slot gợi ý khối quảng cáo cạnh nội dung. Vị trí và thứ tự là ước lượng, chưa đối chiếu demo theo publisher.')
  if (/emagazine|center|medium|leaderboard|kingsize/.test(label)) return result('in_article', 'estimated', 'Khối quảng cáo được đặt xen nội dung để xem ngữ cảnh. Tên slot chưa đủ xác nhận vị trí chính xác.')
  return result('unresolved', 'estimated', 'Chưa có mô tả vị trí đủ rõ trong tài liệu đã đối chiếu; giữ slot riêng, không tự đoán vị trí.')
}

export interface PublisherNewsContext {
  wordmark: string
  accent: string
  ink: string
  section: string
  navigation: string[]
  headline: string
  lead: string
  scene: 'market' | 'city' | 'living' | 'technology' | 'motoring'
  related: [string, string, string]
}

const financial: PublisherNewsContext = {
  wordmark: 'CafeF', accent: '#bd2027', ink: '#243244', section: 'KINH DOANH',
  navigation: ['Trang chủ', 'Thị trường', 'Doanh nghiệp', 'Bất động sản', 'Tài chính'],
  headline: 'Doanh nghiệp Việt đón nhịp tăng trưởng mới từ đổi mới sáng tạo',
  lead: 'Nhiều mô hình kinh doanh đang thay đổi cùng nhu cầu tiêu dùng. Công nghệ và dịch vụ giúp doanh nghiệp tìm hướng phát triển trong giai đoạn mới.',
  scene: 'market',
  related: ['Góc nhìn thị trường: động lực cho giai đoạn tiếp theo', 'Không gian làm việc thay đổi cùng thói quen mới', 'Câu chuyện thương hiệu từ những điều gần gũi'],
}

const contexts: Record<string, Partial<PublisherNewsContext>> = {
  cafef: {},
  cafebiz: { wordmark: 'CafeBiz', accent: '#244161', section: 'CÂU CHUYỆN KINH DOANH', navigation: ['Trang chủ', 'Kinh doanh', 'Doanh nhân', 'Sống', 'Công nghệ'] },
  vtv: { wordmark: 'VTV', accent: '#b9252d', section: 'THỜI SỰ', navigation: ['Trang chủ', 'Thời sự', 'Kinh tế', 'Thế giới', 'Đời sống'], scene: 'city', headline: 'Thành phố mở thêm không gian xanh cho người dân' },
  kenh14: { wordmark: 'kenh14.vn', accent: '#ec9026', ink: '#252525', section: 'ĐỜI SỐNG', navigation: ['Trang chủ', 'Star', 'Đời sống', 'Ăn - Quẩy - Đi', 'Công nghệ'], scene: 'city', headline: 'Một góc phố quen, một trải nghiệm mới trong ngày cuối tuần' },
  soha: { wordmark: 'SOHA', accent: '#1b5c89', section: 'THỜI SỰ', scene: 'city', navigation: ['Trang chủ', 'Thời sự', 'Kinh doanh', 'Đời sống', 'Công nghệ'] },
  afamily: { wordmark: 'aFamily', accent: '#cb3465', section: 'ĐỜI SỐNG', scene: 'living', navigation: ['Trang chủ', 'Đời sống', 'Nhà đẹp', 'Sức khỏe', 'Ăn ngon'], headline: 'Những góc nhỏ làm nên một ngôi nhà nhiều cảm hứng' },
  'phu-nu-viet-nam': { wordmark: 'PHỤ NỮ VIỆT NAM', accent: '#a92c62', section: 'CUỘC SỐNG', scene: 'living', navigation: ['Trang chủ', 'Xã hội', 'Gia đình', 'Sức khỏe', 'Đời sống'] },
  giadinh: { wordmark: 'Gia đình & Xã hội', accent: '#267764', section: 'GIA ĐÌNH', scene: 'living', navigation: ['Trang chủ', 'Xã hội', 'Gia đình', 'Sức khỏe', 'Đời sống'] },
  gamek: { wordmark: 'GAMEK', accent: '#d3292f', ink: '#24262c', section: 'GAME', scene: 'technology', navigation: ['Trang chủ', 'Game online', 'PC / Console', 'Mobile', 'Cộng đồng'], headline: 'Cộng đồng khám phá những trải nghiệm mới trong thế giới game' },
  genk: { wordmark: 'GenK', accent: '#ca252b', ink: '#292b30', section: 'CÔNG NGHỆ', scene: 'technology', navigation: ['Trang chủ', 'Công nghệ', 'Đồ chơi số', 'Khoa học', 'AI'], headline: 'Công nghệ mới đưa những ý tưởng của tương lai vào đời sống' },
  autopro: { wordmark: 'AutoPro', accent: '#c42028', ink: '#22272c', section: 'XE VÀ ĐỜI SỐNG', scene: 'motoring', navigation: ['Trang chủ', 'Tin mới', 'Đánh giá xe', 'Trải nghiệm', 'Tư vấn'], headline: 'Một hành trình mới bắt đầu từ những lựa chọn thông minh' },
  'thanh-nien': { wordmark: 'Thanh Niên', accent: '#176ca4', section: 'ĐỜI SỐNG', scene: 'city', navigation: ['Trang chủ', 'Thời sự', 'Thế giới', 'Kinh tế', 'Đời sống'] },
  'tuoi-tre': { wordmark: 'Tuổi Trẻ', accent: '#d1262d', section: 'KINH DOANH', scene: 'city', navigation: ['Trang chủ', 'Thời sự', 'Thế giới', 'Kinh doanh', 'Nhịp sống'] },
  vneconomy: { wordmark: 'VnEconomy', accent: '#243d74', section: 'KINH TẾ', navigation: ['Trang chủ', 'Kinh tế', 'Tài chính', 'Doanh nghiệp', 'Công nghệ'] },
}

export function publisherNewsContext(publisherId: string, label: string): PublisherNewsContext {
  return { ...financial, wordmark: label, ...contexts[publisherId] }
}
