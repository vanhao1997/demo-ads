# BRIEFING — 2026-10-17T04:47:00Z

## Mission
Investigate codebase state and formulate exact implementation strategy for Feature 32 (Live Validation Verbal Badges & Indicators) and Feature 33 (Official Specifications Card).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_3
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: milestone_4

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify source files or test files directly
- Write all findings and proposals to .agents/teamwork/explorer_m4_3/

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: 2026-10-17T04:47:00Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_READY.md`
  - `tests/tier1-feature-coverage.js` (Features 32 & 33 test suites lines 975-1020)
  - `tests/fixtures/campaign-drafts.js` (`PLATFORMS_FIXTURE`, `PLACEMENTS_FIXTURE`, `DEFAULT_CAMPAIGN_DRAFT`)
  - `tests/tier2-boundary-corners.js` (CJK counting logic `countGoogleCharacters`)
  - `tests/run-node-tests.mjs`
  - `src/validation/engine.ts`, `src/validation/counting.ts`, `src/catalog/profiles.ts`, `src/catalog/sources.ts`
  - `src/features/catalogBridge.ts`, `src/features/uiTypes.ts`
  - `src/App.tsx` (platform tabs, placement pills, validation panel, spec-drawer)
  - `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` (lines 2715-3021: authentic 1:1 validation & specs UI)
  - `C:\Users\PC\.gemini\antigravity\brain\f696ce27-5926-4d7a-8538-f2973317f140\.system_generated\steps\26\output.txt` (original `go.noti.vn` code bundle 20929)
- **Key findings**:
  - **Feature 32**:
    1. Status badge requires verbal text: `"Không có lỗi"` when clean, `"1 cảnh báo"` / `"2 cảnh báo"` when warnings present, and `"1 lỗi"` / `"2 lỗi"` when errors present.
    2. Distinction: Errors (`! Lỗi:`), Warnings (`! Cảnh báo:`), Notes/Info (`ⓘ Lưu ý:`).
    3. Tab indicator dot bug: Currently `groupIssueSummary` counts `item.status !== 'pass'`, but because `context.compatibility` check always returns `'unknown'`, every platform has issues! Must only show warning dot when `hasErrors || hasWarnings` (`fail > 0 || warn > 0`). In default state, only TikTok (primary text 147 > 100) and GDN (headline 57 > 30) have warning dots.
    4. Google Search Brand Length: Google RSA profiles lack brand length rule; need `textMax('identity.brandName', 25, 'Tên doanh nghiệp quá 25 ký tự.', { countingStrategy: 'cjk_weighted', severity: 'warn' })`.
    5. TikTok Brand Emoji: `disallowPattern` rule `\p{Extended_Pictographic}` -> `"Tên hiển thị TikTok không được có emoji."`.
    6. Threads Copy Rule: `disallowPattern` `#|https?:\/\/` -> `"Threads không cho hashtag hay đường link trong văn bản chính."`.
  - **Feature 33**:
    1. Specifications Card structure in `src/App.tsx`: Placement title, recommended aspect ratio badge (e.g. `Nên dùng 4:5 (1440×1800)`), source status badge (`Thông số chính thức` vs `Nguồn thứ cấp` vs `Bố cục ước lượng`), bulleted specifications (ratios, character limits, truncation estimates, policy notes e.g. Meta Messenger deprecation), and collapsible documentation sources drawer.
    2. Data model mapping: `FIXTURE_PLACEMENT_ID_MAP` in `src/App.tsx` perfectly bridges 46 catalog profiles to `PLACEMENTS_FIXTURE`.
- **Unexplored areas**: None. All core requirements, edge cases, and UI models investigated.

## Key Decisions Made
- Formulate complete, concrete implementation blueprints for both `src/` (React TypeScript) and `demo-app.html` (standalone prototype).
- Deliver 5-component handoff report to `handoff.md` and notify Orchestrator.

## Artifact Index
- DISPATCH.md — Task assignment and requirements
- BRIEFING.md — Situational awareness and working memory
- progress.md — Heartbeat and step tracking
- handoff.md — Final structured handoff report
