# Original User Request

## 2026-10-17T01:42:33Z

Build a personal web application in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads` (updating both the React/TypeScript application under `src/` and providing a self-contained standalone `demo-app.html` in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`) that clones the Ad Preview section (`Khung xem trước` + `Nội dung quảng cáo`) of `https://go.noti.vn/cong-cu/xem-truoc-quang-cao` with 1:1 visual and functional fidelity, extended with `Zalo Ads`, `LinkedIn Ads`, and `Admicro` placements, while minimizing unnecessary decorative icons. Iteratively inspect, compare, and refine the live application in a real browser against `https://go.noti.vn/cong-cu/xem-truoc-quang-cao` until every platform, placement, device frame, safe-zone overlay, interactive feature, and validation rule matches accurately.

Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads
Integrity mode: development

## Reference Material & Existing Assets

- **Target Reference URL**: `https://go.noti.vn/cong-cu/xem-truoc-quang-cao`
- **Extracted Source Bundle & Specs**:
  - `C:\Users\PC\.gemini\antigravity\brain\f696ce27-5926-4d7a-8538-f2973317f140\.system_generated\steps\26\output.txt` (Full extracted `AdPreviewTool` source code, placement specs, device frame dimensions, and renderers from `go.noti.vn`)
  - `C:\Users\PC\.gemini\antigravity\brain\34b54d25-8f2b-4148-b882-63fbbaaaebfb\.system_generated\steps\203\output.txt` & `steps/209/output.txt` (Full live DOM dump, computed CSS variables, and SVG paths from `go.noti.vn`)
  - `C:\Users\PC\.gemini\antigravity\brain\34b54d25-8f2b-4148-b882-63fbbaaaebfb\.system_generated\steps\54\media_0.png` & `steps/88/media_0.png` (Reference 1600×1050 screenshots of `go.noti.vn`)
- **Existing Prototype**:
  - `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`

## Requirements

### R1. 1:1 Visual & Structural Clone of `go.noti.vn` Ad Preview Workspace
Replicate the two-column workspace (`lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`), design tokens (`--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`), left-hand `Nội dung quảng cáo` editor (dashed default inputs that turn solid on edit, multi-file carousel upload support up to 10 files, brand name, `@handle`, destination URL, CTA selector, avatar upload, primary text, headline, description, and collapsible platform-specific overrides for Google Search, GDN, YouTube, ChatGPT, Zalo Ads, LinkedIn Ads, Admicro), and right-hand sticky `Khung xem trước` glass card.

### R2. Complete Multi-Platform & Multi-Placement Mockups (8 Original + 3 Extended Platforms)
Support all 8 original `go.noti.vn` platforms (`Facebook` 10 placements, `Instagram` 3, `Threads` 1, `TikTok` 2, `YouTube` 6, `Google Tìm kiếm` 2, `Google Hiển thị` 8, `ChatGPT` 2) plus 3 additional platforms (`Zalo Ads` 4 placements, `LinkedIn Ads` 4 placements, `Admicro` 4 placements). Render every placement inside proportional `iPhone 15 / 16 (393 × 852)` or `Desktop Chrome (1920 × 1080, viewport 1920 × 945)` frames, supporting both single-placement view and the `"Tất cả vị trí"` 2-column multi-frame comparison grid.

### R3. Interactive Toolbar, Safe-Zone Overlays, Language Toggle, Zoom Modal & Live Validation
Provide the `Tiếng Việt` / `English` platform UI language toggle (switching in-mockup labels between Vietnamese and English), `Vùng bị che` safe-zone overlays (red danger zones + orange dynamic expansion zones for vertical 9:16 video placements), `Giao diện app` toggle, `TopView` (`0-3 giây đầu` / `Sau 3 giây`) toggle, `Phóng to` zoom modal, `Toàn màn hình` view, live `Kiểm tra vị trí này` character/media validation, and the `Thông số chính thức` specification card with collapsible sources.

### R4. Minimal Decorative Iconography & Dual Deliverable Sync
Avoid unnecessary decorative icons on form inputs, helper banners, and buttons (retaining only platform logos and essential native app mockup chrome). Keep both the React/Vite codebase in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\` and the standalone HTML build (`c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`) synchronized so the user can open the web app directly or via Vite. Note: shell command execution (`run_command`) is disabled by user policy in this environment, so perform all file edits via file tools and all testing/verification via browser tools.

## Acceptance Criteria

### Visual & Functional Fidelity
- [ ] All 11 platforms (`Facebook`, `Instagram`, `Threads`, `TikTok`, `YouTube`, `Google Tìm kiếm`, `Google Hiển thị`, `ChatGPT`, `Zalo Ads`, `LinkedIn Ads`, `Admicro`) and all 46 placements render without layout overflow, broken styles, or console errors at `1600×1050` and mobile viewports.
- [ ] Left-hand `Nội dung quảng cáo` editor updates all active previews, character counters, truncation previews (`... Xem thêm`), platform-specific overrides (Google Search sitelinks/paths, YouTube/GDN/ChatGPT custom headlines & CTAs), and warning badges (`1 cảnh báo` / `Không có lỗi`) in real time.
- [ ] Uploading 1 image/video updates the media box across all placements; uploading multiple images/videos (2–10 files) renders an interactive carousel preview on supported feed placements.
- [ ] `"Tất cả vị trí"` renders a 2-column grid of proportional device frames for all placements of the selected platform.
- [ ] `Tiếng Việt` / `English` toggle switches the in-mockup platform UI labels (`Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, `Thích / Bình luận / Chia sẻ` ↔ `Like / Comment / Share`, etc.).
- [ ] `Phóng to` opens a dedicated high-resolution zoom modal of the active device mockup, and `Toàn màn hình` opens a full-viewport workspace view.
- [ ] Decorative icons (pulsing input pencils, decorative shield icons, etc.) are omitted.

### Browser Verification Loop
- [ ] Browser-driven inspection verifies computed styles, layout geometry, interactive controls, and screenshots of the web app against `https://go.noti.vn/cong-cu/xem-truoc-quang-cao` across all 11 platform tabs and confirms zero console/runtime errors.
