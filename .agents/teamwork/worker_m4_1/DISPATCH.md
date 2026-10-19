# Dispatch: worker_m4_1 (Milestone 4 Implementation)

## Date: 2026-10-17T04:50:00Z
## Recipient: worker_m4_1
## Working Directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m4_1

## Mandatory Reading:
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST READ FIRST)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1\handoff.md` (Full blueprint for Features 26, 27, 28, 29)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_2\handoff.md` (Full blueprint for Features 30, 31)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_3\handoff.md` (Full blueprint for Features 32, 33)

## MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective:
Implement Milestone 4: Interactive Tools, Overlays & Validation (Features 26–33).

### Detailed Tasks:
1. **Feature 26 (Bilingual UI Toggle VI/EN)**:
   - Create `src/features/translations.ts` containing `CANONICAL_CTA_MAP` (all 18 canonical CTAs), `SPONSORED_LABELS` (for all 11 platforms, note LinkedIn is `{ vi: 'Được quảng bá', en: 'Promoted' }`), and `SEE_MORE_LABELS`.
   - In `PresentationControls` (`src/App.tsx`), render toolbar container `aria-label="Ngôn ngữ giao diện nền tảng"` with segmented buttons `Tiếng Việt` (active initially with `.bg-white` / `.active`) and `English`.
   - Update in-mockup labels across social and context renderers (`Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, social actions, and CTAs) to update live when locale toggles.

2. **Feature 27 (Safe-Zone Overlays "Vùng bị che")**:
   - In `src/App.tsx`, rename safe zone button to `"Vùng bị che"` on all 8 vertical 9:16 placements (`facebook.stories`, `facebook.reels`, `instagram.stories`, `instagram.reels`, `tiktok.in_feed`, `tiktok.topview`, `youtube.shorts`, `zalo.video`).
   - Set initial `safeZone: false` in `src/features/editorModel.ts` so clicking activates highlighted state (`.border-brand` / `.bg-[#fdedef]`).
   - Verify red danger zones (`rgba(237, 60, 71, 0.30)`) and orange caption zones (`rgba(255, 159, 28, 0.22)`). Hide button and overlays on non-vertical placements.

3. **Feature 28 (Native App UI Toggle "Giao diện app")**:
   - In `PresentationControls` (`src/App.tsx`), replace `<input type="checkbox">` with a `<button>` with text `"Giao diện app"` (`.border-brand` / `.bg-[#fdedef]` when active).
   - In `src/features/DeviceMockup.tsx`, accept `appChrome` prop and conditionally toggle status bar (`.device-phone-status`) and home indicator (`.device-home-indicator`).
   - Pass `appChrome={presentation.appChrome}` from `App.tsx`.

4. **Feature 29 (TikTok TopView Phase Toggle)**:
   - In `PresentationControls` (`src/App.tsx`), render 2-stage segmented button toggle (`"0-3 giây đầu"` vs `"Sau 3 giây"`).
   - Switch between clean full-screen video with Skip button and in-feed overlay.

5. **Feature 30 (Dedicated Zoom Modal "Phóng to")**:
   - Create `src/features/ZoomModal.tsx` with `#0b0b0f`/90 dark backdrop, centered high-res device mockup, close button (`✕` / `close-zoom-btn`), backdrop click-to-close, and keyboard `Escape` handler returning focus cleanly.
   - In `src/App.tsx`, wire "Phóng to" button to open `ZoomModal` without altering draft state.

6. **Feature 31 (Fullscreen Workspace "Toàn màn hình")**:
   - In `src/App.tsx`, update toolbar button text to `"Toàn màn hình"` (switching to `"Thoát toàn màn hình"` when active).
   - Target workspace container (`workbenchRef.current`) so toolbar remains accessible with exit button. Listen to `fullscreenchange` and handle `Escape`.

7. **Feature 32 (Live Validation Verbal Badges)**:
   - In `src/App.tsx`, fix `groupIssueSummary` so tab warning dot only appears when `fail > 0 || warn > 0` (ignoring `unknown`). Under default draft, only TikTok and GDN show warning dots.
   - In `src/catalog/profiles.ts`, add Google Search brand name > 25 warning rule (`cjk_weighted`), TikTok brand emoji disallow rule, and Threads hashtag/link disallow rule.
   - Render authentic "Kiểm tra vị trí này" section below preview stage with verbal badges (`✓ Không có lỗi`, `1 cảnh báo`, `2 lỗi`), distinguishing Errors (`! Lỗi:`), Warnings (`! Cảnh báo:`), and Notes (`ⓘ Lưu ý:`).

8. **Feature 33 (Official Specifications Card)**:
   - Render official specifications card below "Kiểm tra vị trí này": placement title, recommended ratio/px badge e.g. `Nên dùng 4:5 (1440×1800)`, source status badge (`Thông số chính thức` vs `Nguồn thứ cấp`), technical limits, policy notes, and collapsible source links.

## Write Ownership:
You own:
- `src/features/translations.ts`
- `src/features/ZoomModal.tsx`
- `src/catalog/placementSpecs.ts` (or `src/features/placementSpecs.ts`)
- `src/App.tsx`
- `src/styles.css`
- `src/catalog/profiles.ts`
- `src/features/catalogBridge.ts`
- `src/features/previewPresentation.ts`
- `src/features/editorModel.ts`
- `src/features/DeviceMockup.tsx`
- `src/features/occlusion.css`
- `src/features/SocialPreview.tsx`
- `src/features/ContextPreview.tsx`
- Unit tests under `src/`

Do NOT modify files under `tests/`.

## Verification:
- Run/trace all unit tests under `src/` and all Tier 1–4 tests in `tests/`.
- Ensure clean layout, zero console errors, zero regressions against M1, M2, M3.
- Document all file modifications, rationale, and verification evidence in:
  `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m4_1\handoff.md`.
