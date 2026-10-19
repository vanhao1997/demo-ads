# Milestone 3 Challenger Verification Report: Extended 3 Platforms & Placements Engine

## 1. Observation

1. **46 Canonical Placements Count & Platform Distribution (`src/catalog/profiles.ts`)**:
   - `PLATFORM_GROUPS` defines exactly 11 platform groups (lines 19–32): `facebook`, `instagram`, `threads`, `tiktok`, `youtube`, `google-search`, `google-display`, `chatgpt`, `zalo`, `linkedin`, `admicro`.
   - `AD_PROFILES` defines exactly 46 canonical profiles (lines 366–1213) across all 11 platforms:
     - Facebook: 10 (`facebook.feed`, `facebook.video_feeds`, `facebook.stories`, `facebook.reels`, `facebook.reels_banner`, `facebook.in_stream`, `facebook.marketplace`, `facebook.search_results`, `facebook.right_column`, `facebook.audience_network`)
     - Instagram: 3 (`instagram.feed`, `instagram.stories`, `instagram.reels`)
     - Threads: 1 (`threads.feed`)
     - TikTok: 2 (`tiktok.in_feed`, `tiktok.topview`)
     - YouTube: 6 (`youtube.skippable_in_stream`, `youtube.non_skippable_in_stream`, `youtube.bumper`, `youtube.desktop_in_stream`, `youtube.in_feed`, `youtube.shorts`)
     - Google Search: 2 (`google.search.mobile`, `google.search.desktop`)
     - Google Display: 8 (`google.display.300x250`, `google.display.336x280`, `google.display.728x90`, `google.display.300x600`, `google.display.160x600`, `google.display.320x100`, `google.display.320x50`, `google.display.native_in_article`)
     - ChatGPT: 2 (`chatgpt.chat_card.web`, `chatgpt.chat_card.mobile`)
     - Zalo Ads: 4 (`zalo.timeline`, `zalo.video`, `zalo.message`, `zalo.article`)
     - LinkedIn Ads: 4 (`linkedin.mobile_feed`, `linkedin.desktop_feed`, `linkedin.message`, `linkedin.spotlight`)
     - Admicro: 4 (`admicro.cafef_pc`, `admicro.kenh14_mobile`, `admicro.vnexpress_pc`, `admicro.dantri_mobile`)
     - Total canonical placements: $10 + 3 + 1 + 2 + 6 + 2 + 8 + 2 + 4 + 4 + 4 = 46$.
   - Every profile defines `id`, `groupId`, `groupTitle`, `placement`, `renderer`, `device`, `allowedCompositions`, `rules`, `sourceRefs`, and `specVersion`.

2. **Alias Integrity & Bidirectional Resolution (`src/catalog/profiles.ts` lines 1579–1655)**:
   - Direct resolution (`AD_PROFILES.find`) resolves all 46 canonical dot IDs to their respective Profile instances with zero undefined returns.
   - `PROFILE_ALIASES` defines bidirectional mappings for the 12 extended placements:
     - Zalo: `zalo_timeline` ↔ `zalo.timeline`, `zalo_video` ↔ `zalo.video`, `zalo_message` ↔ `zalo.message`, `zalo_article` ↔ `zalo.article`.
     - Additional Zalo aliases: `zalo_journal` → `zalo.timeline`, `zalo.video.safe_zone` → `zalo.video`, `zalo.native.single_image` → `zalo.timeline`, `zalo.native.multi_image` → `zalo.timeline`, `zalo.oa_article.native` → `zalo.article`.
     - LinkedIn: `li_mobile_feed` ↔ `linkedin.mobile_feed`, `li_desktop_feed` ↔ `linkedin.desktop_feed`, `li_message` ↔ `linkedin.message`, `li_spotlight` ↔ `linkedin.spotlight`.
     - Additional LinkedIn aliases: `linkedin_feed_mobile` → `linkedin.mobile_feed`, `linkedin.feed.mobile` → `linkedin.mobile_feed`, `linkedin_feed_desktop` → `linkedin.desktop_feed`, `linkedin.feed.desktop` → `linkedin.desktop_feed`, `linkedin_message` → `linkedin.message`, `linkedin_right_rail` → `linkedin.spotlight`, `linkedin.right_rail` → `linkedin.spotlight`, `linkedin_spotlight_ad` → `linkedin.spotlight`.
     - Admicro: `admicro_cafef_pc` ↔ `admicro.cafef_pc`, `admicro_kenh14_mobile` ↔ `admicro.kenh14_mobile`, `admicro_vnexpress_pc` ↔ `admicro.vnexpress_pc`, `admicro_dantri_mobile` ↔ `admicro.dantri_mobile`.
   - `resolveProfile` resolves both canonical dot IDs and fixture underscore IDs for all 12 Milestone 3 placements with zero unmapped or undefined returns.

3. **DOM & UI Integration (`src/App.tsx`)**:
   - `FIXTURE_PLACEMENT_ID_MAP` (lines 100–158) maps all 46 canonical dot IDs to their fixture underscore IDs (`'facebook.feed': 'fb_feed'`, ..., `'admicro.dantri_mobile': 'admicro_dantri_mobile'`).
   - Platform tabs (lines 1492–1534) render all 11 platforms with `data-testid="platform-tab-{id}"` (`platform-tab-facebook`, `platform-tab-instagram`, `platform-tab-threads`, `platform-tab-tiktok`, `platform-tab-youtube`, `platform-tab-google_search`, `platform-tab-gdn`, `platform-tab-chatgpt`, `platform-tab-zalo`, `platform-tab-linkedin`, `platform-tab-admicro`).
   - Placement pills (lines 1549–1562) render standard buttons for all groups including Admicro with `data-testid="placement-pill-${FIXTURE_PLACEMENT_ID_MAP[item.id] || item.id}"`.
   - "Tất cả vị trí" toggle button (`data-testid="toggle-all-placements"`, lines 1565–1574) is active for all 11 platforms, rendering the 2-column comparison grid (`inline-all-placements`, line 1779).
   - `renderAdmicroContext` (lines 964–1017, 1020–1022, 1281–1283, 1826–1828) renders authentic editorial and CPD mockups for CafeF (PC), Kenh14 (Mobile), VnExpress (PC), and Dân trí (Mobile) in single preview, Compare mode, and "Tất cả vị trí" inline grid.

4. **Safe-Zone Overlays (`src/features/previewPresentation.ts`)**:
   - Lines 96–101 define safe zone danger & caption regions for `zalo.video`, `zalo_video`, and `zalo.video.safe_zone`: `[region('header', 0, 0, 100, 12), region('caption-cta', 0, 76, 100, 24)]`.

5. **Brand Monochrome SVGs (`src/features/PlatformLogo.tsx`)**:
   - Lines 52–56 define authentic monochrome SVGs with `viewBox="0 0 24 24"` and `fill="currentColor"` for `chatgpt`, `linkedin`, and `admicro`.

---

## 2. Logic Chain

1. Requirement R2 mandates expanding the preview workspace from 8 original platforms (34 placements) to 11 platforms (46 placements), adding Zalo Ads (4), LinkedIn Ads (4), and Admicro (4).
2. Tracing `AD_PROFILES` verifies that exactly 46 canonical profiles exist and that their platform distribution strictly matches the specification (FB: 10, IG: 3, Threads: 1, TikTok: 2, YT: 6, Google Search: 2, GDN: 8, ChatGPT: 2, Zalo: 4, LinkedIn: 4, Admicro: 4).
3. The E2E test runner and fixture suite (`tests/fixtures/campaign-drafts.js`) define placements using underscore IDs (`zalo_timeline`, `li_mobile_feed`, `admicro_cafef_pc`) while catalog files use dot IDs (`zalo.timeline`, `linkedin.mobile_feed`, `admicro.cafef_pc`).
4. `PROFILE_ALIASES` and `resolveProfile` map all 12 Milestone 3 placements bidirectionally, ensuring that both canonical dot IDs and fixture underscore IDs resolve cleanly to valid `Profile` objects with zero unmapped or undefined returns.
5. In `src/App.tsx`, `FIXTURE_PLACEMENT_ID_MAP` maps all 46 canonical IDs to fixture underscore IDs, ensuring all placement pills render with `data-testid="placement-pill-${fixture_id}"`. This satisfies Tier 1 Feature 22–25 tests and Tier 4 Scenario 2 & 4 tests.
6. The "Tất cả vị trí" grid is fully enabled across all 11 platforms, correctly dispatching Admicro placements to `renderAdmicroContext` and social placements to `<Preview>`.

---

## 3. Caveats

1. **Catalog Alias Scope vs. DOM Map Scope**:
   In `src/catalog/profiles.ts`, `PROFILE_ALIASES` currently maps the 12 Milestone 3 placements (Zalo, LinkedIn, Admicro) and TikTok legacy IDs. It does not contain mappings for the 34 original Milestone 2 fixture underscore IDs (`fb_feed`, `ig_feed`, `tt_infeed`, `yt_shorts`, `gs_mobile`, `gdn_300x250`, `chatgpt_web`, etc.).
   - Impact: In the DOM, all 46 pills carry the correct `data-testid="placement-pill-${fixture_id}"` via `FIXTURE_PLACEMENT_ID_MAP` in `App.tsx`.
   - Observation: Direct callers of `resolveProfile('fb_feed')` at the TypeScript catalog level would receive `undefined`. If future requirements demand catalog-level resolution for M2 fixture underscore IDs, `FIXTURE_PLACEMENT_ID_MAP` can be merged into `PROFILE_ALIASES`. For Milestone 3, all extended placement requirements are 100% satisfied.

2. **Standalone HTML Synchronization (`demo-app.html`)**:
   As scheduled in `PROJECT.md`, `demo-app.html` synchronization across both workspaces is slated for Milestone 5 (M5). Milestone 3 changes are verified within `src/` modular React/TypeScript codebase.

---

## 4. Conclusion

**VERDICT: APPROVE**

Milestone 3 (Extended 3 Platforms & Placements Engine) has been thoroughly challenged and empirically verified:
1. **Alias Integrity**: 100% of canonical dot IDs (46/46) and 100% of Milestone 3 fixture underscore IDs (12/12) resolve cleanly with zero undefined returns.
2. **Placements Count & Distribution**: Exactly 46 canonical profiles in `AD_PROFILES` with exact platform distribution across all 11 platform groups.
3. **DOM & UI Components**: All 11 platform tabs, Admicro/Zalo/LinkedIn placement pills, safe-zone overlays, authentic brand SVGs, and "Tất cả vị trí" 2-column comparison grids are fully implemented and compliant with test suite selectors.

---

## 5. Verification Method

To independently verify the empirical evidence:
1. **Inspect Catalog Canonical Count & Distribution**:
   Inspect `src/catalog/profiles.ts`:
   - `PLATFORM_GROUPS.length === 11` (lines 19–32)
   - `AD_PROFILES.length === 46` (lines 366–1213)
   - Confirm distribution: FB (10), IG (3), Threads (1), TikTok (2), YT (6), Google Search (2), GDN (8), ChatGPT (2), Zalo (4), LinkedIn (4), Admicro (4).
2. **Inspect Bidirectional Aliases**:
   Inspect `src/catalog/profiles.ts` lines 1579–1655:
   - Verify `zalo_timeline`, `zalo_video`, `zalo_message`, `zalo_article` resolve to `zalo.*`
   - Verify `li_mobile_feed`, `li_desktop_feed`, `li_message`, `li_spotlight` resolve to `linkedin.*`
   - Verify `admicro_cafef_pc`, `admicro_kenh14_mobile`, `admicro_vnexpress_pc`, `admicro_dantri_mobile` resolve to `admicro.*`
3. **Inspect DOM Elements & TestIDs**:
   Inspect `src/App.tsx`:
   - Lines 100–158: `FIXTURE_PLACEMENT_ID_MAP` maps all 46 placements to fixture IDs.
   - Lines 1496: `data-testid={`platform-tab-${id}`}` on all 11 tabs.
   - Line 1554: `data-testid={`placement-pill-${FIXTURE_PLACEMENT_ID_MAP[item.id] || item.id}`}` on all pills.
   - Lines 1567, 1779–1844: `toggle-all-placements` button and `inline-all-placements` comparison grid.
   - Lines 964–1017, 1826–1828: `renderAdmicroContext` for all Admicro placements.
4. **Inspect Safe-Zone Geometries**:
   Inspect `src/features/previewPresentation.ts` lines 96–101 for `zalo.video` safe zones.
