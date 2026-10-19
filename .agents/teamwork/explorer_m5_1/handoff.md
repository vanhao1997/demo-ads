# Handoff Report: Standalone HTML Asset & Delta Survey (Milestone M5)

**Agent**: `explorer_m5_1`  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_1`  
**Date**: 2026-10-17  
**Recipient**: Project Orchestrator (`853b94d8-915a-4180-baf9-463270ce3714`) & Downstream Implementation Worker (`worker_m5_1`)

---

## 1. Observation

### 1.1 Existing Standalone HTML Files & Deliverable Existence
1. **Workspace Standalone HTML**:
   - Path: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
   - Status: **MISSING / DOES NOT EXIST** (`GetFileAttributesEx: The system cannot find the file specified`).
2. **Brain Prototype Standalone HTML**:
   - Path: `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
   - Status: **EXISTS** (3,038 lines, 169,656 bytes, UTF-8 text/babel single-file web application using Tailwind CDN, React 18 UMD, ReactDOM 18 UMD, and Babel Standalone).
3. **E2E Test Suite Target Configurations**:
   - `tests/e2e-suite.html:58-60`:
     - Option 1: `<option value="../demo-app.html">Local: ../demo-app.html</option>`
     - Option 2: `<option value="../../brain/7b0b102b-4a94-4be4-b9d2-bcb4488c9b59/scratch/demo-app.html">Brain Prototype: demo-app.html</option>`
     - Option 3: `<option value="http://localhost:5173/">Vite Dev Server: http://localhost:5173/</option>`

---

### 1.2 Placement Catalog Delta (34 vs 46 Canonical Placements)

| Metric | Original go.noti.vn | Current `src/` Codebase | Brain Prototype `demo-app.html` | Delta & Alignment |
|---|:---:|:---:|:---:|---|
| **Platform Count** | 8 | 11 | 11 | Complete alignment on 11 platforms |
| **Placement Count** | 34 | 46 | 46 | Complete catalog alignment (34 original + 12 extended) |
| **Facebook Placements** | 10 | 10 (`facebook.feed` to `facebook.audience_network`) | 10 (`fb_feed` to `fb_audience_network`) | Matched 1:1; ID aliases supported |
| **Instagram Placements** | 3 | 3 (`instagram.feed`, `stories`, `reels`) | 3 (`ig_feed`, `ig_stories`, `ig_reels`) | Matched 1:1; ID aliases supported |
| **Threads Placements** | 1 | 1 (`threads.feed`) | 1 (`threads_feed`) | Matched 1:1; ID aliases supported |
| **TikTok Placements** | 2 | 2 (`tiktok.in_feed`, `tiktok.topview`) | 2 (`tt_infeed`, `tt_topview`) | Matched 1:1; ID aliases supported |
| **YouTube Placements** | 6 | 6 (`youtube.skippable` to `shorts`) | 6 (`yt_instream_skippable` to `yt_shorts`) | Matched 1:1; ID aliases supported |
| **Google Search Placements** | 2 | 2 (`google.search.mobile`, `desktop`) | 2 (`gs_mobile`, `gs_desktop`) | Matched 1:1; ID aliases supported |
| **Google Display (GDN)** | 8 | 8 (7 dimensions + `native_in_article`) | 8 (7 dimensions + `gdn_native`) | Matched 1:1; ID aliases supported |
| **ChatGPT Placements** | 2 | 2 (`chatgpt.chat_card.web`, `mobile`) | 2 (`chatgpt_web`, `chatgpt_mobile`) | Matched 1:1; ID aliases supported |
| **Zalo Ads (Extended)** | 0 | 4 (`zalo.timeline`, `video`, `message`, `article`) | 4 (`zalo_timeline`, `zalo_video`, `zalo_message`, `zalo_article`) | Matched 1:1; ID aliases supported |
| **LinkedIn Ads (Extended)** | 0 | 4 (`linkedin.mobile_feed`, `desktop_feed`, `message`, `spotlight`) | 4 (`li_mobile_feed`, `li_desktop_feed`, `li_message`, `li_spotlight`) | Matched 1:1; ID aliases supported |
| **Admicro (Extended)** | 0 | 4 (`admicro.cafef_pc`, `kenh14_mobile`, `vnexpress_pc`, `dantri_mobile`) | 4 (`admicro_cafef_pc`, `admicro_kenh14_mobile`, `admicro_vnexpress_pc`, `admicro_dantri_mobile`) | Matched 1:1; ID aliases supported |
| **"Tất cả vị trí" Grid on Extended** | N/A | Enabled for all 11 platforms | Enabled for all 11 platforms (lines 2760-2772, 2870-2907) | Matched; earlier Admicro filter removed |

---

### 1.3 Detailed Features 26–33 Delta Matrix

#### Feature 26: Bilingual UI Toggle (VI / EN)
- **`src/` Implementation**:
  - `src/features/translations.ts:11-55`: Definitive dictionary mappings for all 18 canonical CTAs (`CANONICAL_CTA_MAP`), sponsored labels for all 11 platforms (`SPONSORED_LABELS`), and read-more labels (`SEE_MORE_LABELS`).
  - `src/App.tsx:3316-3343`: Renders segmented button group `role="group" aria-label="Ngôn ngữ giao diện nền tảng"` with `Tiếng Việt` and `English` buttons.
  - Active button carries class `bg-white active text-[#101113] shadow-sm`.
  - When switched to `en`, in-mockup labels update dynamically:
    - Sponsored: `Được tài trợ` ↔ `Sponsored` (LinkedIn: `Được quảng bá` ↔ `Promoted`, GDN/Admicro: `Quảng cáo` ↔ `Ad`, Google Search: `Kết quả được tài trợ` ↔ `Sponsored results`).
    - Truncation / Read more: `Xem thêm` ↔ `See more` (Instagram lowercase `xem thêm` ↔ `more`, Threads capitalized `Xem thêm` ↔ `More`).
    - CTAs: `Tìm hiểu thêm` ↔ `Learn more`, `Mua ngay` ↔ `Shop now`, etc.
    - Social actions: `Thích / Bình luận / Chia sẻ` ↔ `Like / Comment / Share`.
- **`brain/.../demo-app.html` Prototype**:
  - Line 2385: Declares `const [lang, setLang] = useState("vi");`.
  - Lines 2777-2799: Renders UI toggle buttons `Tiếng Việt` and `English`.
  - **CRITICAL GAP**: `lang` is **never passed** to `PlacementPreview` (lines 2896, 2910) or any placement renderers (`MetaFeedMobile`, `VerticalMobile`, `LinkedInAdsRenderer`, `AdmicroRenderer`). All in-mockup text is hardcoded Vietnamese strings (e.g. line 2034: `<div className="text-[11px] text-slate-500">Được tài trợ</div>`, line 2089: `<span>👍 Thích</span>`). Toggling English changes the button styling, but fails to translate in-mockup labels (failing Tier 1 Tests 26.4–26.5 and Tier 5 Tests 5.4.1.1–5.4.1.4).

#### Feature 27: Safe-Zone Overlays ("Vùng bị che")
- **`src/` Implementation**:
  - Enabled on exactly 8 vertical 9:16 placements (`fb_stories`, `fb_reels`, `ig_stories`, `ig_reels`, `tt_infeed`, `tt_topview`, `yt_shorts`, `zalo_video`).
  - Initial safe-zone state in application defaults to `false` (Tier 5 Test 5.4.2.3).
  - Toggle button highlighted state: `border-brand bg-[#fdedef] text-[#ed3c47] active` (App.tsx:3353).
  - Renders red danger zones (`rgba(237, 60, 71, 0.3)`) and orange dynamic caption expansion zones (`rgba(255, 159, 28, 0.22)`).
  - Non-vertical placements hide the safe-zone button entirely.
- **`brain/.../demo-app.html` Prototype**:
  - Lines 866-930: `VerticalSafeZoneOverlay` renders red danger zones and orange caption zones.
  - Lines 2804-2815: Renders "Vùng bị che" button when `hasSafeZoneControls` is true.
  - **CRITICAL GAP**: Line 2386 initializes `const [showSafeZone, setShowSafeZone] = useState(true);` (**defaults to `true`**), violating Tier 5 Test 5.4.2.3 expectation (`Initial safe-zone state in application defaults to false`).
  - Button active styling uses `border-[#ed3c47]/50 bg-[#fdedef] text-[#ed3c47]` instead of including `.border-brand` and `.active` classes.

#### Feature 28: Native App UI Toggle ("Giao diện app")
- **`src/` Implementation**:
  - `src/App.tsx:3361-3374` & `src/features/DeviceMockup.tsx`: "Giao diện app" button toggles `appChrome` state (`true` / `false`).
  - When `appChrome === false`: suppresses native app headers, reaction rails, bottom navigation bars, AND the outer `DeviceMockup` status bar (9:41, wifi, battery) and home indicator bar (Tier 5 Tests 5.4.3.1 & 5.4.3.3).
- **`brain/.../demo-app.html` Prototype**:
  - Line 2387: Declares `const [showAppUi, setShowAppUi] = useState(true);`.
  - Lines 2816-2825: Renders "Giao diện app" button in toolbar.
  - In `VerticalMobile` (lines 1155-1271): `showAppUi` toggles in-mockup header, reaction rail, and bottom nav.
  - **CRITICAL GAP**: In `IPhoneFrame` (lines 646-730), status bar (9:41) and home indicator are rendered inside the frame **outside** `showAppUi`! When `showAppUi` is false, `IPhoneFrame` still unconditionally displays the status bar and home indicator bar, failing Tier 5 Test 5.4.3.3.

#### Feature 29: TikTok TopView Phase Toggle ("0-3 giây đầu" / "Sau 3 giây")
- **`src/` Implementation**:
  - `src/App.tsx:3376-3406`: When `tiktok.topview` or `tt_topview` is selected, renders a 2-button segmented group `role="group" aria-label="Giai đoạn hiển thị TopView"`:
    - Button 1: "0-3 giây đầu" -> sets `topViewPhase: 'intro'`.
    - Button 2: "Sau 3 giây" -> sets `topViewPhase: 'feed'`.
  - Active button has `bg-white active text-[#101113] shadow-sm`.
  - In `'intro'` phase: displays clean full-screen video with top "Bỏ qua" (Skip) countdown button; completely suppresses reaction rail, caption, in-feed CTA card, and bottom nav bar (`socialPreview.css:2262-2267`).
  - In `'feed'` phase: displays standard in-feed overlay.
- **`brain/.../demo-app.html` Prototype**:
  - Line 2388: Declares `const [tiktokLatePhase, setTiktokLatePhase] = useState(false);`.
  - **CRITICAL GAP**: The toolbar **completely lacks** the TopView phase toggle button group! The buttons "0-3 giây đầu" and "Sau 3 giây" do not exist anywhere in `demo-app.html` (failing Tier 1 Tests 29.2–29.5 and Tier 5 Tests 5.4.4.1–5.4.4.2).
  - In `VerticalMobile`: `tiktokLatePhase` prop is received but never used in any conditional rendering.

#### Feature 30: Dedicated Zoom Modal ("Phóng to")
- **`src/` Implementation**:
  - `src/features/ZoomModal.tsx` & `src/App.tsx:1697-1706, 1916-1938`:
    - Clicking "Phóng to" sets `zoomModalOpen = true`.
    - Fixed backdrop `rgba(11, 11, 15, 0.9)` (`#0b0b0f`/90) with `backdrop-filter: blur(8px)`, `z-index: 9999` (`.zoom-modal-backdrop`).
    - Modal header with platform group name, title, resolution/ratio badge (`.zoom-modal-meta`).
    - Dedicated close button `.close-zoom-btn.text-button` with `✕` glyph, `aria-label="Đóng"`, `title="Đóng (Esc)"`.
    - Centered high-resolution device mockup inside `.zoom-modal-body > .zoom-modal-content`.
    - Keyboard: `Escape` key closes modal and returns focus to trigger button (`zoomBtnRef`). Backdrop click closes modal.
- **`brain/.../demo-app.html` Prototype**:
  - Lines 2829-2836:
    ```jsx
    {!showAll && (
      <button
        type="button"
        onClick={() => setShowAll(true)}
        className="..."
      >
        Phóng to
      </button>
    )}
    ```
  - **CRITICAL HISTORICAL BUG**: "Phóng to" button simply executes `setShowAll(true)` (switching to the 2-column grid instead of zooming!). There is NO `ZoomModal` component, NO `#0b0b0f`/90 dark backdrop, NO close button `✕`, and NO ESC key handler (failing Tier 1 Tests 30.2–30.5).

#### Feature 31: Fullscreen Workspace ("Toàn màn hình")
- **`src/` Implementation**:
  - `src/App.tsx:1708-1715`: Button text is `{previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}`.
  - Targets `workbenchRef` (keeping toolbar controls accessible in fullscreen).
  - Listens to `fullscreenchange` and `Escape` key to synchronize state.
- **`brain/.../demo-app.html` Prototype**:
  - Lines 2837-2847: Button text is statically `"Toàn màn hình"`.
  - Calls `document.documentElement.requestFullscreen().catch(() => {})`.
  - **GAP**: Does not toggle button label to `"Thoát toàn màn hình"`, does not handle `fullscreenchange`, does not provide exit fullscreen button in toolbar.

#### Feature 32: Live Validation Verbal Badges ("Kiểm tra vị trí này")
- **`src/` Implementation**:
  - `src/validation/engine.ts` & `src/App.tsx`:
    - Full rule validation per placement (18+ rules per placement).
    - Categorizes issues into 3 tiers: Error (`! Lỗi:`, red `#ed3c47`), Warning (`! Cảnh báo:`, orange `#e8590c`), Note (`ⓘ Lưu ý:`, muted `#5f6470`).
    - Verbal summary badges: `✓ Không có lỗi` (green `#e7f6ec`/`#16a34a`), `! {count} lỗi` (red `#fdedef`/`#ed3c47`), `{count} cảnh báo` (orange `#fbeee5`/`#e8590c`).
    - Platform tab warning dots: Only TikTok and GDN have `hasWarning: true` in initial draft.
    - CJK weighted character counting: CJK codepoints count as 2 units in Google Search/GDN.
- **`brain/.../demo-app.html` Prototype**:
  - Lines 2441-2448, 2921-2979: Simple length checks on `primaryLimit` and `headlineLimit`.
  - **GAP**: Does not categorize into `! Lỗi:` vs `! Cảnh báo:`.
  - **GAP**: Uses raw JavaScript `.length` without CJK double-width weighting.
  - **GAP**: Missing TikTok brand name emoji validation and 20-character cap.

#### Feature 33: Official Specifications Card
- **`src/` Implementation**: `src/features/placementSpecs.ts` documents official specs for all 46 placements with official ratios, recommended pixel resolutions, truncation estimates, authoritative status (`Thông số chính thức`, `Nguồn thứ cấp`, `Bố cục ước lượng`), and collapsible source documentation links.
- **`brain/.../demo-app.html` Prototype**: Lines 2981-3020 render the spec card with ratio, recommended px, sourceStatus, specs list, and source details.
- **Alignment**: High functional parity on specs card structure, though specs data should be verified against `src/features/placementSpecs.ts` for all 46 placements.

---

### 1.4 Design Tokens and Device Geometries Comparison

1. **Design Tokens**:
   - Both codebases define root variables in CSS:
     - `--brand: #ed3c47`
     - `--brand-050: #fdedef`
     - `--bg-subtle: #f6f6f7`
     - `--border: #e7e7ea`
     - Glass card: `--glass-bg: rgba(255, 255, 255, 0.78)` / `--glass-blur: 16px` / `backdrop-filter: blur(16px)`
   - Dashed default state: `border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`, turning solid on edit.
   - Minimal decorative iconography: No pulsing pencils, no decorative shields, no redundant star/sparkle icons. Authentic monochrome 18x18 SVGs for all 11 platforms.
2. **Device Geometries**:
   - **iPhone 15 / 16 (6,1 inch)**:
     - Outer casing: `411 × 870`, padding `9px`, border-radius `64px`.
     - Inner screen: `393 × 852`, border-radius `55px`.
     - Status bar: height `54px`, time `9:41`, wifi, battery icons.
     - Dynamic Island: `126 × 37` px, top `11px`, border-radius `9999px`.
     - Home indicator bar: `134 × 5` px, bottom `8px`, border-radius `9999px`.
   - **Desktop Chrome (1920 × 1080)**:
     - Total casing: `1920 × 1080` (or `1920 × 1033`).
     - Chrome header: Tab bar `41px` + Toolbar `47px` = `88px`.
     - Viewport: `1920 × 945`.
   - **AutoScaler**: Both implement `AutoScaler` using `ResizeObserver` computing `Math.min(maxScale, clientWidth / width, maxHeight / height)`.

---

## 2. Logic Chain

1. **Observation 1.1** shows that `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` does not exist, while `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` exists but contains several critical gaps.
   - *Inference*: `worker_m5_1` must produce a refined, updated `demo-app.html` file that satisfies all test expectations and deploy it to **both** paths (`scratch/demo-ads/demo-app.html` and `brain/.../demo-app.html`).
2. **Observation 1.3 (Feature 30)** confirms the known bug: in `demo-app.html`, clicking "Phóng to" executes `setShowAll(true)` instead of opening a modal.
   - *Inference*: The standalone HTML must implement a dedicated `ZoomModal` component with `.zoom-modal-backdrop` (`#0b0b0f`/90), `.close-zoom-btn` with `✕` glyph, ESC key listener, and click-outside dismissal, matching `src/features/ZoomModal.tsx`.
3. **Observation 1.3 (Feature 26)** shows that `lang` is never passed to `PlacementPreview` in `demo-app.html`, leaving all mockups hardcoded in Vietnamese.
   - *Inference*: The standalone HTML must incorporate the canonical bilingual translation dictionary (`CANONICAL_CTA_MAP`, `SPONSORED_LABELS`, `SEE_MORE_LABELS`) and pass `lang` into `PlacementPreview` and all platform renderers, updating labels dynamically.
4. **Observation 1.3 (Feature 27)** reveals that `showSafeZone` defaults to `true` in `demo-app.html`, which fails Tier 5 Test 5.4.2.3 requiring initial safe-zone state to be `false`.
   - *Inference*: `showSafeZone` initial state must be changed to `false` (`useState(false)`).
5. **Observation 1.3 (Feature 28)** shows that `IPhoneFrame` in `demo-app.html` does not respect `showAppUi` for status bar (9:41) and home indicator.
   - *Inference*: `IPhoneFrame` must accept `showAppUi` (or `appChrome`) and conditionally hide status bar and home indicator when `showAppUi === false`.
6. **Observation 1.3 (Feature 29)** confirms that the TikTok TopView phase toggle buttons ("0-3 giây đầu" / "Sau 3 giây") are completely missing from the toolbar in `demo-app.html`.
   - *Inference*: A segmented toggle button group `role="group" aria-label="Giai đoạn hiển thị TopView"` must be added to the toolbar when `activePlacementId === 'tt_topview'`, and `VerticalMobile` must render clean video with "Bỏ qua" skip button in intro phase vs in-feed overlay in feed phase.
7. **Observation 1.3 (Feature 31)** shows that "Toàn màn hình" does not toggle text to "Thoát toàn màn hình" or listen to `fullscreenchange`.
   - *Inference*: Fullscreen state must be tracked and button label dynamically toggled.
8. **Observation 1.3 (Feature 32)** shows that live validation lacks CJK double-width calculation and Error vs Warning categorization.
   - *Inference*: Add CJK character weighting function (`cjk_weighted`) and render distinct `! Lỗi:` and `! Cảnh báo:` items.

---

## 3. Caveats

1. **Self-Contained Browser Architecture**: The standalone `demo-app.html` must remain 100% self-contained (zero npm, zero bundler, running directly via `file://` URL). It relies on CDN scripts (Tailwind CDN, React 18, ReactDOM 18, Babel Standalone). All React code must be in a single `<script type="text/babel">` block.
2. **Execution Environment Constraint**: Shell execution (`run_command`) is disabled by user policy. All edits must be made via file editing tools (`write_to_file`, `replace_file_content`), and all test runs must be verified in the browser or via static inspection.
3. **Dual Synchronization Invariant**: Both `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` must be kept identical in content and functionality.

---

## 4. Conclusion & Technical Requirements for `worker_m5_1`

To achieve 100% pass rate across the E2E Test Suite (Tiers 1–4 and Tier 5 adversarial tests) and fulfill Milestone M5, `worker_m5_1` must implement the following concrete changes:

### Technical Requirements Checklist for `worker_m5_1`

1. **Deploy Standalone HTML to Dual Locations**:
   - Write updated, fully functional `demo-app.html` to `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`.
   - Synchronize identical content to `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`.

2. **Fix Feature 30: Dedicated Zoom Modal ("Phóng to")**:
   - Replace `onClick={() => setShowAll(true)}` on the "Phóng to" button with `onClick={() => setZoomModalOpen(true)}`.
   - Add state: `const [zoomModalOpen, setZoomModalOpen] = useState(false);`.
   - Implement `ZoomModal` component:
     - Backdrop: `.zoom-modal-backdrop` with `background-color: rgba(11, 11, 15, 0.9)`, `backdrop-filter: blur(8px)`, `z-index: 9999`, `role="dialog"`, `aria-modal="true"`.
     - Header: `.zoom-modal-header` with platform title, resolution badge (`.zoom-modal-meta`), and close button `.close-zoom-btn.text-button` displaying `✕` glyph, `aria-label="Đóng"`, `title="Đóng (Esc)"`.
     - Body: `.zoom-modal-body > .zoom-modal-content` containing high-resolution centered mockup.
     - Event handling: ESC key closes modal; clicking backdrop closes modal.

3. **Fix Feature 26: Bilingual UI Translation Wiring**:
   - Embed canonical translation dictionaries: `CANONICAL_CTA_MAP` (18 CTAs), `SPONSORED_LABELS` (11 platforms, including LinkedIn `Được quảng bá` ↔ `Promoted`), `SEE_MORE_LABELS` (including Instagram `xem thêm` ↔ `more`, Threads `Xem thêm` ↔ `More`).
   - Pass `lang` down to `PlacementPreview` and into all individual platform renderers.
   - Update in-mockup labels across all 11 platforms to look up translations based on active `lang`.
   - Ensure the language button group has `role="group" aria-label="Ngôn ngữ giao diện nền tảng"` and active button has `.bg-white` and `.active`.

4. **Fix Feature 27: Safe-Zone Initial State & Styling**:
   - Change default initial state: `const [showSafeZone, setShowSafeZone] = useState(false);` (starts as `false`).
   - Ensure "Vùng bị che" button has classes `.toolbar-pill-btn`, and when active: `.border-brand`, `.bg-[#fdedef]`, `.active`.
   - Ensure safe-zone overlays are only available on the 8 designated 9:16 vertical placements.

5. **Fix Feature 28: Native App UI Isolation**:
   - Pass `showAppUi` into `IPhoneFrame`.
   - When `showAppUi === false`: hide the status bar (9:41) and home indicator in `IPhoneFrame`, in addition to in-mockup reaction rails and headers.

6. **Fix Feature 29: TikTok TopView Phase Toggle**:
   - In toolbar, when `activePlacementId === 'tt_topview'`, render:
     ```jsx
     <div role="group" aria-label="Giai đoạn hiển thị TopView" className="inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5">
       <button type="button" onClick={() => setTiktokLatePhase(false)} className={`h-full rounded-full px-3 text-xs font-semibold ${!tiktokLatePhase ? 'bg-white active text-[#101113] shadow-sm' : 'text-[#5f6470]'}`}>
         0-3 giây đầu
       </button>
       <button type="button" onClick={() => setTiktokLatePhase(true)} className={`h-full rounded-full px-3 text-xs font-semibold ${tiktokLatePhase ? 'bg-white active text-[#101113] shadow-sm' : 'text-[#5f6470]'}`}>
         Sau 3 giây
       </button>
     </div>
     ```
   - In `VerticalMobile`: when `placement.id === 'tt_topview'` and `!tiktokLatePhase` (intro phase), render clean full video with top "Bỏ qua" skip button and suppress in-feed reaction rail, caption, CTA card, and bottom nav.

7. **Fix Feature 31: Fullscreen Workspace Toggle**:
   - Track fullscreen state: `const [isFullscreen, setIsFullscreen] = useState(false);`.
   - Button text: `{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}`.
   - Listen to `fullscreenchange` event on document to keep state in sync.

8. **Fix Feature 32: CJK Character Counting & Validation Badges**:
   - Implement CJK counting: codepoints in CJK ranges count as 2 characters.
   - Distinguish Error badges (`! Lỗi:`) from Warning badges (`! Cảnh báo:`) and Note items (`ⓘ Lưu ý:`).
   - Display `✓ Không có lỗi` when zero errors/warnings.
   - Validate TikTok brand name: maximum 20 chars, disallow emoji.

---

## 5. Verification Method

### 5.1 Test Suite Verification Commands
Open the test suite in a real browser:
```text
file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/e2e-suite.html
```
- Select target: `Local: ../demo-app.html`.
- Click **"Chạy Toàn Bộ 4 Tier"** to execute all 246 tests across Tiers 1–4.
- Invalidation condition: Any test failure in Tiers 1–4 indicates regression or incomplete porting.

### 5.2 Standalone Direct Visual Inspection
Open the standalone file directly:
```text
file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/demo-app.html
```
Verify:
1. **Phóng to**: Clicking "Phóng to" on any single-placement preview opens high-resolution modal with `#0b0b0f`/90 dark backdrop, close button `✕`, and ESC key dismisses modal.
2. **Bilingual toggle**: Clicking "English" instantly translates in-mockup labels (`Được tài trợ` -> `Sponsored`, `Xem thêm` -> `See more`, `Tìm hiểu thêm` -> `Learn more`, LinkedIn `Được quảng bá` -> `Promoted`).
3. **Safe-Zone toggle**: Defaults to OFF; clicking "Vùng bị che" highlights button and renders red/orange overlays.
4. **App UI toggle**: Clicking "Giao diện app" toggles all native chrome including iPhone 9:41 status bar and home indicator.
5. **TikTok TopView**: Selecting TikTok -> TopView shows "0-3 giây đầu" / "Sau 3 giây" toggle. Intro phase shows clean video + Skip button; feed phase shows overlay.
6. **Dual deliverable**: Compare SHA256 / content between `scratch/demo-ads/demo-app.html` and `brain/.../demo-app.html` to confirm exact synchronization.
