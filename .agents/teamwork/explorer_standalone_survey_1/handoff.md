# Handoff Report — Standalone Prototype Survey & Iconography Audit

**Agent**: `explorer_standalone_survey_1`  
**Date**: 2026-10-17  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_standalone_survey_1`  
**Deliverable Target**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_standalone_survey_1\handoff.md`  

---

## 1. Observation

Direct observations from examining the codebase, extracted assets, prototype files, and reference screenshots:

### 1.1 Prototype File Inventory & File Locations
1. **Existing Prototype**:
   - Path: `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
   - Size: 169,656 bytes, 3,038 lines of code.
   - Technology Stack: Self-contained single-page application using CDN Tailwind (`https://cdn.tailwindcss.com`), React 18 UMD, ReactDOM 18 UMD, and Babel Standalone (`@babel/standalone/babel.min.js`), executing inside a single `<script type="text/babel">` block.
2. **Local Workspace Prototype**:
   - Path: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
   - Status: **MISSING / NOT FOUND** (`GetFileAttributesEx: The system cannot find the file specified`). The standalone file currently exists only in the brain directory and must be created/synchronized in `demo-ads`.
3. **React/TypeScript Source Code**:
   - Path: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\`
   - Key files: `src/App.tsx` (2,900 lines, 130,174 bytes), `src/styles.css` (3,419 lines, 61,489 bytes), `src/features/PlatformLogo.tsx` (121 lines), `src/features/LandingPage.tsx` (50 lines, unused in main app).

### 1.2 Extracted go.noti.vn Assets & Reference Screenshots
1. **Reference Screenshot 1 (`steps/54/media_0.png`)**:
   - Dimensions: 1600 × 1050 viewport.
   - Shows the two-column layout: Left column (`Nội dung quảng cáo`), Right column (`Khung xem trước`).
   - Left column inputs have visible pink dashed borders and pencil icons at the right side of every input.
   - Right column displays the iPhone 15/16 mockup for `Facebook · Bảng feed` with 4:5 striped placeholder media, status bar, dynamic island, bottom navigation bar, inspection alerts, and official specification card.
2. **Reference Screenshot 2 (`steps/88/media_0.png`)**:
   - Dimensions: 1600 × 1050 viewport.
   - Shows `"Tất cả vị trí"` active (selected pill in pink background with red border).
   - Displays a 2-column grid of proportional device frames comparing all 10 Facebook placements simultaneously (Feed, Video Feeds, Stories, Reels, Banner trên Reels, Video trong luồng, Marketplace, Kết quả tìm kiếm, Cột bên phải, Audience Network).
   - Safe zone overlays are active on Stories and Reels (red danger zone at top/bottom, orange caption zone).
3. **Live DOM and CSS Bundle (`steps/203/output.txt` & `steps/209/output.txt`)**:
   - Tokens extracted from `go.noti.vn`:
     ```css
     :root {
       --bg: #fff;
       --bg-subtle: #f6f6f7;
       --surface: #fff;
       --text: #101113;
       --text-muted: #5f6470;
       --border: #e7e7ea;
       --brand: #ed3c47;
       --brand-600: #d62e3a;
       --brand-050: #fdedef;
       --accent: #ff7849;
       --gradient-brand: linear-gradient(135deg, #ed3c47, #ff7849);
       --success: #16a34a;
       --success-bg: #e7f6ec;
       --danger: #e8590c;
       --danger-bg: #fbeee5;
       --glass-bg: #ffffff8c;
       --glass-border: #ffffff59;
       --glass-blur: 16px;
       --glass-saturate: 160%;
       --glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80;
       --radius-sm: 8px;
       --radius-md: 14px;
       --radius-lg: 20px;
       --shadow-soft-sm: 0 1px 2px #1011160f;
     }
     ```
   - Two-column grid class on `go.noti.vn`:
     `grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start`
   - Right-hand glass container class:
     `section.min-w-0.rounded-[var(--radius-lg)].border.glass[aria-label="Khung xem trước"]`

### 1.3 Iconography Audit (Decorative vs Essential)
From `steps/209/output.txt` and `steps/54/media_0.png`:
- **Decorative icons present in `go.noti.vn`**:
  1. Pulsing input pencil icons: `<svg viewBox="0 0 24 24" width="14" height="14" class="... text-brand motion-safe:animate-pulse"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/></svg>`. Present on:
     - Notice banner (`Ô viền nét đứt đang hiện nội dung mặc định...`)
     - Tên thương hiệu input (`#ap-brand`)
     - @Tên tài khoản input (`#ap-handle`)
     - Đường dẫn đích input (`#ap-url`)
     - Logo / ảnh đại diện row
     - Văn bản chính textarea (`#ap-primary`)
     - Tiêu đề input (`#ap-headline`)
     - Mô tả input (`#ap-desc`)
     - Google Sitelinks textarea (`#ap-sitelinks`)
  2. Upload box shield icon: `<svg width="12" height="12" class="text-success"><path d="M12 22s8-3.5 8-10V5.5L12 2 4 5.5V12c0 6.5 8 10 8 10Zm-3-10 2 2 4-4"/></svg>` next to "Tệp chỉ nằm trong trình duyệt của bạn".
  3. Upload button icon: `<svg width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>` inside "Chọn tệp".
  4. Reset button circular arrow: `<svg width="16" height="16"><path d="M3 2v6h6M3.51 9a9 9 0 1 0 2.13-3.36L3 8"/></svg>` inside "Về nội dung mặc định".
  5. Placement selector pill device icons: Mobile phone `<svg width="13" height="13"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm5 16h.01"/></svg>`, Desktop monitor `<svg width="13" height="13"><path d="M3 4h18..."></path></svg>`, Grid icon `<svg width="13" height="13"><path d="M3 3h7..."></path></svg>`.
  6. Toolbar icons: Magnifying glass `<svg width="13" height="13"><path d="M11 19a8 8 0 1 0..."></path></svg>` before "Phóng to", Expand `<svg>` before "Toàn màn hình".
  7. Caption phone icon: `<svg width="12" height="12">` before "iPhone 15 / 16...".
- **Observed in `demo-app.html`**:
  - The pulsing input pencil icons have been completely omitted.
  - The shield icon and upload icon have been omitted.
  - The device icons on placement pills have been omitted.
  - Platform logos (Facebook, Instagram, Threads, TikTok, YouTube, Google, ChatGPT, Zalo, LinkedIn, Admicro) are preserved as 18×18 currentColor SVGs.
  - Essential native chrome icons (iPhone signal, wifi, battery; Chrome tabs and controls) are preserved.
- **Observed in `src/features/PlatformLogo.tsx`**:
  - `chatgpt`, `linkedin`, and `admicro` lack SVGs in `PLATFORM_BRAND_ASSET_IDS` and fall back to plain text labels (`FALLBACK_LABELS`), whereas `demo-app.html` includes inline SVG paths for all three.

### 1.4 Zoom Modal Defect in `demo-app.html`
- In `demo-app.html` lines 2829–2836:
  ```jsx
  {!showAll && (
    <button
      type="button"
      onClick={() => setShowAll(true)}
      className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e7e7ea] bg-white px-3 text-xs font-semibold text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
    >
      Phóng to
    </button>
  )}
  ```
- **Defect**: Bấm `Phóng to` chỉ gọi `setShowAll(true)` (chuyển sang chế độ lưới "Tất cả vị trí"), thay vì mở một Zoom Modal riêng biệt phóng to thiết bị đang chọn.

---

## 2. Logic Chain

### Step 2.1: Layout Geometry & Column Grid Isolation
1. **Premise**: In CSS Grid, grid tracks default to `minmax(auto, 1fr)`.
2. **Observation**: Mockup frames have fixed intrinsic dimensions (iPhone frame is 411×870; Desktop Chrome is 1920×1080).
3. **Inference**: If a column uses `auto` minimum sizing, large child elements force the column track to expand, causing horizontal scrolling and breaking responsive containment.
4. **Conclusion**: The column definition `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` on the parent container (with `min-w-0` on both child sections) is mandatory to force CSS Grid tracks to truncate and allow `AutoScaler`'s `ResizeObserver` to correctly compute the available container width.
5. In `src/styles.css`, line 656 currently specifies `grid-template-columns: minmax(380px, 5fr) minmax(0, 7fr);`. This should be aligned to `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` to match `go.noti.vn` exactly at all screen breakpoints.

### Step 2.2: Iconography De-cluttering (Requirement R4)
1. **Premise**: Requirement R4 explicitly mandates: "Avoid unnecessary decorative icons on form inputs, helper banners, and buttons (retaining only platform logos and essential native app mockup chrome)."
2. **Observation**: In `go.noti.vn`, 9 separate form inputs render pulsing pink pencil icons (`motion-safe:animate-pulse`), which animate continuously and add visual noise. Additionally, buttons contain non-essential upload and reset glyphs.
3. **Inference**:
   - The pink dashed border (`border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`) and placeholder text already clearly indicate unedited default state.
   - Button text labels ("Chọn tệp", "Về nội dung mặc định", "Phóng to", "Toàn màn hình") are completely unambiguous without accompanying glyphs.
   - Removing these icons reduces DOM node count, eliminates continuous CSS keyframe animations, and prevents visual clutter.
4. **Conclusion**:
   - **MUST REMOVE**:
     - All pulsing pencil icons on inputs, textareas, and notice banner.
     - Green shield icon next to the browser-only privacy notice.
     - Upload icon inside the "Chọn tệp" button.
     - Circular reset icon inside "Về nội dung mặc định".
     - Phone/monitor/grid device icons in placement pills.
     - Decorative icons on toolbar buttons.
   - **MUST RETAIN**:
     - Platform Logos: 18×18 monochrome SVGs for all 11 platforms (`facebook`, `instagram`, `threads`, `tiktok`, `youtube`, `google_search`, `gdn`, `chatgpt`, `zalo`, `linkedin`, `admicro`).
     - Native App Chrome: iPhone 15/16 status bar (cellular signal, Wi-Fi arcs, battery pill with percentage charge), Dynamic Island (126×37), Home Indicator bar (134×5); Chrome tab header, address bar, navigation arrows, window action controls; Native social media interaction controls (like, comment, share, bookmark, TikTok rail, YouTube player timeline/skip button).

### Step 2.3: Device Frame Scaling Physics & Sticky Stage
1. **Premise**: Device frames must render with exact native aspect ratios without distorting mockup typography.
2. **Observation**:
   - iPhone 15/16 frame: outer width 411px, outer height 870px, screen 393×852px, border-radius 64px, inner screen radius 55px.
   - Desktop Chrome frame: outer width 1920px, chrome header 88px (41px tab bar + 47px toolbar), viewport 1920×945px.
3. **Mechanism**: `AutoScaler` monitors the container's `clientWidth` via `ResizeObserver`.
   - Calculates `scale = Math.max(0.05, Math.min(maxScale, clientWidth / width, maxHeight / height))`.
   - Applies CSS `transform: scale(${scale})` with `transformOrigin: "left top"`.
   - Sets wrapper element dimensions to `Math.floor(width * scale)` and `Math.floor(height * scale)`.
4. **Conclusion**: This ensures zero layout shifts, zero letterboxing, and exact physical proportionality across both single view and the 2-column `"Tất cả vị trí"` comparison grid.

### Step 2.4: Rectifying the Zoom Modal Defect
1. **Premise**: Requirement R3 requires: "`Phóng to` opens a dedicated high-resolution zoom modal of the active device mockup".
2. **Defect**: In `demo-app.html`, `onClick={() => setShowAll(true)}` wrongly toggles multi-placement grid view instead of opening a zoom modal.
3. **Rectification**:
   - Implement dedicated state `isZoomModalOpen` (boolean).
   - In single placement view, clicking "Phóng to" sets `setIsZoomModalOpen(true)`.
   - Render a high-resolution modal overlay:
     ```jsx
     {isZoomModalOpen && (
       <div
         role="dialog"
         aria-modal="true"
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
         onClick={() => setIsZoomModalOpen(false)}
       >
         <div
           className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center justify-center"
           onClick={(e) => e.stopPropagation()}
         >
           <button
             type="button"
             onClick={() => setIsZoomModalOpen(false)}
             className="absolute -top-12 right-0 flex h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 text-xs font-semibold text-white hover:bg-white/30"
           >
             Đóng (Esc) ✕
           </button>
           <PlacementPreview
             state={state}
             placement={currentPlacement}
             showSafeZone={showSafeZone}
             showAppUi={showAppUi}
             tiktokLatePhase={tiktokLatePhase}
             maxHeight={window.innerHeight * 0.85}
             maxScale={1.1}
             isGrid={false}
           />
         </div>
       </div>
     )}
     ```
   - Add keyboard listener for `Escape` to close modal.

### Step 2.5: Synchronization Strategy between React/TS and Standalone HTML
1. **Premise**: Both the Vite application in `src/` and the self-contained standalone `demo-app.html` must remain synchronized 100%.
2. **Analysis**:
   - `src/` is a modular TypeScript codebase with multiple features (`catalog/`, `domain/`, `features/`, `media/`, `storage/`).
   - `demo-app.html` is an all-in-one HTML deliverable intended for instant double-click viewing in any browser without build tooling or Node.js.
   - Any updates to:
     - Platform matrix (11 platforms, 46 placements)
     - Safe zone definitions (Stories 14%/35%, Reels 14%/35%, TikTok 160/440/80/120, YouTube Shorts 288/672/48/192)
     - Character limits, truncation points, and validation rules
     - CSS variables and design tokens (`#ed3c47`, `#fdedef`, `#f6f6f7`, `#e7e7ea`)
     Must be maintained in both codebases.
3. **Execution Plan**:
   - Provide an identical `demo-app.html` in both `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`.
   - Update `src/features/PlatformLogo.tsx` to include the SVGs for ChatGPT, LinkedIn, and Admicro.
   - Align `src/styles.css` workbench grid layout with `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`.

---

## 3. Caveats

1. **Local Filesystem Isolation**:
   - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` was not present initially. Any standalone HTML updates must ensure this file is created in `demo-ads` as well as mirrored to the brain directory.
2. **Shell Command Restriction**:
   - Terminal command execution (`run_command`) is disabled by policy in this workspace. All code verification and regression checks must be conducted through browser tools (`read_browser_page`, `view_file`).
3. **Carousel File Limit**:
   - While `go.noti.vn` supports multi-file upload for carousel testing (up to 10 cards), in local `demo-app.html` standalone mode, handling multiple files via `URL.createObjectURL` requires maintaining an array of blobs in React state rather than a single `mediaUrl`.
4. **Third-party CDN Availability**:
   - Standalone `demo-app.html` relies on unpkg/CDN for React 18, Babel Standalone, and Tailwind CDN. If opened in an environment without internet access, these external CDN scripts would fail to load unless inlined or bundled. For development mode in this environment, CDN access is available.

---

## 4. Conclusion

1. **Prototype Architecture Assessment**:
   The existing standalone prototype `demo-app.html` in `brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` provides a solid foundation containing all 11 platforms and 46 placements, accurate viewport geometry (iPhone 15/16 393×852, Chrome 1920×945), and exact design tokens matching `go.noti.vn`.
2. **Key Defects Identified & Targeted for Resolution**:
   - **Missing Local Deliverable**: `demo-app.html` is completely missing from `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`.
   - **Zoom Modal Bug**: "Phóng to" currently triggers `setShowAll(true)` instead of rendering a dedicated high-resolution zoom modal overlay.
   - **Missing SVGs in TypeScript codebase**: `src/features/PlatformLogo.tsx` lacks SVG logos for ChatGPT, LinkedIn, and Admicro, falling back to plain text labels.
   - **Iconography Cleanup (R4)**: Decorative pulsing pencil icons, upload icons, shield badges, and button icons must remain strictly removed in both React/TS and standalone HTML deliverables.
   - **Grid Spec Inconsistency**: `src/styles.css` has `grid-template-columns: minmax(380px, 5fr) minmax(0, 7fr);` which must be updated to `minmax(0, 5fr) minmax(0, 7fr)`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Missing File in demo-ads**:
   - Run `find_by_name` on `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\` with pattern `*demo-app.html*`. Confirm 0 results.
2. **Verify Prototype Tokens & Structure**:
   - View `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` lines 38–62 (`:root` tokens) and lines 102–495 (`PLATFORMS` and `PLACEMENTS` definitions).
3. **Verify Zoom Modal Defect**:
   - Inspect line 2831 in `demo-app.html`: confirm `onClick={() => setShowAll(true)}`.
4. **Verify PlatformLogo Fallbacks in TypeScript**:
   - View `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\PlatformLogo.tsx` lines 46–50: confirm `FALLBACK_LABELS` used for `chatgpt`, `linkedin`, and `admicro`.
5. **Verify Reference Visuals**:
   - Inspect screenshot `steps/54/media_0.png` (single view) and `steps/88/media_0.png` (all placements 2-column grid view) to confirm layout alignment.
