# Project: Ad Preview Clone (go.noti.vn 1:1 + Extended Platforms)

## Architecture
- **Dual Deliverable Architecture**:
  1. **React / TypeScript Application**: Located in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\`. Modern component-based modular structure with Vite build tool.
  2. **Standalone Single-File Web App**: Located in `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` and synchronized with `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`. Self-contained browser application requiring zero build step or server.
- **Workspace Layout**:
  Two-column responsive container (`lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` with `min-w-0` on both child columns):
  - Left Column: Sticky/scrolling `Nội dung quảng cáo` creative editor, file uploader, brand identity inputs, live validation badges, and collapsible platform overrides.
  - Right Column: Sticky `Khung xem trước` glass card (`--glass-bg: #ffffff8c`, `--glass-blur: 16px`, `--glass-border: #ffffff59`), platform tabs (11 platforms), placement pills (46 placements + "Tất cả vị trí"), device frames (iPhone 15/16 and Desktop Chrome 1920×1080), safe-zone overlays, presentation controls, and specifications drawer.
- **Core Data Flow**:
  `EditorDraft` (Identity, Copy, Form, Assets up to 10 files, Overrides, RenderSettings)
  → `ValidationEngine` (runs 18+ validation rules per placement, computes verbal badges)
  → `AutoScaler` (computes proportional scaling for 393×852 mobile and 1920×945 desktop viewports)
  → `DeviceMockup` & `PreviewSurface` (renders native platform skins, live text truncation `... Xem thêm`, carousel pagination, safe-zone danger/caption overlays, and bilingual VI/EN labels).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Two-Column Workspace Layout | Responsive grid `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` with `min-w-0` isolation | M1 | R1, Survey |
| 2 | Design Tokens & Theme | CSS variables (`--brand: #ed3c47`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`, glass tokens) | M1 | R1, Survey |
| 3 | Minimal Decorative Iconography | Removal of 9 pulsing pencil icons, upload icons, shield badges, button icons; preserve monochrome platform logos & native chrome | M1 | R4, Survey |
| 4 | Dashed Default State | Inputs with default values render with dashed pink border (`border-dashed border-brand/50 bg-brand-050/40`), turning solid on edit | M1 | R1, Survey |
| 5 | Brand & Handle Inputs | Brand name and `@handle` inputs; fallback to brand initial if avatar absent; TikTok emoji validation; Google 25 char limit | M1 | R1, Survey |
| 6 | Destination URL & CTA Selector | URL input + 18 CTA options; buttons adapt text to platform capabilities and active language (VI/EN) | M1 | R1, Survey |
| 7 | Avatar / Logo Uploader | Upload brand logo/avatar; creates blob URL; updates preview across all placements | M1 | R1, Survey |
| 8 | Primary Text & Live Truncation | Main ad copy input; grapheme counting; live truncation (`... Xem thêm` / `... see more`) based on lines/chars | M1 | R1, Survey |
| 9 | Multi-File Carousel Upload (≤10) | File picker/drag-drop up to 10 files; auto-sets composition to 'carousel' when ≥2 files; enforces 10-file cap; per-card metadata | M1 | R1, Survey |
| 10 | Inline Platform Overrides: Google Search | Expandable accordion for RSA: 3–15 headlines (max 30 chars), 2–4 descriptions (max 90 chars), 2 paths (max 15 chars), sitelinks | M1 | R1, Survey |
| 11 | Inline Platform Overrides: GDN / YouTube / ChatGPT | Expandable accordion for Long Headline (GDN, 90), YouTube Headline (15) & CTA (10), ChatGPT Title (50) & Body (100) | M1 | R1, Survey |
| 12 | Facebook 10 Placements | fb-feed, fb-video-feeds, fb-stories, fb-reels, fb-reels-overlay, fb-instream, fb-marketplace, fb-search, fb-right-column, fb-audience-network | M2 | R2, Survey |
| 13 | Instagram 3 Placements | ig-feed, ig-stories, ig-reels with authentic Instagram chrome, gradients, and actions | M2 | R2, Survey |
| 14 | Threads 1 Placement | threads-feed with Threads skin, repost/like actions; validation warning on hashtags & URLs | M2 | R2, Survey |
| 15 | TikTok 2 Placements | tiktok-infeed, tiktok-topview (2 placements; standard carousel is a composition); TikTok audio line, reaction rail, and safe zones | M2 | R2, Survey |
| 16 | YouTube 6 Placements | yt-skippable, yt-nonskip, yt-bumper, yt-desktop, yt-infeed, yt-shorts; companion banner, countdown/skip button, shorts safe zones | M2 | R2, Survey |
| 17 | Google Tìm kiếm 2 Placements | gsearch-mobile, gsearch-desktop text-only SERP ad; sitelinks carousel/grid, paths, rating stars, callouts | M2 | R2, Survey |
| 18 | Google Hiển thị 8 Placements | gdn-300x250, gdn-336x280, gdn-728x90, gdn-300x600, gdn-160x600, gdn-320x100, gdn-320x50, gdn-native | M2 | R2, Survey |
| 19 | ChatGPT 2 Placements | chatgpt-web, chatgpt-mobile; conversational interface, sponsored badge, assistant response layout, SVG brand logo | M2 | R2, Survey |
| 20 | iPhone 15/16 Device Frame | Proportional 393×852 inner screen, 411×870 casing, dynamic island, status bar (9:41, wifi, battery), home indicator bar | M2 | R2, Survey |
| 21 | Desktop Chrome Device Frame | Proportional 1920×1080 casing (viewport 1920×945, chrome header 87px with tabs, omnibox, and navigation) | M2 | R2, Survey |
| 22 | Zalo Ads 4 Canonical Placements | zalo-timeline (Nhật ký), zalo-video (9:16 safe zone), zalo-message (Tin nhắn OA), zalo-article (Báo Mới / Khám phá) | M3 | R2, Survey |
| 23 | LinkedIn Ads 4 Canonical Placements | li-mobile-feed, li-desktop-feed, li-message (Sponsored InMail), li-spotlight (Right Rail Dynamic Ad); SVG brand logo | M3 | R2, Survey |
| 24 | Admicro 4 Canonical Placements | admicro-cafef-pc, admicro-kenh14-mobile, admicro-vnexpress-pc, admicro-dantri-mobile; standard placement pills; SVG brand logo | M3 | R2, Survey |
| 25 | "Tất cả vị trí" Grid for Extended Platforms | Enable 2-column comparison grid for Zalo Ads, LinkedIn Ads, and Admicro (removing hardcoded Admicro disable check) | M3 | R2, Survey |
| 26 | Bilingual UI Toggle (VI / EN) | Instant language switch for all in-mockup labels (`Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`, social actions, CTAs) | M4 | R3, Survey |
| 27 | Safe-Zone Overlays ("Vùng bị che") | Red danger zones + orange dynamic caption expansion zones on 9:16 vertical video placements | M4 | R3, Survey |
| 28 | Native App UI Toggle ("Giao diện app") | Toggle native chrome (status bar, bottom navigation, search bars, reaction rails) | M4 | R3, Survey |
| 29 | TikTok TopView Phase Toggle | 2-stage toggle ("0-3 giây đầu" / "Sau 3 giây") switching full video vs in-feed overlay | M4 | R3, Survey |
| 30 | Dedicated Zoom Modal ("Phóng to") | High-resolution modal with dark backdrop (`#0b0b0f`/90), centered device frame, ESC handler, and close button | M4 | R3, Survey |
| 31 | Fullscreen Workspace ("Toàn màn hình") | Full-viewport workspace view leveraging browser Fullscreen API | M4 | R3, Survey |
| 32 | Live Validation Verbal Badges | "Kiểm tra vị trí này" engine categorizing issues into Error, Warning, Info; verbal tab badges (`1 cảnh báo`, `Không có lỗi`) | M4 | R3, Survey |
| 33 | Official Specifications Card | Collapsible drawer with official placement specifications, aspect ratios, dimension guidelines, and source links | M4 | R3, Survey |
| 34 | Local Standalone HTML Deployment | Deploy synchronized `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` with zero build dependencies | M5 | R4, Survey |
| 35 | Brain Prototype Standalone Sync | Synchronize `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` | M5 | R4, Survey |
| 36 | Zoom Modal Fix in Standalone HTML | Fix "Phóng to" in `demo-app.html` to open high-res modal instead of triggering `setShowAll(true)` | M5 | R4, Survey |
| 37 | E2E Browser Test Suite (Tiers 1–4) | Independent opaque-box test runner covering all 11 platforms, 46 placements, boundaries, and scenarios | M0 | Acceptance, Survey |
| 38 | 100% E2E Pass & Tier 5 Adversarial Hardening | 100% pass of E2E verification test suite + adversarial stress testing (edge cases, CJK double-width, upload bounds) | M6 | Acceptance, Survey |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Infrastructure & Suite | Build independent browser verification test runner and 4-tier test suite (Tiers 1–4) covering all 11 platforms and 46 placements; publishes `TEST_READY.md` | none | DONE (246 tests across Tiers 1–4, TEST_READY.md published) |
| M1 | Core Layout, Tokens & Ad Content Editor | Two-column grid, design tokens, dashed default inputs, multi-file carousel upload (≤10), brand/handle inputs, URL, 18 CTAs, avatar upload, primary text live truncation, collapsible inline overrides, remove decorative icons | none | DONE (Passed Gate Iteration 2: clean tokens, mobile grid isolation, live overrides, clean audit) |
| M2 | Original 8 Platforms & Placements Engine | 34 original placements (FB 10, IG 3, Threads 1, TikTok 2, YT 6, Google Search 2, GDN 8, ChatGPT 2), iPhone 15/16 & Desktop Chrome 1920×1080/945 frames, safe zones, ChatGPT SVG logo | M1 | DONE (Passed Gate Iteration 2: 34 placements, proportional 1920x945 & 393x852 frames, ChatGPT conversational UI, clean audit) |
| M3 | Extended 3 Platforms & Placements Engine | 12 extended placements: Zalo Ads (4), LinkedIn Ads (4), Admicro (4). Canonical profile definitions, LinkedIn/Admicro SVGs, standard placement pills, enable "Tất cả vị trí" grid for all 3 | M2 | DONE (Passed Gate Iteration 1: 46 canonical profiles, 11 groups, standard placement pills for Admicro, "Tất cả vị trí" grid enabled, clean audit) |
| M4 | Interactive Tools, Overlays & Validation | Bilingual toggle (VI/EN), safe-zone overlays, app UI toggle, TopView phases, ZoomModal, fullscreen, live validation verbal badges, official specs card | M3 | DONE (Passed Gate Iteration 2: authentic overlays, TopView alias, safeZone guard, translateCta canonical key lookup, clean audit) |
| M5 | Dual Deliverable Standalone HTML Sync | Deploy and synchronize `demo-app.html` in both `demo-ads/` and brain directory with all 11 platforms, 46 placements, pruned icons, and zoom modal fix | M4 | DONE (Passed Gate Iteration 1: 3,539 lines, 194KB, zero dependencies, all 11 platforms, 46 placements, accessible ZoomModal, bilingual UI, safe zones, app UI toggle, TopView, clean audit) |
| M6 | Final Verification & Adversarial Hardening | Phase 1: 100% pass of E2E test suite (Tiers 1–4); Phase 2: Tier 5 adversarial coverage hardening (Challenger stress testing) | M0, M5 | DONE (Passed Gate Iteration 2: 0 tautologies across all 252 tests, authentic DOM assertions, Tier 5 suites intact, byte-for-byte deliverable parity, clean audit) |

---

## Interface Contracts

### Creative Draft Contract (`EditorDraft`)
```ts
export interface EditorDraft {
  identity: {
    brandName: string;
    handle: string;
    logoUrl?: string;
  };
  copy: {
    primaryText: string;
    headline: string;
    description: string;
    cta: string; // one of 18 canonical CTA keys
    destinationUrl: string;
    googleSearch: {
      headlines: string[]; // 3 to 15 items, max 30 chars each
      descriptions: string[]; // 2 to 4 items, max 90 chars each
      paths: string[]; // 2 items, max 15 chars each
      sitelinks: string[]; // 2 to 8 items, max 25 chars each
      callouts: string[]; // max 25 chars each
    };
    gdn: {
      longHeadline: string; // max 90 chars
    };
    youtube: {
      headline: string; // max 15 chars
      cta: string; // max 10 chars
    };
    chatgpt: {
      title: string; // 3 to 50 chars
      body: string; // max 100 chars
    };
  };
  composition: 'single_image' | 'carousel' | 'video';
  assets: InspectedMedia[]; // max 10 creative files
  cardDetails: Record<string, { title: string; description: string; url: string }>;
  renderSettings: Record<string, { fit: 'cover' | 'contain' | 'blur'; safeZone: boolean }>;
}
```

### Platform Profile Contract (`UiProfile`)
```ts
export interface UiProfile {
  id: string; // e.g. 'facebook.feed', 'zalo.timeline', 'admicro.cafef_pc'
  groupId: string; // 'facebook' | 'instagram' | 'threads' | 'tiktok' | 'youtube' | 'google-search' | 'google-display' | 'chatgpt' | 'zalo' | 'linkedin' | 'admicro'
  title: string;
  deviceKind: 'mobile' | 'desktop';
  aspectRatio: string; // '4:5' | '9:16' | '1:1' | '16:9' | '1.91:1' | etc.
  mediaAllowed: ('image' | 'video')[];
  textLimits: {
    primary?: { rec: number; max?: number; lines: number; truncateAt?: number };
    headline?: { rec: number; max?: number; lines: number };
    description?: { rec: number; max?: number; lines: number };
  };
  safeZones?: {
    dangerTopPct: number;
    dangerBottomPct: number;
    dangerLeftPct: number;
    dangerRightPct: number;
    rail?: { xPct: number; yPct: number; wPct: number; hPct: number };
    caption?: { xPct: number; yPct: number; wPct: number; hPct: number };
  };
}
```

### Bilingual Translation Contract (`LocaleDict`)
```ts
export interface LocaleDict {
  locale: 'vi' | 'en';
  sponsored: Record<string, string>; // platform -> label
  seeMore: Record<string, string>; // platform -> label
  ctas: Record<string, string>; // ctaKey -> label
  ui: Record<string, string>; // common UI tokens
}
```

---

## Code Layout

- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\`
  - `src/`
    - `App.tsx`: Top-level application container, state coordination, and 2-column grid layout
    - `styles.css`: Global styles, CSS variables (`--brand`, `--glass-*`), and mockup casing geometries
    - `catalog/`
      - `profiles.ts`: Canonical definitions for all 46 placements across 11 platforms
      - `admicro.ts`: 4 canonical Admicro placements (CafeF, Kenh14, VnExpress, Dantri)
      - `zalo.ts`: 4 canonical Zalo placements (Timeline, Video, Message, Article)
      - `linkedin.ts`: 4 canonical LinkedIn placements (Mobile Feed, Desktop Feed, Message, Spotlight)
    - `features/`
      - `EditorPanel.tsx`: `Nội dung quảng cáo` creative editor, multi-file uploader, and inline overrides
      - `PreviewSurface.tsx`: Sticky `Khung xem trước` glass card container and toolbar
      - `DeviceMockup.tsx`: iPhone 15/16 and Desktop Chrome 1920×1080 device casings
      - `deviceMockupModel.ts`: Geometric definitions for 393×852 mobile and 1920×945 desktop
      - `SocialPreview.tsx`: Meta, TikTok, Threads, LinkedIn, Zalo feed renderers
      - `ContextPreview.tsx`: Google Search SERP, GDN banner slots, YouTube players, ChatGPT chat
      - `OcclusionOverlay.tsx`: 9:16 vertical video danger & caption safe-zone overlays
      - `PlatformLogo.tsx`: 18×18 monochrome SVGs for all 11 platforms
      - `ZoomModal.tsx`: Dedicated high-resolution zoom modal
      - `catalogBridge.ts` & `translations.ts`: Bilingual translation engine (VI/EN)
    - `validation/`
      - `engine.ts` & `counting.ts`: Live character counter and rule checker
    - `media/`
      - `inspect.ts`: File sniffing, aspect ratio calculation, and asset store
  - `demo-app.html`: Standalone single-file HTML build
  - `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`: Synchronized standalone HTML build
  - `scripts/`: Verification scripts and packaging utilities
