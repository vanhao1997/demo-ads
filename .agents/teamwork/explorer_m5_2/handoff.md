# Handoff Report: Single-File Zero-Dependency HTML Packaging & Runtime Architecture for `demo-app.html`

**Author**: `explorer_m5_2`  
**Milestone**: M5 (Dual Deliverable Standalone HTML Sync & Packaging)  
**Target File 1**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`  
**Target File 2**: `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`  
**Date**: 2026-10-17  

---

## 1. Observation

### 1.1 Existing Prototype Architecture (`brain/.../scratch/demo-app.html`)
Direct inspection of `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` (3,038 lines, 169,656 bytes) revealed:
1. **Script Engine & Loading Mechanism**:
   - Lines 10–37: Tailwind Play CDN runtime script + inlined configuration:
     ```html
     <script src="https://cdn.tailwindcss.com"></script>
     <script>
       tailwind.config = { theme: { extend: { ... } } };
     </script>
     ```
   - Lines 92–96: React 18 & ReactDOM 18 production UMD scripts + Babel Standalone browser transpiler:
     ```html
     <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
     <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
     <script type="text/babel">
       const { useState, useEffect, useMemo, useRef } = React;
     ```
   - Lines 96–3035: Single inline `<script type="text/babel">` block containing the complete React component hierarchy, data structures, and layout renderers.

2. **CSS Styles & Design Tokens**:
   - Lines 38–87: Inlined `<style>` block containing root CSS variables matching `go.noti.vn`:
     `--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`, `--glass-bg: rgba(255, 255, 255, 0.78)`, `--glass-shadow`, `--glass-border`, `.glass-card` (with `backdrop-filter: blur(16px)`), background radial/linear grid patterns, and `.no-scrollbar` utility.
   - Combined with Tailwind utility classes for flex, grid, spacing, and typography.

3. **SVG Assets & Graphics**:
   - Lines 530–597: Function `PlatformSvg({ id, active })` embeds authentic monochrome 18×18 SVG paths directly into JSX with `fill="currentColor"`. Zero external SVG or icon image files.
   - Lines 685–701: Status bar icons (cellular signal bars, wifi waves, battery shell) are rendered via raw SVG `<rect>` and `<path>` primitives inside `IPhoneFrame`.

4. **State Management & Client Storage**:
   - Lines 2380–2435: Pure client-side React hooks (`useState`, `useMemo`, `useRef`, `useEffect`).
   - Line 2424 & 2432: File uploads use native browser `URL.createObjectURL(file)` to generate blob URLs. No server upload or persistent backend is required.
   - Lines 2436–2440: `inputClass(fieldKey)` dynamically evaluates `editedFields[key]` to switch inputs from initial pink dashed borders (`border-dashed border-[#ed3c47]/50 bg-[#fdedef]/40`) to solid borders (`border-[#e7e7ea] bg-white`).

### 1.2 Divergences and Bugs in Prototype against Acceptance Criteria & E2E Test Suite
Auditing `brain/.../demo-app.html` against `tests/tier1-feature-coverage.js`, `tests/tier2-boundary-corners.js`, and `tests/tier5-adversarial-m4.js` revealed eight critical defects:

1. **Zoom Modal Bug (Feature 30 / Test 30.2)**:
   - Line 2831–2836:
     ```jsx
     <button type="button" onClick={() => setShowAll(true)} ...>Phóng to</button>
     ```
     Clicking "Phóng to" improperly activates the multi-placement grid (`setShowAll(true)`) instead of opening a dedicated high-resolution zoom modal.
   - Missing: Modal container with `.zoom-modal-backdrop` (`background-color: rgba(11, 11, 15, 0.9)`), close button `✕`, and `Escape` keyboard dismissal handler (verified by Tier 1 Tests 30.1–30.5).

2. **Safe-Zone Overlays Initial State (Feature 27 / Test 5.4.2.3)**:
   - Line 2386: `const [showSafeZone, setShowSafeZone] = useState(true);`
   - Tier 5 Test 5.4.2.3 strictly asserts: `Initial safe-zone state in application defaults to false`.
   - Missing: Initial state must be `false`. Active button state must apply `.border-brand` and `.bg-[#fdedef]`.

3. **Device Mockup Chrome Hooks (Feature 28 / Tests 5.4.3.1–5.4.3.3)**:
   - Lines 676–716: `IPhoneFrame` lacks the required test hook class names `.device-phone-status` and `.device-home-indicator`.
   - When `showAppUi` is toggled off, `.device-phone-status` must be completely unmounted from the DOM (`expect(phoneStatus).toBe(null)`).

4. **TikTok TopView Phase Toggle (Feature 29 / Tests 5.4.4.1–5.4.4.2)**:
   - Lines 2775–2850: When `tt_topview` is selected, the toolbar fails to render the two-phase segmented toggle ("0-3 giây đầu" vs "Sau 3 giây").
   - Phase "0-3 giây đầu" must display a clean full-screen video with a "Bỏ qua" (Skip) button, suppressing in-feed reaction rails and overlays.

5. **Canonical CTAs & Bilingual Invariants (Feature 26 / Tests 5.4.1.1–5.4.1.4)**:
   - Lines 518–525: Prototype only defines 6 hardcoded CTAs instead of the 18 canonical CTAs defined in `CANONICAL_CTA_MAP`.
   - In-mockup labels (`Được tài trợ`, `Xem thêm`, CTA buttons) are hardcoded in Vietnamese and do not adapt when `lang === 'en'`.
   - Tier 5 Test 5.4.1.3 & 5.4.1.4 explicitly require:
     - LinkedIn sponsored label: `Được quảng bá` ↔ `Promoted`
     - Instagram see-more: lowercase `xem thêm` ↔ `more`
     - Threads see-more: capitalized `Xem thêm` ↔ `More`

6. **Multi-File Carousel Upload (Feature 09 / Tier 1 Feature 09)**:
   - Line 2422: `const file = e.target.files && e.target.files[0];` only captures a single file.
   - Line 2475: Hardcoded to `"1/10 tệp"` or `"0/10 tệp"`.
   - File input lacks `multiple` attribute and multi-item asset array support (2–10 files with carousel indicator on supported placements).

7. **CJK Character Width Accounting (Feature 38 / Tests 2.10–2.14)**:
   - Prototype uses standard `.length` string counting for Google Search and GDN limits, failing to count CJK codepoints as 2 characters.

8. **Missing Target Deliverable in Project Root**:
   - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` does NOT exist yet. The test suite runner (`tests/e2e-suite.html`) targets `../demo-app.html` by default.

---

## 2. Logic Chain

1. **Environmental Policy Constraint**:
   - `run_command` is disabled by user policy in this environment. No build scripts (`npm run build`, `vite build`, `npx tailwindcss`) can be executed.
   - Therefore, any packaging strategy that relies on compiling React/TypeScript files to a bundled `.js` via Node/Vite CLI is strictly infeasible.

2. **Self-Contained Browser Runtime Viability**:
   - The prototype architecture demonstrates that loading React 18 UMD, ReactDOM 18 UMD, Babel Standalone, and Tailwind CDN inside a single `.html` file executes flawlessly in standard modern web browsers (`file:///` protocol and local HTTP servers).
   - The browser-driven E2E test suite (`tests/e2e-suite.html`) is specifically architected to test this file in an `iframe` sandbox via `tests/e2e-runner.js`.

3. **Zero-Dependency & Offline Characterization**:
   - **Assets & Data**: 100% self-contained. All 11 platform SVG logos, device casings, status bars, safe-zone overlays, default campaign copy, and placement metadata are embedded directly in the HTML document. File uploads create client-side Blob URLs.
   - **Runtime Dependencies**: Relies on React 18, ReactDOM 18, Babel Standalone, and Tailwind Play CDN via script tags. In browser execution, these are cached after initial load.
   - **Zero Build Commands**: Updating `demo-app.html` requires only reading and writing the HTML file directly using `write_to_file`.

4. **Synchronization Requirement**:
   - The application must exist and remain identical in two locations:
     - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
     - `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
   - The worker must author the refined, defect-free code in `demo-ads/demo-app.html` and copy/synchronize it to the brain directory.

---

## 3. Caveats

1. **Babel Standalone Startup Latency**:
   - Babel Standalone compiles the JSX on DOMContentLoaded. In an iframe, this takes approximately 40–120ms before React mounts to `#root`. E2E tests must poll or wait for `#root > div` before dispatching DOM events (which `tests/e2e-runner.js` already does via its iframe load listener).
2. **CDN Offline Availability**:
   - While all application code, styles, SVG assets, and media blobs are inlined, if opened in a completely air-gapped machine with a cleared browser cache, the CDN UMD scripts (`unpkg.com`, `cdn.tailwindcss.com`) require network connectivity for the initial fetch.
3. **No Modifying Source Files in Read-Only Mode**:
   - As an explorer agent, no modifications were made to `src/` or `demo-app.html`. All concrete blueprints and code structures are provided below for the worker agent.

---

## 4. Conclusion & Structural Blueprint for Worker

### 4.1 Packaging Strategy Summary
- **Format**: Single, self-contained HTML5 file (`demo-app.html`).
- **Runtime Stack**:
  - `React 18` (UMD production: `https://unpkg.com/react@18/umd/react.production.min.js`)
  - `ReactDOM 18` (UMD production: `https://unpkg.com/react-dom@18/umd/react-dom.production.min.js`)
  - `Babel Standalone` (`https://unpkg.com/@babel/standalone/babel.min.js`)
  - `Tailwind Play CDN` (`https://cdn.tailwindcss.com`) with inlined `tailwind.config`
- **Build Step**: None (Zero build commands; runtime in-browser transpilation).
- **Deployment Targets**:
  1. `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`
  2. `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`

---

### 4.2 Concrete Structural Blueprint & Code Blocks

The worker must implement `demo-app.html` with the following modular sections:

```
demo-app.html
├── <!DOCTYPE html> <html lang="vi">
├── <head>
│   ├── Meta tags (UTF-8, viewport, title)
│   ├── Google Fonts link (Inter)
│   ├── <script src="https://cdn.tailwindcss.com"> + tailwind.config
│   └── <style> Design Tokens, Glass Card, Background Grid, Zoom Modal CSS, Device Frame CSS
├── <body>
│   ├── <div id="root"></div>
│   ├── React 18 UMD script
│   ├── ReactDOM 18 UMD script
│   ├── Babel Standalone script
│   └── <script type="text/babel">
│       ├── Section 1: Data Contracts & Dictionaries
│       │   ├── PLATFORMS (11 platforms)
│       │   ├── PLACEMENTS (46 placements with exact limits & safeZone flags)
│       │   ├── CANONICAL_CTA_MAP (18 canonical CTAs with vi & en mappings)
│       │   ├── SPONSORED_LABELS (11 platforms bilingual mappings)
│       │   ├── SEE_MORE_LABELS (Platform-specific casing mappings)
│       │   └── DEFAULT_STATE
│       ├── Section 2: Utilities & Algorithms
│       │   ├── countGoogleCharacters (CJK double-width accounting)
│       │   ├── truncateText & parseDomain
│       │   └── getCtaLabel(key, lang)
│       ├── Section 3: Monochrome Platform SVGs & Status Bar SVGs
│       │   └── PlatformSvg({ id, active })
│       ├── Section 4: Device Frames & Mockup Geometry
│       │   ├── AutoScaler
│       │   ├── IPhoneFrame (with .device-phone-status & .device-home-indicator hooks)
│       │   └── DesktopChromeFrame (1920x945 viewport inside 1920x1080 casing)
│       ├── Section 5: Shared Preview Components
│       │   ├── BrandAvatar
│       │   ├── AdMediaBox (with multi-file carousel pagination)
│       │   └── VerticalSafeZoneOverlay (red danger + orange dynamic caption zones)
│       ├── Section 6: Placement Renderers (46 Placements across 11 Platforms)
│       │   ├── MetaFeedMobile, VerticalMobile, FacebookSpecialMobile, FacebookRightColumnDesktop
│       │   ├── YouTubeRenderer, GoogleSearchRenderer, GdnRenderer, ChatGptRenderer
│       │   └── ZaloAdsRenderer, LinkedInAdsRenderer, AdmicroRenderer
│       ├── Section 7: Dedicated Zoom Modal Component
│       │   └── ZoomModal (role="dialog", backdrop #0b0b0f/90, close button, Escape listener)
│       ├── Section 8: Main Workspace Container (AdPreviewWorkspace)
│       │   ├── Two-Column Layout (lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)])
│       │   ├── Left Column: Editor, Multi-File Uploader, Brand/Handle, URL, CTA, Overrides
│       │   ├── Right Column: Sticky Preview Glass Card, Platform Tabs, Placement Pills
│       │   ├── Toolbar: VI/EN Language Toggle, Safe-Zone Toggle, App UI Toggle, TopView Toggle, Zoom, Fullscreen
│       │   ├── Comparison Grid ("Tất cả vị trí" for all 11 platforms)
│       │   └── Live Validation Badges & Official Specs Card
│       └── Section 9: Root Mount
│           └── ReactDOM.createRoot(document.getElementById("root")).render(<AdPreviewWorkspace />);
```

---

### 4.3 Key Migration Snippets for Worker Implementation

#### Snippet 1: Bilingual Translation Dictionaries & 18 Canonical CTAs
```javascript
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
  instagram: { vi: 'xem thêm', en: 'more' },   // strictly lowercase for Instagram
  threads: { vi: 'Xem thêm', en: 'More' },       // capitalized 'More' for Threads
  tiktok: { vi: 'Xem thêm', en: 'See more' },
  zalo: { vi: 'Xem thêm', en: 'See more' },
  linkedin: { vi: 'Xem thêm', en: 'See more' },
  youtube: { vi: 'Xem thêm', en: 'See more' },
  google_search: { vi: 'Xem thêm', en: 'See more' },
  gdn: { vi: 'Xem thêm', en: 'See more' },
  chatgpt: { vi: 'Xem thêm', en: 'See more' },
  admicro: { vi: 'Xem thêm', en: 'See more' },
};

function resolveCtaText(ctaKeyOrValue, lang = 'vi') {
  for (const [key, item] of Object.entries(CANONICAL_CTA_MAP)) {
    if (key === ctaKeyOrValue || item.vi === ctaKeyOrValue || item.en === ctaKeyOrValue) {
      return item[lang];
    }
  }
  return ctaKeyOrValue;
}
```

#### Snippet 2: Dedicated Zoom Modal Fix (Feature 30)
```jsx
// Inside AdPreviewWorkspace state:
const [isZoomOpen, setIsZoomOpen] = useState(false);

// Escape key dismiss listener:
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsZoomOpen(false);
  };
  if (isZoomOpen) window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isZoomOpen]);

// Phóng to toolbar button:
{!showAll && (
  <button
    type="button"
    onClick={() => setIsZoomOpen(true)}
    className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e7e7ea] bg-white px-3 text-xs font-semibold text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
  >
    Phóng to
  </button>
)}

// High-resolution Zoom Modal markup:
{isZoomOpen && (
  <div
    className="zoom-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label={`Phóng to ${currentPlatformObj.name} - ${currentPlacement.name}`}
    onClick={(e) => {
      if (e.target === e.currentTarget) setIsZoomOpen(false);
    }}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(11, 11, 15, 0.9)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '16px 24px 24px',
      overflow: 'auto',
    }}
  >
    <div className="zoom-modal-header flex items-center justify-between w-full max-w-[1200px] mx-auto mb-4 text-white">
      <div className="zoom-modal-meta flex items-center gap-2 text-sm font-semibold">
        <strong>{currentPlatformObj.name}</strong>
        <span> · </span>
        <span>{currentPlacement.name}</span>
        <span className="zoom-modal-ratio ml-2 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white/80">
          {currentPlacement.device === 'desktop' ? '1920 × 1080 (Chrome)' : '393 × 852 (iPhone 15/16)'}
        </span>
      </div>
      <button
        type="button"
        className="close-zoom-btn inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg text-white hover:bg-white/20 transition-colors"
        aria-label="Đóng"
        title="Đóng (Esc)"
        onClick={() => setIsZoomOpen(false)}
      >
        ✕
      </button>
    </div>
    <div className="zoom-modal-body flex-1 flex items-center justify-center min-h-0 w-full">
      <div className="zoom-modal-content max-w-[95vw] max-h-[calc(100vh-80px)]">
        <PlacementPreview
          state={state}
          placement={currentPlacement}
          showSafeZone={showSafeZone}
          showAppUi={showAppUi}
          tiktokLatePhase={tiktokLatePhase}
          lang={lang}
          isGrid={false}
          maxHeight={960}
          maxScale={1.15}
        />
      </div>
    </div>
  </div>
)}
```

#### Snippet 3: DeviceMockup Test Hooks & App UI Isolation (Feature 28)
```jsx
function IPhoneFrame({ dark = false, bg = "#ffffff", maxHeight = 825, maxScale = 0.945, showCaption = true, showAppUi = true, extraCaption = null, children }) {
  const frameW = 411;
  const frameH = 870;
  const statusColor = dark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";
  return (
    <div className="w-full min-w-0">
      <AutoScaler width={frameW} height={frameH} maxHeight={maxHeight} maxScale={maxScale}>
        <div className="relative h-full w-full bg-[#1c1c1e] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] select-none" style={{ borderRadius: 64, padding: 9 }}>
          <div className="relative overflow-hidden" style={{ width: 393, height: 852, borderRadius: 55, background: bg }}>
            <div className="relative h-full w-full overflow-hidden">
              {children}
            </div>

            {/* Status Bar: Conditionally rendered with class .device-phone-status */}
            {showAppUi && (
              <div
                aria-hidden="true"
                className="device-phone-status pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between"
                style={{ height: 54, paddingLeft: 48, paddingRight: 30, paddingTop: 6 }}
              >
                <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: statusColor }}>
                  9:41
                </span>
                <span className="flex items-center gap-[6px]" style={{ color: statusColor }}>
                  <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="0.8" fill="currentColor"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="0.8" fill="currentColor"/><rect x="10" y="3" width="3.2" height="9" rx="0.8" fill="currentColor"/><rect x="15" y="0" width="3.2" height="12" rx="0.8" fill="currentColor"/></svg>
                  <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.2c2.4 0 4.6.9 6.3 2.5l1.3-1.3A10.6 10.6 0 0 0 8.5.4 10.6 10.6 0 0 0 .9 3.4l1.3 1.3a8.8 8.8 0 0 1 6.3-2.5Z" fill="currentColor"/><path d="M8.5 5.6c1.5 0 2.8.6 3.9 1.5l1.3-1.3a7.2 7.2 0 0 0-10.4 0l1.3 1.3a5.5 5.5 0 0 1 3.9-1.5Z" fill="currentColor"/><path d="M8.5 9c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.6c.4-.4.9-.6 1.5-.6Z" fill="currentColor"/></svg>
                  <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor"/><path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1Z" fill="currentColor" fillOpacity="0.45"/></svg>
                </span>
              </div>
            )}

            {/* Dynamic Island */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-full bg-black" style={{ top: 11, width: 126, height: 37 }} />

            {/* Home Indicator: Conditionally rendered with class .device-home-indicator */}
            {showAppUi && (
              <div aria-hidden="true" className="device-home-indicator pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-full" style={{ bottom: 8, width: 134, height: 5, background: statusColor }} />
            )}
          </div>
        </div>
      </AutoScaler>
    </div>
  );
}
```

#### Snippet 4: Safe Zone Overlays Initial State & Button Styling (Feature 27)
```jsx
// Initial state MUST default to false:
const [showSafeZone, setShowSafeZone] = useState(false);

// Toolbar button styling applies .border-brand and .bg-[#fdedef] when active:
<button
  type="button"
  onClick={() => setShowSafeZone((v) => !v)}
  className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${
    showSafeZone
      ? "border-brand border-[#ed3c47]/50 bg-[#fdedef] text-[#ed3c47]"
      : "border-[#e7e7ea] bg-white text-[#5f6470]"
  }`}
>
  Vùng bị che
</button>
```

#### Snippet 5: TikTok TopView Phase Toggle in Toolbar (Feature 29)
```jsx
{activePlacementId === "tt_topview" && (
  <div
    role="group"
    aria-label="Giai đoạn TopView"
    className="topview-phase-group flex h-8 items-center gap-0.5 rounded-full border border-[#e7e7ea] bg-[#f6f6f7] p-0.5"
  >
    <button
      type="button"
      onClick={() => setTiktokLatePhase(false)}
      className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
        !tiktokLatePhase ? "bg-white text-[#101113] shadow-sm active" : "text-[#5f6470] hover:text-[#101113]"
      }`}
    >
      0-3 giây đầu
    </button>
    <button
      type="button"
      onClick={() => setTiktokLatePhase(true)}
      className={`h-full rounded-full px-3 text-xs font-semibold transition-colors ${
        tiktokLatePhase ? "bg-white text-[#101113] shadow-sm active" : "text-[#5f6470] hover:text-[#101113]"
      }`}
    >
      Sau 3 giây
    </button>
  </div>
)}
```

#### Snippet 6: Multi-File Carousel Upload & Asset State (Feature 09)
```jsx
// File input supports up to 10 files:
<input
  type="file"
  multiple
  accept="image/*,video/*"
  onChange={handleMediaUpload}
  className="hidden"
/>

const handleMediaUpload = (e) => {
  const files = Array.from(e.target.files || []).slice(0, 10);
  if (!files.length) return;
  const newAssets = files.map((f) => ({
    url: URL.createObjectURL(f),
    type: f.type.startsWith("video/") ? "video" : "image",
    name: f.name,
  }));
  setState((prev) => ({
    ...prev,
    mediaUrl: newAssets[0].url,
    mediaType: newAssets[0].type,
    assets: newAssets,
    composition: newAssets.length >= 2 ? "carousel" : "single_image",
  }));
};

// Counter badge:
<span className="mt-2 inline-flex h-6 items-center rounded-full bg-[#f6f6f7] px-2.5 text-[11px] font-semibold text-[#5f6470]">
  {state.assets && state.assets.length > 0 ? `${state.assets.length}/10 tệp` : state.mediaUrl ? "1/10 tệp" : "0/10 tệp"}
</span>
```

#### Snippet 7: CJK Double-Width Accounting (Feature 38 / Tier 2)
```javascript
function countGoogleCharacters(str) {
  if (!str) return 0;
  let cnt = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    const isCJK =
      (cp >= 4352 && cp <= 4447) ||
      (cp >= 11904 && cp <= 42191) ||
      (cp >= 44032 && cp <= 55203) ||
      (cp >= 63744 && cp <= 64255) ||
      (cp >= 65072 && cp <= 65103) ||
      (cp >= 65280 && cp <= 65374);
    cnt += isCJK ? 2 : 1;
  }
  return cnt;
}
```

---

## 5. Verification Method

To independently verify the packaging strategy and downstream worker implementation:

### 5.1 Standalone Browser Execution
1. Open `tests/e2e-suite.html` in a web browser:
   ```text
   file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/e2e-suite.html
   ```
2. Verify the target selector has `../demo-app.html` active in the sandbox iframe.
3. Click **"Chạy Toàn Bộ 4 Tier"** (or append `?autorun=true`).
4. **Verification Pass Criteria**:
   - `demo-app.html` exists at `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`.
   - All 246 E2E tests pass (Tier 1: 184 tests, Tier 2: 29 tests, Tier 3: 15 tests, Tier 4: 18 tests).
   - Console error interceptor reports `0 errors`.
   - Feature 30 test passes: Clicking "Phóng to" opens modal with `.zoom-modal-backdrop` and Escape closes it.
   - Feature 27 test passes: Safe zones default to inactive, activating adds `.border-brand` / `.bg-[#fdedef]`.
   - Feature 28 test passes: `.device-phone-status` contains `9:41` and unmounts when `showAppUi` is false.
   - Feature 26 test passes: Language switch alters labels (`Được tài trợ` ↔ `Sponsored`, `Được quảng bá` ↔ `Promoted`, `xem thêm` ↔ `more`).
   - Feature 25 test passes: "Tất cả vị trí" displays comparison grid across all 11 platforms (including Admicro, Zalo, LinkedIn).

### 5.2 Direct Inspection Checks
Inspect `demo-app.html`:
```powershell
# Invalidation Condition 1: Missing file
Test-Path "c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html" -eq $false

# Invalidation Condition 2: Zoom button still triggers setShowAll(true)
grep "onClick={() => setShowAll(true)}" "c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html"

# Invalidation Condition 3: showSafeZone still defaults to true
grep "useState(true)" "c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html"
```
