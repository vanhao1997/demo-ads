# BRIEFING — 2026-10-17T01:46:00Z

## Mission
Survey the existing React/TypeScript codebase in src/ and specs to map components, state architecture, media handling, validation, safe zones, and gap analysis vs 11 platforms/46 placements and R1-R4 requirements.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_codebase_survey_1
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: codebase survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT edit or write source code in src/
- Write reports and working docs only in .agents/teamwork/explorer_codebase_survey_1/

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/App.tsx`, `src/styles.css`
  - `src/domain/types.ts`
  - `src/catalog/profiles.ts`, `src/catalog/admicro.ts`, `src/catalog/inventory.ts`, `src/catalog/sources.ts`
  - `src/features/` (EditorPanel, Preview, PreviewSurface, SocialPreview, ContextPreview, DeviceMockup, deviceMockupModel, OcclusionOverlay, previewPresentation, publisherModel, PublisherStudio, catalogBridge, editorModel, useHistory, PlatformLogo)
  - `src/validation/` (counting.ts, engine.ts)
  - `src/media/inspect.ts`
  - `ORIGINAL_REQUEST.md`, `AD_PREVIEW_SPEC.md`, `PLATFORM_MATRIX.md`, `design.md`, `ACCEPTANCE_TESTS.md`
  - Reference prototype: `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
  - Extracted bundle: `C:\Users\PC\.gemini\antigravity\brain\f696ce27-5926-4d7a-8538-f2973317f140\.system_generated\steps\26\output.txt`
- **Key findings**:
  - 11 platform groups exist in `src/catalog/profiles.ts` and `admicro.ts`.
  - Discrepancy in placement inventory: FB (10), IG (3), Threads (1), YT (6), Google Search (2), Google Display (8), ChatGPT (2), LinkedIn (4) match. But TikTok has 3 profiles (split in-feed video vs standard carousel), Zalo has 12 profiles (spec requires 4 canonical), Admicro has custom publisher studio with ~20 slots rather than 4 canonical packages/placements, and "Tất cả vị trí" is explicitly disabled for Admicro (`profile.groupId !== 'admicro'`).
  - Device frame discrepancy: Desktop mockup uses `pc-1440` (1440x900) instead of `Desktop Chrome (1920x1080, viewport 1920x945)` specified in R2.
  - Multi-file upload: Carousel upload does not automatically switch `composition` to `'carousel'` when multiple files (2-10) are uploaded; file count is not enforced to 10 max in `addFiles`.
  - Overrides: Currently housed in a top-level "Copy riêng" tab with generic dropdowns, rather than collapsible inline platform accordions (Google Search sitelinks/paths, YouTube/GDN/ChatGPT CTAs) under the form.
  - Input styling: Dashed styling is applied to all inputs via `:not(:focus)` rather than distinguishing default/placeholder from user-edited content.
  - Missing SVGs: ChatGPT, LinkedIn, Admicro platform logos fall back to text labels.
  - Standalone `demo-app.html` is missing from `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` (only exists in brain scratchpad).
- **Unexplored areas**: None. Entire codebase survey scope covered.

## Key Decisions Made
- Completed deep dive across domain models, catalog profiles, features, media pipeline, validation engine, and CSS styling.
- Compiling full 5-component handoff report.

## Artifact Index
- handoff.md — detailed survey and gap analysis report
- progress.md — task heartbeat and step tracking
- DISPATCH.md — parent task instructions
