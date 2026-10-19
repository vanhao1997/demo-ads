# Dispatch: explorer_m4_3 (Milestone 4 Exploration 3)

## Date: 2026-10-17T04:36:00Z
## Recipient: explorer_m4_3
## Working Directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_3

## Mandatory Reading:
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST READ FIRST)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier1-feature-coverage.js` (Features 32, 33)
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\validation\`

## Objective:
Investigate codebase state and formulate an exact implementation strategy for:
1. Feature 32: Live Validation Verbal Badges ("Kiểm tra vị trí này")
   - Inspect `src/validation/engine.ts`, `counting.ts`, `index.ts`.
   - UI Integration in `src/App.tsx`:
     - Platform tabs & placement indicators: show warning dot badge on platforms/placements with issues (e.g. TikTok, GDN, Threads).
     - Verbal status badge: display verbal status e.g. "Không có lỗi" (when all pass) or issue count e.g. "1 cảnh báo", "2 lỗi".
     - Distinguish between Errors, Warnings, and Notes/Info.
     - Brand name exceeding 25 chars triggers Google Search warning rule.
     - Live validation updates in real-time as user types.
2. Feature 33: Official Specifications Card
   - Collapsible drawer or section displaying official placement specifications, aspect ratios, recommended pixel resolutions (e.g. 1440×1800 for 4:5), truncation estimates (e.g. 124 chars for FB feed), source status (authoritative vs estimated), and platform policy notes.

## Deliverable:
Write your structured exploration report with code locations, gaps, and concrete implementation plan to:
`c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_3\handoff.md`.
