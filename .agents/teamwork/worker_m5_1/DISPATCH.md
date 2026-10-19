# Dispatch: worker_m5_1

## Objective
Implement Milestone 5: Dual Deliverable Standalone HTML Sync & Packaging (`demo-app.html`).
Create and deploy synchronized standalone zero-dependency single-file HTML builds at:
1. `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
2. `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`

## Detailed Implementation Tasks

### 1. Zero-Dependency Standalone Architecture
- Structure as a single self-contained HTML5 file using:
  - React 18 UMD (`https://unpkg.com/react@18/umd/react.production.min.js`)
  - ReactDOM 18 UMD (`https://unpkg.com/react-dom@18/umd/react-dom.production.min.js`)
  - Babel Standalone (`https://unpkg.com/@babel/standalone/babel.min.js`)
  - Tailwind Play CDN (`https://cdn.tailwindcss.com`) with inlined `tailwind.config`
  - Inlined `<style>` containing all design tokens (`--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`, `--glass-bg: rgba(255, 255, 255, 0.78)`, `--glass-blur: 16px`), glass card, zoom modal, device frames, and dashed default inputs.
  - Authentic monochrome 18×18 SVGs for all 11 platforms embedded in JSX.
  - Complete React component tree inside `<script type="text/babel">`.

### 2. Complete 11 Platforms & 46 Canonical Placements
- Support all 11 platform groups and 46 canonical placements (34 original + 12 extended: Zalo 4, LinkedIn 4, Admicro 4).
- Ensure ID normalization handles both canonical namespaced IDs (e.g. `zalo.timeline`, `tiktok.topview`) and test fixture underscore IDs (e.g. `zalo_timeline`, `tt_topview`).
- Ensure "Tất cả vị trí" 2-column comparative grid is enabled and functional across all 11 platforms.

### 3. Dedicated Accessible ZoomModal ("Phóng to") — Feature 30
- Fix legacy bug: eliminate `onClick={() => setShowAll(true)}` from the "Phóng to" button.
- Wire "Phóng to" button to open `ZoomModal`:
  - Fixed dark backdrop `.zoom-modal-backdrop` (`background-color: rgba(11, 11, 15, 0.9)`, `backdrop-filter: blur(8px)`, `z-index: 9999`, `role="dialog"`, `aria-modal="true"`).
  - Header `.zoom-modal-header` with platform/placement title, resolution badge (`.zoom-modal-meta`), and close button `.close-zoom-btn` with `✕` glyph, `aria-label="Đóng"`, `title="Đóng (Esc)"`.
  - Body `.zoom-modal-body > .zoom-modal-content` displaying centered high-resolution mockup.
  - Keyboard: `Escape` key closes modal and returns focus to trigger button.
  - Backdrop click closes modal.

### 4. Bilingual UI Translation & Plumbing — Feature 26
- Embed `CANONICAL_CTA_MAP` (18 canonical CTAs), `SPONSORED_LABELS` (all 11 platforms, including LinkedIn `Được quảng bá` ↔ `Promoted`), `SEE_MORE_LABELS` (Instagram lowercase `xem thêm` ↔ `more`, Threads `Xem thêm` ↔ `More`).
- Add helper functions `translateCta`, `translateSponsored`, `translateSeeMore`.
- Plumb `lang` parameter down through `PlacementPreview` and into all individual platform renderers.
- Dynamically translate in-mockup labels based on active language (`vi` / `en`).

### 5. Safe-Zone Overlays ("Vùng bị che") — Feature 27
- Default initial state: `useState(false)` (starts as `false`).
- Restrict "Vùng bị che" button strictly to the 8 vertical 9:16 video placements (exclude `facebook.reels_banner` / `fb_reels_overlay`).
- Highlight active button with `.border-brand` and `.bg-[#fdedef]`.
- Render red danger zones (`rgba(237, 60, 71, 0.3)`) and orange caption zones (`rgba(255, 159, 28, 0.22)`).

### 6. Native App UI Toggle ("Giao diện app") & Chrome Hooks — Feature 28
- Wire "Giao diện app" button to `showAppUi` state.
- Include test hooks `.device-phone-status` (with `9:41`) and `.device-home-indicator` in `IPhoneFrame`.
- When `showAppUi === false`: unmount/hide `.device-phone-status`, `.device-home-indicator`, and all in-mockup reaction rails / bottom nav bars.

### 7. TikTok TopView Phase Toggle — Feature 29
- When `tt_topview` / `tiktok.topview` is selected, render segmented button group `role="group" aria-label="Giai đoạn hiển thị TopView"` with "0-3 giây đầu" and "Sau 3 giây".
- Phase "0-3 giây đầu": render clean video with "Bỏ qua" skip button and suppress in-feed overlays.
- Phase "Sau 3 giây": render interactive in-feed overlays.

### 8. Fullscreen Workspace Toggle — Feature 31
- Track fullscreen state and toggle toolbar button label between `"Toàn màn hình"` and `"Thoát toàn màn hình"`.
- Listen to `fullscreenchange` and handle `Escape`.

### 9. Live Validation Verbal Badges & Official Specs Card — Features 32 & 33
- CJK double-width character accounting for Google Search and GDN (`countGoogleCharacters`).
- Verbal badges: `✓ Không có lỗi`, `! X lỗi` (`bg-[#fdedef] text-[#ed3c47]`), `X cảnh báo` (`bg-[#fbeee5] text-[#e8590c]`).
- TikTok brand name validation: max 20 chars, disallow emoji.
- Render official placement specs card with official ratios and dimensions.

### 10. Multi-File Carousel Upload — Feature 09
- Allow up to 10 files in file upload input (`multiple` attribute).
- Display counter badge `{assets.length}/10 tệp`.
- Auto-switch composition to `'carousel'` when 2+ assets are loaded.

### 11. Minimal Decorative Iconography (Requirement R4)
- Omit all pulsing pencil SVGs, decorative shield icons, and button glyphs.
- Strictly preserve authentic 18×18 monochrome platform SVGs and authentic device chrome.

### 12. Dual Deliverable Synchronization
- Ensure both files (`scratch/demo-ads/demo-app.html` and `brain/.../demo-app.html`) are completely identical and synchronized.

## Write Ownership
You own:
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
- `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
Do NOT modify files under `tests/` or `src/`.

## 2026-10-17T05:53:50Z
Identity: You are worker_m5_1, working in directory c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m5_1.
Your parent is the Project Orchestrator (conversation ID: 853b94d8-915a-4180-baf9-463270ce3714).

MANDATORY: You MUST read c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read:
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m5_1\DISPATCH.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_1\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_2\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement Milestone 5: Dual Deliverable Standalone HTML Sync & Packaging (demo-app.html).
Create and deploy synchronized standalone zero-dependency single-file HTML builds at:
1. c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html
2. C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html


## 2026-10-17T06:22:00Z
Resumed session to complete dual deliverable synchronization (Chunks 4 & 5).
Synchronized deliverable to C:\Users\PC\.gemini\antigravity\brain\55bcab9c-102d-4473-9c43-62d4ca627d6f\scratch\demo-app.html.
Both deliverables are verified bit-identical (3,539 lines, 194,468 bytes).
