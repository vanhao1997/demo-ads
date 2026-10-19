# Quy chuẩn Dự án: Công cụ Xem trước Quảng cáo Đa nền tảng (P2P Digital)

## 1. Nhận diện Thương hiệu & Phong cách Minimalist Monochrome (`p2pdigital.vn`)
- Tên thương hiệu mặc định: `P2P Digital` (handle: `@p2pdigital`, URL: `https://p2pdigital.vn/`, mã ưu đãi: `P2P2026`).
- Không sử dụng tên thương hiệu cũ (`Noti`, `noti.vn`, `NOTI2026`) ở bất kỳ trường dữ liệu mặc định, tiêu đề hay nội dung mẫu nào.
- **Nguyên tắc Màu sắc Minimalist (Tránh rối mắt)**:
  - **Nền & Bề mặt (Monochrome 95%)**: Nền trang `#F7F8FA` phẳng (không dùng gradient/chấm bi nền), thẻ chính `#FFFFFF` viền mảnh `#E5E7EB`, thẻ phụ `#F9FAFB`, ô nhập liệu `#FAFAFA` / `#FFFFFF` (không tô nền vàng hay viền đứt nét vàng cho các ô nhập mặc định).
  - **Trạng thái Đang chọn (Unified Active State)**: Toàn bộ tab nền tảng, pill vị trí, pill định dạng và nút công cụ khi active dùng chung một tông **Charcoal Đen tuyền (`#18181B`) + Chữ trắng (`#FFFFFF`)** đồng nhất.
  - **Điểm nhấn Thương hiệu P2P (`#FAD318` / `#FAD11B`)**: Chỉ giữ làm điểm nhấn tinh tế tại biểu tượng logo P2P Digital trên thanh Header và avatar thương hiệu mặc định, không lạm dụng tô vàng hàng loạt nút hay thẻ.
  - **Thanh tiến độ & Nhãn Policy**: Thanh đo ký tự dùng màu xám nhạt `#CBD5E1` khi an toàn, chỉ chuyển đỏ `#DC2626` khi vượt giới hạn Policy; nhãn trạng thái dùng pill nền trắng kèm chấm tròn nhỏ (`6px`) thay vì các khối màu xanh/vàng/cam rực rỡ.

## 2. Iconography & Chính sách Zero Unicode Emoji
- Tuyệt đối không sử dụng ký tự Unicode Emoji (`\p{Extended_Pictographic}`, kể cả `▪` `U+25AA`; sử dụng `•` `U+2022` cho dấu đầu dòng).
- Mọi logo nền tảng và icon điều hướng trong mockup phải dùng inline SVG (`PlatformSvg`, `Icon`).
- Không gắn icon trang trí dư thừa vào nhãn form nhập liệu hoặc thông báo kiểm tra.

## 3. Bố cục Compact & Phân tách Cột Trái / Cột Phải
- **Cột trái (`Nội dung quảng cáo`)**:
  - Giữ thiết kế compact (chiều cao input `h-9`, gộp `Ảnh / video` và `Logo đại diện` trên cùng một hàng 2 cột, đặt nút `Mặc định` ở góc phải tiêu đề).
  - Phần 1: Các trường nội dung chung (`brand`, `handle`, `url`, `cta`, `primaryText`, `headline`, `description`).
  - Phần 2: Khung `Tối ưu riêng cho [Nền tảng]` (`[data-testid="platform-specific-editor"]`) tự động hiển thị các trường nội dung chuyên biệt theo đúng `activePlatform` đang chọn.
  - Không đặt các dropdown chuyển đổi chế độ hiển thị/định dạng trùng lặp với cột phải.
- **Cột phải (`Khung xem trước`)**:
  - Thanh chọn 11 nền tảng bố trí dạng lưới compact (`grid-cols-4 sm:grid-cols-6`).
  - Hàng công cụ định dạng (Row 2B) quản lý trạng thái định dạng (`adFormat`), tiện ích (`tiktokAddon`), tài sản tìm kiếm (`googleAssetMode`), và danh tính (`tiktokIdentity`, `zaloIdentity`).

## 4. Chống chồng chéo Lớp phủ Xem trước (Preview Mutual Exclusion)
- Không hiển thị đồng thời các nhãn tương tác phía trên của TikTok (`voting_sticker`, `countdown_sticker`, `gift_code`, `pop_out_showcase`, `super_like`) khi đang kích hoạt thẻ định dạng tương tác giữa màn hình (`poll_interactive`, `lead_form`, `click_to_message`, `flexible`, `multi_advertiser`).
- Không hiển thị đồng thời `Display Card` và thẻ sản phẩm `TikTok Shop (VSA)`.
- Giữ đồng bộ giữa bản chạy trực tiếp `demo-app.html` và mã nguồn trong `src/`.
