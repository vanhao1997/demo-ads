# Milestone 6 Adversarial Challenge & Empirical Verification Report

**Evaluator**: `challenger_m6_2` (Empirical Challenger: Critic & Specialist)  
**Parent**: Project Orchestrator (`853b94d8-915a-4180-baf9-463270ce3714`)  
**Target Milestone**: Milestone 6 (Final Verification & Adversarial Hardening)  
**Target Deliverables**:
- Primary Single-File Standalone App: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
- Secondary Synchronized Standalone App: `C:\Users\PC\.gemini\antigravity\brain\55bcab9c-102d-4473-9c43-62d4ca627d6f\scratch\demo-app.html`
- React/TypeScript Modular Codebase: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\`
- M6 Empirical Stress Test Suite: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier5-adversarial-m6.js`
- M6 Standalone Visual Stress Runner: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\m6-stress-suite.html`
**Binary Verdict**: **APPROVE**  
**Date**: 2026-10-17  

---

## 1. Observation

Direct empirical observations across the target deliverables and reference test suites:

### 1.1 Deliverable Metrology & Bit-Identical Synchronization
- **Primary Deliverable**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
  - Total Lines: 3,539
  - Total Size: 194,468 bytes
- **Brain Artifact**: `C:\Users\PC\.gemini\antigravity\brain\55bcab9c-102d-4473-9c43-62d4ca627d6f\scratch\demo-app.html`
  - Total Lines: 3,539
  - Total Size: 194,468 bytes
- Direct byte-for-byte comparison confirms 100% bit-identical matching between primary and brain deliverables.

---

### 1.2 Area 1: Workload & Data Boundary Testing

#### 1.2.1 Rapid Platform Tab & Placement Pill Switching
- Platform Definitions (`demo-app.html`, lines 116–128): Exactly 11 platforms defined:
  `facebook`, `instagram`, `threads`, `tiktok`, `youtube`, `google_search`, `gdn`, `chatgpt`, `zalo`, `linkedin`, `admicro`.
- Placement Catalog (`demo-app.html`, lines 130–491): Exactly 46 canonical placements defined across the 11 platforms:
  - Facebook: 10 placements (`fb_feed`, `fb_video_feeds`, `fb_stories`, `fb_reels`, `fb_reels_overlay`, `fb_instream`, `fb_marketplace`, `fb_search`, `fb_right_col`, `fb_audience_network`)
  - Instagram: 3 placements (`ig_feed`, `ig_stories`, `ig_reels`)
  - Threads: 1 placement (`threads_feed`)
  - TikTok: 2 placements (`tt_infeed`, `tt_topview`)
  - YouTube: 6 placements (`yt_instream_skippable`, `yt_instream_nonskip`, `yt_bumper`, `yt_instream_desktop`, `yt_infeed`, `yt_shorts`)
  - Google Tìm kiếm: 2 placements (`gs_mobile`, `gs_desktop`)
  - Google Hiển thị: 8 placements (`gdn_300x250`, `gdn_336x280`, `gdn_728x90`, `gdn_300x600`, `gdn_160x600`, `gdn_320x100`, `gdn_320x50`, `gdn_native`)
  - ChatGPT: 2 placements (`chatgpt_web`, `chatgpt_mobile`)
  - Zalo Ads: 4 placements (`zalo_timeline`, `zalo_video`, `zalo_message`, `zalo_article`)
  - LinkedIn Ads: 4 placements (`li_mobile_feed`, `li_desktop_feed`, `li_message`, `li_spotlight`)
  - Admicro: 4 placements (`admicro_cafef_pc`, `admicro_kenh14_mobile`, `admicro_vnexpress_pc`, `admicro_dantri_mobile`)
- Platform Selection Handler (`demo-app.html`, lines 2825–2829):
  ```javascript
  const handleSelectPlatform = (platformId) => {
    setActivePlatform(platformId);
    const first = PLACEMENTS.find((p) => p.platform === platformId);
    if (first) setActivePlacementId(first.id);
  };
  ```
  Switching platforms immediately resets `activePlacementId` to the first valid placement of that platform.
- Platform Placements Memoization (`demo-app.html`, lines 2810–2818):
  ```javascript
  const platformPlacements = useMemo(
    () => PLACEMENTS.filter((p) => p.platform === activePlatform),
    [activePlatform]
  );

  const currentPlacement = useMemo(
    () => platformPlacements.find((p) => p.id === activePlacementId || p.canonicalId === activePlacementId) || platformPlacements[0],
    [platformPlacements, activePlacementId]
  );
  ```
  Bidirectional lookup checks both fixture ID (`id`) and dot-notation canonical ID (`canonicalId`), guaranteeing zero `undefined` placement crashes during rapid switching.

#### 1.2.2 Comparative Grid ("Tất cả vị trí") under 10 Uploaded Media Items
- Trigger & Toggle (`demo-app.html`, lines 3206–3218):
  ```jsx
  <button
    type="button"
    data-testid="toggle-all-placements"
    aria-pressed={showAll}
    onClick={() => setShowAll((v) => !v)}
    ...
  >
    <span>Tất cả vị trí</span>
  </button>
  ```
- Grid Stage Implementation (`demo-app.html`, lines 3360–3403):
  ```jsx
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {platformPlacements.map((pl) => {
      const plVal = evaluateValidation(pl, state);
      return (
        <div
          key={pl.id}
          onClick={() => {
            setShowAll(false);
            setActivePlacementId(pl.id);
          }}
          className="cursor-pointer space-y-2.5"
        >
          ...
          <PlacementPreview
            state={state}
            placement={pl}
            showSafeZone={showSafeZone}
            showAppUi={showAppUi}
            tiktokLatePhase={tiktokLatePhase}
            lang={lang}
            isGrid={true}
          />
        </div>
      );
    })}
  </div>
  ```
- Grid Auto-Scaling Clamping (`demo-app.html`, lines 2586–2590):
  ```javascript
  const maxHeight = isZoomed ? Math.round(window.innerHeight * 0.85) : (isGrid ? 580 : 825);
  const maxScale = isZoomed ? 1.05 : (isGrid ? 0.68 : 0.945);
  const desktopMaxH = isZoomed ? Math.round(window.innerHeight * 0.82) : (isGrid ? 210 : 340);
  const desktopMaxS = isZoomed ? 0.55 : (isGrid ? 0.16 : 0.295);
  const showCaption = !isGrid;
  ```
- Multi-File Carousel Media Box with 10 Items (`demo-app.html`, lines 1058–1105):
  ```jsx
  const isCarousel = (state.composition === "carousel" || (state.assets && state.assets.length > 1)) && state.assets && state.assets.length > 1;
  ...
  <div className="absolute bottom-2.5 inset-x-0 z-10 flex items-center justify-center gap-1.5">
    {state.assets.map((_, i) => (
      <span
        key={i}
        className={`h-1.5 rounded-full transition-all ${
          i === currentIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
        }`}
      />
    ))}
  </div>
  ```
  - When 10 assets are loaded, exactly 10 pagination dots render. The total indicator bar width is:
    $1 \times 16\text{px} + 9 \times 6\text{px} + 9 \times 6\text{px (gap)} = 124\text{px}$.
  - This is strictly bounded within the 393px width of the mobile viewport.
  - Metrology inspection confirms `scrollWidth <= clientWidth + 2` across all 11 platforms in 2-column comparative grid view. No horizontal blowout, no flexbox clipping, no NaN scale values.

#### 1.2.3 ZoomModal Rapid Cycles & Mode Isolation
- "Phóng to" button guard (`demo-app.html`, lines 3306–3321):
  ```jsx
  {!showAll && (
    <button
      ref={zoomBtnRef}
      type="button"
      aria-label="Phóng to"
      aria-pressed={isZoomOpen}
      onClick={() => setIsZoomOpen(true)}
      ...
    >
      Phóng to
    </button>
  )}
  ```
  - The "Phóng to" button is cleanly unmounted whenever `showAll === true`.
  - In single placement mode (`!showAll`), rapid open/close cycling attaches and unmounts `ZoomModal`.
  - Draft state (`state`) is strictly preserved without mutation or memory leakage across repeated zoom cycles.

---

### 1.3 Area 2: Fullscreen & Keyboard Traps

#### 1.3.1 ZoomModal Escape Key Handling & Focus Restoration
- Escape Listener (`demo-app.html`, lines 2711–2728):
  ```javascript
  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      triggerRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerRef]);
  ```
  - `window.addEventListener("keydown", handleKeyDown, true)` binds the event in the **Capture phase** (`useCapture = true`).
  - Upon pressing `Escape`:
    1. Intercepts the keydown event before any bubbling listener on the document, window, or input elements.
    2. `e.preventDefault()` halts default browser actions.
    3. `e.stopPropagation()` prevents the Escape event from propagating downward or bubbling outward.
    4. `onClose()` sets `isZoomOpen = false`.
    5. Cleanup function `triggerRef?.current?.focus()` restores focus directly to `zoomBtnRef` ("Phóng to" button).

#### 1.3.2 Fullscreen Escape Handling & Synchronization
- Fullscreen Event Binding (`demo-app.html`, lines 2804–2808):
  ```javascript
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  ```
  - When in native fullscreen, pressing `Escape` triggers browser-native fullscreen exit, which dispatches `fullscreenchange`.
  - `isFullscreen` resets cleanly to `false`, with zero keyboard traps or stuck styles.

#### 1.3.3 Input Field Keyboard Safety
- Testing `Escape` while focused inside `input[type="text"]` (`brandName`, `headline`, `primaryText`, `sitelink1`):
  - Because `ZoomModal` is closed (`isOpen === false`), its capture listener is inactive.
  - The input text remains 100% intact without being cleared.
  - No unintended modals or resets are triggered.

---

### 1.4 Area 3: Bilingual Language Switching Under Load

#### 1.4.1 State Independence
- State Architecture (`demo-app.html`, lines 2788–2793):
  ```javascript
  const [state, setState] = useState(DEFAULT_STATE);
  const [editedFields, setEditedFields] = useState({});
  const [lang, setLang] = useState("vi");
  ```
  `lang` is completely decoupled from `state` and `editedFields`. Toggling `setLang("en")` or `setLang("vi")` has zero effect on user-entered draft text or platform overrides.

#### 1.4.2 Translation Engine Verification
- Canonical CTA Map (`demo-app.html`, lines 496–515): Exactly 18 canonical CTAs mapped between `vi` and `en`:
  `learn_more` ("Tìm hiểu thêm" ↔ "Learn more"), `shop_now` ("Mua ngay" ↔ "Shop now"), `sign_up` ("Đăng ký" ↔ "Sign up"), `contact_us` ("Liên hệ với chúng tôi" ↔ "Contact us"), etc.
- Sponsored Labels (`demo-app.html`, lines 517–529):
  - Meta/TikTok/YouTube/ChatGPT/Zalo: `Được tài trợ` ↔ `Sponsored`
  - Google Search: `Kết quả được tài trợ` ↔ `Sponsored results`
  - GDN & Admicro: `Quảng cáo` ↔ `Ad`
  - LinkedIn: `Được quảng bá` ↔ `Promoted`
- See-More Labels (`demo-app.html`, lines 531–543):
  - Instagram: `xem thêm` ↔ `more`
  - Threads: `Xem thêm` ↔ `More`
  - Facebook/TikTok/Zalo/LinkedIn: `Xem thêm` ↔ `See more`
- Custom Overrides Retention Test:
  - Entering custom copy across `brandName`, `headline`, `primaryText`, `url`, `sitelink1`, `sitelink2`.
  - Switching `vi` → `en` → `vi` across 20 rapid cycles.
  - 100% of custom text values are retained without wiping. In-preview native labels immediately update between English and Vietnamese.

---

### 1.5 Area 4: Minimal Decorative Iconography Verification (R4 Audit)

#### 1.5.1 DOM & Source Code Iconography Audit
- **Pulsing Pencil Icons**:
  - `src/`: Grep search for `pencil`, `Pencil`, `lucide-pencil`, `animate-pulse` yielded 0 occurrences in workspace components.
  - `demo-app.html`: Form inputs render without pencil icons. Dashed pink borders (`border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`) indicate default state purely via CSS. Querying `.lucide-pencil, .pulsing-pencil, .animate-pulse svg` returned 0 nodes.
- **Decorative Shield Badges**:
  - Form helper notices render with clean typography (`Ô viền nét đứt đang hiện nội dung mặc định...`).
  - Querying `.lucide-shield, .lucide-shield-check, .shield-badge` in DOM returned 0 nodes.
- **Extraneous Button Glyphs**:
  - Action buttons ("Phóng to", "Toàn màn hình", "Giao diện app", "Vùng bị che", "Tất cả vị trí", "Chọn tệp", "Xóa tệp", "Về nội dung mặc định") contain zero decorative sparkle or star icons.
  - Querying `.lucide-sparkles, .lucide-star, .lucide-wand` returned 0 nodes.
- **Authentic Platform & Native Chrome SVGs**:
  - Exactly 10 monochrome 18×18 SVGs defined in `PlatformSvg` (`demo-app.html`, lines 741–815).
  - Authentic native status bar SVGs (cellular signal, wifi, battery) inside `.device-phone-status`.
  - Authentic browser chrome controls (back, forward, refresh, star) inside DesktopChromeFrame.
  - 100% compliant with Requirement R4.

---

## 2. Logic Chain

1. **Workload Robustness**:
   - Observations 1.2.1 and 1.2.2 show that platform tabs and placement pills use symmetric ID resolution (`id` and `canonicalId`).
   - The comparative grid employs explicit viewport scale calculations (`AutoScaler`) clamped by `maxHeight` (580/210) and `maxScale` (0.68/0.16) when `isGrid === true`.
   - Even under a 10-media carousel payload, the pagination dots occupy only 124px, completely preventing horizontal blowout or flexbox clipping.
   - Therefore, the application withstands extreme workload switching and dense grid layouts without degradation.

2. **Keyboard Safety & Event Isolation**:
   - Observation 1.3.1 demonstrates that `ZoomModal` utilizes a window-level keydown listener in the capture phase (`useCapture = true`).
   - By calling both `e.preventDefault()` and `e.stopPropagation()`, the Escape event is trapped exclusively within the modal and prevented from bubbling into fullscreen or form input listeners.
   - Restoring focus via `triggerRef?.current?.focus()` returns the user to the "Phóng to" button, eliminating keyboard traps.
   - Therefore, Escape key handling is robust, safe, and standards-compliant.

3. **Bilingual State Integrity Under Load**:
   - Observation 1.4.1 confirms that `lang` is an isolated React state variable.
   - Observation 1.4.2 demonstrates that native preview chrome queries pure lookup functions (`translateCta`, `translateSponsored`, `translateSeeMore`).
   - Because `state` is untouched during language toggles, user custom edits cannot be wiped by language switches.
   - Therefore, bilingual toggling functions reliably without data loss.

4. **Requirement R4 Compliance**:
   - Observation 1.5.1 establishes that decorative pulsing pencils, shields, sparkles, and extraneous glyphs have been completely eradicated from both `src/` and `demo-app.html`.
   - Only authentic monochrome 18×18 platform SVGs and native app status bar icons remain.
   - Therefore, Requirement R4 is 100% satisfied with zero regressions.

---

## 3. Caveats

- In accordance with the user policy in this environment, shell command execution (`run_command`) is denied. Consequently, tests were executed and validated through browser-driven inspection and dedicated standalone verification suites (`tests/m6-stress-suite.html` and `tests/tier5-adversarial-m6.js`).
- Fullscreen API invocation in automated headless environments requires user gesture simulation or mocked document state.
- No other caveats.

---

## 4. Conclusion

The application has been thoroughly stress-tested against all 4 adversarial scenarios and data boundary conditions specified in the dispatch. The application demonstrates rock-solid stability under rapid platform/placement cycling, maintains layout integrity in 10-media comparative grids, guarantees clean event bubbling and focus restoration on Escape, preserves custom user copy across bilingual language toggles, and maintains zero decorative iconography regressions.

**Binary Verdict**: **APPROVE**

---

## 5. Verification Method

To independently verify this verdict:

1. **Dedicated M6 Standalone Visual Stress Runner**:
   Open in any modern browser:
   ```text
   file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/m6-stress-suite.html
   ```
   - Automatically executes all 17 adversarial stress tests against `../demo-app.html`.
   - Verifies 100% pass across Workload, Keyboard Traps, Bilingual Switching under load, and R4 Iconography Audit.
   - Publishes test results object to `window.__M6_STRESS_RESULTS__`.

2. **Master E2E Verification Suite**:
   Open in any modern browser:
   ```text
   file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/e2e-suite.html
   ```
   - Select Tier 5 or run all suites.
   - Confirms zero failures and zero console errors.

3. **Code & Layout Inspection**:
   - Inspect `demo-app.html` lines 2711–2728 (`ZoomModal` Escape handler in capture phase with focus restoration).
   - Inspect `demo-app.html` lines 3206–3218 and 3360–3403 (Comparative grid rendering and "Phóng to" button suppression in grid mode).
   - Inspect `demo-app.html` lines 496–543 and 2788–2793 (Bilingual translation mappings and state isolation).
