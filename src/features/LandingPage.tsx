import { Grid2X2, Layers3, ListChecks, LockKeyhole, ScanSearch, ShieldCheck } from 'lucide-react'
import './landingPage.css'

const features = [
  ['Vùng an toàn có số đo', 'Vùng bị che vẽ theo hướng dẫn của Meta, TikTok và YouTube, tô đỏ phần luôn bị che và tô cam phần bị che thêm khi chú thích dài.', ShieldCheck],
  ['Đánh dấu vùng video bị che', 'Tô vùng giao diện che trên từng vị trí để bạn tự kiểm tra chữ, logo và sản phẩm trước khi chạy quảng cáo.', ScanSearch],
  ['Đủ vị trí hiển thị', 'Bảng feed, Stories, Reels, Marketplace, kết quả tìm kiếm, cột bên phải, video trong luồng, Audience Network, Shorts, In-Feed, TopView, Google Search và Display.', Layers3],
  ['Đếm ký tự đúng cách nền tảng đếm', 'Chữ Việt có dấu và emoji được đếm là một ký tự như người đọc thấy; Google đếm chữ Hàn, Nhật, Trung là hai, đúng quy định.', ListChecks],
  ['Xem tất cả vị trí một lần', 'Chế độ lưới đặt mọi vị trí của một nền tảng cạnh nhau, kèm số lỗi từng vị trí, để chọn bộ tài nguyên dùng được cho nhiều chỗ nhất.', Grid2X2],
  ['Không gửi gì đi đâu', 'Ảnh và video chỉ nằm trong trình duyệt. Không tải tệp lên, không lưu lại gì khi đóng hoặc tải lại trang.', LockKeyhole],
] as const

const placementGroups = [
  ['Facebook', ['Bảng feed', 'Video Feeds', 'Stories', 'Reels', 'Banner trên Reels', 'Video trong luồng', 'Marketplace', 'Kết quả tìm kiếm', 'Cột bên phải', 'Audience Network']],
  ['Instagram', ['Bảng feed', 'Stories', 'Reels']],
  ['Threads', ['Bảng feed']],
  ['TikTok', ['In-Feed', 'TopView']],
  ['YouTube', ['Trong luồng', 'Bumper 6 giây', 'Trong nguồn cấp', 'Shorts']],
  ['Google Search', ['Di động', 'Máy tính']],
  ['Google Display', ['300x250', '336x280', '728x90', '300x600', '160x600', '320x100', '320x50', 'Native trong bài viết']],
  ['ChatGPT', ['Web', 'Ứng dụng di động']],
  ['Zalo Ads', ['Nhật ký Zalo', 'Zalo Video', 'Tin nhắn OA', 'Báo Mới']],
  ['LinkedIn Ads', ['Bảng tin Di động', 'Bảng tin Máy tính', 'Tin nhắn tài trợ', 'Spotlight']],
  ['Admicro', ['CafeF (PC)', 'Kenh14 (Mobile)', 'VnExpress (Masthead PC)', 'Dân trí (In-Page Mobile)']],
] as const

export function LandingPage({ heroOnly = false }: { heroOnly?: boolean; hideHero?: boolean } = {}) {
  if (heroOnly) return null
  return (
    <div id="p2p-landing" className="p2p-landing">
      <section className="landing-section landing-section-tint" aria-labelledby="landing-feature-title">
        <span className="landing-kicker">TÍNH NĂNG</span>
        <h2 id="landing-feature-title">Thấy đúng thứ người xem sẽ thấy</h2>
        <p>Mỗi vị trí đọc giới hạn ký tự, tỉ lệ khung và vùng an toàn từ hướng dẫn của chính nền tảng đó.</p>
        <div className="landing-card-grid two">
          {features.map(([title, body, Icon]) => <article className="landing-card" key={title}><span className="landing-icon"><Icon size={19} /></span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="landing-placement-title">
        <span className="landing-kicker">VỊ TRÍ HỖ TRỢ</span>
        <h2 id="landing-placement-title">Mười một nền tảng, đủ vị trí hiển thị đang chạy được</h2>
        <p>Danh sách này đọc từ cùng bộ thông số với công cụ - vị trí nào có ở đây thì có mockup và có kiểm tra.</p>
        <div className="landing-placement-grid">
          {placementGroups.map(([name, placements]) => <article className="landing-placement-card" key={name}><h3>{name}</h3><ul>{placements.map((placement) => <li key={placement}><span />{placement}</li>)}</ul></article>)}
        </div>
      </section>

      <footer className="landing-footer"><div><strong>P2P Digital</strong><span>Ad Preview Studio cho đội ngũ Marketing</span></div><div><span>Local MVP · Không upload media</span><span>p2pdigital.vn</span></div></footer>
    </div>
  )
}
