# Task Assignment — reviewer_m3_1 (Milestone 3 Code Reviewer 1)

## Mission
Review the Milestone 3 implementation (Extended 3 Platforms & Placements Engine) across `src/catalog/profiles.ts`, `src/App.tsx`, `src/features/SocialPreview.tsx`, `src/features/ContextPreview.tsx`, and `src/catalog/catalog.test.ts`.

## Review Scope & Checklist
1. `src/catalog/profiles.ts`:
   - Verify `PLATFORM_GROUPS` contains exactly 11 groups (Facebook, Instagram, Threads, TikTok, YouTube, Google Search, Google Display, ChatGPT, Zalo Ads, LinkedIn Ads, Admicro).
   - Verify `AD_PROFILES` defines exactly 46 canonical profiles: 34 original + 4 Zalo (`zalo.timeline`, `zalo.video`, `zalo.message`, `zalo.article`) + 4 LinkedIn (`linkedin.mobile_feed`, `linkedin.desktop_feed`, `linkedin.message`, `linkedin.spotlight`) + 4 Admicro (`admicro.cafef_pc`, `admicro.kenh14_mobile`, `admicro.vnexpress_pc`, `admicro.dantri_mobile`).
   - Verify bidirectional alias resolution in `resolveProfile` for both canonical dot IDs and fixture underscore IDs.
2. `src/App.tsx`:
   - Verify platform tabs render all 11 platforms with appropriate labels and test IDs (`platform-tab-{id}`).
   - Verify placement pills render standard buttons for all platforms including Admicro.
   - Verify "Tất cả vị trí" toggle and Crop/Fit controls are enabled for all 11 platforms without Admicro exclusion guards.
3. `src/catalog/catalog.test.ts`:
   - Verify tests check for 11 platform groups, 46 canonical profiles, 4 profiles per extended platform, and alias resolution.

## Output
State clearly your verdict: **APPROVE** or **REQUEST_CHANGES** in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m3_1\handoff.md`.
Send a completion message with your verdict to the Project Orchestrator when done.


## 2026-10-17T04:23:42Z
Identity: You are reviewer_m3_1, working in directory c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m3_1.
Your parent is the Project Orchestrator (conversation ID: 853b94d8-915a-4180-baf9-463270ce3714).

MANDATORY: You MUST read c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read:
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m3_1\DISPATCH.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m3_1\handoff.md

Objective:
Review Milestone 3 implementation (Extended 3 Platforms & Placements Engine):
1. Inspect src/catalog/profiles.ts:
   - Verify PLATFORM_GROUPS has exactly 11 groups (including 'admicro').
   - Verify AD_PROFILES has exactly 46 canonical profiles: 34 original + 4 Zalo (zalo.timeline, zalo.video, zalo.message, zalo.article) + 4 LinkedIn (linkedin.mobile_feed, linkedin.desktop_feed, linkedin.message, linkedin.spotlight) + 4 Admicro (admicro.cafef_pc, admicro.kenh14_mobile, admicro.vnexpress_pc, admicro.dantri_mobile).
   - Verify bidirectional alias resolution in resolveProfile (canonical dot IDs and fixture underscore IDs).
2. Inspect src/App.tsx:
   - Verify platform tabs render all 11 platforms.
   - Verify placement pills render standard buttons for all platforms including Admicro.
   - Verify "Tất cả vị trí" toggle and controls are active for all 11 platforms without Admicro guards.
3. Inspect src/catalog/catalog.test.ts:
   - Verify tests check for 11 platform groups and 46 canonical profiles.

Verdict: State clearly APPROVE or REQUEST_CHANGES in your handoff report at c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m3_1\handoff.md. When done, send a completion message to the Project Orchestrator.
