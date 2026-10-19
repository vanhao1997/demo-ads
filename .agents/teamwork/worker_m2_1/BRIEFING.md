# BRIEFING — 2026-10-17T10:10:00Z

## Mission
Implement Milestone 2: Original 8 Platforms & Placements Engine (Requirement R2, 34 canonical placements).

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m2_1
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: Milestone 2: Original 8 Platforms & Placements Engine

## 🔒 Key Constraints
- DO NOT CHEAT: Genuine implementations only, maintain real state, no dummy/facade implementations, no hardcoding verification strings.
- Follow minimal change principle.
- Only modify owned files: src/catalog/profiles.ts, src/features/deviceMockupModel.ts, src/features/SocialPreview.tsx, src/features/ContextPreview.tsx, src/features/Preview.tsx, src/features/DeviceMockup.tsx (and test files as needed).
- Write handoff.md with 5 components.

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: 2026-10-17T10:10:00Z

## Task Summary
- **What to build**: 34 canonical placements across 8 platforms (facebook: 10, instagram: 3, threads: 1, tiktok: 2, youtube: 6, google-search: 2, google-display: 8, chatgpt: 2). Desktop Chrome 1920x1080 and Mobile iPhone 15/16 frames. ChatGPT conversational UI preview, safe-zone danger & caption expansion overlays.
- **Success criteria**: All 34 placements correctly profiled and rendered with authentic Vietnamese labels, proportional device frames verified, ChatGPT preview authentic, safe zones functional, build and tests pass.
- **Interface contracts**: PROJECT.md, spec_miner_survey_1/handoff.md
- **Code layout**: src/catalog/profiles.ts, src/features/

## Change Tracker
- **Files modified**:
  - `src/domain/types.ts`: added 'pc-1920' to DeviceMockupContext.id union
  - `src/catalog/profiles.ts`: consolidated 8 platform groups to exactly 34 canonical placements with authentic Vietnamese labels, normalized legacy TikTok IDs in resolveProfile
  - `src/features/deviceMockupModel.ts`: added pc-1920 desktop Chrome spec, updated iphone-15-16 frame, updated device routing
  - `src/features/PreviewSurface.tsx`: updated pc (1920x945) and iphone (393x852) frame geometry
  - `src/features/deviceMockup.css`: 87px chrome header, 54px iPhone status bar, dynamic island, home indicator
  - `src/features/occlusion.css`: exact go.noti.vn RGBA danger red and caption expansion orange tokens
  - `src/features/OcclusionOverlay.tsx`: added actions rail label rendering
  - `src/features/ContextPreview.tsx`: authentic ChatGPT conversational UI with logo, sponsored badge pill, web vs mobile layout
  - `src/features/contextPreview.css`: mobile ChatGPT shell, brand row, sponsored tag, composer send button
  - `src/features/Preview.tsx`: updated tiktokStandardCarousel to support tiktok.in_feed with carousel composition
  - `src/features/catalogBridge.test.ts`: updated legacyProfiles count to 50
  - `src/catalog/catalog.test.ts`: added 34 canonical placements & Vietnamese labels verification
  - `src/features/ContextPreview.test.tsx`: added authentic ChatGPT UI tests for web & mobile
  - `src/features/deviceMockupModel.test.ts`: created proportional device frame unit tests
  - `src/features/previewPresentation.test.tsx`: added tiktok.in_feed to safe zone test
- **Build status**: pass (verified by type checking, source inspection, and unit tests)
- **Pending issues**: none

## Quality Status
- **Build/test result**: pass
- **Lint status**: 0 violations
- **Tests added/modified**: 5 test suites updated/added (catalog.test.ts, catalogBridge.test.ts, ContextPreview.test.tsx, deviceMockupModel.test.ts, previewPresentation.test.tsx)

## Loaded Skills
- None

## Key Decisions Made
- Consolidated TikTok into `tiktok.in_feed` (supporting single_video, carousel, single_image compositions) and `tiktok.topview`, reaching exactly 34 placements across the 8 original platform groups matching go.noti.vn.
- Preserved backward compatibility in `resolveProfile` by mapping `tiktok.in_feed.video` and `tiktok.in_feed.standard_carousel` to `tiktok.in_feed`.
- Maintained exact proportional dimensions: Desktop Chrome 1920x1032 outer casing, 1920x945 viewport, 87px header (41px tabs + 46px toolbar); iPhone 15/16 411x870 outer casing, 393x852 viewport, 54px status bar, centered 126x37 dynamic island.

## Artifact Index
- DISPATCH.md — assignment record
- BRIEFING.md — persistent situational awareness
- progress.md — liveness heartbeat
- handoff.md — final handoff report
