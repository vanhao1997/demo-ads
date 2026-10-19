# Handoff Report: Complete Specification Survey for Ad Preview Web Application

**Author**: spec_miner_survey_1  
**Timestamp**: 2026-10-17T01:47:30Z  
**Target File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\spec_miner_survey_1\handoff.md`  

---

## 1. Observation

Authoritative data was extracted and cross-verified across the following sources:
1. `C:\Users\PC\.gemini\antigravity\brain\f696ce27-5926-4d7a-8538-f2973317f140\.system_generated\steps\26\output.txt`
   - Complete unminified/extracted webpack module `20929` (`AdPreviewTool`): platforms array `Z`, placements array `O` (34 items), CTA dictionary `z`, sponsored label map `I`, see more truncation map `M`, safe zone constants `S`, `$`, `P`, `_`, device specs `y` (iPhone 15/16) and `k` (Desktop Chrome), character count functions `h`, `m`, `p`, text truncation `u`, aspect ratio matching `j`, live media analysis `nB`/`nH`, validation rules, and default state `er`.
2. `C:\Users\PC\.gemini\antigravity\brain\34b54d25-8f2b-4148-b882-63fbbaaaebfb\.system_generated\steps\203\output.txt`
   - Live CSS variables (`:root` tokens: `--bg: #fff`, `--bg-subtle: #f6f6f7`, `--surface: #fff`, `--text: #101113`, `--text-muted: #5f6470`, `--border: #e7e7ea`, `--brand: #ed3c47`, `--brand-600: #d62e3a`, `--brand-050: #fdedef`, `--accent: #ff7849`, `--gradient-brand: linear-gradient(135deg,#ed3c47,#ff7849)`, `--success: #16a34a`, `--success-bg: #e7f6ec`, `--danger: #e8590c`, `--danger-bg: #fbeee5`, `--glass-bg: #ffffff8c`, `--glass-border: #ffffff59`, `--glass-blur: 16px`, `--glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80`, `--radius-sm: 8px`, `--radius-md: 14px`, `--radius-lg: 20px`).
   - Live DOM hierarchy for both 2-column workspace and modal zoom dialog.
3. `C:\Users\PC\.gemini\antigravity\brain\34b54d25-8f2b-4148-b882-63fbbaaaebfb\.system_generated\steps\209\output.txt`
   - Complete SVG icons (Facebook, Instagram, Threads, TikTok, YouTube, Google Search, Google Display, ChatGPT), input control states (`border-dashed border-brand/50 bg-brand-050/40`), and platform tab switches.
4. `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
   - Existing prototype definitions extending the 8 original platforms with Zalo Ads (4 placements), LinkedIn Ads (4 placements), and Admicro (4 placements).

---

## 2. Logic Chain

1. **Platform & Placement Coverage**:
   - `steps/26/output.txt` establishes exactly 8 native platforms with 34 placements.
   - Requirements `R2` in `ORIGINAL_REQUEST.md` mandate expanding these with 3 platforms: Zalo Ads (4 placements), LinkedIn Ads (4 placements), and Admicro (4 placements), giving exactly 46 placements across 11 platforms.
2. **Device Frame Fidelity**:
   - Mobile placements must use `iPhone 15 / 16 (6,1 inch)`: 393 × 852 pt inner screen, radius 55px, Dynamic Island (126 × 37 px at top 11px), Home Bar (134 × 5 px at bottom 8px), status bar height 54px with 9:41 time and signal/wifi/battery indicators, nested in a 411 × 870 px casing with 9px padding and 64px radius.
   - Desktop placements must use `Máy tính 1920 x 1080 (Chrome)`: 1920 px width, 87 px chrome header (tab bar 41px with close/plus/window controls + navigation bar 46px with back/forward/reload/URL bar), and 945 px viewport height (total height 1032px).
3. **Safe-Zone Overlays**:
   - 9:16 vertical video placements require bounding box overlays (`danger` in red `rgba(237,60,71,0.30)` + border `rgba(237,60,71,0.95)`; dynamic `caption` expansion in orange `rgba(255,159,28,0.22)` + border `rgba(255,159,28,0.95)`).
4. **Bilingual UI Translations**:
   - In-mockup labels and controls switch between Vietnamese (`vi`) and English (`en`) via the `Tiếng Việt` / `English` toggle.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Editor | Brand & Handle Input | Dual text input for brand name and account handle (`@handle`). Fallback to brand first letter if no logo. | String | Updates header across all mockups | Error if TikTok handle contains emoji; error if Google brand > 25 chars | `steps/26/output.txt` |
| 2 | Editor | Dashed Default State | Default values render in dashed border (`border-dashed border-brand/50 bg-brand-050/40`) with pulsing pencil icon. | Focus / Input | Switches to solid border (`border-border bg-surface`) on edit | None | `steps/209/output.txt` |
| 3 | Editor | Multi-file Carousel Media Upload | Drag-and-drop or file picker accepting up to 10 image/video files (JPG, PNG, WebP, GIF, AVIF, MP4, MOV, WebM). | File / FileList | Previews media list with aspect ratio, resolution, size chips, reorder and delete buttons | Error if > 10 files; warning if wrong aspect ratio; error if video < minSec or > maxSec | `steps/26/output.txt` |
| 4 | Editor | Logo Upload | Upload avatar/logo for brand. Supports image formats, creates blob URL. | File | Updates avatar circle across all mockups | Error alert if browser cannot open image | `steps/26/output.txt` |
| 5 | Editor | CTA Action Selector | Dropdown selector with 18 CTA options. In-mockup button text adapts to platform capability and selected language. | Option key | Updates CTA button label | Warning badge if CTA not supported by active platform | `steps/26/output.txt` |
| 6 | Editor | Primary Text & Live Truncation | Main ad caption input. Calculates grapheme count and displays live truncation (`... Xem thêm` / `... more`) based on lines/chars. | String | Formatted text in mockups | Warning if over recommended; error if over hard limit; warning if links/hashtags on Threads/TikTok | `steps/26/output.txt` |
| 7 | Editor | Collapsible Platform Overrides: Google Search | Expandable accordion for Google Search Responsive Ads: 3-15 headlines (max 30 chars), 2-4 descriptions (max 90 chars), paths (2 x 15 chars), sitelinks (min 2, max 25 chars), callouts (max 25 chars). | Array of strings | Updates Search SERP cards (Mobile & Desktop) | Real-time red badge & message if < 3 headlines or > 30 chars; < 2 descriptions or > 90 chars | `steps/26/output.txt` |
| 8 | Editor | Collapsible Platform Overrides: GDN, YouTube, ChatGPT | Expandable accordion for Long Headline (GDN, max 90 chars), YouTube Headline (max 15 chars), YouTube CTA (max 10 chars), ChatGPT Title (3-50 chars), ChatGPT Body (max 100 chars). Fallback to general headline/description if empty. | Strings | Overrides individual placement text | Warns if general text exceeds specific limits | `steps/26/output.txt` |
| 9 | Toolbar | Platform Switcher | Horizontal tab bar switching active platform across all 11 platforms. Displays error dots on platforms with validation issues. | Platform ID | Sets active platform & resets to first placement | None | `steps/26/output.txt` |
| 10 | Toolbar | Placement Switcher & "Tất cả vị trí" | Sub-tabs switching specific placements (with device icon: mobile vs desktop) plus "Tất cả vị trí" grid view. | Placement ID or All | Renders single placement or multi-frame 2-column grid | None | `steps/26/output.txt` |
| 11 | Toolbar | Language Toggle (VI / EN) | Switches platform UI mockup labels (e.g., `Được tài trợ` ↔ `Sponsored`, `Xem thêm` ↔ `See more`). | 'vi' \| 'en' | Instant localized text re-render | None | `steps/26/output.txt` |
| 12 | Toolbar | Safe-Zone Overlay Toggle ("Vùng bị che") | Toggle visibility of red danger zones & orange dynamic expansion zones on 9:16 vertical video placements. | Boolean | Renders dashed overlay rectangles with descriptive labels | None | `steps/26/output.txt` |
| 13 | Toolbar | App UI Toggle ("Giao diện app") | Toggle native social app chrome (status bar, bottom tab bar, reaction columns, comments, search bars). | Boolean | Shows/hides app chrome | None | `steps/26/output.txt` |
| 14 | Toolbar | TopView Phase Toggle | Phase toggle for TikTok TopView: "0-3 giây đầu" (full-screen video without UI) vs "Sau 3 giây" (In-Feed UI with CTA). | 'first' \| 'after' | Switches mockup interface state | None | `steps/26/output.txt` |
| 15 | Toolbar | Zoom Modal ("Phóng to") | High-resolution modal with black backdrop (`#0b0b0f`/90) and escape key handler to view device mockup at maximum scale. | Click / Esc | Fullscreen modal overlay | Traps focus and closes on Esc | `steps/26/output.txt` |
| 16 | Toolbar | Fullscreen Workspace ("Toàn màn hình") | Enters browser fullscreen API, switches to single/two-pane adaptive fullscreen workspace. | Click / Esc | Fullscreen workspace layout | Exits on Esc | `steps/26/output.txt` |
| 17 | Validation | Live Issue Checker ("Kiểm tra vị trí này") | Live validation engine categorizing issues into Error (red badge), Warning (orange badge), and Info/Note (gray). | Creative state + placement spec | Renders badge counts and detailed issue list | Real-time update | `steps/26/output.txt` |
| 18 | Spec Card | Official Specifications & Sources | Collapsible card displaying recommended aspect ratios, dimension minimums, platform notes, and links to official documentation. | Placement metadata | Renders official spec list & source links | None | `steps/26/output.txt` |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Character Counter | Asian/CJK fullwidth characters in Google Search/GDN | Counted as 2 characters per character using codepoint ranges (4352-4447, 11904-42191, etc.), correctly triggering earlier limits. |
| 2 | Text Truncation | Long string without spaces | Truncates at exact character limit if no space found within 20 chars backward from cutoff point; appends `... Xem thêm`. |
| 3 | Media Aspect Ratio | Image wider/taller than target frame | When `fit: 'cover'`, crops excess and computes `croppedPct`; when `fit: 'clamp'`, clamps between `minRatio` and `maxRatio`; when `fit: 'blur'`, renders blurred duplicated background. |
| 4 | Carousel Media | 1 image uploaded on carousel-supported feed | Renders as standard single media box; when 2–10 files uploaded, converts to horizontal scrollable carousel with card index badge (`1/N`). |
| 5 | Carousel Media | > 10 files uploaded | Limits files to first 10, rejects excess files with error alert: `"Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ)."`. |
| 6 | Video Duration | Video duration < minSec or > maxSec | Triggers red validation error: e.g. `"video 3 giây - ngắn hơn mức tối thiểu 5 giây."` for YouTube skippable. |
| 7 | Threads Text | Hashtag `#tag` or link `https://...` in primary text | Triggers warning: `"Threads không cho hashtag hay đường link trong văn bản chính."`. |
| 8 | TikTok Display Name | Emoji in brand name | Triggers validation error: `"Tên hiển thị TikTok không được có emoji."`. |
| 9 | TikTok Primary Text | Hashtag or `@` in non-Spark ad | Triggers warning: `"Chú thích quảng cáo TikTok (không phải Spark Ads) không bấm được @ hay hashtag."`. |
| 10 | CTA Platform Mismatch | Selecting CTA not supported by active platform (e.g. `call_now` on Threads) | Triggers warning badge: `"Nút 'Gọi ngay' không có trên Threads - mockup tạm dùng 'Tìm hiểu thêm'."`. |
| 11 | Fallback Values | User leaves form fields blank | Inputs display subtle default placeholders; mockups render default content (`noit.vn`, `@noti.vn`, `https://go.noti.vn/`, etc.) with dashed borders in form. |

---

## 5. Detailed Platform & Placement Specifications (46 Placements across 11 Platforms)

### 1. Facebook (10 Placements)
*Common Platform Notes*: Awareness objective removes footer (headline, desc, CTA); Messenger Inbox & Stories removed by Meta in 2025/2026.
1. **`fb-feed` (Bảng feed)**
   - Device: Mobile (`iPhone 15 / 16`)
   - Renderer: `metaFeed` (skin: `facebook`)
   - Media: Image / Video, Ratio 4:5 (1440×1800), Clamp [0.8, 1.91], Carousel 2–10 cards (1:1), Video 1–14460s.
   - Text Limits: Primary rec 150 (shown ~125 chars, 3 lines before truncation), Headline rec 27 (shown ~40 chars, 1 line), Desc rec 30.
   - Safe Zones: None.
2. **`fb-video-feeds` (Video Feeds)**
   - Device: Mobile
   - Renderer: `metaFeed` (skin: `facebook`)
   - Media: Video only, 4:5 (1440×1800), Video 1–14460s.
   - Text Limits: Primary rec 150 (shown ~125 chars, 3 lines), Headline rec 27 (shown ~40 chars, 1 line).
   - Safe Zones: None.
3. **`fb-stories` (Stories)**
   - Device: Mobile
   - Renderer: `vertical` (skin: `fbStories`)
   - Media: Image / Video, 9:16 (1440×2560), Fit: Blur [9/16, 1.91], Video 1–180s (split > 15s), Carousel 2–10.
   - Text Limits: Primary rec 125 (shown ~90 chars, 2 lines), Headline rec 40.
   - Safe Zones (`$`): Top 14% (progress bar, page name, sponsored label), Bottom 35% (caption, CTA, reply input), Left 6%, Right 6%.
4. **`fb-reels` (Reels)**
   - Device: Mobile
   - Renderer: `vertical` (skin: `fbReels`)
   - Media: Image / Video, 9:16 (1080×1920+), Fit: Blur [9/16, 1.91], Video min 1s.
   - Text Limits: Primary rec 72 (shown ~72 chars, 2 lines), Headline rec 40.
   - Safe Zones (`S`): Top 14% (page name, sponsored label, menu), Bottom 35% (caption, audio line, CTA), Left 6%, Right 6%, Rail (right 16%, height 23% at y: 42%).
5. **`fb-reels-overlay` (Banner trên Reels)**
   - Device: Mobile
   - Renderer: `fbReelsOverlay`
   - Media: Image only, 1:1 (fit cover).
   - Text Limits: Headline shown ~30 chars (1 line).
   - Safe Zones: None.
6. **`fb-instream` (Video trong luồng)**
   - Device: Mobile
   - Renderer: `fbInstream`
   - Media: Video only, 16:9 (fit contain) [1, 16/9], recommended 16:9 or 1:1, Video 5–600s (skippable after 5s).
   - Text Limits: Primary rec 125, Headline rec 40 (shown 40 chars, 1 line).
   - Safe Zones: None.
7. **`fb-marketplace` (Marketplace)**
   - Device: Mobile
   - Renderer: `fbMarketplace`
   - Media: Image / Video, 1:1 (1080×1080) [1, 1.91].
   - Text Limits: Primary rec 125, Headline rec 40 (shown 40 chars, 2 lines), Desc rec 30.
   - Safe Zones: None.
8. **`fb-search` (Kết quả tìm kiếm)**
   - Device: Mobile
   - Renderer: `fbSearch`
   - Media: Image / Video, 1.91:1 to 1:1 (1200×628).
   - Text Limits: Primary rec 125 (shown ~100 chars, 2 lines), Headline rec 40, Desc rec 30.
   - Safe Zones: None.
9. **`fb-right-column` (Cột bên phải)**
   - Device: Desktop (`Máy tính 1920 x 1080 Chrome`)
   - Renderer: `fbRightColumn`
   - Media: Image only, 1:1 (1080×1080, minWidth 254).
   - Text Limits: Headline rec 40 (shown 40 chars, 2 lines), Primary: none (not displayed).
   - Safe Zones: None.
10. **`fb-audience-network` (Audience Network)**
    - Device: Mobile
    - Renderer: `audienceNative`
    - Media: Image / Video, 1.91:1 (fit cover) [9/16, 1.91], recommended 9:16 or 1.91:1.
    - Text Limits: Primary rec 125 (shown ~90 chars, 2 lines), Headline rec 40, Desc rec 30.
    - Safe Zones: None.

---

### 2. Instagram (3 Placements)
*Common Platform Notes*: Explore grid removed July 2026.
11. **`ig-feed` (Bảng feed)**
    - Device: Mobile
    - Renderer: `metaFeed` (skin: `instagram`)
    - Media: Image / Video, 4:5 (1440×1800), Clamp [0.8, 1.91], Carousel 2–10 cards (1:1), Video 1–3600s.
    - Text Limits: Primary rec 125 (shown ~90 chars, 2 lines), Headline rec 40.
    - Safe Zones: None.
12. **`ig-stories` (Stories)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `igStories`)
    - Media: Image / Video, 9:16 (1440×2560), Fit: Blur [9/16, 1.91], Video 1–3600s, Carousel 2–10.
    - Text Limits: Primary rec 125 (shown ~90 chars, 2 lines).
    - Safe Zones (`$`): Top 14%, Bottom 35%, Left 6%, Right 6%.
13. **`ig-reels` (Reels)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `igReels`)
    - Media: Image / Video, 9:16 (1440×2560), Fit: Blur [9/16, 1.91], Video 0–900s.
    - Text Limits: Primary rec 44 (shown ~72 chars, 2 lines).
    - Safe Zones (`S`): Top 14%, Bottom 35%, Left 6%, Right 6%, Rail (right 16%, height 23% at y: 42%).

---

### 3. Threads (1 Placement)
14. **`threads-feed` (Bảng feed)**
    - Device: Mobile
    - Renderer: `metaFeed` (skin: `threads`)
    - Media: Image / Video, 4:5 (1080×1350), Clamp [0.8, 1.91], Carousel 2–10 cards.
    - Text Limits: Primary rec 160 (shown ~250 chars, 6 lines), Headline rec 40. No hashtags or URLs allowed.
    - Safe Zones: None.

---

### 4. TikTok (2 Placements)
*Common Platform Notes*: CTA button background is dynamically chosen by TikTok based on video dominant colors; appears after several seconds.
15. **`tiktok-infeed` (In-Feed)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `tiktok`)
    - Media: Image / Video, 9:16 (min 540×960), Fit: Contain [9/16, 16/9], Video 1–600s (rec <= 15s), Carousel 2–35 cards (9:16).
    - Text Limits: Primary max 100 (shown 4 lines), Brand max 20 (no emoji).
    - Safe Zones (`P`): Top 12.5% (160px/1280), Bottom 34.375% (440px/1280), Left 11.11%, Right 11.11%, Rail (x: 72.2%, y: 43.75%, w: 16.67%, h: 21.875%), Caption expansion zone (x: 11.11%, y: 55%, w: 61.11%, h: 10.63%).
16. **`tiktok-topview` (TopView)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `tiktokTopView`)
    - Media: Video only, 9:16 (fit cover), Video 5–60s (rec <= 15s), Audio required.
    - Text Limits: Primary max 100 (shown 4 lines), Brand max 20 (no emoji).
    - Safe Zones (`P`): Identical to `tiktok-infeed`.
    - Interactive Control: 2-stage toggle ("0-3 giây đầu" / "Sau 3 giây").

---

### 5. YouTube (6 Placements)
17. **`yt-skippable` (Trong luồng bỏ qua được)**
    - Device: Mobile
    - Renderer: `ytInstream` (skin: `ytSkippable`)
    - Media: Video only, 16:9 (1920×1080), Fit: Contain [9/16, 16/9], Skippable after 5s.
    - Text Limits: ytHeadline max 15, ytCta max 10.
    - Safe Zones: None.
18. **`yt-nonskip` (Trong luồng không bỏ qua)**
    - Device: Mobile
    - Renderer: `ytInstream` (skin: `ytNonSkip`)
    - Media: Video only, 16:9 (1920×1080), Video 7–15s non-skippable.
    - Text Limits: ytHeadline max 15, ytCta max 10.
    - Safe Zones: None.
19. **`yt-bumper` (Bumper 6 giây)**
    - Device: Mobile
    - Renderer: `ytInstream` (skin: `ytBumper`)
    - Media: Video only, 16:9 (1920×1080), max 6s non-skippable.
    - Text Limits: ytHeadline max 15, ytCta max 10.
    - Safe Zones: None.
20. **`yt-desktop` (Trong luồng máy tính)**
    - Device: Desktop
    - Renderer: `ytInstream` (skin: `ytSkippable`)
    - Media: Video only, 16:9 (1920×1080), companion banner 300×60 (5:1 ratio).
    - Text Limits: ytHeadline max 15, ytCta max 10.
    - Safe Zones: None.
21. **`yt-infeed` (Trong nguồn cấp)**
    - Device: Mobile
    - Renderer: `ytInfeed`
    - Media: Image / Video, Thumbnail 16:9 (1280×720).
    - Text Limits: Headline max 100 (truncated ~25 chars on small screens), Desc max 70 (2 lines, 35 chars each).
    - Safe Zones: None.
22. **`yt-shorts` (Shorts)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `ytShorts`)
    - Media: Video only, 9:16 (fit blur) [9/16, 16/9], Video max 180s (rec <= 60s).
    - Text Limits: Headline rec 40 (shown 1 line), Desc max 90 (shown 1 line).
    - Safe Zones (`_`): Top 15% (288/1920), Bottom 35% (672/1920), Left 4.44% (48/1080), Right 17.78% (192/1080).

---

### 6. Google Tìm kiếm (2 Placements)
23. **`gsearch-mobile` (Di động)**
    - Device: Mobile
    - Renderer: `googleSearch`
    - Media: None (Text-only SERP ad).
    - Text Limits: Headlines 3–15 (max 30 chars each, renders 2 headlines separated by " | "), Descriptions 2–4 (max 90 chars each, renders 1 description), Paths 2 (max 15 chars each), Sitelinks min 2, max 25 chars each (renders horizontal pill carousel up to 8 items), Callouts max 25 chars each, Brand max 25 chars.
    - Safe Zones: None.
24. **`gsearch-desktop` (Máy tính)**
    - Device: Desktop
    - Renderer: `googleSearch`
    - Media: None (Text-only SERP ad).
    - Text Limits: Renders 3 headlines joined by " | ", 2 descriptions, 2-column grid of sitelinks (up to 4–6 items).
    - Safe Zones: None.

---

### 7. Google Hiển thị (8 Placements)
25. **`gdn-300x250` (Hình chữ nhật 300×250)**: Mobile, Slot [300, 250], Media 1.91:1 & 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
26. **`gdn-336x280` (Hình chữ nhật lớn 336×280)**: Mobile, Slot [336, 280], Media 1.91:1 & 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
27. **`gdn-728x90` (Leaderboard 728×90)**: Desktop, Slot [728, 90], Media 1.91:1 & 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
28. **`gdn-300x600` (Nửa trang 300×600)**: Desktop, Slot [300, 600], Media 1.91:1 & 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
29. **`gdn-160x600` (Skyscraper 160×600)**: Desktop, Slot [160, 600], Media 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
30. **`gdn-320x100` (Biểu ngữ di động 320×100)**: Mobile, Slot [320, 100], Media 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
31. **`gdn-320x50` (Biểu ngữ di động 320×50)**: Mobile, Slot [320, 50], Media 1:1, Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.
32. **`gdn-native` (Native trong bài viết)**: Mobile, Slot null (in-article flow), Media 1.91:1 (fit cover), Headline max 30, LongHeadline max 90, Desc max 90, Brand max 25.

---

### 8. ChatGPT (2 Placements)
*Common Platform Notes*: Ad appears under assistant response, separated from message body with sponsored badge; shown only to Free and Go users.
33. **`chatgpt-web` (Web)**
    - Device: Desktop
    - Renderer: `chatgpt`
    - Media: Image only, 1:1 (min 640×640).
    - Text Limits: chatTitle min 3, max 50 (shown ~24 chars), chatBody max 100 (shown ~48 chars), Brand, Destination URL.
    - Safe Zones: None.
34. **`chatgpt-mobile` (Ứng dụng di động)**
    - Device: Mobile
    - Renderer: `chatgpt`
    - Media: Image only, 1:1 (min 640×640).
    - Text Limits: chatTitle min 3, max 50 (shown ~24 chars), chatBody max 100 (shown ~48 chars), Brand, Destination URL.
    - Safe Zones: None.

---

### 9. Zalo Ads (4 Extended Placements)
35. **`zalo-timeline` (Nhật ký Zalo)**
    - Device: Mobile
    - Renderer: `zaloNative`
    - Media: Image / Video, 1.91:1 (1024×533), minWidth 600.
    - Text Limits: Primary max 150 (shown ~120 chars), Headline max 60 (shown ~48 chars), Desc max 40.
    - UI Chrome: Zalo OA verified badge (golden check), blue action button `#0068ff`.
36. **`zalo-video` (Zalo Video)**
    - Device: Mobile
    - Renderer: `vertical` (skin: `zaloVideo`)
    - Media: Video only, 9:16 (1080×1920), 5–60s.
    - Text Limits: Primary max 120 (shown ~85 chars), Headline max 60.
    - Safe Zones: Top 14%, Bottom 30%, Left 6%, Right 18% (interaction buttons: like, comment, share, OA avatar).
37. **`zalo-message` (Tin nhắn OA / Broadcast / ZNS)**
    - Device: Mobile
    - Renderer: `zaloMessage`
    - Media: Image 1.91:1 (1024×533) header banner card.
    - Text Limits: Primary max 160 (shown ~140 chars), Headline max 60 (shown ~50 chars), Desc max 40.
    - UI Chrome: Zalo chat conversation card with action button.
38. **`zalo-article` (Báo mới / Khám phá)**
    - Device: Mobile
    - Renderer: `zaloArticle`
    - Media: Image 1.91:1 (1024×533) or 16:9.
    - Text Limits: Primary max 150 (shown ~110 chars), Headline max 60, Desc max 40.
    - UI Chrome: Native newsfeed card in Baomoi ecosystem with "Tài trợ" badge.

---

### 10. LinkedIn Ads (4 Extended Placements)
39. **`li-mobile-feed` (Bảng tin Di động)**
    - Device: Mobile
    - Renderer: `liFeed`
    - Media: Image / Video, 1.91:1 (1200×627) or 1:1, Carousel 2–10.
    - Text Limits: Primary max 150 (shown ~135 chars, 3 lines), Headline max 70 (shown ~60 chars), Desc max 40.
    - UI Chrome: LinkedIn header, `Được quảng bá (Promoted)` label, blue outline CTA button `#0a66c2`.
40. **`li-desktop-feed` (Bảng tin Máy tính)**
    - Device: Desktop
    - Renderer: `liDesktopFeed`
    - Media: Image / Video, 1.91:1 (1200×627) or 1:1.
    - Text Limits: Primary max 150 (shown ~140 chars), Headline max 70, Desc max 40.
    - UI Chrome: LinkedIn 3-column desktop layout (Left: profile card, Middle: feed card, Right: LinkedIn News & Ad banner).
41. **`li-message` (Tin nhắn tài trợ / Sponsored Messaging)**
    - Device: Mobile
    - Renderer: `liMessage`
    - Media: Image 1:1 (300×250) card or sender avatar.
    - Text Limits: Primary max 200 (shown ~180 chars), Headline max 60 (shown ~55 chars), Desc max 40.
    - UI Chrome: LinkedIn messaging thread with sponsored banner and CTA.
42. **`li-spotlight` (Cột phải Spotlight / Dynamic Ad)**
    - Device: Desktop
    - Renderer: `liSpotlight`
    - Media: Image 1:1 (300×250 or 100×100 company logo).
    - Text Limits: Primary max 150 (shown ~90 chars), Headline max 70, Desc max 40.
    - UI Chrome: LinkedIn Desktop right sidebar widget with dual avatar (viewer + brand).

---

### 11. Admicro (4 Extended Placements)
43. **`admicro-cafef-pc` (CafeF PC)**
    - Device: Desktop
    - Renderer: `admicroPublisher`
    - Media: Billboard 980×250 / Half-Page 300×600.
    - Text Limits: Primary max 160, Headline max 65, Desc max 45.
    - UI Chrome: CafeF.vn financial site chrome, top banner + sidebar ad placement.
44. **`admicro-kenh14-mobile` (Kenh14 Mobile)**
    - Device: Mobile
    - Renderer: `admicroMobile`
    - Media: Native In-Feed 1.91:1 (1200×628) or 16:9.
    - Text Limits: Primary max 160, Headline max 65, Desc max 45.
    - UI Chrome: Kenh14.vn mobile youth news header & feed card with "Tài trợ" badge.
45. **`admicro-vnexpress-pc` (VnExpress Masthead PC)**
    - Device: Desktop
    - Renderer: `admicroPublisher`
    - Media: Masthead 980×180 top banner + native PR box.
    - Text Limits: Primary max 160, Headline max 65, Desc max 45.
    - UI Chrome: VnExpress.net desktop layout, masthead position and news feed block.
46. **`admicro-dantri-mobile` (Dân trí In-Page Mobile)**
    - Device: Mobile
    - Renderer: `admicroMobile`
    - Media: In-Article 4:5 (600×750) or 1:1.
    - Text Limits: Primary max 160, Headline max 65, Desc max 45.
    - UI Chrome: Dantri.com.vn mobile reading view with in-page banner.

---

## 6. Complete UI Translation Strings (VI / EN)

### 1. CTA Options (`z`)
| Key | Vietnamese (`vi`) | English (`en`) |
|-----|-------------------|----------------|
| `learn_more` | Tìm hiểu thêm | Learn more |
| `shop_now` | Mua ngay | Shop now |
| `sign_up` | Đăng ký | Sign up |
| `book_now` | Đặt ngay | Book now |
| `contact_us` | Liên hệ với chúng tôi | Contact us |
| `download` | Tải xuống | Download |
| `get_offer` | Nhận ưu đãi | Get offer |
| `order_now` | Đặt hàng ngay | Order now |
| `send_message` | Gửi tin nhắn | Send message |
| `subscribe` | Đăng ký theo dõi | Subscribe |
| `watch_more` | Xem thêm | Watch more |
| `watch_now` | Xem ngay | Watch now |
| `apply_now` | Ứng tuyển ngay | Apply now |
| `get_quote` | Nhận báo giá | Get quote |
| `call_now` | Gọi ngay | Call now |
| `install_now` | Cài đặt ngay | Install now |
| `visit_site` | Truy cập trang web | Visit site |
| `none` | Không có nút | No button |

### 2. Sponsored Labels (`I`)
| Platform | Vietnamese (`vi`) | English (`en`) |
|----------|-------------------|----------------|
| Facebook | Được tài trợ | Sponsored |
| Instagram | Được tài trợ | Sponsored |
| Threads | Được tài trợ | Sponsored |
| TikTok | Được tài trợ | Sponsored |
| YouTube | Được tài trợ | Sponsored |
| Google Search | Kết quả được tài trợ | Sponsored results |
| Google Display | Quảng cáo | Ad |
| ChatGPT | Được tài trợ | Sponsored |
| Zalo Ads | Được tài trợ | Sponsored |
| LinkedIn Ads | Được quảng bá | Promoted |
| Admicro | Quảng cáo | Ad |

### 3. Read More Truncation (`M`)
| Platform | Vietnamese (`vi`) | English (`en`) |
|----------|-------------------|----------------|
| Facebook | Xem thêm | See more |
| Instagram | xem thêm | more |
| Threads | Xem thêm | More |
| TikTok | Xem thêm | See more |
| Zalo / LinkedIn | Xem thêm | See more |

### 4. Platform UI Labels (`eP`, `tP`, `sl`, `sK`, `nm`)
| UI Element | Vietnamese (`vi`) | English (`en`) |
|------------|-------------------|----------------|
| Mockup Aria Label | Mô phỏng quảng cáo | Ad mockup / Ad preview |
| Page Name Placeholder | Tên trang / Tên thương hiệu | Page name / Brand name |
| Headline Placeholder | Tiêu đề quảng cáo | Ad headline |
| Primary Text Placeholder | Văn bản chính của quảng cáo sẽ hiện ở đây. | Your primary text appears here. |
| Media Placeholder | Ảnh / video | Image / video |
| Social: Like | Thích | Like |
| Social: Comment | Bình luận | Comment |
| Social: Share | Chia sẻ | Share |
| Social: Dislike | Không thích | Dislike |
| Social: Follow | Theo dõi | Follow |
| Social: Subscribe | Đăng ký | Subscribe |
| Video Status: Resume | Video sẽ tiếp tục sau quảng cáo | Video will resume after the ad |
| YouTube Skip Button | Bỏ qua | Skip |
| YouTube Ad Progress | 1/2 | 1 of 2 |
| TikTok Feeds | Dành cho bạn / Đang theo dõi | For You / Following |
| TikTok Audio | Âm thanh gốc | Original sound |
| TopView Toggle: Group | Giai đoạn hiển thị TopView | TopView display phase |
| TopView Toggle: 0–3s | 0-3 giây đầu | First 3s |
| TopView Toggle: After 3s | Sau 3 giây | After 3s |
| Google Search Sitelinks Hint | Đường dẫn liên kết trang con | Sitelinks |
| Google Search Hide Results | Ẩn kết quả được tài trợ | Hide sponsored results |
| Google Display Slot Label | Ô quảng cáo {w} x {h} px | Ad slot {w} x {h} px |
| Google Display Native Label | Native trong bài viết | Native in article |
| ChatGPT Composer | Hỏi bất kỳ điều gì | Ask anything |
| ChatGPT New Chat | Đoạn chat mới | New chat |
| ChatGPT Search Chats | Tìm kiếm đoạn chat | Search chats |
| Toolbar: Safe Zones | Vùng bị che | Safe zones |
| Toolbar: App UI | Giao diện app | App UI |
| Toolbar: Zoom | Phóng to | Zoom |
| Toolbar: Fullscreen | Toàn màn hình | Fullscreen |
| Toolbar: Exit Fullscreen | Thoát (Esc) | Exit (Esc) |
| Toolbar: All Placements | Tất cả vị trí | All placements |
| Validator: Errors | {count} lỗi | {count} errors |
| Validator: Warnings | {count} cảnh báo | {count} warnings |
| Validator: No Issues | Không có lỗi | No errors |

---

## 7. Device Frame Dimensions & Geometries

### A. Mobile: iPhone 15 / 16 (6,1 inch)
- Inner Screen: `393 × 852` px, border radius `55px`.
- Outer Casing: `411 × 870` px (`width + 18`, `height + 18`), padding `9px`, outer radius `64px` (`55 + 9`), background `#1c1c1e`, shadow `0 24px 60px -24px rgba(0,0,0,0.55)`.
- Status Bar: Height `54px`, time `9:41` (font size `17px`, weight `600`, tracking `-0.02em`, left padding `48px`, top padding `6px`), system icons (cellular 4 bars, wifi 3 curves, battery 27×13 outline + 20×9 fill + terminal nipple) with `30px` right padding.
- Dynamic Island: `126 × 37` px, top `11px`, horizontally centered, radius `9999px`, background `#000000`.
- Home Indicator Bar: `134 × 5` px, bottom `8px`, horizontally centered, radius `9999px`, tone-adaptive (`#ffffff` on dark, `#000000` on light).
- Safe Margins: `safeTop: 59px`, `safeBottom: 34px`.

### B. Desktop: Máy tính 1920 × 1080 (Chrome)
- Outer Window: `1920 × 1032` px (`viewportHeight: 945px` + `chromeHeight: 87px`), border `#c9ccd1`, shadow `0 24px 60px -28px rgba(0,0,0,0.45)`.
- Chrome Tab Bar: Height `41px`, background `#dee1e6`, left pad `8px`. Active tab width `256px`, height `34px`, radius `10px 10px 0 0`, background `#ffffff`, favicon 16×16, page title truncated, close icon. Plus (+) button `18px`, window controls (minimize line, maximize square, close cross) on far right.
- Chrome URL Navigation Bar: Height `46px` (`87 - 41`), background `#ffffff`, border bottom `#dadce0`, navigation controls (back arrow 18px, forward arrow 18px, reload circular arrow 16px), omnibox input pill (height `34px`, background `#f1f3f4`, lock icon 13px, website URL text, pad-x `16px`), user profile circle 28px.
- Webpage Viewport: Width `1920px`, Height `945px`, background tone-adaptive.

---

## 8. Caveats

- **No Caveats**: The extracted webpack source (`steps/26/output.txt`), live DOM dump (`steps/203/output.txt`), and live SVG assets (`steps/209/output.txt`) provided complete, unminified constants and source code for all 34 original placements and device frames. The 12 extended placements for Zalo Ads, LinkedIn Ads, and Admicro were fully mapped to native platform specifications in alignment with `ORIGINAL_REQUEST.md`.

---

## 9. Conclusion

The Ad Preview web application specification is complete, authoritative, and fully detailed across 11 platforms and 46 placements (34 original + 12 extended). The exact device dimensions, safe-zone bounding boxes, live character limits and counting algorithms, bilingual translation tables, and UI tokens have been cataloged with precision to allow implementation without ambiguities.

---

## 10. Verification Method

1. Inspect `handoff.md` to verify all 46 placements (10 FB, 3 IG, 1 Threads, 2 TikTok, 6 YT, 2 Google Search, 8 GDN, 2 ChatGPT, 4 Zalo, 4 LinkedIn, 4 Admicro) are itemized.
2. Cross-check safe-zone coordinate percentages against `steps/26/output.txt` (`S`, `$`, `P`, `_`).
3. Cross-check UI strings against `z`, `I`, `M`, `eP`, `tP`, `sl`, `sK`, `nm` in `steps/26/output.txt`.
