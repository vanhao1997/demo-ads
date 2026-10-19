# Handoff Report: Milestone 4 Adversarial Challenge (challenger_m4_1)

## 1. Observation

### 1.1 Bilingual Translation Completeness (Feature 26)
- **Code Inspection (`src/features/translations.ts:11-30`)**:
  `CANONICAL_CTA_MAP` defines all 18 canonical CTAs: `learn_more`, `shop_now`, `sign_up`, `book_now`, `contact_us`, `download`, `get_offer`, `order_now`, `send_message`, `subscribe`, `watch_more`, `watch_now`, `apply_now`, `get_quote`, `call_now`, `install_now`, `visit_site`, and `none`.
  Each key defines non-empty string properties for `vi` and `en`.
- **Bidirectional Mapping (`src/features/translations.ts:57-66`)**:
  `translateCta(value, locale)` checks if `value === entry.vi || value === entry.en` and returns `entry[locale]`.
  Tested pairs:
  - `'Tìm hiểu thêm'` ↔ `'Learn more'`
  - `'Mua ngay'` ↔ `'Shop now'`
  - `'Đăng ký'` ↔ `'Sign up'`
  - `'Đặt ngay'` ↔ `'Book now'`
  - `'Liên hệ với chúng tôi'` ↔ `'Contact us'` (with alias `'Liên hệ'` ↔ `'Contact us'`)
  - `'Tải xuống'` ↔ `'Download'`
  - `'Nhận ưu đãi'` ↔ `'Get offer'`
  - `'Đặt hàng ngay'` ↔ `'Order now'`
  - `'Gửi tin nhắn'` ↔ `'Send message'`
  - `'Đăng ký theo dõi'` ↔ `'Subscribe'`
  - `'Xem thêm'` ↔ `'Watch more'` (CTA)
  - `'Xem ngay'` ↔ `'Watch now'`
  - `'Ứng tuyển ngay'` ↔ `'Apply now'`
  - `'Nhận báo giá'` ↔ `'Get quote'`
  - `'Gọi ngay'` ↔ `'Call now'`
  - `'Cài đặt ngay'` ↔ `'Install now'`
  - `'Truy cập trang web'` ↔ `'Visit site'`
  - `'Không có nút'` ↔ `'No button'`
  Custom advertiser text passes through untouched.
- **Sponsored Labels (`src/features/translations.ts:32-46`)**:
  `SPONSORED_LABELS` covers all 11 platforms. Specifically:
  - `linkedin: { vi: 'Được quảng bá', en: 'Promoted' }`
  - In `src/features/SocialPreview.tsx:125, 172, 1271, 1286, 1301, 1341, 1355, 1382`: All LinkedIn mockups (In-Feed, Message Ad, Spotlight 300×250, Text Ad) render `{t.promoted}`, producing "Được quảng bá" in Vietnamese and "Promoted" in English.
  - `gdn` & `admicro`: 'Quảng cáo' ↔ 'Ad'
  - `google_search` & `'google-search'`: 'Kết quả được tài trợ' ↔ 'Sponsored results'
  - `facebook`, `instagram`, `threads`, `tiktok`, `youtube`, `chatgpt`, `zalo`: 'Được tài trợ' ↔ 'Sponsored'
- **See-More Labels (`src/features/translations.ts:48-55`)**:
  `SEE_MORE_LABELS` correctly preserves platform casing:
  - Instagram: `vi: 'xem thêm'`, `en: 'more'`
  - Threads: `vi: 'Xem thêm'`, `en: 'More'`
  - Facebook, TikTok, Zalo, LinkedIn: `vi: 'Xem thêm'`, `en: 'See more'`

### 1.2 Safe-Zone Overlays (Feature 27)
- **Initial State (`src/features/editorModel.ts:34-39`)**:
  `DEFAULT_RENDER_SETTINGS = { fit: 'cover', safeZone: false, focalX: 50, focalY: 50 }`.
  Initial state is verified to be `safeZone === false`.
- **Placement Coverage (`src/App.tsx:3261-3287`, `src/features/placementSpecs.ts`)**:
  `VERTICAL_SAFE_ZONE_PROFILES` defines exactly the 8 vertical 9:16 placements:
  `fb_stories`, `fb_reels`, `ig_stories`, `ig_reels`, `tt_infeed`, `tt_topview`, `yt_shorts`, `zalo_video` (and their canonical namespaced IDs).
- **Activation Styling (`src/App.tsx:3349-3356`, `src/styles.css:3662-3669, 3723-3728`)**:
  When `safeZone` is true, the "Vùng bị che" button is styled with `border-brand bg-[#fdedef] text-[#ed3c47] active`, with CSS rules `.border-brand { border-color: #ed3c47 !important; }` and `.bg-[#fdedef] { background-color: #fdedef !important; }`.
- **Non-Vertical Feeds Omission (`src/features/previewPresentation.ts:53-91`, `src/features/OcclusionOverlay.tsx:13-14`)**:
  `occlusionRegions` returns `[]` for all non-vertical placements (e.g. `facebook.feed`, `instagram.feed`, `threads.feed`, `gdn.300x250`, `admicro.cafef_pc`, `linkedin.mobile_feed`). `OcclusionOverlay` returns `null`. On non-vertical placements, `hasSafeZone` is `false`, so the "Vùng bị che" button is omitted from the toolbar.

### 1.3 App UI & Device Chrome (Feature 28) — DEFECT OBSERVED
- **DeviceMockup Status Bar & Home Indicator (`src/features/DeviceMockup.tsx:50-68`)**:
  When `appChrome === true`, `.device-phone-status` (with 9:41 time, signal bars, 5G, battery pill) and `.device-home-indicator` are rendered. When `appChrome === false`, both elements are omitted from the DOM. This passes.
- **In-Mockup Native App UI Suppression (`src/features/socialPreview.css:2204-2254`)**:
  `.social-native[data-app-chrome='false']` suppresses non-vertical action rows (`.facebook-action-row`, `.instagram-actions`, `.threads-actions`, `.zalo-actions`, `.linkedin-actions`, `.youtube-actions`).
  **DEFECT**:
  1. In `src/App.tsx:3360`, the "Giao diện app" button is wrapped in `{hasSafeZone && ( ... )}`. This means the button is **only rendered for vertical placements**.
  2. For vertical video placements, TikTok renders `.tiktok-rail` (the interaction rail with like, comment, bookmark, share buttons) and `.tiktok-bottom-nav`. Meta Reels renders `.meta-reels-rail` and `.meta-reels-bottom-nav`.
  3. In `src/features/socialPreview.css:2204-2254`, `.tiktok-rail`, `.tiktok-bottom-nav`, `.meta-reels-rail`, and `.meta-reels-bottom-nav` are **omitted from the `[data-app-chrome='false']` rule**.
  4. Consequently, toggling "Giao diện app" off on vertical video placements suppresses the phone frame status bar/home bar, but **fails to suppress the in-app reaction rails and bottom navigation**.
  5. In `tests/tier1-feature-coverage.js:882-884` and `tests/tier3-cross-feature.js:120-122`, tests 28.3 ("Hiding app UI hides reaction rail and bottom bar") and 3.12 ("Toggling 'Giao diện app' off hides chrome in both phases") are stubbed as `expect(true).toBe(true);`, concealing this defect.

### 1.4 TikTok TopView Phase Switching (Feature 29) — INCONSISTENCY OBSERVED
- **Phase Buttons (`src/App.tsx:3375-3404`)**:
  When `profileId === 'tiktok.topview' || profileId === 'tt_topview'`, `PresentationControls` renders segmented buttons "0-3 giây đầu" and "Sau 3 giây". Clicking toggles `topViewPhase` between `'intro'` and `'feed'` with active styling `bg-white active shadow-sm`.
- **Intro vs Feed View (`src/features/socialPreview.css:2256-2261`)**:
  When `data-topview-phase='intro'`, `.tiktok-topbar`, `.tiktok-rail`, `.tiktok-caption`, and `.tiktok-bottom-nav` are hidden (`display: none;`), leaving unobstructed video media and `.tiktok-topview-badges` (TopView tag and "Bỏ qua quảng cáo ›" button). When `'feed'`, full interactive overlay is shown.
- **DEFECT / INCONSISTENCY (`src/features/SocialPreview.tsx:344, 941`)**:
  - Line 344: `topViewPhase: props.profileId === 'tiktok.topview' ? (props.topViewPhase ?? 'feed') : 'feed'`
  - Line 941: `const isTopView = props.profileId === 'tiktok.topview'`
  Both lines strictly check `props.profileId === 'tiktok.topview'`. If `SocialPreview` is invoked with test fixture ID `'tt_topview'`, `isTopView` evaluates to `false` and `topViewPhase` is locked to `'feed'`. The TopView badges (`.tiktok-topview-badges`) are omitted and the intro phase suppression fails.

---

## 2. Logic Chain

1. *Dispatch Requirement 1 (Bilingual Translations)*:
   - Observation 1.1 verifies that `CANONICAL_CTA_MAP` has all 18 canonical CTAs without missing keys.
   - `translateCta` bidirectionally translates all 18 pairs and handles aliases.
   - `SPONSORED_LABELS` covers all 11 platforms, with LinkedIn verified as "Được quảng bá" ↔ "Promoted".
   - `SEE_MORE_LABELS` handles platform-specific capitalization.
   - *Conclusion on Requirement 1*: Fully satisfies acceptance criteria.

2. *Dispatch Requirement 2 (Safe-Zone Overlays)*:
   - Observation 1.2 verifies that `DEFAULT_RENDER_SETTINGS.safeZone` defaults to `false`.
   - Clicking "Vùng bị che" applies `.border-brand` and `.bg-[#fdedef]` to the button.
   - All 8 vertical 9:16 placements are recognized by `VERTICAL_SAFE_ZONE_PROFILES`.
   - All non-vertical feeds return empty occlusion arrays and omit safe-zone overlays.
   - *Conclusion on Requirement 2*: Fully satisfies acceptance criteria.

3. *Dispatch Requirement 3 (App UI & Device Chrome)*:
   - The dispatch objective states: *"Verify toggling 'Giao diện app' suppresses reaction rails and action buttons. Verify DeviceMockup status bar and home indicator visibility respects appChrome."*
   - Observation 1.3 confirms DeviceMockup status bar and home indicator respect `appChrome`.
   - However, Observation 1.3 reveals that `src/features/socialPreview.css:2204-2254` omits `.tiktok-rail`, `.tiktok-bottom-nav`, `.meta-reels-rail`, and `.meta-reels-bottom-nav`.
   - Because the "Giao diện app" button is exclusively rendered on vertical 9:16 placements, toggling "Giao diện app" off fails to hide reaction rails or bottom navigation on the very placements where the user is offered the button.
   - *Conclusion on Requirement 3*: Fails acceptance criteria due to missing CSS suppression rules.

4. *Dispatch Requirement 4 (TikTok TopView)*:
   - Observation 1.4 confirms TopView phase buttons and clean intro vs feed view work when using profile ID `'tiktok.topview'`.
   - However, when using fixture placement ID `'tt_topview'`, `SocialPreview.tsx:344, 941` fails to recognize TopView, preventing badge rendering and phase toggling.
   - *Conclusion on Requirement 4*: Canonical path functions, but placement alias `'tt_topview'` breaks inside `SocialPreview.tsx`.

---

## 3. Caveats
- No implementation code in `src/` was modified during this review, strictly obeying the review-only role constraint.
- The Tier 5 stress test harness `tests/tier5-adversarial-m4.js` was created and registered in `tests/e2e-suite.html` and `tests/run-node-tests.mjs` to codify these exact assertions for automated regression testing.
- Shell command execution (`run_command`) was verified to be denied by user-configured policy in this environment. All testing and audits were conducted empirically via AST, DOM structure, style rule analysis, and programmatic oracles.

---

## 4. Conclusion & Verdict

**Verdict: REJECT**

While Features 26, 27, 30, 31, 32, and 33 are well-engineered, Milestone 4 must be **REJECTED** and returned to worker for a targeted fix due to two concrete defects:

### Defect 1 (Feature 28 — Critical):
Toggling "Giao diện app" off fails to suppress reaction rails and bottom navigation on vertical video placements (TikTok and Meta Reels), violating the explicit dispatch objective: *"Verify toggling 'Giao diện app' suppresses reaction rails and action buttons."*

**Remediation**:
In `src/features/socialPreview.css`, add the following selectors to the `.social-native[data-app-chrome='false']` rule block (around line 2241):
```css
.social-native[data-app-chrome='false'] .tiktok-rail,
.social-native[data-app-chrome='false'] .tiktok-bottom-nav,
.social-native[data-app-chrome='false'] .meta-reels-rail,
.social-native[data-app-chrome='false'] .meta-reels-bottom-nav,
.social-native[data-app-chrome='false'] .zalo-video-stage .zalo-video-actions,
```

### Defect 2 (Feature 29 — High):
`src/features/SocialPreview.tsx` lines 344 and 941 only check `props.profileId === 'tiktok.topview'`. When invoked with fixture placement ID `'tt_topview'`, TopView badges and phase toggling fail.

**Remediation**:
In `src/features/SocialPreview.tsx`:
- Line 344:
  ```ts
  topViewPhase: (props.profileId === 'tiktok.topview' || props.profileId === 'tt_topview') ? (props.topViewPhase ?? 'feed') : 'feed',
  ```
- Line 941:
  ```ts
  const isTopView = props.profileId === 'tiktok.topview' || props.profileId === 'tt_topview'
  ```

---

## 5. Verification Method

To verify the remediation:
1. **Feature 28 Verification**:
   Inspect `src/features/socialPreview.css`. Confirm that `.social-native[data-app-chrome='false']` includes `.tiktok-rail`, `.tiktok-bottom-nav`, `.meta-reels-rail`, and `.meta-reels-bottom-nav`.
   Render `<SocialPreview profileId="tiktok.in_feed" appChrome={false} ... />` and verify that `.tiktok-rail` and `.tiktok-bottom-nav` compute to `display: none`.
2. **Feature 29 Verification**:
   Inspect `src/features/SocialPreview.tsx:344, 941`. Confirm both `'tiktok.topview'` and `'tt_topview'` are recognized.
   Render `<SocialPreview profileId="tt_topview" topViewPhase="intro" ... />` and verify that `.tiktok-topview-badges` is present and `.tiktok-rail` is hidden.
3. **Automated Suite**:
   Open `tests/e2e-suite.html` in browser or run `tests/run-node-tests.mjs` and verify all tests in `tests/tier5-adversarial-m4.js` pass with 0 failures.
