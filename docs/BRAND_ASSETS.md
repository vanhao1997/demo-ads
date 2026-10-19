# Brand assets và icon guideline

Mục tiêu: dùng icon/logo đủ rõ cho target picker, source drawer và preview,
nhưng giữ ranh giới giữa UI chrome của Adcraft và brand skin của quảng cáo.

Nguồn tham chiếu chính: [Noti SVG library](https://go.noti.vn/icon/svg),
registry ID `E18`, kiểm tra ngày 12/10/2026.

## 1. Quyết định đã khóa

- UI icon dùng thư viện hiện có trong app (`lucide-react`) hoặc asset nội bộ
  đã review; không vẽ lại icon thủ công khi có icon chuẩn.
- Brand logo dùng file local đã bundle, không fetch runtime từ Noti/CDN.
- Platform logo chỉ xuất hiện ở target/platform context; không dùng làm trang trí
  tùy tiện trong preview creative.
- Logo/brand mark trong preview phải là asset người dùng chọn hoặc fallback
  text rõ ràng. Không tự tạo logo thương hiệu thiếu nguồn.
- Admicro hiện chưa có logo trong inventory Noti đã kiểm tra; dùng text fallback
  `Admicro` cho catalog/slot label cho tới khi có asset được duyệt.
- Brand/trademark guideline của từng platform vẫn áp dụng dù source page ghi
  license cho icon. `CC0`/Simple Icons không tự cấp quyền dùng thương hiệu trong
  mọi ngữ cảnh quảng cáo.

## 2. Asset manifest

Mỗi asset bundle cần manifest versioned:

```text
BrandAsset
  id: brand.facebook | brand.instagram | ...
  label
  file
  sourceRefIds: [E18]
  sourceUrl
  licenseNote
  trademarkStatus: review_required | approved_for_internal | restricted
  variants: monochrome | color | inverse
  viewBox
  sha256
  altText
  checkedAt
```

Bundle tối thiểu cần khảo sát từ E18:

- Facebook
- Instagram
- Threads
- TikTok
- YouTube
- Google / Google Ads
- Zalo

Không ghi manifest “approved” khi chưa có review nội bộ. Hash giúp phát hiện
asset bị đổi ngoài plan; không cần đưa hash vào UI.

## 3. Quy tắc sử dụng trong UI

- Icon button: 16/18/20 px tùy control; mọi icon-only control có accessible
  name và tooltip/focus label khi ý nghĩa không hiển nhiên.
- Platform tabs: logo 18-20 px, label text vẫn hiển thị; không dựa màu/logo
  để truyền trạng thái.
- Target cards: platform logo + product/placement text + evidence badge.
- Source drawer: icon nguồn là metadata, không làm người dùng nhầm với trạng
  thái verified.
- Dark/light surface: dùng variant được review; không tự áp CSS filter làm
  biến dạng brand mark.
- Preview creative: tôn trọng kích thước và crop mà target mô phỏng; logo user
  là asset content, khác platform chrome.
- Fallback: nếu asset lỗi/thiếu, hiển thị tên thương hiệu bằng text và trạng
  thái `asset unavailable`; không hiển thị broken image.

## 4. Tách UI chrome và ad preview skin

Adcraft có workspace operational green, Manrope và metadata mono theo
[design guideline](../design.md). Platform-specific visual skin chỉ nằm trong
renderer preview. Không làm toàn app giống Facebook/TikTok/Zalo; target picker
phải giữ hierarchy và state nhất quán.

Các surface cần asset:

| Surface | Asset policy |
|---|---|
| Header/rail | UI icon local; không brand logo platform |
| Platform tabs | local platform logo + text |
| Target cards | logo + evidence/status text |
| Feed preview | identity logo/avatar user cung cấp hoặc text fallback |
| Zalo Form | avatar/cover user cung cấp; không lấy avatar giả |
| Admicro publisher | text/publisher mark chỉ khi có nguồn; default text fallback |
| Export manifest | asset ID/hash/source metadata, không embed nguồn remote |

## 5. Download, review và licensing gate

Trước khi code bundle:

1. Chọn đúng SVG cần dùng từ E18.
2. Lưu file local cùng manifest và source URL.
3. Kiểm tra viewBox, raster fallback và contrast trên nền sáng/tối.
4. Ghi license note và trademark status.
5. Review accessibility name và fallback.
6. Chạy visual fixture desktop/mobile và export.

Không copy toàn bộ thư viện nếu app chỉ dùng vài logo. Không nhúng remote SVG
trực tiếp vào HTML vì runtime availability và supply chain không ổn định.

Acceptance tham chiếu: `D04-D06`, `A01-A04`, `R01-R02`.

Bundle hiện tại có bảy SVG local từ `simple-icons@15.15.0` cùng source URL,
license note và SHA-256 trong `src/assets/brands/manifest.ts`; E18 chỉ là
inventory reference. Trademark review vẫn mở (`review_required`), không coi
việc bundle/hash là quyền sử dụng thương hiệu đã được phê duyệt.
