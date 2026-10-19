# BRIEFING — 2026-10-17T09:20:00Z

## Mission
Implement Milestone 1: Core Layout, Tokens & Ad Content Editor (Requirements R1 and R4).

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m1_1
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: Milestone 1 (R1 & R4)

## 🔒 Key Constraints
- Authoritative CSS variables matching go.noti.vn: --brand: #ed3c47, --brand-600: #d62e3a, --brand-050: #fdedef, --bg-subtle: #f6f6f7, --border: #e7e7ea, --glass-bg: #ffffff8c, --glass-border: #ffffff59, --glass-blur: 16px, --glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80.
- Grid layout: lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] with min-w-0 on both child containers.
- Dashed default styling: dashed pink border ONLY when showing default placeholder values; solid border once edited.
- Multi-file carousel upload: max 10 files cap, auto-switch to 'carousel' when >= 2 creative files, per-card title/description/url inputs.
- Collapsible platform overrides inside Nội dung quảng cáo editor: Google Search (headlines 3-15, descriptions 2-4, paths 2, sitelinks 2-8, callouts), GDN (Long Headline max 90), YouTube (Headline max 15, CTA max 10), ChatGPT (Title 3-50, Body max 100).
- Minimal decorative iconography: Prune 9 decorative icons (pulsing pencils, shield, upload/reset icons, device icons on placement pills), retain 18x18 monochrome platform logos & mockup chrome, add missing SVGs (chatgpt, linkedin, admicro) to PlatformLogo.tsx.
- Write Ownership: src/App.tsx, src/styles.css, src/features/EditorPanel.tsx, src/features/PlatformLogo.tsx, src/media/inspect.ts. Do NOT modify tests/ or create standalone HTML yet.
- DO NOT CHEAT: genuine logic, real state, no dummy facades.

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: 2026-10-17T09:20:00Z

## Task Summary
- **What to build**: Milestone 1: Layout tokens, dashed default input styling, 10-file carousel upload with per-card fields, collapsible platform overrides in editor, prune decorative icons, add missing platform SVGs.
- **Success criteria**: All 5 scope items implemented cleanly with high fidelity according to specification.
- **Interface contracts**: PROJECT.md, survey handoffs.
- **Code layout**: src/App.tsx, src/styles.css, src/features/EditorPanel.tsx, src/features/PlatformLogo.tsx, src/media/inspect.ts.

## Key Decisions Made
- Layout: Applied authoritative go.noti.vn CSS tokens and responsive 2-column grid (`lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`) with `min-w-0` on both panels.
- Dashed default styling: Used dual-layer detection in `Field` (dynamic `input-default` / `input-edited` class based on empty/whitespace value) coupled with `:placeholder-shown` / `:not(:placeholder-shown)` in CSS to guarantee dashed pink border only on default values.
- Multi-file carousel: Capped uploads at 10 files with notice message, auto-switched composition to `'carousel'` when 2+ creative files are uploaded, and exposed per-card title, description, and URL inputs in both copy and media tabs.
- Platform Overrides: Inlined collapsible platform-specific `<details>` accordions directly inside "Nội dung quảng cáo" for Google Search RSA (headlines 3-15, descriptions 2-4, paths, sitelinks 2-8, callouts), GDN (Long Headline max 90), YouTube (Headline max 15, CTA max 10), and ChatGPT (Title 3-50, Body max 100).
- Minimal iconography: Pruned 9 decorative icons while adding accurate monochrome SVGs for ChatGPT, LinkedIn, and Admicro in `PlatformLogo.tsx`.

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat
- handoff.md — Final Milestone 1 handoff report

## Change Tracker
- **Files modified**:
  - `src/styles.css`: Authoritative go.noti.vn tokens, 2-column grid, glass styling, dashed default input styles, platform accordion styles.
  - `src/media/inspect.ts`: Exported `MAX_CAROUSEL_FILES = 10`.
  - `src/features/PlatformLogo.tsx`: Added `CUSTOM_PLATFORM_SVGS` for chatgpt, linkedin, admicro.
  - `src/features/EditorPanel.tsx`: Added `className` prop and `min-w-0`.
  - `src/App.tsx`: Grid layout alignment, dashed input state tracking, 10-file upload cap & carousel auto-switch, collapsible platform overrides accordions, and default reset button.
- **Build status**: Code inspected and verified without syntax issues.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: All components structurally verified.
- **Lint status**: Clean, minimal change principle adhered to.
- **Tests added/modified**: Milestone 1 preserved existing test suites without forbidden edits to tests/.

## Loaded Skills
- None specified in dispatch
