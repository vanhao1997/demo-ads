# Handoff Report — Zoom Modal Fix, Iconography Pruning & UI Fidelity in Standalone demo-app.html

**Agent**: `explorer_m5_3`  
**Milestone**: M5 (Dual Deliverable Standalone HTML Sync)  
**Date**: 2026-10-17  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_3`  
**Target File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m5_3\handoff.md`  
**Target Prototype**: `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` and `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`

---

## 1. Observation

Direct observations from examining the prototype `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` (3,038 lines, 169,656 bytes), the React source code under `src/`, the test fixtures in `tests/fixtures/campaign-drafts.js`, and the E2E verification test suite `tests/tier1-feature-coverage.js`:

### 1.1 Zoom Button Wiring Defect in Standalone Prototype
1. **Defective Wiring Location**:
   In `demo-app.html`, lines 2828–2836:
   ```jsx
   {!showAll && (
     <button
       type="button"
       onClick={() => setShowAll(true)}
       className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e7e7ea] bg-white px-3 text-xs font-semibold text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
     >
       Phóng to
     </button>
   )}
   ```
2. **Defect Mechanism**:
   - The button labeled "Phóng to" (Zoom In) triggers `onClick={() => setShowAll(true)}`.
   - `showAll` controls the 2-column comparison grid ("Tất cả vị trí"), so clicking "Phóng to" switches the right pane into the multi-placement grid instead of opening a modal.
   - There is no modal DOM node, no dark backdrop, no focus management, and no Escape key listener for zooming in the standalone prototype.
3. **Reference React Implementation in `src/features/ZoomModal.tsx` & `src/styles.css`**:
   - In `src/features/ZoomModal.tsx` (lines 15–82) and `src/styles.css` (lines 3572–3659), the Zoom Modal is a dedicated accessible modal dialog:
     - Backdrop: `.zoom-modal-backdrop` (`position: fixed; inset: 0; z-index: 9999; background-color: rgba(11, 11, 15, 0.9); backdrop-filter: blur(8px); overflow: auto; padding: 16px 24px;`).
     - Header: `.zoom-modal-header` with platform/placement title and geometry badge (`393 × 852 (iPhone 15 / 16)` or `1920 × 945 (Desktop Chrome)`).
     - Close Button: 36×36 circular button `.close-zoom-btn` with `✕`, `aria-label="Đóng"`, `title="Đóng (Esc)"`.
     - Accessibility & Focus: `role="dialog"`, `aria-modal="true"`, autofocus on mount (`closeBtnRef.current?.focus()`), Escape key listener (`event.key === 'Escape'`), backdrop click-outside dismissal (`if (e.target === e.currentTarget) onClose()`), and focus restoration to the trigger button (`triggerRef?.current?.focus()`).
     - Body: `.zoom-modal-body` and `.zoom-modal-content` (`max-width: 95vw; max-height: calc(100vh - 80px);`) containing the auto-scaled high-resolution mockup.

### 1.2 Iconography Audit in Standalone Prototype (Requirement R4)
Requirement R4 mandates: *"Avoid unnecessary decorative icons on form inputs, helper banners, and buttons (retaining only platform logos and essential native app mockup chrome)."*

1. **Decorative Icons Successfully Omitted in `demo-app.html`**:
   - **Form input pulsing pencil icons**: In `go.noti.vn`, 9 separate form inputs rendered pulsing SVG pencils (`<svg class="... text-brand motion-safe:animate-pulse">`). In `demo-app.html`, lines 2511–2631, all pulsing pencils are completely omitted. Inputs render with clean dashed borders (`border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`) when unedited and turn solid on edit.
   - **Default notice banner**: Line 2481 renders clean text without the pulsing pencil SVG.
   - **Privacy notice shield icon**: Line 2507 renders clean text (`Tệp chỉ nằm trong trình duyệt của bạn...`) without the green shield SVG.
   - **Upload button glyph**: Line 2492 renders clean text `"Chọn tệp"` without the upload arrow SVG.
   - **Reset button glyph**: Line 2676 renders clean text `"Về nội dung mặc định"` without the circular reset SVG.
   - **Placement selector pill device icons**: Lines 2736–2757 render clean text without mobile phone, monitor, or grid SVGs.
   - **Toolbar icons**: Lines 2832 and 2844 render clean text `"Phóng to"` and `"Toàn màn hình"` without magnifying glass or expand box SVGs.
   - **Caption phone icons**: Line 724 renders clean caption text without the mini phone SVG.

2. **Essential Authentic Icons Correctly Preserved in `demo-app.html`**:
   - **Platform Logos (`PlatformSvg`, lines 530–597)**:
     18×18 monochrome `currentColor` SVGs for all 11 platforms:
     - `facebook` (d="M24 12.073...")
     - `instagram` (d="M7.0301.084...")
     - `threads` (d="M18.263 11.097...")
     - `tiktok` (d="M12.525.02...")
     - `youtube` (d="M23.498 6.186...")
     - `google_search` / `gdn` (d="M12.48 10.92...")
     - `chatgpt` (d="M22.2819 9.8211...")
     - `zalo` (d="M12 2C6.48 2 2 6.14...")
     - `linkedin` (d="M20.447 20.452...")
     - `admicro` (d="M12 2L2 20h4.2...")
     *(All 11 are authentic vector paths; no text fallbacks).*
   - **Authentic Device Mockup Chrome**:
     - **iPhone 15/16 Frame (`IPhoneFrame`, lines 650–729)**:
       - Status Bar: 4-bar cellular signal SVG (`width="19" height="12"`), 3-arc Wi-Fi SVG (`width="17" height="12"`), battery pill SVG with terminal cap (`width="27" height="13"`), time `"9:41"`.
       - Dynamic Island: `126 × 37` rounded pill (`bg-black`).
       - Home Indicator: `134 × 5` rounded bar (`bottom: 8`).
     - **Desktop Chrome Frame (`DesktopChromeFrame`, lines 732–780)**:
       - Tab bar (41px): Chrome tab styling, close button `×`, new tab `+`, window controls (`—`, `□`, `×`).
       - Toolbar (47px): Navigation arrows `←`, `→`, reload `⟳`, address bar omnibox with secure lock icon.
     - **Native In-App Social Interaction Elements**:
       - Meta: Thích, Bình luận, Chia sẻ.
       - Instagram: Heart (`♡`), Comment (`💬`), Share (`✈`), Bookmark (`🔖`).
       - TikTok: Reaction rail (Avatar+Follow, Heart, Comment, Bookmark, Share, Vinyl disc).
       - YouTube: Player timeline, duration, Skip Ad button.

### 1.3 Bilingual Translations & Live Validation Verbal Badges Audit
1. **Bilingual Translations (VI / EN)**:
   - In `demo-app.html`, line 2385 defines `const [lang, setLang] = useState("vi");`, and lines 2781–2798 render toolbar buttons for `Tiếng Việt` and `English`.
   - **Crucial Gap**: `lang` is **never passed** to `PlacementPreview` or any mockup renderer!
     - In line 2264: `function PlacementPreview({ state, placement, showSafeZone, showAppUi, tiktokLatePhase, isGrid = false })` — `lang` parameter is missing.
     - In lines 2896–2917: `<PlacementPreview ... />` calls do not supply `lang`.
     - In `FacebookFeedPost` (line 976): `<span>Được tài trợ · 🌐</span>` is hardcoded.
     - In `FacebookFeedPost` (line 987): `<span> Xem thêm</span>` is hardcoded.
     - In `FacebookFeedPost` (line 1004): `{state.cta}` is rendered directly without translation.
     - In `MetaFeedMobile` (lines 1031, 1037): `"Được tài trợ"` and `{state.cta}` are hardcoded.
     - In `VerticalMobile` (lines 1168, 1224, 1239, 1251): `"Được tài trợ"` and `{state.cta}` are hardcoded.
   - **Standard Reference Contracts**:
     - `CANONICAL_CTA_MAP` has 18 bilingual entries (`learn_more`, `shop_now`, `sign_up`, `book_now`, `contact_us`, `download`, `get_offer`, `order_now`, `send_message`, `subscribe`, `watch_more`, `watch_now`, `apply_now`, `get_quote`, `call_now`, `install_now`, `visit_site`, `none`).
     - `SPONSORED_LABELS`: `facebook`: 'Được tài trợ'/'Sponsored', `linkedin`: 'Được quảng bá'/'Promoted', `gdn` & `admicro`: 'Quảng cáo'/'Ad', `google_search`: 'Kết quả được tài trợ'/'Sponsored results'.
     - `SEE_MORE_LABELS`: `facebook`: 'Xem thêm'/'See more', `instagram`: 'xem thêm'/'more', `threads`: 'Xem thêm'/'More', `tiktok`/`zalo`/`linkedin`: 'Xem thêm'/'See more'.

2. **Live Validation Verbal Badges**:
   - **Platform Tab Dots (lines 2719–2724)**: Warning dots are bound to static `p.hasWarning` (hardcoded only for TikTok and GDN in `PLATFORMS`), rather than dynamically computing against active draft character counts and rules.
   - **Grid Card Badges (lines 2886–2894)**: Uses verbal badge `{plOver > 0 ? `${plOver} cảnh báo` : "Không có lỗi"}`, but only inspects primary and headline limits.
   - **"Kiểm tra vị trí này" Section (lines 2927–2936)**:
     - Uses verbal badge `{warningCount > 0 ? `${warningCount} cảnh báo` : "✓ Không có lỗi"}`.
     - Lacks distinction between red error badges (`! X lỗi` with `bg-[#fdedef] text-[#ed3c47]`) for hard limit violations (e.g. Google Search RSA headline > 30 chars, description > 90 chars, brand > 25 chars) and orange warning badges (`X cảnh báo` with `bg-[#fbeee5] text-[#e8590c]`).

---

## 2. Logic Chain

### 2.1 Why the Legacy Zoom Button Wiring Breaks Specification & User Experience
1. **Premise**: Requirement R3 states: *"Provide ... 'Phóng to' zoom modal, 'Toàn màn hình' view"*, and Acceptance Criteria states: *"Phóng to opens a dedicated high-resolution zoom modal of the active device mockup"*.
2. **Observation**: In `demo-app.html`, line 2831: `onClick={() => setShowAll(true)}`.
3. **Inference**:
   - "Phóng to" (Zoom In) and "Tất cả vị trí" (All Placements Grid) are two completely different user intents.
   - "Tất cả vị trí" shows all 10 Facebook placements simultaneously in a 2-column comparative grid at reduced scale (~0.68×).
   - "Phóng to" is intended for inspecting the active single placement at high resolution (enlarged scale ~1.0×–1.1×) on an uncluttered dark stage (`#0b0b0f`/90) without form editor distractions.
   - Wiring "Phóng to" to `setShowAll(true)` makes it impossible to zoom in on the active device mockup, and causes Tier 1 E2E Test 30.2–30.5 to fail.
4. **Conclusion**:
   - Dedicated state `zoomModalOpen` must be introduced in `AdPreviewWorkspace`.
   - "Phóng to" button must set `setZoomModalOpen(true)`.
   - A dedicated `ZoomModal` component with accessible modal attributes (`role="dialog"`, `aria-modal="true"`, `#0b0b0f`/90 backdrop, close button, Escape key handler, focus restoration) must be rendered.

### 2.2 Why Iconography Pruning (R4) Improves Fidelity and Performance
1. **Premise**: Requirement R4 mandates minimal decorative iconography.
2. **Observation**: `go.noti.vn` included animated pulsing pencil SVGs next to 9 form fields, decorative shield icons, and upload/reset glyphs.
3. **Inference**:
   - Continuous CSS animations (`motion-safe:animate-pulse`) increase CPU/GPU compositor load in single-page applications.
   - The pink dashed border (`border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`) and explanatory banner already communicate default unedited state with 100% clarity.
   - Button labels ("Chọn tệp", "Về nội dung mặc định", "Phóng to", "Toàn màn hình") are self-documenting.
   - Platform brand recognition relies solely on official 18×18 logos (`PlatformSvg`).
   - Mockup authenticity requires native app chrome (iPhone status bar, Dynamic Island, Chrome header, social reaction rails).
4. **Conclusion**:
   - Standalone `demo-app.html` must continue to omit pulsing pencils, decorative shields, sparkles, and button glyphs.
   - Authentic 18×18 monochrome platform SVGs and device chrome must be strictly preserved.

### 2.3 Why Bilingual Dictionaries & Verbal Badges Must Be Passed to Mockup Renderers
1. **Premise**: Feature 26 mandates that toggling `Tiếng Việt` / `English` updates in-mockup labels (`Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, CTAs).
2. **Observation**: In `demo-app.html`, `lang` state existed only in the top-level workspace and was not plumbed into `PlacementPreview` or individual platform renderers.
3. **Inference**:
   - When a user switches to `English`, the button styles change, but the preview inside the iPhone/Desktop frame remains completely in Vietnamese.
   - Automated tests (Tier 1 Tests 26.4 & 26.5) assert that clicking `English` changes the sponsored badge in the DOM to `"Sponsored"` (or `"Promoted"` for LinkedIn) and read more to `"See more"`.
   - In addition, live validation requires verbal badges (`! X lỗi`, `X cảnh báo`, `✓ Không có lỗi`) rather than arbitrary symbols.
4. **Conclusion**:
   - Introduce `CANONICAL_CTA_MAP`, `SPONSORED_LABELS`, `SEE_MORE_LABELS`, and translation helpers (`translateCta`, `translateSponsored`, `translateSeeMore`) into `demo-app.html`.
   - Pass `lang={lang}` from `AdPreviewWorkspace` into `PlacementPreview` and all child renderers.
   - Replace all hardcoded strings in renderers with dynamic translation helper calls.

---

## 3. Caveats

1. **Standalone Zero-Dependency Packaging**:
   - `demo-app.html` executes directly in the browser via React 18 UMD, ReactDOM 18 UMD, and `@babel/standalone`.
   - All components, helper functions, and dictionaries must be self-contained within `<script type="text/babel">` without ES module `import` / `export` statements.
2. **Missing Local Workspace File**:
   - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` does not yet exist. The prototype currently resides at `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`. The worker must write to both paths simultaneously.
3. **Shell Command Disabled Policy**:
   - Shell commands (`run_command`) cannot be used. Verification must be performed via file inspection tools or browser test execution.
4. **CTA Value Compatibility**:
   - In existing drafts, `state.cta` may be stored as either a canonical key (e.g. `'learn_more'`) or a Vietnamese string (e.g. `'Tìm hiểu thêm'`). The translation helper `translateCta(value, lang)` must handle both cases smoothly.

---

## 4. Conclusion & Concrete Implementation Recommendations for Worker

### 4.1 Recommendation 1: Dedicated Accessible ZoomModal Implementation
In `demo-app.html`, implement the `ZoomModal` component and wire it to the "Phóng to" button:

```jsx
// 1. ZoomModal Component
function ZoomModal({ isOpen, onClose, placement, platform, children, triggerRef }) {
  const closeBtnRef = useRef(null);

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

  if (!isOpen) return null;

  const isDesktop = placement.device === "desktop";
  const dimLabel = isDesktop ? "1920 × 945 (Desktop Chrome)" : "393 × 852 (iPhone 15 / 16)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to ${platform.name} · ${placement.name}`}
      className="zoom-modal-backdrop fixed inset-0 z-[9999] flex flex-col bg-[#0b0b0f]/90 p-4 sm:p-6 backdrop-blur-md overflow-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between pb-4 text-white">
        <div className="flex items-center gap-2 text-sm">
          <strong className="font-bold text-white">{platform.name}</strong>
          <span className="opacity-70">·</span>
          <span className="opacity-90">{placement.name}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white/80">
            {dimLabel}
          </span>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Đóng"
          title="Đóng (Esc)"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-bold text-white transition hover:bg-white/20 hover:scale-105"
        >
          ✕
        </button>
      </div>
      <div
        className="flex flex-1 items-center justify-center min-h-0 w-full"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative max-h-[88vh] max-w-[96vw] flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

// 2. Wiring in AdPreviewWorkspace:
const [zoomModalOpen, setZoomModalOpen] = useState(false);
const zoomBtnRef = useRef(null);

// In Toolbar:
{!showAll && (
  <button
    ref={zoomBtnRef}
    type="button"
    aria-label="Phóng to"
    aria-pressed={zoomModalOpen}
    onClick={() => setZoomModalOpen(true)}
    className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
      zoomModalOpen
        ? "border-[#ed3c47]/50 bg-[#fdedef] text-[#ed3c47]"
        : "border-[#e7e7ea] bg-white text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
    }`}
  >
    Phóng to
  </button>
)}

// Render ZoomModal before </AdPreviewWorkspace>:
<ZoomModal
  isOpen={zoomModalOpen}
  onClose={() => setZoomModalOpen(false)}
  placement={currentPlacement}
  platform={currentPlatformObj}
  triggerRef={zoomBtnRef}
>
  <PlacementPreview
    state={state}
    placement={currentPlacement}
    showSafeZone={showSafeZone}
    showAppUi={showAppUi}
    tiktokLatePhase={tiktokLatePhase}
    lang={lang}
    isGrid={false}
    isZoomed={true}
  />
</ZoomModal>
```

In `PlacementPreview`, when `isZoomed` is true, pass:
- For mobile: `maxHeight={Math.round(window.innerHeight * 0.85)}`, `maxScale={1.05}`
- For desktop: `maxHeight={Math.round(window.innerHeight * 0.82)}`, `maxScale={0.55}`

### 4.2 Recommendation 2: Strict Iconography Pruning & Authenticity Checklist
Worker must ensure:
1. **0 Pulsing Pencil SVGs**: No form input or notice box renders `<svg ... class="...animate-pulse">` or pencil paths (`d="M17 3a2.828..."`).
2. **0 Decorative Shield SVGs**: Privacy note must remain plain text.
3. **0 Upload / Reset / Pill Button Icons**: "Chọn tệp", "Về nội dung mặc định", and placement pills remain text-only.
4. **Preserve Authentic Monochrome SVGs (`PlatformSvg`)**: Keep the 18×18 `fill="currentColor"` SVGs for all 11 platforms.
5. **Preserve Authentic Mockup Chrome**: Keep iPhone signal/wifi/battery SVGs, Dynamic Island (`126×37`), Home bar (`134×5`), Chrome header, and social reaction icons.

### 4.3 Recommendation 3: Bilingual Dictionaries & Plumbing Architecture
Worker must insert canonical translation dictionaries and helpers into `demo-app.html`:

```jsx
const CANONICAL_CTA_MAP = {
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
};

const SPONSORED_LABELS = {
  facebook: { vi: 'Được tài trợ', en: 'Sponsored' },
  instagram: { vi: 'Được tài trợ', en: 'Sponsored' },
  threads: { vi: 'Được tài trợ', en: 'Sponsored' },
  tiktok: { vi: 'Được tài trợ', en: 'Sponsored' },
  youtube: { vi: 'Được tài trợ', en: 'Sponsored' },
  google_search: { vi: 'Kết quả được tài trợ', en: 'Sponsored results' },
  gdn: { vi: 'Quảng cáo', en: 'Ad' },
  chatgpt: { vi: 'Được tài trợ', en: 'Sponsored' },
  zalo: { vi: 'Được tài trợ', en: 'Sponsored' },
  linkedin: { vi: 'Được quảng bá', en: 'Promoted' },
  admicro: { vi: 'Quảng cáo', en: 'Ad' },
};

const SEE_MORE_LABELS = {
  facebook: { vi: 'Xem thêm', en: 'See more' },
  instagram: { vi: 'xem thêm', en: 'more' },
  threads: { vi: 'Xem thêm', en: 'More' },
  tiktok: { vi: 'Xem thêm', en: 'See more' },
  zalo: { vi: 'Xem thêm', en: 'See more' },
  linkedin: { vi: 'Xem thêm', en: 'See more' },
};

function translateCta(value, lang = 'vi') {
  if (!value) return '';
  if (CANONICAL_CTA_MAP[value]) return CANONICAL_CTA_MAP[value][lang];
  if (value === 'Liên hệ') return lang === 'vi' ? 'Liên hệ' : 'Contact us';
  for (const entry of Object.values(CANONICAL_CTA_MAP)) {
    if (value === entry.vi || value === entry.en) return entry[lang];
  }
  return value;
}

function translateSponsored(platform, lang = 'vi') {
  const entry = SPONSORED_LABELS[platform] || SPONSORED_LABELS.facebook;
  return entry[lang] || (lang === 'vi' ? 'Được tài trợ' : 'Sponsored');
}

function translateSeeMore(platform, lang = 'vi') {
  const entry = SEE_MORE_LABELS[platform] || SEE_MORE_LABELS.facebook;
  return entry[lang] || (lang === 'vi' ? 'Xem thêm' : 'See more');
}
```

Plumb `lang` through `PlacementPreview`:
- `function PlacementPreview({ state, placement, showSafeZone, showAppUi, tiktokLatePhase, lang = "vi", isGrid = false, isZoomed = false })`
- In `FacebookFeedPost`:
  - `translateSponsored("facebook", lang)` replaces `"Được tài trợ"`
  - `translateSeeMore("facebook", lang)` replaces `"Xem thêm"`
  - `translateCta(state.cta, lang)` replaces `{state.cta}`
- Apply identically across `MetaFeedMobile`, `VerticalMobile`, `FacebookSpecialMobile`, `FacebookRightColumnDesktop`, `YouTubeRenderer`, `GoogleSearchRenderer`, `GdnRenderer`, `ChatGptRenderer`, `ZaloAdsRenderer`, `LinkedInAdsRenderer`, and `AdmicroRenderer`.

### 4.4 Recommendation 4: Dynamic Verbal Validation Badges
1. Calculate validation issues dynamically per platform:
   - For Google Search: Brand name > 25 chars or headline > 30 chars or description > 90 chars -> `fail: 1`.
   - For Threads: Primary text > 500 chars or containing hashtags/URLs -> `warn: 1`.
   - For General: primary over limit or headline over limit -> `warn: 1`.
2. Update Platform Tab Warning Dot dynamically:
   - Show red dot if platform has failures, orange dot if platform has warnings, omit dot if clean.
3. Update "Kiểm tra vị trí này":
   - Categorize issues into:
     - `! {failCount} lỗi` (`bg-[#fdedef] text-[#ed3c47]`)
     - `{warnCount} cảnh báo` (`bg-[#fbeee5] text-[#e8590c]`)
     - `✓ Không có lỗi` (`bg-[#e7f6ec] text-[#16a34a]`)

---

## 5. Verification Method

### 5.1 Automated Test Execution via Standalone E2E Runner
Open `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\e2e-suite.html` in any web browser and execute Tiers 1–4:
1. **Feature 30 (Zoom Modal)**:
   - Test 30.1 verifies `"Phóng to"` button presence.
   - Test 30.2 verifies clicking `"Phóng to"` opens the modal without switching to grid view.
   - Test 30.3 verifies backdrop style contains `#0b0b0f`/90 (`rgba(11, 11, 15, 0.9)`).
   - Test 30.4 verifies close button (`✕`) presence.
   - Test 30.5 verifies pressing `Escape` closes the modal and returns focus to the trigger button.
2. **Feature 03 (Iconography)**:
   - Test 3.1 verifies zero pulsing pencil icons (`.animate-pulse.lucide-pencil, .pulsing-pencil`).
   - Test 3.2 verifies zero decorative shield badges in helper banners.
   - Test 3.3 verifies zero decorative sparkles/stars on buttons.
   - Test 3.4 verifies 18×18 monochrome platform SVGs are present.
   - Test 3.5 verifies Dynamic Island, Home Bar, and Omnibox native chrome are preserved.
3. **Feature 26 (Bilingual UI Toggle)**:
   - Test 26.1 & 26.2 verify toolbar language selector with default `'vi'`.
   - Test 26.3 verifies clicking `English` toggles button active state.
   - Test 26.4 verifies in-mockup sponsored badge updates between `"Được tài trợ"` and `"Sponsored"`.
   - Test 26.5 verifies in-mockup read more label updates between `"Xem thêm"` and `"See more"`.
4. **Feature 32 (Verbal Badges)**:
   - Test 32.1 & 32.2 verify warning badge dot and verbal indicator (`"Không có lỗi"` / `"X cảnh báo"`).

### 5.2 Manual Browser Invalidation Conditions
The fix is **invalidated** if:
- Clicking "Phóng to" sets `showAll` to true (revealing the 2-column comparison grid instead of a modal).
- Clicking the dark backdrop does not dismiss the modal.
- Pressing Escape while the modal is open does not dismiss the modal or fail to restore focus to the "Phóng to" button.
- Any decorative pencil icon or shield icon appears on inputs or banners.
- Switching to `English` leaves mockup labels in Vietnamese.
- Any placement renders without proportional scaling inside the zoom modal.
