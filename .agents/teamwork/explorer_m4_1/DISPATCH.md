# Dispatch: explorer_m4_1 (Milestone 4 Exploration 1)

## Date: 2026-10-17T04:36:00Z
## Recipient: explorer_m4_1
## Working Directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1

## Mandatory Reading:
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST READ FIRST)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\fixtures\campaign-drafts.js`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier1-feature-coverage.js` (Features 26, 27, 28, 29)

## Objective:
Investigate codebase state and formulate an exact implementation strategy for:
1. Feature 26: Bilingual UI Toggle (VI / EN)
   - Toolbar container: `aria-label="Ngôn ngữ giao diện nền tảng"`
   - Segmented buttons: `Tiếng Việt` (active initially with `.bg-white` / `.active`) and `English`
   - In-mockup dynamic labels: `Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, social actions, and CTAs across all 11 platforms.
2. Feature 27: Safe-Zone Overlays ("Vùng bị che")
   - Button text: "Vùng bị che" on all 8 vertical 9:16 placements (`border-brand` / `bg-[#fdedef]` when active).
   - Overlay geometry: red danger zones (`rgba(237, 60, 71, 0.30)`) and orange caption zones (`rgba(255, 159, 28, 0.22)`).
3. Feature 28: Native App UI Toggle ("Giao diện app")
   - Button text: "Giao diện app" button (not checkbox) toggling native chrome (status bar, bottom navigation, search bar, reaction rails).
4. Feature 29: TikTok TopView Phase Toggle
   - 2-stage toggle ("0-3 giây đầu" / "Sau 3 giây") switching full video vs in-feed overlay.

## Deliverable:
Write your structured exploration report with code locations, gaps, and concrete implementation plan to:
`c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1\handoff.md`.
