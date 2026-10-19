# Test Infrastructure & Specification Guide (TEST_INFRA.md)

**Project**: Ad Preview Web Application (go.noti.vn 1:1 Clone + Extended Platforms)  
**Milestone**: M0 (Testing Infrastructure & 4-Tier Suite)  
**Author**: `test_writer_m0_1`  
**Status**: APPROVED & PUBLISHED  

---

## 1. Test Philosophy: Opaque-Box, Requirement-Driven Testing

### 1.1 Core Principles
1. **Opaque-Box Verification**: Tests interact strictly with public interfaces, observable DOM structures, computed styles, visual boundaries, and exported state. Tests do not rely on internal private React component state or hidden implementation details.
2. **Authoritative Output Derivation**: Every test assertion is derived directly from authoritative specification sources:
   - Extracted `go.noti.vn` Webpack Bundle `20929` (`steps/26/output.txt`).
   - Live DOM & Computed CSS Variables (`steps/203/output.txt` & `steps/209/output.txt`).
   - `ORIGINAL_REQUEST.md` and `PROJECT.md` interface contracts (`EditorDraft`, `UiProfile`, `LocaleDict`).
   - Extended platform guidelines for Zalo Ads, LinkedIn Ads, and Admicro.
3. **Dual-Deliverable Testability**: The test infrastructure validates both the React/TypeScript application (`src/` running via Vite) and the self-contained standalone build (`demo-app.html`).
4. **Zero-Facade Guarantee**: Every test must fail if the expected layout, element, text, attribute, or CSS variable is absent or mutated. No trivial passes or tautological assertions.
5. **Zero Console / Runtime Errors**: A mandatory condition for all test tiers is that running any action, switching platforms, or toggling overlays generates zero uncaught exceptions or error-level console logs.

---

## 2. 4-Tier Test Suite Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Tier 4: Real-World Scenarios                      │
│   (E-commerce Launch, B2B Multi-Channel, Gaming Video Blitz, Audit)    │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 3: Cross-Feature Combinations                     │
│  (VI/EN × Safe Zones, Carousel × Platforms, Overrides × Global Draft)   │
├────────────────────────────────────────────────────────────────────────┤
│               Tier 2: Boundary & Corner Case Verification               │
│ (Aspect Ratio Clamp, CJK 2x Count, Text Truncate, 10-File Limit, Dur.)  │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 1: Feature Coverage & Catalog Completeness         │
│   (11 Platforms, 46 Placements, Workspace Grid, Tokens, Device Frames)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1 Tier 1: Feature Coverage (>=5 Tests per Feature, 11 Platforms, 46 Placements)

Tier 1 covers all 33 architectural features identified in `PROJECT.md` and verified in `spec_miner_survey_1/handoff.md`:

| Feature # | Feature Name | Minimum Tests | Focus Areas |
|---|---|---|---|
| F01 | Two-Column Workspace Layout | 5 | Responsive grid classes `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`, left column `Nội dung quảng cáo`, right column sticky `Khung xem trước`, mobile stacking, `min-w-0` overflow protection. |
| F02 | Design Tokens & Theme | 5 | CSS root variables (`--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`), glass tokens (`--glass-bg`, `--glass-blur: 16px`, `--glass-border`), text colors, radii. |
| F03 | Minimal Decorative Iconography | 5 | Removal of pulsing pencil icons on inputs, removal of decorative shield icons, retention of monochrome platform SVG logos, retention of native mock app chrome. |
| F04 | Dashed Default State | 5 | Initial form state rendered with dashed border (`border-dashed border-brand/50 bg-brand-050/40`), transitions to solid border (`border-border bg-surface`) upon user typing or focus. |
| F05 | Brand Name & @Handle Inputs | 5 | Brand input binds to mockup headers, `@handle` prepend validation, fallback to brand initial letter in avatar circle when logo is absent, Google Search 25-char cap, TikTok emoji block. |
| F06 | Destination URL & CTA Selector | 5 | URL input reflection across all placements, 18 CTA options in dropdown, dynamic CTA label adaptation to active platform and language (VI/EN). |
| F07 | Avatar / Logo Uploader | 5 | Upload trigger, blob URL generation, preview circle update across feeds, fallback on removal, image format handling. |
| F08 | Primary Text & Live Truncation | 5 | Grapheme counting, line-clamp calculations, dynamic `... Xem thêm` / `... See more` insertion based on platform line/character thresholds. |
| F09 | Multi-File Carousel Upload (≤10) | 5 | Drag & drop or picker input, auto-transition to carousel mode when files >= 2, strict 10-file ceiling enforcement, per-card metadata binding, card reordering/deletion. |
| F10 | Google Search Inline Overrides | 5 | Expandable accordion, 3–15 headlines (max 30 chars), 2–4 descriptions (max 90 chars), 2 paths (max 15 chars), sitelinks carousel (2–8 items), callouts. |
| F11 | GDN / YouTube / ChatGPT Overrides | 5 | GDN Long Headline (max 90 chars), YouTube Headline (max 15 chars) & CTA (max 10 chars), ChatGPT Title (3–50 chars) & Body (max 100 chars), fallback to general copy. |
| F12 | Facebook Placements (10 items) | 10 | `fb-feed`, `fb-video-feeds`, `fb-stories`, `fb-reels`, `fb-reels-overlay`, `fb-instream`, `fb-marketplace`, `fb-search`, `fb-right-column`, `fb-audience-network`. |
| F13 | Instagram Placements (3 items) | 5 | `ig-feed`, `ig-stories`, `ig-reels` with authentic Instagram gradient, action icons, and handle placement. |
| F14 | Threads Placement (1 item) | 5 | `threads-feed` skin, like/repost/comment icons, URL and hashtag warning validations. |
| F15 | TikTok Placements (2 items) | 5 | `tiktok-infeed` & `tiktok-topview`, vertical 9:16 layout, reaction rail, audio title bar, TopView phase controller. |
| F16 | YouTube Placements (6 items) | 6 | `yt-skippable`, `yt-nonskip`, `yt-bumper`, `yt-desktop`, `yt-infeed`, `yt-shorts` with companion banners, countdown skip button, and native overlay. |
| F17 | Google Tìm kiếm Placements (2 items) | 5 | `gsearch-mobile` & `gsearch-desktop` text-only SERP renderers, headlines delimiter (" \| "), sitelinks horizontal pill carousel vs 2-column grid. |
| F18 | Google Hiển thị Placements (8 items) | 8 | 8 standard IAB slots (`300x250`, `336x280`, `728x90`, `300x600`, `160x600`, `320x100`, `320x50`, `native`), container dimensions, responsive scaling. |
| F19 | ChatGPT Placements (2 items) | 5 | `chatgpt-web` & `chatgpt-mobile`, conversation thread wrapper, sponsored badge, assistant response layout, SVG brand mark. |
| F20 | iPhone 15/16 Device Frame | 5 | Inner screen `393 × 852 px`, casing `411 × 870 px`, Dynamic Island `126 × 37 px`, status bar `54px` (9:41 time, wifi, battery), Home Bar `134 × 5 px`. |
| F21 | Desktop Chrome Device Frame | 5 | Casing `1920 × 1080 px`, viewport `1920 × 945 px`, Chrome header `87px` (tab bar 41px, nav/omnibox 46px), window controls, favicon. |
| F22 | Zalo Ads Placements (4 items) | 5 | `zalo-timeline`, `zalo-video` (9:16 safe zone), `zalo-message` (OA broadcast), `zalo-article` (Baomoi/Khampha card) with `#0068ff` CTA and OA badge. |
| F23 | LinkedIn Ads Placements (4 items) | 5 | `li-mobile-feed`, `li-desktop-feed` (3-column layout), `li-message` (InMail thread), `li-spotlight` (Dynamic Ad) with `#0a66c2` CTA and Promoted tag. |
| F24 | Admicro Placements (4 items) | 5 | `admicro-cafef-pc`, `admicro-kenh14-mobile`, `admicro-vnexpress-pc`, `admicro-dantri-mobile` with standard placement pills and authentic publisher chromes. |
| F25 | "Tất cả vị trí" Grid View | 5 | 2-column comparison grid for all 11 platforms, proportional frame auto-scaling, removal of disabled checks for extended platforms. |
| F26 | Bilingual UI Toggle (VI / EN) | 5 | Instant toggle switching `Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, social actions (`Thích` ↔ `Like`), CTAs (`Mua ngay` ↔ `Shop now`). |
| F27 | Safe-Zone Overlays ("Vùng bị che") | 5 | Red danger zones (`rgba(237,60,71,0.30)`) and orange dynamic caption zones (`rgba(255,159,28,0.22)`) on all 9:16 vertical video placements. |
| F28 | Native App UI Toggle ("Giao diện app")| 5 | Toggle showing/hiding native app chrome (status bar, bottom nav, reaction rail, omnibox). |
| F29 | TikTok TopView Phase Toggle | 5 | Switching between "0-3 giây đầu" (unobstructed full video) and "Sau 3 giây" (in-feed overlay with CTA). |
| F30 | Dedicated Zoom Modal ("Phóng to") | 5 | Modal backdrop `#0b0b0f`/90, centered high-res device mockup, ESC key listener, close button, focus restoration. |
| F31 | Fullscreen Workspace ("Toàn màn hình")| 5 | Fullscreen API invocation, viewport adaptation, exit controls. |
| F32 | Live Validation Verbal Badges | 5 | Live issue computation, verbal tab indicators (`1 cảnh báo`, `Không có lỗi`, `2 lỗi`), categorization into Error, Warning, Info. |
| F33 | Official Specifications Card | 5 | Collapsible drawer, recommended aspect ratios, dimension guidelines, official documentation external links. |

---

### 2.2 Tier 2: Boundary & Corner Cases

Tier 2 pushes data limits, media constraints, character limits, and encoding boundaries:

1. **Aspect Ratio Clamping & Containment**:
   - Clamping [0.8, 1.91] on Facebook Feed: images at 1:2 (0.5) clamp to 0.8; images at 3:1 (3.0) clamp to 1.91.
   - Stories & Reels `fit: blur`: 16:9 images inside 9:16 frames generate blurred background duplicates without layout clipping.
   - Video `fit: contain`: 16:9 videos inside TikTok or YouTube Shorts center with letterboxing.
2. **Text Truncation Limits**:
   - Exact boundary test: Facebook Feed copy at 124 chars (no truncation) vs 125 chars (triggers `... Xem thêm`).
   - Boundary test: Instagram Feed copy at 89 chars vs 90 chars.
   - No-space truncation: Long strings without spaces truncate exactly at cutoff without browser freeze or regex overflow.
3. **CJK & Fullwidth Double-Width Counting**:
   - Google Search & GDN rule: CJK characters (codepoints 4352–4447, 11904–42191, etc.) count as 2 characters.
   - A 16-character Vietnamese headline passes max 30; a 16-character Japanese/Chinese headline calculates as 32 characters, correctly triggering a red validation error (`vượt quá 30 ký tự`).
4. **Empty States & Graceful Defaults**:
   - Blank brand name defaults to placeholder (`noti.vn` / `Tên thương hiệu`).
   - Missing avatar renders brand initial letter inside circle (`N` for `noti.vn`).
   - Blank primary text renders default placeholder with pink dashed border styling.
5. **Multi-File Carousel Upload Limits**:
   - Exactly 1 file uploaded: renders standard single-media container (no carousel dots/arrows).
   - Exactly 2 files: renders carousel container with pagination indicators (`1/2`).
   - Exactly 10 files: renders complete 10-card carousel.
   - 11 or more files: rejects excess files, enforces 10-file cap, and surfaces alert/validation message.
6. **Video Duration Limits**:
   - YouTube Skippable: < 5s triggers error (`ngắn hơn mức tối thiểu 5 giây`).
   - YouTube Bumper: > 6s triggers error (`vượt quá tối đa 6 giây`).
   - YouTube Non-Skippable: 7–15s valid; > 15s triggers error.
   - Zalo Video / TopView: > 60s triggers error.
7. **Platform Copy & Content Restrictions**:
   - Threads: Hashtags (`#marketing`) or URLs (`https://...`) trigger warning badge.
   - TikTok: Emojis in brand name trigger error; hashtags in primary copy trigger warning.
   - CTA Platform Mismatch: Selecting `call_now` for Threads triggers warning badge and fallback to `learn_more`.

---

### 2.3 Tier 3: Cross-Feature Combinations (Pairwise & Multi-Variable Interactions)

Tier 3 exercises the system when multiple interactive features intersect:

1. **Language Switch (VI ↔ EN) × Safe-Zone Overlays (9:16 Video)**:
   - When Safe Zones are enabled on TikTok In-Feed, FB Reels, or YouTube Shorts:
     - In `vi` mode: danger zone displays `"Vùng nguy hiểm (che bởi UI)"`, caption expansion displays `"Mở rộng chú thích"`.
     - Switching to `en` mode: labels immediately update to `"Danger Zone (UI occlusion)"` and `"Caption Expansion Zone"` without resetting overlay state or redrawing flicker.
2. **Carousel Upload (2–10 Files) × Multi-Platform Switching**:
   - Upload 4 images in editor.
   - Select Facebook Feed: renders 4-card horizontal carousel.
   - Switch to Instagram Feed: renders 4-card carousel with IG pagination dots.
   - Switch to LinkedIn Mobile Feed: renders 4-card carousel with LinkedIn cards.
   - Switch to TikTok In-Feed: handles carousel composition appropriately (or notes format).
   - Switch to Google Search: suppresses image carousel cleanly (text-only SERP) with zero errors.
3. **Collapsible Platform Overrides × Global Draft Copy**:
   - Provide global primary text: `"Global Headline Sample"`.
   - In Google Search accordion, enter custom headlines (`"GS Headline 1"`, `"GS Headline 2"`, `"GS Headline 3"`).
   - In YouTube accordion, enter custom headline (`"YT Custom Title"`).
   - Inspect Facebook Feed: displays global copy.
   - Inspect Google Search: displays custom GS headlines.
   - Inspect YouTube In-Feed: displays custom YT headline.
   - Clear YouTube override: immediately falls back to global headline.
4. **TikTok TopView Phase Switch × App UI Toggle × Safe Zones**:
   - In `tiktok-topview`:
     - Phase "0-3 giây đầu": displays full clean video; app UI chrome is hidden by default; safe zones show initial danger bounds.
     - Phase "Sau 3 giây": displays full in-feed interactive overlay, avatar, reaction rail, and CTA banner; safe zones adapt to include caption expansion.
     - Toggling "Giao diện app" off hides the chrome while maintaining the selected phase.
5. **"Tất cả vị trí" 2-Column Grid × Bilingual Toggle × Device Scaling**:
   - Select Facebook platform and click "Tất cả vị trí".
   - Verifies 10 proportional device frames render in a 2-column responsive grid (`grid-cols-1 md:grid-cols-2`).
   - Toggle language to English: all 10 device frames update in-mockup labels (`Sponsored`, `See more`, `Like`) simultaneously.
   - Verify each frame maintains proportional auto-scaling without aspect ratio distortion.
6. **Zoom Modal ("Phóng to") × Keyboard Navigation & Focus Trap**:
   - Open Zoom Modal from any single placement or "Tất cả vị trí".
   - Verifies modal overlay opens with backdrop `#0b0b0f`/90 and centers the high-res mockup.
   - Pressing `Escape` key immediately closes the modal and restores focus to the trigger button.
   - Clicking the close button (`✕`) closes the modal.
   - Re-opening retains all active draft modifications.

---

### 2.4 Tier 4: Real-World Application Scenarios

Tier 4 simulates end-to-end user workflows from initial input to final multi-placement review:

1. **Scenario 1: Multi-Card E-Commerce Launch ("Thời trang Mùa hè")**:
   - User inputs brand: `"ChicStyle Studio"`, handle: `@chicstyle`.
   - Uploads 3 product images (1:1 aspect ratio).
   - Inputs copy: `"Bộ sưu tập Mùa Hè 2026 đã chính thức ra mắt! Ưu đãi giảm đến 40% cho 100 đơn hàng đầu tiên."`
   - Sets CTA to `"Mua ngay"` (`shop_now`), destination URL: `"https://chicstyle.vn/summer"`.
   - Verifies Facebook Feed renders 3-card carousel with `"Mua ngay"` button.
   - Verifies Instagram Feed renders carousel with pagination.
   - Verifies TikTok In-Feed renders preview with brand title and handle.
   - Verifies Google Search renders sitelinks carousel.
2. **Scenario 2: B2B Enterprise SaaS Announcement ("CloudSync AI")**:
   - User inputs brand: `"CloudSync Enterprise"`, handle: `@cloudsync`.
   - Uploads high-res landscape visual (1.91:1 ratio, 1200×628 px).
   - Inputs headline: `"Tối ưu hóa quy trình làm việc đám mây với AI"`.
   - Sets CTA to `"Đăng ký"` (`sign_up`).
   - Verifies LinkedIn Mobile Feed renders Promoted post with `#0a66c2` CTA.
   - Verifies LinkedIn Desktop Feed renders 3-column feed with sidebar navigation.
   - Verifies Admicro CafeF PC renders billboard banner with publisher chrome.
   - Verifies ChatGPT Web renders sponsored message block below simulated assistant response.
3. **Scenario 3: Mobile Gaming Video Blitz ("CyberWar 2099")**:
   - Uploads vertical 9:16 gameplay video (15 seconds duration).
   - Selects TikTok TopView: tests 0–3s phase (clean video) and after-3s phase (overlay with CTA `"Cài đặt ngay"`).
   - Enables "Vùng bị che" safe zone overlay: verifies danger rail and caption box bounds.
   - Switches to YouTube Shorts: verifies right-hand reaction rail safe zone and bottom title zone.
   - Switches to Facebook Reels: verifies bottom 35% safe margin.
   - Confirms zero validation warnings on video length.
4. **Scenario 4: Comprehensive Multi-Placement Audit & Zero-Console-Error Certification**:
   - Navigates through all 11 platform tabs sequentially (`Facebook` → `Instagram` → `Threads` → `TikTok` → `YouTube` → `Google Tìm kiếm` → `Google Hiển thị` → `ChatGPT` → `Zalo Ads` → `LinkedIn Ads` → `Admicro`).
   - Switches each platform to "Tất cả vị trí" grid view.
   - Toggles language `vi` ↔ `en`.
   - Toggles safe-zone overlays and app UI.
   - Captures console output and confirms zero uncaught errors, zero broken images, and zero layout overflow across all 46 placements.

---

## 3. Test Runner Architecture & Execution Guide

### 3.1 Standalone Browser Runner (`tests/e2e-suite.html`)
The primary test harness is a standalone HTML application that can be opened in any browser (`file:///.../tests/e2e-suite.html` or served via any static server).
- **Execution**: Open `tests/e2e-suite.html` directly in a browser.
- **Embedded Target**: The runner loads either `../demo-app.html` or a configurable target URL (e.g. `http://localhost:5173/`) into a sandboxed test iframe.
- **Real-Time UI**: Live dashboard showing pass/fail status, execution time, tier filtering, assertion count, error stack traces, and console interceptor logs.
- **Automation Interface**: Exposes `window.__TEST_RESULTS__` containing:
  ```json
  {
    "total": 140,
    "passed": 140,
    "failed": 0,
    "durationMs": 4250,
    "tiers": {
      "tier1": { "total": 85, "passed": 85, "failed": 0 },
      "tier2": { "total": 25, "passed": 25, "failed": 0 },
      "tier3": { "total": 15, "passed": 15, "failed": 0 },
      "tier4": { "total": 15, "passed": 15, "failed": 0 }
    },
    "zeroConsoleErrors": true
  }
  ```

### 3.2 Modular Test Engine (`tests/e2e-runner.js`)
Contains the lightweight assertion framework and test execution engine:
- `describe(suiteName, fn)`: Test suite block.
- `it(testName, fn)`: Asynchronous test case.
- `expect(actual)`: Matchers (`toBe`, `toEqual`, `toContain`, `toBeGreaterThan`, `toBeLessThan`, `toHaveClass`, `toHaveStyle`, `toExist`).
- `testHarness`: Utility to query iframe elements, dispatch input events, upload virtual files, and inspect computed CSS styles.

### 3.3 Test Suite Modules
- `tests/tier1-feature-coverage.js`: All 33 features, 11 platforms, 46 placements.
- `tests/tier2-boundary-corners.js`: Boundaries, aspect ratios, CJK double-width, 10-file cap, duration bounds.
- `tests/tier3-cross-feature.js`: Pairwise combinations and feature interactions.
- `tests/tier4-scenarios.js`: Realistic marketing campaign workflows.
- `tests/fixtures/campaign-drafts.js`: Canonical test assets and mock data.

---

## 4. Acceptance Criteria & Pass/Fail Thresholds

| Milestone Gate | Criteria | Enforcement |
|---|---|---|
| M0 Gate | Test infrastructure and 4-tier test files created, documented, and browser-executable. `TEST_INFRA.md` & `TEST_READY.md` published. | Milestone M0 Deliverable |
| Milestone Gates M1–M5 | Incremental test suites passing against features implemented in each milestone. | Continuous verification |
| Milestone M6 Gate | 100% of tests passing across Tiers 1–4 across both `src/` and `demo-app.html` with zero console errors. | Final Release Acceptance |
