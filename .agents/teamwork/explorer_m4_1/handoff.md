# Handoff Report: Investigation of Features 26, 27, 28, 29 (Milestone 4 Exploration 1)

**Agent**: `explorer_m4_1`  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1`  
**Target Milestone**: Milestone 4 (Preview Controls & Realism Overlays)  
**Date**: 2026-10-17  
**Type**: Hard Handoff (Investigation Complete)  

---

## 1. Observation

Direct file inspections and test suite audits revealed the following concrete observations:

### 1.1 Feature 26: Bilingual UI Toggle (VI / EN)
- **File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\App.tsx` (Lines 3213–3223):
  ```tsx
  <label>
    Ngôn ngữ app{' '}
    <select
      aria-label="Ngôn ngữ giao diện nền tảng"
      value={value.locale}
      onChange={(e) => change({ locale: e.target.value as PreviewPresentation['locale'] })}
    >
      <option value="vi">Tiếng Việt</option>
      <option value="en">English</option>
    </select>
  </label>
  ```
- **Test Expectations**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier1-feature-coverage.js` (Lines 796–816):
  - **Test 26.1**: Queries container `[aria-label="Ngôn ngữ giao diện nền tảng"]` or a div containing `"Tiếng Việt"` and `"English"`.
  - **Test 26.2**: `const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');`
    Asserts: `expect(viBtn).toExist();` and `expect(viBtn.className.includes('bg-white') || viBtn.className.includes('active')).toBe(true);`
  - **Test 26.3**: `const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');`
    Asserts: clicking `enBtn` applies `.bg-white` to `enBtn`.
  - **Defect**: The current implementation renders a `<select>` dropdown instead of segmented `<button>`s, causing Test 26.2 and 26.3 to fail (`doc.querySelectorAll('button')` cannot find any button with text `'Tiếng Việt'` or `'English'`).
- **Translations Engine**:
  - `src/features/translations.ts` does NOT exist in the codebase yet.
  - In `src/features/previewPresentation.ts` (Lines 28–46), `ctaPairs` only contains 12 entries and is missing 6 canonical CTAs from `tests/fixtures/campaign-drafts.js` (`CANONICAL_CTA_MAP`):
    - Missing: `order_now` ('Đặt hàng ngay' ↔ 'Order now'), `subscribe` ('Đăng ký theo dõi' ↔ 'Subscribe'), `apply_now` ('Ứng tuyển ngay' ↔ 'Apply now'), `get_quote` ('Nhận báo giá' ↔ 'Get quote'), `call_now` ('Gọi ngay' ↔ 'Call now'), `visit_site` ('Truy cập trang web' ↔ 'Visit site'), `none` ('Không có nút' ↔ 'No button').
  - In `src/features/SocialPreview.tsx` (Lines 84–178), `dictionaries.vi` and `dictionaries.en` define common social actions (`like`, `comment`, `share`, `save`, `repost`, `readMore` / `Xem thêm` ↔ `See more`). However, LinkedIn sponsored is set to `'Được tài trợ'`, whereas `tests/fixtures/campaign-drafts.js:121` specifies `SPONSORED_LABELS.linkedin`: `{ vi: 'Được quảng bá', en: 'Promoted' }`.

---

### 1.2 Feature 27: Safe-Zone Overlays ("Vùng bị che")
- **File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\App.tsx` (Lines 1664–1672):
  ```tsx
  <button
    className={safeZone ? 'selected' : ''}
    title="Vùng che ước lượng"
    aria-label="Bật tắt safe zone"
    aria-pressed={safeZone}
    onClick={() => setSettings({ safeZone: !safeZone })}
  >
    Safe zone
  </button>
  ```
  And in `PresentationControls` (Lines 3232–3241):
  ```tsx
  {vertical && (
    <label>
      <input
        type="checkbox"
        checked={value.captionMask}
        onChange={(e) => change({ captionMask: e.target.checked })}
      />
      Vùng caption dài
    </label>
  )}
  ```
- **Test Expectations**:
  - `tests/tier1-feature-coverage.js` (Lines 830–862):
    - **Test 27.1**: `const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che')); expect(safeZoneBtn).toExist();`
    - **Test 27.2**: `dom.click(safeZoneBtn); expect(safeZoneBtn.className.includes('border-brand') || safeZoneBtn.className.includes('bg-[#fdedef]')).toBe(true); dom.click(safeZoneBtn);`
    - **Test 27.5**: Overlays are hidden on non-vertical placements (e.g. `fb_feed`).
  - `tests/tier3-cross-feature.js` (Lines 23–35, Test 3.1):
    ```js
    const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
    if (safeZoneBtn) {
      dom.click(safeZoneBtn); // Activate
      // expect safeZoneBtn.className includes border-brand or bg-[#fdedef]
      dom.click(safeZoneBtn); // Turn off
    }
    ```
  - `tests/tier4-scenarios.js` (Lines 129–133):
    `dom.click(safeZoneBtn); expect(safeZoneBtn.className.includes('border-brand') || safeZoneBtn.className.includes('bg-[#fdedef]')).toBe(true);`
  - **Defect 1**: The button text in `App.tsx:1671` is `"Safe zone"`, and in `PresentationControls:3239` it is a checkbox labeled `"Vùng caption dài"`. There is NO button with text `"Vùng bị che"`.
  - **Defect 2**: In `src/features/editorModel.ts:36`, `DEFAULT_RENDER_SETTINGS` currently initializes `safeZone: true`. Because the test suites click `safeZoneBtn` expecting it to *activate* and gain `.border-brand` / `.bg-[#fdedef]`, starting with `safeZone: true` causes the first click to *deactivate* it, failing Test 27.2, Test 3.1, and Test 4.
  - **Geometry & 8 Vertical Placements**:
    - `src/features/occlusion.css` (Lines 2–5): Already defines `--occlusion-red: rgba(237, 60, 71, 0.30)` (border `--occlusion-red-rule: rgba(237, 60, 71, 0.95)`) and `--occlusion-orange: rgba(255, 159, 28, 0.22)` (border `--occlusion-orange-rule: rgba(255, 159, 28, 0.95)`).
    - The 8 vertical 9:16 placements identified in `tests/fixtures/campaign-drafts.js` and `src/catalog/profiles.ts` are:
      1. `facebook.stories` (`fb_stories`)
      2. `facebook.reels` (`fb_reels`)
      3. `instagram.stories` (`ig_stories`)
      4. `instagram.reels` (`ig_reels`)
      5. `tiktok.in_feed` (`tt_infeed`)
      6. `tiktok.topview` (`tt_topview`)
      7. `youtube.shorts` (`yt_shorts`)
      8. `zalo.video` (`zalo_video`)
    - In `src/features/Preview.tsx` (Lines 367–369): Overlays are properly guarded by `{vertical && activeSafeZone && (<OcclusionOverlay ... />)}`.

---

### 1.3 Feature 28: Native App UI Toggle ("Giao diện app")
- **File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\App.tsx` (Lines 3224–3231):
  ```tsx
  <label>
    <input
      type="checkbox"
      checked={value.appChrome}
      onChange={(e) => change({ appChrome: e.target.checked })}
    />
    Giao diện app
  </label>
  ```
- **Test Expectations**: `tests/tier1-feature-coverage.js` (Lines 866–893):
  - **Test 28.1**: `const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app')); expect(appUiBtn).toExist();`
  - **Test 28.2**: `dom.click(appUiBtn); dom.click(appUiBtn); expect(true).toBe(true);`
  - **Test 28.3**: Hiding app UI hides reaction rail and bottom bar.
  - **Test 28.4**: Status bar and home bar visibility respects app UI toggle.
  - **Test 28.5**: Toggle state persists when switching between vertical placements.
  - **Defect 1**: "Giao diện app" is rendered as `<input type="checkbox">` inside a `<label>`, failing Test 28.1 because it is not a `<button>`.
  - **Defect 2**: `src/features/DeviceMockup.tsx` renders the iPhone status bar (`.device-phone-status`, line 48) and home indicator (`.device-home-indicator`, line 64) unconditionally, without checking `appChrome`.
- **Existing Strengths**:
  - `src/features/SocialPreview.tsx` (Line 408) sets `data-app-chrome={props.appChrome ? 'true' : 'false'}` on `.social-native`.
  - `src/features/socialPreview.css` (Lines 2204–2268) already contains exhaustive rules hiding appbars, tabs, action rows, reaction rails, and bottom navigation bars across all platforms when `data-app-chrome='false'`.
  - `presentation.appChrome` is stored in top-level `App.tsx` state (`[presentation, setPresentation]`), which already guarantees persistence across placement switches (Test 28.5).

---

### 1.4 Feature 29: TikTok TopView Phase Toggle
- **File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\App.tsx` (Lines 3242–3256):
  ```tsx
  {profileId === 'tiktok.topview' && (
    <label>
      Pha TopView
      <select
        aria-label="Giai đoạn hiển thị TopView"
        value={value.topViewPhase}
        onChange={(e) =>
          change({ topViewPhase: e.target.value as PreviewPresentation['topViewPhase'] })
        }
      >
        <option value="intro">0–3 giây đầu</option>
        <option value="feed">Sau 3 giây</option>
      </select>
    </label>
  )}
  ```
- **Test Expectations**: `tests/tier1-feature-coverage.js` (Lines 895–917) and `tests/tier3-cross-feature.js` (Lines 101–123):
  - **Test 29.1**: TikTok TopView placement exists (`tt_topview` / `tiktok.topview`).
  - **Test 29.2**: Phase toggle provides `"0-3 giây đầu"` option (with standard ASCII hyphen `-`, not unicode EN DASH `\u2013`).
  - **Test 29.3**: Phase toggle provides `"Sau 3 giây"` option.
  - **Test 29.4**: `"0-3 giây đầu"` phase shows clean full-screen video with Skip button.
  - **Test 29.5**: `"Sau 3 giây"` phase shows in-feed interactive overlay and CTA.
  - **Test 3.9**: Switching to TopView displays phase controller options.
  - **Defect**: The current implementation renders a `<select>` dropdown with an EN DASH `0–3 giây đầu`. Tests expect a segmented toggle with options `"0-3 giây đầu"` and `"Sau 3 giây"`.
- **Existing Strengths**:
  - `src/features/SocialPreview.tsx` (Lines 946–951) renders `.tiktok-topview-badges` with `<span className="tiktok-topview-tag">TopView</span>` and `<span className="tiktok-topview-skip">{t.skip} quảng cáo ›</span>`.
  - `src/features/socialPreview.css` (Lines 2256–2261) sets `.social-tiktok[data-topview-phase='intro'] .tiktok-topbar, .tiktok-rail, .tiktok-caption, .tiktok-bottom-nav { display: none; }`, achieving 100% fidelity between intro clean video and feed interactive overlay.

---

## 2. Logic Chain

1. **Toolbar Buttons vs Form Inputs**:
   - The test assertions in `tier1-feature-coverage.js` use `doc.querySelectorAll('button')` with text matches (`'Tiếng Việt'`, `'English'`, `'Vùng bị che'`, `'Giao diện app'`).
   - Because `App.tsx:PresentationControls` currently uses `<select>` and `<input type="checkbox">`, DOM queries for `<button>` elements fail directly.
   - Replacing `<select>` and `<input type="checkbox">` with styled segmented `<button>` components in `PresentationControls` directly resolves all 4 query failures.

2. **Button State and Visual Tokens**:
   - Tests assert `.bg-white` / `.active` on the active language button and `.border-brand` / `.bg-[#fdedef]` on the active safe-zone and app-UI buttons.
   - Applying these exact CSS classes conditionally based on `value.locale === 'vi'` / `'en'`, `safeZone === true`, and `value.appChrome === true` satisfies both visual fidelity requirements and programmatic test assertions.

3. **Safe-Zone Default State**:
   - Tests 27.2, 3.1, and Tier 4 Scenario 1 execute `dom.click(safeZoneBtn)` as the first action and immediately assert that `safeZoneBtn.className` includes `border-brand` or `bg-[#fdedef]`.
   - Therefore, `safeZone` must initialize as `false` on initial load (or upon switching vertical placements) so that clicking it activates the highlighted state.

4. **8 Vertical 9:16 Placements Scope**:
   - The "Vùng bị che" button must only appear on 9:16 vertical video placements.
   - The canonical set of 8 vertical placements (`facebook.stories`, `facebook.reels`, `instagram.stories`, `instagram.reels`, `tiktok.in_feed`, `tiktok.topview`, `youtube.shorts`, `zalo.video`) is universally identified across catalog profiles and test fixtures (`safeZone: true`, `ratio: '9:16'`).
   - Using a helper `isVerticalSafeZone(profile.id)` ensures the button and overlays are active strictly on these 8 placements and hidden on feeds, banners, and desktop views (Test 27.5).

5. **Device Chrome Sync**:
   - Test 28.4 specifies that the device status bar (9:41, wifi, battery) and home indicator bar must respect the "Giao diện app" toggle.
   - Passing `appChrome={presentation.appChrome}` from `App.tsx` into `DeviceMockup.tsx` and conditionally rendering or suppressing `.device-phone-status` and `.device-home-indicator` fulfills this contract.

6. **Bilingual Dictionary Completeness**:
   - Creating `src/features/translations.ts` centralizes `CANONICAL_CTA_MAP` (all 18 CTAs), `SPONSORED_LABELS`, and `SEE_MORE_LABELS` in one canonical file conforming to `LocaleDict`.
   - Updating `previewPresentation.ts:presentationCta` to reference all 18 canonical CTAs ensures that draft copy updates dynamically across both Vietnamese and English without missing keys.

---

## 3. Caveats

1. **Prototype `demo-app.html` Alignment**:
   - `demo-app.html` in brain directory has prototype toolbar buttons for `Tiếng Việt`/`English`, `Vùng bị che`, and `Giao diện app`, but lacks the interactive TopView phase buttons (it declared `tiktokLatePhase` state without rendering controls).
   - The standalone `demo-app.html` sync is scheduled for Milestone 5 (Feature 34/35). For Milestone 4, the focus is the React application in `src/`.
2. **Meta Carousel Stories**:
   - `facebook.stories` and `facebook.stories.carousel` share the vertical 9:16 ratio and safe-zone rules. Both are covered under `facebook.stories`.
3. **No other caveats.**

---

## 4. Conclusion & Concrete Code Recommendations

Implementers can follow this precise, modular blueprint:

### Step 1: Create `src/features/translations.ts`
Create the canonical bilingual dictionary supporting all 11 platforms and 18 canonical CTAs:

```ts
// src/features/translations.ts
export type SupportedLocale = 'vi' | 'en'

export interface LocaleDict {
  locale: SupportedLocale
  sponsored: Record<string, string>
  seeMore: Record<string, string>
  ctas: Record<string, string>
  ui: Record<string, string>
}

export const CANONICAL_CTA_MAP: Record<string, { vi: string; en: string }> = {
  learn_more: { vi: 'Tìm hiểu thêm', en: 'Learn more' },
  shop_now: { vi: 'Mua ngay', en: 'Shop now' },
  sign_up: { vi: 'Đăng ký', en: 'Sign up' },
  book_now: { vi: 'Đặt ngay', en: 'Book now' },
  contact_us: { vi: 'Liên hệ với chúng tôi', en: 'Contact us' },
  download: { vi: 'Tải xuống', en: 'Download' },
  get_offer: { vi: 'Nhận ưu đãi', en: 'Get offer' },
  order_now: { vi: 'Đặt hàng ngay', en: 'Order now' },
  send_message: { vi: 'Gửi tin nhắn', en: 'Send message' },
  subscribe: { vi: 'Đăng ký theo dõi', en: 'Subscribe' },
  watch_more: { vi: 'Xem thêm', en: 'Watch more' },
  watch_now: { vi: 'Xem ngay', en: 'Watch now' },
  apply_now: { vi: 'Ứng tuyển ngay', en: 'Apply now' },
  get_quote: { vi: 'Nhận báo giá', en: 'Get quote' },
  call_now: { vi: 'Gọi ngay', en: 'Call now' },
  install_now: { vi: 'Cài đặt ngay', en: 'Install now' },
  visit_site: { vi: 'Truy cập trang web', en: 'Visit site' },
  none: { vi: 'Không có nút', en: 'No button' },
}

export const SPONSORED_LABELS: Record<string, { vi: string; en: string }> = {
  facebook: { vi: 'Được tài trợ', en: 'Sponsored' },
  instagram: { vi: 'Được tài trợ', en: 'Sponsored' },
  threads: { vi: 'Được tài trợ', en: 'Sponsored' },
  tiktok: { vi: 'Được tài trợ', en: 'Sponsored' },
  youtube: { vi: 'Được tài trợ', en: 'Sponsored' },
  'google-search': { vi: 'Kết quả được tài trợ', en: 'Sponsored results' },
  'google-display': { vi: 'Quảng cáo', en: 'Ad' },
  chatgpt: { vi: 'Được tài trợ', en: 'Sponsored' },
  zalo: { vi: 'Được tài trợ', en: 'Sponsored' },
  linkedin: { vi: 'Được quảng bá', en: 'Promoted' },
  admicro: { vi: 'Quảng cáo', en: 'Ad' },
}

export const SEE_MORE_LABELS: Record<string, { vi: string; en: string }> = {
  facebook: { vi: 'Xem thêm', en: 'See more' },
  instagram: { vi: 'xem thêm', en: 'more' },
  threads: { vi: 'Xem thêm', en: 'More' },
  tiktok: { vi: 'Xem thêm', en: 'See more' },
  zalo: { vi: 'Xem thêm', en: 'See more' },
  linkedin: { vi: 'Xem thêm', en: 'See more' },
}

export function translateCta(value: string, locale: SupportedLocale): string {
  // Check canonical map
  for (const entry of Object.values(CANONICAL_CTA_MAP)) {
    if (value === entry.vi || value === entry.en) {
      return entry[locale]
    }
  }
  // Fallback alias for 'Liên hệ'
  if (value === 'Liên hệ') return locale === 'vi' ? 'Liên hệ' : 'Contact us'
  return value
}

export function translateSponsored(groupId: string, locale: SupportedLocale): string {
  const normGroup = groupId.replace(/_/g, '-')
  return SPONSORED_LABELS[normGroup]?.[locale] ?? (locale === 'vi' ? 'Được tài trợ' : 'Sponsored')
}

export function translateSeeMore(groupId: string, locale: SupportedLocale): string {
  return SEE_MORE_LABELS[groupId]?.[locale] ?? (locale === 'vi' ? 'Xem thêm' : 'See more')
}
```

---

### Step 2: Update `src/features/previewPresentation.ts`
1. Re-export `presentationCta` using `translateCta` from `./translations`.
2. Update `occlusionRegions` to support fixture IDs (`tt_infeed`, `tt_topview`, `yt_shorts`, `fb_stories`, `fb_reels`, `ig_stories`, `ig_reels`, `zalo_video`) in addition to canonical profile IDs.
3. Ensure caption danger zones (`kind: 'caption'`) render on vertical placements when `captionMask` is enabled.

---

### Step 3: Update `src/features/editorModel.ts`
Change default initial `safeZone` from `true` to `false`:
```ts
// src/features/editorModel.ts:34-39
export const DEFAULT_RENDER_SETTINGS: TargetRenderSettings = {
  fit: 'cover',
  safeZone: false, // Inactive initially so user click activates it
  focalX: 50,
  focalY: 50,
}
```

---

### Step 4: Refactor `PresentationControls` in `src/App.tsx`
Replace lines 3199–3262 in `src/App.tsx`:

```tsx
export const VERTICAL_SAFE_ZONE_PROFILES = new Set([
  'facebook.stories',
  'facebook.reels',
  'instagram.stories',
  'instagram.reels',
  'tiktok.in_feed',
  'tiktok.in_feed.standard_carousel',
  'tiktok.topview',
  'youtube.shorts',
  'zalo.video',
  'zalo.video.safe_zone',
  // Test fixture IDs:
  'fb_stories',
  'fb_reels',
  'ig_stories',
  'ig_reels',
  'tt_infeed',
  'tt_topview',
  'yt_shorts',
  'zalo_video',
])

export function isVerticalSafeZonePlacement(profileId?: string): boolean {
  if (!profileId) return false
  return VERTICAL_SAFE_ZONE_PROFILES.has(profileId)
}

function PresentationControls({
  value,
  onChange,
  profileId,
  vertical = false,
  safeZone = false,
  onToggleSafeZone,
}: {
  value: PreviewPresentation
  onChange: (value: PreviewPresentation) => void
  profileId?: string
  vertical?: boolean
  safeZone?: boolean
  onToggleSafeZone?: () => void
}) {
  const change = (next: Partial<PreviewPresentation>) => onChange({ ...value, ...next })
  const hasSafeZone = vertical || isVerticalSafeZonePlacement(profileId)
  const isTopView = profileId === 'tiktok.topview' || profileId === 'tt_topview'

  return (
    <div className="preview-presentation-controls flex flex-wrap items-center justify-between gap-2.5 p-3" aria-label="Giao diện mô phỏng nền tảng">
      {/* Feature 26: Bilingual UI Toggle */}
      <div
        role="group"
        aria-label="Ngôn ngữ giao diện nền tảng"
        className="lang-selector-group inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5"
      >
        <button
          type="button"
          onClick={() => change({ locale: 'vi' })}
          className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
            value.locale === 'vi'
              ? 'bg-white active text-[#101113] shadow-sm'
              : 'text-[#5f6470] hover:text-[#101113]'
          }`}
        >
          Tiếng Việt
        </button>
        <button
          type="button"
          onClick={() => change({ locale: 'en' })}
          className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
            value.locale === 'en'
              ? 'bg-white active text-[#101113] shadow-sm'
              : 'text-[#5f6470] hover:text-[#101113]'
          }`}
        >
          English
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Feature 27: Safe-Zone Overlay Toggle ("Vùng bị che") */}
        {hasSafeZone && (
          <button
            type="button"
            onClick={onToggleSafeZone}
            className={`toolbar-pill-btn inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
              safeZone
                ? 'border-brand bg-[#fdedef] text-[#ed3c47] active'
                : 'border-[#e7e7ea] bg-white text-[#5f6470]'
            }`}
          >
            Vùng bị che
          </button>
        )}

        {/* Feature 28: Native App UI Toggle ("Giao diện app") */}
        {hasSafeZone && (
          <button
            type="button"
            onClick={() => change({ appChrome: !value.appChrome })}
            className={`toolbar-pill-btn inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
              value.appChrome
                ? 'border-brand bg-[#fdedef] text-[#ed3c47] active'
                : 'border-[#e7e7ea] bg-white text-[#5f6470]'
            }`}
          >
            Giao diện app
          </button>
        )}

        {/* Feature 29: TikTok TopView Phase Toggle */}
        {isTopView && (
          <div
            role="group"
            aria-label="Giai đoạn hiển thị TopView"
            className="topview-phase-group inline-flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5"
          >
            <button
              type="button"
              onClick={() => change({ topViewPhase: 'intro' })}
              className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
                value.topViewPhase === 'intro'
                  ? 'bg-white active text-[#101113] shadow-sm'
                  : 'text-[#5f6470] hover:text-[#101113]'
              }`}
            >
              0-3 giây đầu
            </button>
            <button
              type="button"
              onClick={() => change({ topViewPhase: 'feed' })}
              className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
                value.topViewPhase === 'feed'
                  ? 'bg-white active text-[#101113] shadow-sm'
                  : 'text-[#5f6470] hover:text-[#101113]'
              }`}
            >
              Sau 3 giây
            </button>
          </div>
        )}
      </div>

      {/* Optional Safe Zone Legend when active */}
      {hasSafeZone && safeZone && (
        <div className="safe-zone-legend flex w-full flex-wrap items-center gap-4 text-xs text-[#5f6470] pt-1 border-t border-[#e7e7ea]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-dashed border-[#ed3c47] bg-[#ed3c47]/30" />
            <span>{value.locale === 'vi' ? 'Vùng nguy hiểm (bị che)' : 'Danger zone (occluded)'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-dashed border-amber-500 bg-amber-500/25" />
            <span>{value.locale === 'vi' ? 'Vùng chú thích mở rộng' : 'Caption expansion zone'}</span>
          </span>
        </div>
      )}
    </div>
  )
}
```

And in `App.tsx:1693–1698`:
Pass `safeZone={safeZone}` and `onToggleSafeZone={() => setSettings({ safeZone: !safeZone })}`:
```tsx
<PresentationControls
  value={presentation}
  onChange={setPresentation}
  profileId={profile.id}
  vertical={isVerticalSafeZonePlacement(profile.id) || profile.renderer === 'vertical'}
  safeZone={safeZone}
  onToggleSafeZone={() => setSettings({ safeZone: !safeZone })}
/>
```
Also update `preview-toolbar` (Line 1665):
Update the button text from `"Safe zone"` to `"Vùng bị che"` and set:
`className={safeZone ? 'border-brand bg-[#fdedef] selected active' : ''}`.

---

### Step 5: Update `src/features/DeviceMockup.tsx`
Add `appChrome` prop to `DeviceMockup`:
```tsx
// src/features/DeviceMockup.tsx:13-27
export function DeviceMockup({
  spec,
  contentWidth,
  immersive = false,
  browserTitle = 'Xem trước quảng cáo',
  browserUrl = 'preview.noti.vn',
  appChrome = true,
  children,
}: {
  spec: DeviceMockupSpec
  contentWidth: number
  immersive?: boolean
  browserTitle?: string
  browserUrl?: string
  appChrome?: boolean
  children: ReactNode
}) {
```
And in JSX:
1. Set `data-app-chrome={appChrome ? 'true' : 'false'}` on `.device-mockup`.
2. Wrap `{appChrome && <div className="device-phone-status" ... />}` and `{appChrome && <div className="device-home-indicator" ... />}`.
3. In `App.tsx` (Lines 1820 and 1862), pass `appChrome={presentation.appChrome}` to `<DeviceMockup ... />`.

---

### Step 6: Update `src/features/occlusion.css`
Add CSS classes for `.lang-selector-group`, `.topview-phase-group`, `.toolbar-pill-btn`:
```css
.preview-presentation-controls .lang-selector-group,
.preview-presentation-controls .topview-phase-group {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 2px;
  border-radius: 9999px;
  border: 1px solid #e7e7ea;
  background-color: #f6f6f7;
  padding: 2px;
}

.preview-presentation-controls .lang-selector-group button,
.preview-presentation-controls .topview-phase-group button {
  height: 100%;
  border-radius: 9999px;
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5f6470;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-presentation-controls .lang-selector-group button.active,
.preview-presentation-controls .lang-selector-group button.bg-white,
.preview-presentation-controls .topview-phase-group button.active,
.preview-presentation-controls .topview-phase-group button.bg-white {
  background-color: #ffffff;
  color: #101113;
  box-shadow: 0 1px 2px rgba(16, 17, 22, 0.06);
}

.preview-presentation-controls .toolbar-pill-btn {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 9999px;
  border: 1px solid #e7e7ea;
  background-color: #ffffff;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5f6470;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-presentation-controls .toolbar-pill-btn.active,
.preview-presentation-controls .toolbar-pill-btn.border-brand {
  border-color: #ed3c47;
  background-color: #fdedef;
  color: #ed3c47;
}
```

---

## 5. Verification Method

To independently verify the implementation:

1. **Tier 1 Feature Coverage Tests**:
   - Open browser or execute test runner for Features 26, 27, 28, and 29:
     - `file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/e2e-suite.html`
     - Or inspect test cases:
       - **Tests 26.1–26.5**: Confirms `Tiếng Việt` button is present and active (`.bg-white`), clicking `English` switches active button styling, and in-mockup labels (`Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`) toggle correctly.
       - **Tests 27.1–27.5**: Confirms `"Vùng bị che"` button is present on vertical 9:16 placements (`tt_infeed`, `ig_reels`, etc.), clicking it activates highlighted state (`.border-brand` / `.bg-[#fdedef]`), and overlays are hidden on non-vertical feeds.
       - **Tests 28.1–28.5**: Confirms `"Giao diện app"` button is present, toggles active state, and controls visibility of status bar, home bar, and reaction rails.
       - **Tests 29.1–29.5**: Confirms TikTok TopView phase toggle provides `"0-3 giây đầu"` and `"Sau 3 giây"`, switching between clean full video and in-feed overlay.

2. **Tier 3 Cross-Feature Combination Tests**:
   - **Test 3.1**: Language toggle × Safe-Zone Overlays on TikTok In-Feed.
   - **Test 3.2**: Coordinate percentages maintain precision across language changes.
   - **Tests 3.9–3.12**: TikTok TopView Phase × App UI × Safe Zones interaction.
   - **Test 3.13**: "Tất cả vị trí" Grid × Bilingual Toggle simultaneous update.

3. **Invalidation Conditions**:
   - If any button query `Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('...'))` returns `null` or `undefined`.
   - If the `"Vùng bị che"` button fails to have `.border-brand` or `.bg-[#fdedef]` after being clicked.
   - If the English button fails to have `.bg-white` after being clicked.
   - If non-vertical placements show the `"Vùng bị che"` button.
