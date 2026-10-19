# Handoff Report — React/TypeScript Codebase Survey & Gap Analysis

**Agent ID**: `explorer_codebase_survey_1`  
**Date & Time**: 2026-10-17T01:56:00Z  
**Target Repository**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads`  
**Parent Orchestrator**: `853b94d8-915a-4180-baf9-463270ce3714`  

---

## 1. Observation

### 1.1 Architectural & Component Hierarchy Map

The application entry point is `src/main.tsx` mounting `<App />` from `src/App.tsx` (2,900 lines, 130 KB). The component hierarchy is structured as follows:

```text
App (src/App.tsx)
├── topbar (.topbar)
│   ├── Wordmark / BrandLogo
│   ├── Workspace Navigation Tabs ('workspace' | 'catalog' | 'compare')
│   ├── Status Pill (local session, version, evidence badge)
│   └── Topbar Actions (Save Draft JSON, Import JSON, Review Package Export)
├── main-content (.main-content)
│   └── workbench (.workbench: 2-column grid [minmax(380px, 5fr) minmax(0, 7fr)])
│       ├── Column 1 (Left):
│       │   ├── Aside (.validation-panel: "Kiểm tra vị trí này")
│       │   │   ├── Summary Counts (fail, warn, unknown, pass)
│       │   │   ├── Check List (live rule validation cards with actual vs expected)
│       │   │   └── Pass Toggle & Spec Version Footnote
│       │   └── EditorPanel (src/features/EditorPanel.tsx)
│       │       ├── Panel Header ("01 Nội dung quảng cáo", undo/redo buttons)
│       │       ├── File counter badge ("X / 10 tệp")
│       │       ├── Editor Tabs ('copy' | 'media' | 'override')
│       │       ├── Tab 'copy':
│       │       │   ├── Quick Upload Box (.quick-upload)
│       │       │   ├── Field: Brand Name (Tên thương hiệu)
│       │       │   ├── Field: Account Handle (Tên tài khoản @handle)
│       │       │   ├── Field: Destination URL (URL đích)
│       │       │   ├── Select: Call To Action (Nút kêu gọi hành động)
│       │       │   ├── Logo/Avatar Upload Row (.logo-upload-row)
│       │       │   ├── Field: Primary Text (Văn bản chính, textarea)
│       │       │   ├── Conditional RSA Fields (Headlines array, Descriptions array, Paths)
│       │       │   ├── Field: Headline (Tiêu đề)
│       │       │   ├── Field: Description (Mô tả)
│       │       │   ├── Select: Composition Kind (Bố cục nội dung)
│       │       │   ├── Field: Creative Name (Tên creative)
│       │       │   └── Conditional Form Fields (Tên OA, Tiêu đề Form, Nội dung Form, FormQuestions)
│       │       ├── Tab 'media':
│       │       │   ├── Upload Zone (.upload-zone)
│       │       │   ├── Asset List (.asset-list: role selector, order ↑↓, delete)
│       │       │   └── Card Details (Title, Description, URL per card when composition='carousel')
│       │       └── Tab 'override':
│       │           └── Field overrides (inherit | replace | clear per copy field)
│       └── Column 2 (Right):
│           ├── Section (.target-bar)
│           │   ├── Platform Tabs (.platform-tabs: 11 platform buttons with PlatformLogo & issue badges)
│           │   ├── Placement Row (.placement-row)
│           │   │   ├── Placement Selector & Pills (.placement-pills)
│           │   │   ├── Inline "Tất cả vị trí" Toggle Button (.all-placements-button)
│           │   │   ├── Evidence Badge (.evidence-badge)
│           │   │   └── Spec Drawer Toggle ("Nguồn thông số")
│           │   └── Spec Drawer (.spec-drawer: collapsible official sources, rules, checkedAt)
│           └── Section (.preview-panel)
│               ├── Preview Toolbar (.preview-toolbar: Crop toggle, Contain/Cover, Safe zone, Zoom, Fullscreen)
│               ├── PresentationControls (.preview-presentation-controls)
│               │   ├── Language Select (Ngôn ngữ app: 'vi' | 'en')
│               │   ├── App Chrome Checkbox (Giao diện app)
│               │   ├── Caption Mask Checkbox (Vùng caption dài for 9:16 vertical)
│               │   └── TopView Phase Select (0–3 giây đầu / Sau 3 giây for tiktok.topview)
│               ├── Mockup Device Tag & Dimensions
│               ├── Crop Controls (Focal X/Y sliders when showCrop is active)
│               └── Preview Stage (.preview-stage)
│                   ├── Mode A: Single Placement View
│                   │   └── PreviewSurface (src/features/PreviewSurface.tsx)
│                   │       └── DeviceMockup (src/features/DeviceMockup.tsx: iPhone 15/16 or PC frame)
│                   │           └── Preview (src/features/Preview.tsx)
│                   │               ├── Feed/Social: SocialPreview (src/features/SocialPreview.tsx)
│                   │               ├── Search/GDN/YouTube/ChatGPT: ContextPreview (src/features/ContextPreview.tsx)
│                   │               ├── Banner: BannerAd (.banner-ad)
│                   │               ├── Form: FormAd (.form-ad)
│                   │               └── Safe-Zone: OcclusionOverlay (src/features/OcclusionOverlay.tsx)
│                   └── Mode B: "Tất cả vị trí" 2-Column Comparison Grid
│                       └── .inline-all-placements-grid (maps all group profiles in proportional DeviceMockups)
```

### 1.2 State Management Architecture

State is localized in `App.tsx` and custom hooks without third-party state managers (Redux/Zustand):
1. **Creative Draft State**: Managed via `useHistory(initialDraft)` (`src/features/useHistory.ts:1-40`), exposing `history.value` (type `EditorDraft` from `src/features/editorModel.ts`), `history.undo`, `history.redo`, and `history.set`.
   - `draft.identity`: `{ brandName: string, handle: string }`
   - `draft.copy`: `{ primaryText, headlines: string[], descriptions: string[], cta, destinationUrl, paths: string[] }`
   - `draft.form`: `{ oaName, title, body, questions: FormQuestion[] }`
   - `draft.assets`: `InspectedMedia[]` (`src/media/inspect.ts`) with `kind: 'image' | 'video' | 'audio'`, dimensions, duration, SHA-256 hash, object URL, and assigned `role: 'creative' | 'logo' | 'avatar' | 'form_cover' | 'audio'`.
   - `draft.overrides`: `Record<profileId, Record<CopyField, { mode: 'inherit' | 'replace' | 'clear', value: string }>>`
   - `draft.renderSettings`: `Record<profileId, { fit: 'cover' | 'contain', safeZone: boolean, focalX: number, focalY: number }>`
2. **Active Target State**:
   - `profileId`: Current selected placement ID (`useState(profiles[0].id)`).
   - `profile`: Resolved `UiProfile` via `profiles.find(item => item.id === profileId)`.
3. **Presentation & Mockup State**:
   - `presentation`: `PreviewPresentation` (`{ locale: 'vi' | 'en', appChrome: boolean, captionMask: boolean, topViewPhase: 'intro' | 'feed' }`).
   - `mockupMode`: `'target' | 'mobile' | 'pc'`. Resolved mockup spec via `deviceMockupFor(profile, mockupMode)`.
   - `allPlacementsInline`: Boolean toggle for `"Tất cả vị trí"` comparison grid.
   - `previewZoomed`: Boolean toggle for high-resolution zoomed view.
   - `previewFullscreen`: Boolean toggle for native browser fullscreen.
4. **Validation State**:
   - `checks = useMemo(() => runValidation(draft, profile.id), [draft, profile.id])` (`src/features/catalogBridge.ts:182`).
   - `groupIssueSummary`: Memoized map computing fail/warn/unknown count per platform group for tab badges (`App.tsx:322-346`).

---

### 1.3 Inventory: Supported Platforms & Placements in Code vs Requirements

Requirement R2 mandates **11 platforms** and **46 placements**:
- 8 original Noti platforms: Facebook (10), Instagram (3), Threads (1), TikTok (2), YouTube (6), Google Tìm kiếm (2), Google Hiển thị (8), ChatGPT (2) = **34 placements**.
- 3 extended platforms: Zalo Ads (4), LinkedIn Ads (4), Admicro (4) = **12 placements**.
- Total: **46 placements**.

#### Inventory Comparison Table

| Platform Group | Group Title in Code | Required Placements | Implemented Profiles in Code | Profile IDs & Status | Match / Gap |
|---|---|---|---|---|---|
| `facebook` | Facebook | 10 | 10 | `facebook.feed`, `facebook.video_feeds`, `facebook.stories`, `facebook.reels`, `facebook.reels_banner`, `facebook.in_stream`, `facebook.marketplace`, `facebook.search_results`, `facebook.right_column`, `facebook.audience_network` | **Exact match (10/10)** |
| `instagram` | Instagram | 3 | 3 | `instagram.feed`, `instagram.stories`, `instagram.reels` | **Exact match (3/3)** |
| `threads` | Threads | 1 | 1 | `threads.feed` | **Exact match (1/1)** |
| `tiktok` | TikTok | 2 | 3 | `tiktok.in_feed.video`, `tiktok.in_feed.standard_carousel`, `tiktok.topview` | **Mismatch**: TikTok has 3 profiles in code because standard carousel is exposed as a separate profile ID (`tiktok.in_feed.standard_carousel`) with the same placement label ("In-feed"). Spec requires 2 placements: In-feed and TopView (with carousel as a composition of In-feed). |
| `youtube` | YouTube | 6 | 6 | `youtube.skippable_in_stream`, `youtube.non_skippable_in_stream`, `youtube.bumper`, `youtube.desktop_in_stream`, `youtube.in_feed`, `youtube.shorts` | **Exact match (6/6)** |
| `google-search` | Google Search / Google Tìm kiếm | 2 | 2 | `google.search.mobile`, `google.search.desktop` | **Exact match (2/2)** |
| `google-display` | Google Display / Google Hiển thị | 8 | 8 | `google.display.300x250`, `google.display.336x280`, `google.display.728x90`, `google.display.300x600`, `google.display.160x600`, `google.display.320x100`, `google.display.320x50`, `google.display.native_in_article` | **Exact match (8/8)** |
| `chatgpt` | ChatGPT | 2 | 2 | `chatgpt.chat_card.web`, `chatgpt.chat_card.mobile` | **Exact match (2/2)** |
| `linkedin` | LinkedIn Ads | 4 | 4 | `linkedin.feed.mobile`, `linkedin.feed.desktop`, `linkedin.message`, `linkedin.right_rail` | **Exact match (4/4)** |
| `zalo` | Zalo Ads | 4 | 12 | `zalo.native.single_image`, `zalo.native.multi_image`, `zalo.video.safe_zone`, `zalo.form`, `zalo.message`, `zalo.display.masthead`, `zalo.display.masthead_mobile`, `zalo.display.inpage_fullpage_welcome`, `zalo.display.halfpage`, `zalo.display.medium_rectangle`, `zalo.commerce.product`, `zalo.oa_article.native` | **Mismatch**: Code defines 12 profiles. The canonical 4 placements in prototype `demo-app.html` are: (1) Nhật ký Zalo (Feed 1.91:1/1:1), (2) Zalo Video (9:16 safe zone), (3) Tin nhắn OA (Message), (4) Báo Mới / Khám phá (Article). |
| `admicro` | Admicro / Admicro CPD | 4 | Custom Studio (~20 slots) | In `src/catalog/admicro.ts`, 4 packages exist (`homepage_plus`, `homepage_premium`, `billboard_plus`, `billboard_premium`), but `App.tsx` routes Admicro to a standalone `PublisherStudio` (`PublisherPicker`) with CafeF, Kenh14, VTV slots. | **Mismatch**: Admicro is not treated as 4 canonical placements with placement pills. Furthermore, `"Tất cả vị trí"` comparison grid is hard-disabled for Admicro (`App.tsx:1514`: `profile.groupId !== 'admicro'`). |
| **Total** | **11 Platforms** | **46 Placements** | **51+ Profiles** | | **5 platforms match exactly, 3 have placement inventory discrepancies** |

---

### 1.4 Media Upload & Multi-File Carousel Inspection

Inspected `src/media/inspect.ts:1-106` and `src/App.tsx:511-551, 1819-1846, 2104-2281`:
1. **Sniffing & Budget**: `sniffType` checks magic numbers for PNG, JPEG, GIF, WebP, MP4, MP3, WAV. Limits: `APP_FILE_BUDGET = 256 MB/file`, `APP_SESSION_BUDGET = 512 MB/session`. SVG/HTML files are blocked.
2. **Metadata Extraction**: Images decoded via `createImageBitmap(blob)` to extract `width` and `height`. Video/audio created in ephemeral elements to extract `videoWidth`, `videoHeight`, and `durationMs`.
3. **Multi-File Upload Behavior**:
   - `addFiles(files)` loops over `Array.from(files)`, checks SHA-256 for duplicates, appends to `draft.assets`.
   - **Crucial gap**: Uploading multiple files does **not** update `draft.composition` to `'carousel'` automatically. `draft.composition` defaults to `'single_image'`. Unless the user manually opens the "Bố cục nội dung" dropdown and selects "Carousel", only the first asset is rendered.
   - **File Count Limit**: The editor displays `<div className="editor-file-count">{draft.assets.length} / 10 tệp</div>` (`App.tsx:1777`), but `addFiles` never halts or truncates when `files.length + draft.assets.length > 10`.
   - **Card Details**: When `draft.composition === 'carousel'`, `App.tsx:2229-2273` renders per-card fields (Tiêu đề card, Mô tả card, URL card) stored in `draft.cardDetails[asset.id]`. In `Preview.tsx:133-167`, per-card URLs are correctly rejected with a warning for TikTok Standard Carousel (which requires a shared URL).

---

### 1.5 Validation Rules & Character Counters

Inspected `src/validation/counting.ts`, `src/validation/engine.ts`, and `src/features/catalogBridge.ts`:
1. **Counting Strategies** (`counting.ts:21-29`):
   - `grapheme`: Uses `Intl.Segmenter('vi', { granularity: 'grapheme' })` (handles composite Vietnamese accents and emojis correctly).
   - `code_point`: Uses `Array.from(input).length`.
   - `utf16`: Uses `input.length`.
   - `cjk_weighted`: Weighted counting where CJK characters count as 2 units and latin/Vietnamese count as 1 unit (used for Google RSA headlines and descriptions).
2. **Rule Operators Supported**: `required`, `minCount`, `maxCount`, `minLength`, `maxLength`, `maxBytes`, `minBytes`, `mimeIn`, `dimensions`, `minDimensions`, `ratioIn`, `maxDurationMs`, `minDurationMs`, `codecIn`, `audioRequired`, `allowedValues`, `disallow`, `disallowPattern`, `url`.
3. **Warning Badge Difference on Platform Tabs**:
   - Code (`App.tsx:1245-1256`): Renders a badge containing only the raw count:
     ```tsx
     <span className={`platform-issue-badge ${status}`}>
       {issue.fail || issue.warn || issue.unknown}
     </span>
     ```
   - Target Noti Reference (`go.noti.vn`): Renders verbal badges such as `"1 cảnh báo"` (orange), `"1 lỗi"` (red), or `"Không có lỗi"` (green/neutral).

---

### 1.6 Safe Zone Overlays & Device Frames

Inspected `src/features/OcclusionOverlay.tsx`, `src/features/previewPresentation.ts`, `src/features/DeviceMockup.tsx`, and `src/features/deviceMockupModel.ts`:
1. **Safe-Zone Overlays**:
   - Fully implemented in `previewPresentation.ts:67-99` and `occlusion.css:1-37`.
   - Supports TikTok In-feed (`tiktok.*`), YouTube Shorts (`youtube.shorts`), Meta Stories/Reels (`*.stories`, `*.reels`), and Zalo Video (`zalo.video.safe_zone`).
   - Renders red danger zones (`--occlusion-red: rgb(216 45 57 / 0.23)`,dashed border `--occlusion-red-rule`) and dynamic orange caption expansion zones (`--occlusion-orange: rgb(244 150 40 / 0.25)`).
2. **Device Frame Mockups**:
   - `iPhone 15 / 16`: Configured at `viewport: { width: 393, height: 852 }`, `frame: { width: 417, height: 876 }` with dynamic island, status bar, and home indicator. (Accurate to specification).
   - `PC / Desktop`: Configured in `src/features/deviceMockupModel.ts:23-29` as:
     ```ts
     'pc-1440': {
       id: 'pc-1440',
       kind: 'desktop',
       label: 'PC',
       viewport: { width: 1440, height: 900 },
       frame: { width: 1484, height: 1014 },
     }
     ```
     **Discrepancy**: R2 and Noti reference specifically define Desktop Chrome as:
     `Desktop Chrome (1920 × 1080, viewport 1920 × 945, chromeHeight 87)`.
     The current code uses 1440 × 900.

---

## 2. Logic Chain

1. **Observation 1.1 & 1.3**: The code defines 11 platform groups in `src/catalog/profiles.ts` and `admicro.ts`. However, TikTok defines 3 profiles (`tiktok.in_feed.video`, `tiktok.in_feed.standard_carousel`, `tiktok.topview`) instead of 2 placements; Zalo defines 12 profiles instead of 4 canonical placements; and Admicro is configured as a publisher studio with ~20 slot variants rather than 4 canonical packages/placements.
   - *Inference*: The platform count (11) is met, but the placement inventory diverges from the 46 placements required in R2.
2. **Observation 1.3 & App.tsx:1514**: In `App.tsx:1514`, the multi-placement comparison grid is conditioned on `allPlacementsInline && profile.groupId !== 'admicro'`. In `App.tsx:1295`, the `"Tất cả vị trí"` button is hidden when `profile.groupId === 'admicro'`.
   - *Inference*: Admicro cannot be viewed in the `"Tất cả vị trí"` 2-column grid, violating R2's requirement that every platform support the `"Tất cả vị trí"` comparison grid.
3. **Observation 1.4**: In `src/App.tsx:511-551`, `addFiles` uploads files into `draft.assets` without changing `draft.composition`. In `src/features/Preview.tsx:329-369`, carousel swipe controls and multi-card layouts only activate if `draft.composition === 'carousel'`.
   - *Inference*: Uploading multiple images (2–10 files) does not automatically show a carousel preview on feed placements, violating R1/R4 acceptance criteria ("uploading multiple images/videos (2–10 files) renders an interactive carousel preview on supported feed placements").
4. **Observation 1.6 & deviceMockupModel.ts:23-29**: The desktop spec is hardcoded to 1440 × 900.
   - *Inference*: Desktop placements are rendered at 1440 × 900 rather than the specified 1920 × 945 Chrome viewport, resulting in geometric scaling distortion compared to the target reference `go.noti.vn`.
5. **Observation 1.1 & App.tsx:1794, 2282**: Platform overrides are located in a separate top-level tab (`editorTab === 'override'`) with generic copy fields, rather than collapsible inline platform accordions (Google Search sitelinks/paths, YouTube/GDN/ChatGPT CTAs) directly inside the editor.
   - *Inference*: The editor structure deviates from the 1:1 visual clone of `go.noti.vn` specified in R1.
6. **Observation styles.css:912-917**: The dashed border rule applies to `input:not(:focus)` unconditionally.
   - *Inference*: Inputs remain dashed even after the user has typed content into them as soon as focus leaves the field, failing the requirement for dashed default inputs that turn solid on edit.
7. **Observation PlatformLogo.tsx:46-50**: SVG files are provided for Facebook, Google, Instagram, Threads, TikTok, YouTube, and Zalo. However, `chatgpt`, `linkedin`, and `admicro` do not have SVG files and fall back to plain text tags.
   - *Inference*: Platform tabs for ChatGPT, LinkedIn, and Admicro lack brand logos, reducing visual fidelity.
8. **Observation File System**: `demo-app.html` exists in `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`, but does NOT exist in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`.
   - *Inference*: Deliverable synchronization requirement R4 is broken; opening the workspace directly without the brain directory will fail to find `demo-app.html`.

---

## 3. Caveats

1. **Read-Only Constraint**: In accordance with the prompt instructions, no source files were modified during this investigation.
2. **Disabled Shell Execution**: Shell command execution (`run_command`) is disabled by user policy. Automated test suites (`npm test`, `vitest`) could not be run synchronously from the terminal; verification of test assertions was conducted by code analysis of test files.
3. **Reference URL Network Access**: Direct network requests to `https://go.noti.vn/cong-cu/xem-truoc-quang-cao` were not made; observations rely on the exact extracted source code bundle and DOM dumps provided in the system reference files (`steps/26/output.txt` and `steps/203/output.txt`).

---

## 4. Conclusion & Specific Gap Matrix (R1, R2, R3, R4)

### Summary Matrix of Gaps

| Requirement | Spec Requirement | Current Code Implementation | Specific Gap / Action Needed |
|---|---|---|---|
| **R1** | Two-column grid `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` | `.workbench` has `minmax(380px, 5fr) minmax(0, 7fr)` | Minor column width gap; column 2 contains stacked `.target-bar` and `.preview-panel`. |
| **R1** | Design tokens: `--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea` | Uses `--color-accent: #ed3c47`, `--color-accent-soft: #fff1f2`, `--color-panel-soft: #f5f6f8`, `--color-rule: #e5e7eb` | Standardize design token variable names and tint hex codes to match target tokens. |
| **R1** | Dashed default inputs that turn solid on edit | CSS styles all `input:not(:focus)` as dashed | Inputs revert to dashed on blur even when filled. Need state-based class (`value ? 'solid' : 'dashed'`) or CSS `:not(:placeholder-shown)`. |
| **R1** | Multi-file carousel upload support up to 10 files | Uploads files to `assets` array; composition stays `single_image` | Auto-detect multiple creative files (2–10) and set `composition = 'carousel'`; enforce 10-file maximum cap in upload handler. |
| **R1** | Collapsible platform-specific overrides (Google Search, GDN, YouTube, ChatGPT, Zalo, LinkedIn, Admicro) | Housed in separate top-level "Copy riêng" tab with generic dropdowns | Move overrides into collapsible accordions (details/summary) inline in the editor below primary copy fields. |
| **R1** | Sticky `Khung xem trước` glass card | `.preview-panel` is static with normal border, no sticky or glass backdrop | Add `position: sticky; top: 1rem;` and glass backdrop blur styling. |
| **R2** | 11 platforms, 46 placements | 11 platforms, but 51+ profiles | Standardize to exact 46 placements: consolidate TikTok to 2 placements (`In-feed` + `TopView`), select 4 canonical Zalo placements (`Nhật ký Zalo`, `Zalo Video`, `Tin nhắn OA`, `Báo Mới / Khám phá`), and 4 canonical Admicro placements (`CafeF PC`, `Kenh14 Mobile`, `VnExpress PC`, `Dân trí Mobile`). |
| **R2** | Device frames: iPhone 15/16 (393 × 852) & Desktop Chrome (1920 × 1080, viewport 1920 × 945) | iPhone is 393 × 852; Desktop is 1440 × 900 (`pc-1440`) | Update desktop mockup spec in `deviceMockupModel.ts` to 1920 × 945 with 87px browser chrome. |
| **R2** | `"Tất cả vị trí"` 2-column multi-frame comparison grid on all platforms | Implemented for 10 platforms, but explicitly disabled for Admicro | Enable `"Tất cả vị trí"` for Admicro and provide standard placement pills. |
| **R3** | Live validation badges on platform tabs | Displays numeric count only (e.g. `1`) | Display text badges like `"1 cảnh báo"`, `"1 lỗi"`, or `"Không có lỗi"` matching `go.noti.vn`. |
| **R3** | `Phóng to` zoom modal | Toggles `.preview-stage-zoomed` fixed overlay | Implement dedicated modal dialog with backdrop overlay and close button. |
| **R4** | Minimal decorative iconography | Lucide icons only in unused `LandingPage.tsx`, but missing SVGs for ChatGPT, LinkedIn, Admicro | Add missing brand SVGs for ChatGPT, LinkedIn, and Admicro in `src/assets/brands/`. |
| **R4** | Dual deliverable sync (`src/` and `demo-app.html`) | `demo-app.html` missing from `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\` | Copy/generate synchronized `demo-app.html` into root workspace. |

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Component Hierarchy & State**:
   - Inspect `src/App.tsx:241-360` to confirm state hooks (`useHistory`, `profileId`, `presentation`, `allPlacementsInline`, `editorTab`).
   - Inspect `src/App.tsx:1213-1750` to confirm `.workbench` grid structure, `.target-bar`, `.preview-panel`, and `.editor-panel`.
2. **Verify Placement Counts**:
   - Check `src/catalog/profiles.ts:327-363`: Facebook (10 placements), Instagram (3 placements), YouTube (6 placements), Google Display (8 placements).
   - Check `src/catalog/profiles.ts:407-547`: Threads (1 profile), TikTok (3 profiles: lines 426, 444, 531).
   - Check `src/catalog/profiles.ts:584-638`: Google Search (2 profiles).
   - Check `src/catalog/profiles.ts:740-811`: ChatGPT (2 profiles).
   - Check `src/catalog/profiles.ts:814-1132`: Zalo (12 profiles).
   - Check `src/catalog/profiles.ts:1134-1212`: LinkedIn (4 profiles).
   - Check `src/catalog/admicro.ts:501-660`: Admicro slot and package catalog.
   - Inspect `src/App.tsx:1514`: Confirm `allPlacementsInline && profile.groupId !== 'admicro'`.
3. **Verify Device Dimensions**:
   - Inspect `src/features/deviceMockupModel.ts:15-30`: Confirm `iphone-15-16` is 393 × 852 and `pc-1440` is 1440 × 900.
   - Inspect `C:\Users\PC\.gemini\antigravity\brain\f696ce27-5926-4d7a-8538-f2973317f140\.system_generated\steps\26\output.txt` (line 3, object `k`): Confirm target Chrome viewport is 1920 × 945.
4. **Verify Input Styling & Dashed Borders**:
   - Inspect `src/styles.css:912-917`: Confirm `.editor-panel .field input:not(:focus)` sets `border-style: dashed`.
5. **Verify Missing Files**:
   - Check existence of `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` using file tools.
   - Check `src/assets/brands/manifest.ts` and `src/features/PlatformLogo.tsx:46-50` to confirm lack of ChatGPT, LinkedIn, and Admicro SVGs.
