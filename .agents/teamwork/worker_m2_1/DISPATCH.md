## 2026-10-17T02:45:58Z
Identity: You are worker_m2_1, working in directory c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m2_1.
Your parent is the Project Orchestrator (conversation ID: 853b94d8-915a-4180-baf9-463270ce3714).

MANDATORY: You MUST read c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read:
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\spec_miner_survey_1\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_codebase_survey_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement Milestone 2: Original 8 Platforms & Placements Engine (Requirement R2, 34 canonical placements).

Scope & Implementation Tasks:
1. Placement Catalog Consolidation (src/catalog/profiles.ts):
   - Standardize the 8 original platform groups to exactly 34 placements:
     - facebook (10 placements): facebook.feed, facebook.video_feeds, facebook.stories, facebook.reels, facebook.reels_banner, facebook.in_stream, facebook.marketplace, facebook.search_results, facebook.right_column, facebook.audience_network.
     - instagram (3 placements): instagram.feed, instagram.stories, instagram.reels.
     - threads (1 placement): threads.feed.
     - tiktok (2 placements): consolidate to tiktok.in_feed (covering both video & carousel compositions) and tiktok.topview.
     - youtube (6 placements): youtube.skippable_in_stream, youtube.non_skippable_in_stream, youtube.bumper, youtube.desktop_in_stream, youtube.in_feed, youtube.shorts.
     - google-search (2 placements): google.search.mobile, google.search.desktop.
     - google-display (8 placements): google.display.300x250, google.display.336x280, google.display.728x90, google.display.300x600, google.display.160x600, google.display.320x100, google.display.320x50, google.display.native_in_article.
     - chatgpt (2 placements): chatgpt.chat_card.web, chatgpt.chat_card.mobile.
   - Verify all placement labels match go.noti.vn specs from spec_miner_survey_1/handoff.md.

2. Proportional Device Frames (src/features/deviceMockupModel.ts, src/features/DeviceMockup.tsx):
   - Desktop Chrome Frame: Update or add pc-1920 (or update desktop mockup model) to exact Desktop Chrome 1920 × 1080 specs:
     viewport 1920 × 945, chromeHeader 87px (tab bar 41px + navigation bar 46px), outer frame 1920 × 1032.
     Ensure desktop placements (google.search.desktop, google.display.728x90, google.display.300x600, google.display.160x600, facebook.right_column, youtube.desktop_in_stream, chatgpt.chat_card.web) use this desktop frame.
   - Mobile Frame: Ensure iPhone 15 / 16 maintains proportional 393 × 852 viewport, 411 × 870 casing, 54px status bar, dynamic island, and home indicator.

3. Placement Renderers & Safe-Zone Overlays (src/features/SocialPreview.tsx, src/features/ContextPreview.tsx, src/features/Preview.tsx, src/features/OcclusionOverlay.tsx):
   - Ensure ChatGPT previews (chatgpt.chat_card.web and chatgpt.chat_card.mobile) render the ChatGPT conversational UI, sponsored badge, and ChatGPT brand logo cleanly.
   - Verify safe-zone danger and caption expansion overlays on vertical placements (facebook.stories, facebook.reels, instagram.stories, instagram.reels, tiktok.in_feed, tiktok.topview, youtube.shorts).

Write Ownership:
You own: src/catalog/profiles.ts, src/features/deviceMockupModel.ts, src/features/SocialPreview.tsx, src/features/ContextPreview.tsx, src/features/Preview.tsx, src/features/DeviceMockup.tsx.
Report all changes and verification in c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m2_1\handoff.md.
