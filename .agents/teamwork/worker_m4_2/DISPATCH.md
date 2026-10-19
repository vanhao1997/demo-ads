## 2026-10-17T05:28:45Z
Identity: You are worker_m4_2, working in directory c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m4_2.
Your parent is the Project Orchestrator (conversation ID: 853b94d8-915a-4180-baf9-463270ce3714).

MANDATORY: You MUST read c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read:
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m4_2\DISPATCH.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m4_1\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\challenger_m4_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Remediate the 4 specific issues identified by reviewer_m4_1 and challenger_m4_1 on Milestone 4:

1. Hide Vertical Reaction Column & Bottom Navigation on data-app-chrome='false':
   In src/features/socialPreview.css (around lines 2241-2254) and src/features/contextPreview.css:
   Ensure that when .social-native has data-app-chrome='false', the vertical reaction columns and bottom navigation bars are hidden:
   .social-native[data-app-chrome='false'] .tiktok-rail,
   .social-native[data-app-chrome='false'] .tiktok-bottom-nav,
   .social-native[data-app-chrome='false'] .meta-reels-rail,
   .social-native[data-app-chrome='false'] .meta-reels-bottom-nav,
   .context-shorts-shell[data-app-chrome='false'] .context-shorts-rail {
     display: none !important;
   }

2. Support tt_topview Fixture ID in SocialPreview.tsx:
   In src/features/SocialPreview.tsx (lines 344 and 941):
   Update the isTopView check to:
   const isTopView = props.profileId === 'tiktok.topview' || props.profileId === 'tt_topview'
   Ensure TopView badges (.tiktok-topview-badges) and intro phase suppression work for both canonical dot ID and fixture underscore ID.

3. Restrict "Vùng bị che" Button Strictly to Vertical 9:16 Placements:
   In src/App.tsx (around line 1722):
   Update:
   vertical={isVerticalSafeZonePlacement(profile.id)}
   instead of vertical={profile.renderer === 'vertical'}, so facebook.reels_banner (fb_reels_overlay, a 1:1 overlay placement) does not show the "Vùng bị che" button.

4. Add Canonical Key Lookup in translateCta:
   In src/features/translations.ts (around line 57):
   In translateCta(value: string, locale: SupportedLocale):
   Add:
   if (CANONICAL_CTA_MAP[value]) {
     return CANONICAL_CTA_MAP[value][locale]
   }
   so that passing canonical keys (e.g. 'learn_more', 'shop_now') directly returns the localized string.

5. Add Unit Test Assertions:
   In src/features/milestone4.test.tsx, add unit tests asserting:
   - translateCta('learn_more', 'vi') === 'Tìm hiểu thêm' and translateCta('learn_more', 'en') === 'Learn more'.
   - isVerticalSafeZonePlacement('fb_reels_overlay') === false and isVerticalSafeZonePlacement('facebook.reels_banner') === false.
   - isTopView evaluates to true for both 'tiktok.topview' and 'tt_topview'.

Write Ownership:
You own:
- src/features/socialPreview.css
- src/features/contextPreview.css
- src/features/SocialPreview.tsx
- src/features/translations.ts
- src/App.tsx
- src/features/milestone4.test.tsx

Do NOT modify files under tests/.

Deliverable:
Document all code changes, rationale, and verification steps in:
c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m4_2\handoff.md.
When done, send a completion message to the Project Orchestrator.
