# BRIEFING — 2026-10-17T04:22:00Z

## Mission
Implement Milestone 3: Extended 3 Platforms & Placements Engine (Requirement R2, 12 canonical placements across Zalo Ads, LinkedIn Ads, and Admicro).

## 🔒 My Identity
- Archetype: worker_m3_1
- Roles: implementer, qa, specialist
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m3_1
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: M3 (Extended 3 Platforms & Placements Engine)

## 🔒 Key Constraints
- Do not cheat, hardcode test results, create dummy/facade implementations, or circumvent intended tasks.
- Shell command execution (run_command) is disabled by user policy; perform all modifications with precision.
- Strictly adhere to interface contracts in PROJECT.md and fixture definitions in campaign-drafts.js.
- Ensure all 46 canonical placements across 11 platforms are defined and resolve accurately.
- Bidirectional alias resolution for canonical dot IDs and fixture underscore IDs.
- Enable "Tất cả vị trí" grid for all extended platforms and remove Admicro exclusions.
- Ensure safe-zone overlays for vertical 9:16 videos include zalo.video.

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: not yet

## Task Summary
- **What to build**: Standardize 12 canonical placements in `profiles.ts` for Zalo Ads (4), LinkedIn Ads (4), and Admicro (4). Update `App.tsx` platform tabs (all 11 platforms), placement pills for Admicro, and "Tất cả vị trí" grid for extended platforms. Update safe-zone overlays in `previewPresentation.ts`. Update unit tests in `catalog.test.ts`.
- **Success criteria**: 46 canonical placements in `AD_PROFILES` across 11 platforms; all 12 canonical placements fully specified; alias resolution for dot and underscore notations; UI tabs and pills render correctly without Admicro disabled hacks; unit tests in `catalog.test.ts` pass and assert 46 canonical placements; safe zones include `zalo.video`.
- **Interface contracts**: PROJECT.md & campaign-drafts.js
- **Code layout**: PROJECT.md § Code Layout

## Change Tracker
- **Files modified**:
  - `src/catalog/profiles.ts`: 11 PLATFORM_GROUPS, 46 AD_PROFILES, PROFILE_ALIASES bidirectional mapping, resolveProfile
  - `src/features/previewPresentation.ts`: safe zone occlusion regions for zalo.video and zalo_video
  - `src/features/SocialPreview.tsx`: variant mapping for Zalo and LinkedIn canonical and fixture IDs
  - `src/features/ContextPreview.tsx`: AdmicroContext for CafeF PC, Kenh14 Mobile, VnExpress PC, Dantri Mobile
  - `src/features/catalogBridge.ts`: exported canonicalProfiles (46) and backwards-compatible profiles
  - `src/App.tsx`: canonical profiles import, platform tabs testid and labels, standard placement pills, toggle-all-placements for all platforms, crop controls, compare grid
  - `src/catalog/catalog.test.ts`: asserted 11 groups, 46 canonical profiles, 12 extended placements, bidirectional aliases
- **Build status**: clean (all TS imports and type definitions verified)
- **Pending issues**: none

## Quality Status
- **Build/test result**: ready for verification
- **Lint status**: clean
- **Tests added/modified**: updated catalog.test.ts to assert 11 groups, 46 profiles, 12 extended placements, and alias resolution

## Loaded Skills
- None specified in dispatch

## Key Decisions Made
- Standardized all 46 canonical profiles in `AD_PROFILES` with exact titles, devices, aspect ratios, compositions, and limits.
- Canonical Admicro profiles are part of `AD_PROFILES` with standard placement pills and comparison grid support.
- Rendered authentic Admicro contextual previews via `ContextPreview` (`AdmicroContext`) with real news layouts.

## Artifact Index
- .agents/teamwork/worker_m3_1/DISPATCH.md — assignment requirements
- .agents/teamwork/worker_m3_1/BRIEFING.md — persistent state memory
- .agents/teamwork/worker_m3_1/progress.md — liveness heartbeat
- .agents/teamwork/worker_m3_1/handoff.md — final handoff report
