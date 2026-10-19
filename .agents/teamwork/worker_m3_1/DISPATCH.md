# Task Assignment — worker_m3_1 (Milestone 3: Extended 3 Platforms & Placements Engine)

## Mission
Implement Milestone 3: Extended 3 Platforms & Placements Engine (Requirement R2, 12 canonical placements across Zalo Ads, LinkedIn Ads, and Admicro).

## Key References
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\fixtures\campaign-drafts.js` (Lines 71–88)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier1-feature-coverage.js` (Features 22–25)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Tasks

### 1. Catalog Profiles Consolidation (`src/catalog/profiles.ts`)
- Standardize the 12 canonical placements across Zalo, LinkedIn, and Admicro:
  - **Zalo Ads (4 placements)**:
    - `zalo.timeline` (alias `zalo_timeline`): title "Nhật ký Zalo", device: 'mobile', aspect ratio '1.91:1' (supports 1:1, 4:5, 16:9), compositions: ['single_image', 'carousel', 'single_video'], safeZone: false.
    - `zalo.video` (alias `zalo_video`): title "Zalo Video", device: 'mobile', aspect ratio '9:16', composition: 'single_video', safeZone: true.
    - `zalo.message` (alias `zalo_message`): title "Tin nhắn OA", device: 'mobile', aspect ratio '1.91:1' / '1:1', safeZone: false.
    - `zalo.article` (alias `zalo_article`): title "Báo mới / Khám phá", device: 'mobile', aspect ratio '1.91:1', safeZone: false.
  - **LinkedIn Ads (4 placements)**:
    - `linkedin.mobile_feed` (alias `li_mobile_feed`): title "Bảng tin Di động", device: 'mobile', aspect ratio '1.91:1' (supports 1:1, carousel), safeZone: false.
    - `linkedin.desktop_feed` (alias `li_desktop_feed`): title "Bảng tin Máy tính", device: 'desktop', aspect ratio '1.91:1', safeZone: false.
    - `linkedin.message` (alias `li_message`): title "Tin nhắn tài trợ", device: 'mobile', aspect ratio '1:1', safeZone: false.
    - `linkedin.spotlight` (alias `li_spotlight`): title "Cột phải Spotlight", device: 'desktop', aspect ratio '1:1', safeZone: false.
  - **Admicro (4 canonical placements)**:
    - `admicro.cafef_pc` (alias `admicro_cafef_pc`): title "CafeF (PC)", device: 'desktop', aspect ratio '1.91:1' (or 300x600 / 1160x250), safeZone: false.
    - `admicro.kenh14_mobile` (alias `admicro_kenh14_mobile`): title "Kenh14 (Mobile)", device: 'mobile', aspect ratio '1.91:1', safeZone: false.
    - `admicro.vnexpress_pc` (alias `admicro_vnexpress_pc`): title "VnExpress (Masthead PC)", device: 'desktop', aspect ratio '1.91:1', safeZone: false.
    - `admicro.dantri_mobile` (alias `admicro_dantri_mobile`): title "Dân trí (In-Page Mobile)", device: 'mobile', aspect ratio '4:5', safeZone: false.
- Update `AD_PROFILES` array to include all 46 canonical profiles (34 original + 12 extended).
- Update `resolveProfile` so that both canonical dot IDs (`zalo.timeline`, `linkedin.mobile_feed`, `admicro.cafef_pc`) and fixture underscore IDs (`zalo_timeline`, `li_mobile_feed`, `admicro_cafef_pc`) resolve accurately to the canonical profile.

### 2. Platform Tabs & Placement UI in `src/App.tsx`
- Ensure the right column platform tabs render all 11 platforms:
  Facebook, Instagram, Threads, TikTok, YouTube, Google Tìm kiếm, Google Hiển thị, ChatGPT, Zalo Ads, LinkedIn Ads, Admicro.
  Tab button labels should match: 'Zalo Ads', 'LinkedIn Ads', 'Admicro'.
- When `admicro` is selected:
  - Render standard placement pills (`placement-pills`), allowing users to click between CafeF, Kenh14, VnExpress, Dantri.
  - Remove the special case that prevented standard pills (`profile.groupId !== 'admicro' ? ...`).
- Enable "Tất cả vị trí" comparison grid for Admicro:
  - In `src/App.tsx:1102`, remove the disable check on Admicro:
    `disabled={compareIds.includes(comparePicker)}` (instead of `&& item.groupId === 'admicro'`).
  - In `src/App.tsx:1503` and `1520`, remove `profile.groupId !== 'admicro' &&` so the "Tất cả vị trí" toggle and Crop button are available for all 11 platforms.

### 3. Rendering Fidelity in `SocialPreview.tsx` & `ContextPreview.tsx`
- Verify that `SocialPreview.tsx` renders authentic previews for:
  - Zalo Timeline, Zalo Video (vertical with reaction rail and safe zones), Zalo Message OA, Zalo Article Báo Mới.
  - LinkedIn Mobile Feed, Desktop Feed, Message Ad (InMail), Spotlight (right rail dynamic card).
- Verify that Admicro editorial mockups render authentic ad placements on CafeF, Kenh14, VnExpress, Dantri article mockups.
- Safe zones: Ensure `zalo.video` (and `zalo_video`) activates safe-zone overlays in `previewPresentation.ts`.

### 4. Unit Test Updates (`src/catalog/catalog.test.ts`, etc.)
- Update `src/catalog/catalog.test.ts` to assert:
  - Exactly 46 canonical placements across all 11 platforms.
  - Exactly 4 placements for Zalo Ads, 4 for LinkedIn Ads, and 4 for Admicro.
  - Both dot and underscore ID resolution.

## Write Ownership
You own:
- `src/catalog/profiles.ts`
- `src/App.tsx`
- `src/features/SocialPreview.tsx`
- `src/features/ContextPreview.tsx`
- `src/features/catalogBridge.ts`
- `src/features/previewPresentation.ts`
- `src/catalog/catalog.test.ts`

Do NOT modify test files under `tests/` (Tier 1–4 suites are opaque-box acceptance tests).

## Verification & Output
- Document your changes, file edits, and verification steps in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m3_1\handoff.md`.
- Update your `progress.md` periodically.
- Send a completion message to the Project Orchestrator when done.
