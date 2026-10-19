# Milestone 5 Review & Adversarial Challenge Report: Interactive Tools, Modals, Bilingual Plumbing & Validation

**Author**: `reviewer_m5_2`  
**Role**: Code Reviewer & Adversarial Critic  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m5_2`  
**Date**: 2026-10-17  
**Verdict**: **APPROVE**

---

## 1. Observation

Direct source inspection was conducted on `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and synchronized artifact `C:\Users\PC\.gemini\antigravity\brain\55bcab9c-102d-4473-9c43-62d4ca627d6f\scratch\demo-app.html` (both bit-identical, 3,539 lines, 194,468 bytes).

### 1.1 Feature 30: Dedicated Accessible Zoom Modal ("Phóng to")
- **Elimination of Legacy Bug**: In `demo-app.html` line 3312:
  ```jsx
  {!showAll && (
    <button
      ref={zoomBtnRef}
      type="button"
      aria-label="Phóng to"
      aria-pressed={isZoomOpen}
      onClick={() => setIsZoomOpen(true)}
      className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
        isZoomOpen
          ? "border-brand border-[#ed3c47]/50 bg-[#fdedef] text-[#ed3c47]"
          : "border-[#e7e7ea] bg-white text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
      }`}
    >
      Phóng to
    </button>
  )}
  ```
  The legacy bug `onClick={() => setShowAll(true)}` is completely absent; the button triggers `setIsZoomOpen(true)` and attaches `ref={zoomBtnRef}` for focus management.
- **Component Anatomy (Lines 2708–2782)**:
  - Container element has `role="dialog"`, `aria-modal="true"`, and class `.zoom-modal-backdrop` (line 2740).
  - Explicit inline styling applies:
    ```js
    backgroundColor: "rgba(11, 11, 15, 0.9)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)"
    ```
  - Close button has class `.close-zoom-btn`, `aria-label="Đóng"`, `title="Đóng (Esc)"`, and contains glyph `✕` (lines 2759–2768).
  - Accessibility & Focus: `useEffect` focuses `closeBtnRef.current?.focus()` on open, intercepts `Escape` key (`e.preventDefault(); e.stopPropagation(); onClose()`), cleans up the listener, and executes `triggerRef?.current?.focus()` on unmount (lines 2711–2728).
  - Backdrop dismissal: Evaluates `if (e.target === e.currentTarget) onClose()` on both backdrop and body wrapper (lines 2746–2748, 2772–2774), preventing misfires when clicking inside the mockup canvas.
  - State isolation: `onClose={() => setIsZoomOpen(false)}` operates without mutating draft state (`state` or `editedFields`).

### 1.2 Feature 26: Bilingual UI & In-Mockup Translation
- **Canonical Dictionaries (Lines 496–543)**:
  - `CANONICAL_CTA_MAP`: Exactly 18 canonical CTA entries (`learn_more`, `shop_now`, `sign_up`, `book_now`, `contact_us`, `download`, `get_offer`, `order_now`, `send_message`, `subscribe`, `watch_more`, `watch_now`, `apply_now`, `get_quote`, `call_now`, `install_now`, `visit_site`, `none`), each mapping `{ vi, en }`.
  - `SPONSORED_LABELS`: Exactly 11 platforms, including LinkedIn mapped to `{ vi: 'Được quảng bá', en: 'Promoted' }`, Google Search `{ vi: 'Kết quả được tài trợ', en: 'Sponsored results' }`, GDN `{ vi: 'Quảng cáo', en: 'Ad' }`, and Admicro `{ vi: 'Quảng cáo', en: 'Ad' }`.
  - `SEE_MORE_LABELS`: Strict differentiation between Instagram (`{ vi: 'xem thêm', en: 'more' }` lowercase) and Threads (`{ vi: 'Xem thêm', en: 'More' }` capitalized).
- **Toolbar Language Selector (Lines 3224–3247)**:
  - Segmented control in toolbar with buttons `Tiếng Việt` and `English`.
  - Active button dynamically receives classes `bg-white active text-[#101113] shadow-sm`.
- **Dynamic Plumbing (Lines 2585–2703)**:
  - `PlacementPreview` router plumbs `lang={lang}` dynamically into all 11 platform renderers: `MetaFeedMobile`, `VerticalMobile`, `FacebookSpecialMobile`, `FacebookRightColumnDesktop`, `YouTubeRenderer`, `GoogleSearchRenderer`, `GdnRenderer`, `ChatGptRenderer`, `ZaloAdsRenderer`, `LinkedInAdsRenderer`, and `AdmicroRenderer`.

### 1.3 Feature 27: Safe-Zone Overlays ("Vùng bị che")
- **Initial State**: Line 2794: `const [showSafeZone, setShowSafeZone] = useState(false);` (strictly initialized to `false`).
- **Styling**: Lines 3284–3288: Active state renders `.border-brand`, `.border-[#ed3c47]/50`, `.bg-[#fdedef]`, `.text-[#ed3c47]`, and `.active`.
- **Placement Restriction**:
  - Line 2870–2872: `hasSafeZoneControls = showAll ? platformPlacements.some((p) => p.safeZone) : Boolean(currentPlacement.safeZone);`.
  - Exactly 8 vertical 9:16 placements have `safeZone: true`: `fb_stories`, `fb_reels`, `ig_stories`, `ig_reels`, `tt_infeed`, `tt_topview`, `yt_shorts`, `zalo_video`.
  - `fb_reels_overlay` (Banner trên Reels, 1:1) has `safeZone: false`, strictly excluding it.
  - Visual layers (lines 1142–1200): Renders red danger zones (`rgba(237, 60, 71, 0.3)`) and orange dynamic caption expansion zones (`rgba(255, 159, 28, 0.22)`).

### 1.4 Feature 28: Native App UI Toggle ("Giao diện app")
- **Initial State**: Line 2795: `const [showAppUi, setShowAppUi] = useState(true);`.
- **Frame Chrome**: Lines 904–932 & 942–948: `IPhoneFrame` conditionally mounts `.device-phone-status` (with `9:41`) and `.device-home-indicator` only when `showAppUi === true`.
- **Vertical Placement UI**: Lines 1462–1583: `VerticalMobile` wraps top header, right reaction rails (likes, comments, share), bottom caption, and bottom navigation tabs within `showAppUi && (...)`. When toggled off, they cleanly unmount.

### 1.5 Feature 29: TikTok TopView Phase Toggle
- **Toolbar Control**: Lines 3251–3277: Appears exclusively when TikTok TopView is active; provides segmented buttons "0-3 giây đầu" and "Sau 3 giây" with `active` styling.
- **Render Modes**:
  - Phase 0–3s (lines 1452–1460): Clean intro mode displaying full-screen video with "Bỏ qua" / "Skip" button in the upper right (`top-[62px] right-4`).
  - Phase >3s (lines 1461–1583): In-feed overlay mode displaying brand name, caption, sound bar, reaction column, CTA card, and bottom navigation.

### 1.6 Feature 31: Fullscreen Workspace
- **Toolbar Button**: Lines 3323–3338: Calls Fullscreen API on `workbenchRef.current || document.documentElement` and `document.exitFullscreen()`.
- **Label Toggling**: Displays "Toàn màn hình" when inactive and "Thoát toàn màn hình" when active.
- **Event Synchronization**: Lines 2803–2808: Listens to `fullscreenchange` on `document` and synchronizes state with `document.fullscreenElement`.

### 1.7 Features 32 & 33: Live Validation & Official Specs Card
- **CJK Double-Width Accounting (Lines 577–592)**:
  `countGoogleCharacters` iterates codepoints and counts 2 units for standard CJK ranges:
  - 4352–4447 (Hangul Jamo)
  - 11904–42191 (CJK Radicals, Ideographs, Katakana/Hiragana)
  - 44032–55203 (Hangul Syllables)
  - 63744–64255 (CJK Compatibility Ideographs)
  - 65072–65103 (CJK Compatibility Forms)
  - 65280–65374 (Fullwidth ASCII)
  Standard Latin and Vietnamese accented characters count as 1 unit.
- **Verbal Badges (Lines 3424–3438)**:
  - Error: `! ${errorCount} lỗi` (`bg-[#fdedef] text-[#ed3c47]`)
  - Warning: `${warningCount} cảnh báo` (`bg-[#fbeee5] text-[#e8590c]`)
  - Zero issues: `✓ Không có lỗi` (`bg-[#e7f6ec] text-[#16a34a]`)
- **TikTok Rules**: Lines 686–694 enforce brand name <= 20 characters and reject emojis using `/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u`.
- **Official Specs Card**: Lines 3462–3502 render placement title, ratio badge ("Nên dùng ..."), source verification status pill, bulleted specifications, and collapsible `<details>` with source citations.

---

## 2. Logic Chain

1. *Elimination of legacy bug*: Upstream survey identified that "Phóng to" historically executed `setShowAll(true)`. Inspection of line 3312 proves this was replaced with `setIsZoomOpen(true)`. The `ZoomModal` component mounts as an accessible modal with backdrop blur, role dialog, Escape key trap, and focus restoration to the trigger ref without altering draft inputs.
2. *Bilingual fidelity*: Requirements mandate support for 18 canonical CTAs and in-mockup translation across 11 platforms. The dictionary in lines 496–543 covers all 18 CTAs and 11 platforms (explicitly verifying LinkedIn as 'Được quảng bá' ↔ 'Promoted'). The `lang` state is passed through `PlacementPreview` to all 11 platform renderers, updating buttons, labels, and social chrome in real time.
3. *Safe-zone scoping*: Overlay controls must only target 9:16 vertical video placements. In `PLACEMENTS`, exactly 8 vertical placements have `safeZone: true`, while `fb_reels_overlay` and all feed/horizontal placements have `safeZone: false`. `hasSafeZoneControls` evaluates `currentPlacement.safeZone`, preventing non-vertical placements from showing the toggle.
4. *Native UI toggle clean unmount*: When `showAppUi` is false, `IPhoneFrame` unmounts `.device-phone-status` and `.device-home-indicator`, and `VerticalMobile` unmounts the reaction rail and navigation bar. This allows clean ad creative review without device interference.
5. *TikTok TopView fidelity*: TopView differs between initial 3s and subsequent playtime. The segmented control toggles `tiktokLatePhase`, displaying the clean video with skip button in 0–3s mode and expanding the full interactive overlay in >3s mode.
6. *Integrity verification*: Source review confirmed zero hardcoded test stubs, zero dummy facades, and zero bypassed functionality. All public exports (`window.PLATFORMS`, `window.PLACEMENTS`, `window.countGoogleCharacters`, etc.) expose legitimate data structures and pure calculation functions.

---

## 3. Caveats

- In headless or sandbox iframe environments where `requestFullscreen` is prohibited by security policy, the call gracefully fails without breaking the UI due to `.catch(() => {})`.
- Vietnamese diacritics in `countGoogleCharacters` (e.g., ồ, ẵ, ệ in Latin Extended Additional 0x1EA0..0x1EF9) count as 1 unit, whereas fullwidth Latin (0xFF01..0xFF5E) counts as 2 units, adhering precisely to Google Ads SERP counting rules.
- No other caveats.

---

## 4. Adversarial Challenge & Stress-Test Results

| # | Attack Scenario / Hypothesis | Blast Radius | Mitigation in Source | Result |
|---|---|---|---|:---:|
| 1 | **Unmounted Trigger Focus Restoration**: User triggers ZoomModal, placement changes, and modal unmounts. | Null pointer exception attempting to focus trigger. | Lines 2726: Uses optional chaining `triggerRef?.current?.focus()`. | **PASS** |
| 2 | **Click Inside Zoom Content**: User clicks mockup or controls inside the zoomed frame. | Unwanted modal dismissal. | Lines 2747 & 2773: Evaluates `e.target === e.currentTarget` on backdrop elements. | **PASS** |
| 3 | **CJK Codepoint Boundary Confusion**: Testing Vietnamese diacritics against CJK ranges. | False inflation of Vietnamese ad character counts. | Codepoint checks 11904..42191 and 44032..55203 properly bypass Latin Extended (0x1EA0..0x1EF9). | **PASS** |
| 4 | **Non-Vertical Safe-Zone Leak**: User switches from TikTok (9:16) to FB Feed (4:5) while safe-zone active. | Incorrect overlay rendering on non-vertical feed. | `hasSafeZoneControls` becomes false; `MetaFeedMobile` contains no safe-zone renderer. | **PASS** |
| 5 | **Fullscreen Rejection**: Running inside restricted iframe lacking `allowfullscreen`. | Unhandled Promise rejection crashing app. | Line 3327 & 3331: Appends `.catch(() => {})` on both enter and exit calls. | **PASS** |
| 6 | **Unknown CTA Value Fallback**: User provides custom or legacy CTA string. | Blank CTA button or runtime crash. | Lines 594–601: `translateCta` safely returns original string if not in canonical dictionary. | **PASS** |

---

## 5. Conclusion

Milestone 5 implementation in `demo-app.html` (and brain prototype) is complete, robust, accessible, and fully aligned with all acceptance criteria:
- Feature 30: Dedicated accessible ZoomModal with dark backdrop, blur, Escape trap, focus return, and legacy bug removal.
- Feature 26: Complete bilingual UI with 18 canonical CTAs, 11 platform translations (including LinkedIn 'Được quảng bá'), and dynamic plumbing.
- Feature 27: Safe-zone overlays default to false, properly styled, and restricted strictly to the 8 vertical 9:16 placements.
- Feature 28: Native App UI toggle cleanly unmounts iPhone chrome and vertical reaction/action bars.
- Feature 29: TikTok TopView phase toggle cleanly switches between 0-3s skip mode and >3s interactive mode.
- Feature 31: Fullscreen workspace toggles properly with `fullscreenchange` event listener.
- Features 32 & 33: Live validation calculates CJK double-width accurately, displays verbal badges, enforces TikTok brand rules, and renders official specs cards.
- Integrity check: Zero violations detected.

**Verdict: APPROVE**

---

## 6. Verification Method

To independently verify this evaluation:
1. **File Metrology**:
   Inspect line count and byte size of both deliverables:
   ```powershell
   Get-Item c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html | Select-Object Length
   # Expected: 194,468 bytes, 3,539 lines
   ```
2. **DOM Selectors & Attributes**:
   Open `demo-app.html` in browser and verify presence of:
   - `[data-testid="platform-tab-facebook"]` through `[data-testid="platform-tab-admicro"]` (11 tabs)
   - `.zoom-modal-backdrop` and `.close-zoom-btn` upon clicking "Phóng to"
   - Button text "Toàn màn hình" in toolbar
   - Verbal badges `✓ Không có lỗi`, `! X lỗi`, `X cảnh báo`
3. **Invalidation Conditions**:
   - Any recurrence of `setShowAll(true)` on "Phóng to" button.
   - Any non-vertical placement showing "Vùng bị che" controls.
   - `countGoogleCharacters` counting Vietnamese accented letters as 2 characters.
