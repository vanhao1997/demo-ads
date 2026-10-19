# Plan — Project Orchestrator

## Objective
Build and verify a pixel-perfect, functionally complete Ad Preview clone web application replicating `https://go.noti.vn/cong-cu/xem-truoc-quang-cao` and extended with Zalo Ads, LinkedIn Ads, and Admicro (total 11 platforms, 46 placements) with dual deliverables (React/TS in `src/` and standalone HTML in `demo-app.html`).

## Execution Phases

### Phase 0: Survey & Scope Mapping
- Spawn 3 parallel Explorers:
  - Explorer 1: Inspect reference bundle & specs (`steps/26/output.txt`, `steps/203/output.txt`, `steps/209/output.txt`, target URL) to enumerate all 8 original platforms, 3 extended platforms, 46 placement specs, device frames, safe zones, and UI strings.
  - Explorer 2: Inspect existing React workspace (`src/`, `package.json`, `design.md`, `AD_PREVIEW_SPEC.md`, `PLATFORM_MATRIX.md`, `ACCEPTANCE_TESTS.md`) to assess current implementation status, gaps, and architecture.
  - Explorer 3: Inspect existing standalone prototype (`7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`), visual QA reports, and iconography requirements (verifying removal of decorative icons).
- Synthesize all findings into `PROJECT.md` at project root with complete Feature Inventory, Milestones, Interface Contracts, and Code Layout.

### Phase 1: Dual Track Decomposition
- E2E Testing Track: Launch E2E Testing Orchestrator to design independent opaque-box browser verification harness & test suite (Tiers 1-4) across all 11 platforms and 46 placements, publishing `TEST_READY.md`.
- Implementation Track: Decompose into milestones:
  - Milestone 1: Core Layout & Ad Content Editor (R1, R4 - clean inputs, no decorative icons, multi-file carousel upload, validation, overrides)
  - Milestone 2: Original 8 Platforms & Placements Engine (Facebook 10, Instagram 3, Threads 1, TikTok 2, YouTube 6, Google Search 2, GDN 8, ChatGPT 2) with device frames & safe zones
  - Milestone 3: Extended Platforms (Zalo Ads 4, LinkedIn Ads 4, Admicro 4) with authentic mockup chrome & specs
  - Milestone 4: Global Interactive Tools & Overlays (Language toggle VI/EN, "Tất cả vị trí" 2-col comparison grid, TopView toggle, Zoom modal, Fullscreen, Specs card)
  - Milestone 5: Standalone HTML Sync & Zero-Dependency Bundle packaging (`demo-app.html`)
  - Milestone 6: Final Acceptance — 100% E2E test pass + Tier 5 adversarial hardening

### Phase 2: Execution & Verification Loop
- For each milestone, execute the Explorer -> Worker -> Reviewers -> Challengers -> Forensic Auditor cycle.
- Audit verdict is a binary veto. All gates must pass.

### Phase 3: Final Acceptance & Sentinel Handoff
- Full browser verification of live application against reference URL.
- Report completion and deliverable links back to Sentinel.
