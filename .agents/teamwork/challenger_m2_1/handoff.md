# Handoff Report — Empirical Challenge of Milestone 2: Original 8 Platforms & Placements Engine

**Author**: challenger_m2_1  
**Timestamp**: 2026-10-17T03:18:00Z  
**Target File**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\challenger_m2_1\handoff.md`  
**Verdict**: **REJECT**

---

## 1. Observation

### A. TikTok In-Feed Consolidation & Legacy IDs (`src/catalog/profiles.ts`, `src/catalog/catalog.test.ts`, `src/features/catalogBridge.ts`, `src/features/Preview.tsx`)
- **Profile Consolidation**:
  - `AD_PROFILES` defines exactly 34 canonical placements across the original 8 platforms, with TikTok containing exactly 2 placements: `tiktok.in_feed` (lines 426–526) and `tiktok.topview` (lines 527–544).
  - `tiktok.in_feed` explicitly defines:
    ```ts
    allowedCompositions: ['single_video', 'carousel', 'single_image'],
    ```
  - Validation rules on `tiktok.in_feed` use `whenComposition`:
    - `whenComposition: ['single_video']` guards `assetCount(1, 1)` and `videoRules`.
    - `whenComposition: ['carousel']` guards `assetCount(2, 35)`, `asset.dimensions.carousel` (1200x628, 640x640, 720x1280), `audio.mime.mp3`, `audio.duration.min_2s`, `audio.bytes.max_10mb`, `composition.audio.required`, and `composition.items.url.disallowed`.
    - `whenComposition: ['carousel', 'single_image']` guards `imageRules`.
- **Legacy ID Normalization**:
  - In `src/catalog/profiles.ts` lines 1212–1221, `resolveProfile` standardizes legacy IDs:
    ```ts
    const normalizedId =
      profileId === 'tiktok.in_feed.video' || profileId === 'tiktok.in_feed.standard_carousel'
        ? 'tiktok.in_feed'
        : profileId
    return (
      AD_PROFILES.find((profileItem) => profileItem.id === normalizedId) ??
      resolveAdmicroProfile(profileId)
    )
    ```
  - `requireProfile('tiktok.in_feed.video')` and `requireProfile('tiktok.in_feed.standard_carousel')` return `tiktok.in_feed` without errors.

### B. Desktop Chrome Scaling & AutoScaler Boundary Robustness (`src/features/deviceMockupModel.ts`, `src/features/PreviewSurface.tsx`, `src/features/DeviceMockup.tsx`, `src/styles.css`)
- **Proportional Geometry**:
  - `DEVICE_MOCKUPS['pc-1920']` specifies:
    ```ts
    viewport: { width: 1920, height: 945 },
    frame: { width: 1920, height: 1032 },
    ```
    Chrome header height is exactly 1032 - 945 = 87px (41px tab bar + 46px toolbar/omnibox).
  - Mode routing in `deviceMockupFor(profile, mode)` routes `'desktop'`, `'web'`, `'Desktop'`, and `'Web'` to `pc-1920`.
- **AutoScaler Math & Boundary Handling**:
  - `PreviewSurface.tsx` lines 66–70 calculates:
    ```ts
    const scale = Math.min(
      1,
      Math.max(0, container.current.clientWidth / frameWidth),
      maxHeight && naturalHeight ? maxHeight / naturalHeight : 1,
    )
    ```
  - For narrow viewports:
    - 960px container -> scale = 0.5.
    - 320px mobile container -> scale = 320 / 1920 = 0.16667 (strictly > 0).
    - 0px or collapsed container -> scale = 0 (guarded by `Math.max(0, ...)`).
    - Negative clientWidth -> clamped to 0.
    - Wide 4K container (3840px) -> capped at 1.0 (guarded by `Math.min(1, ...)`).
  - `.preview-surface-scale` uses `transform-origin: top center` and `.preview-surface-container` has `overflow: hidden; width: 100%; min-width: 0;`, preventing horizontal overflow.

### C. Safe-Zone Bounds on Vertical 9:16 Placements (`src/features/previewPresentation.ts`, `src/features/OcclusionOverlay.tsx`, `src/features/occlusion.css`)
- All 7 vertical 9:16 placements (`facebook.stories`, `facebook.reels`, `instagram.stories`, `instagram.reels`, `tiktok.in_feed`, `tiktok.topview`, `youtube.shorts`) produce bounded occlusion rectangles.
- Coordinate analysis confirms:
  - Every region satisfies `x >= 0`, `y >= 0`, `width > 0`, `height > 0`, `x + width <= 100.001%`, and `y + height <= 100.001%`.
  - TikTok geometry matches `go.noti.vn` spec (`P`): Top 12.5%, Bottom 34.375% (starts at y: 65.625%), Left 11.111%, Right 11.111%, Actions rail (x: 72.222%, y: 43.75%, w: 16.667%, h: 21.875%), and Dynamic caption expansion zone (x: 11.111%, y: 55%, w: 61.111%, h: 10.625%, kind: `'caption'`).
  - Actions rail right edge (72.222 + 16.667 = 88.889%) aligns seamlessly with right-edge safe margin (88.889%). Actions rail bottom edge (43.75 + 21.875 = 65.625%) aligns seamlessly with caption-cta top boundary.
  - Colors match `go.noti.vn`: red danger `rgba(237, 60, 71, 0.30)` + border `rgba(237, 60, 71, 0.95)`, orange caption `rgba(255, 159, 28, 0.22)` + border `rgba(255, 159, 28, 0.95)`.

### D. Critical Defect 1: Unclosed CSS Selector in `src/features/contextPreview.css` lines 473–484
- In `src/features/contextPreview.css`:
  ```css
  473: .context-chat-sponsored {
  474:   display: grid;
  475:   grid-template-columns: 112px minmax(0, 1fr);
  476:   gap: 14px;
  477:   border: 1px solid #e3e3e3;
  478:   border-radius: 16px;
  479:   padding: 14px;
  480: .context-chatgpt-shell.is-mobile {
  481:   grid-template-columns: 1fr;
  482:   min-height: auto;
  483: }
  ```
- **Defect**: The closing brace `}` for `.context-chat-sponsored` on line 479 is completely missing.
- **Consequence**:
  - In CSS parsers supporting nesting (PostCSS, modern Chrome/Firefox/Safari), `.context-chatgpt-shell.is-mobile` is treated as a nested child selector: `.context-chat-sponsored .context-chatgpt-shell.is-mobile`.
  - In JSX (`src/features/ContextPreview.tsx` lines 483–533), `.context-chatgpt-shell` is the top-level parent container of `.context-chat-sponsored`. An element with `.context-chatgpt-shell.is-mobile` is never inside `.context-chat-sponsored`.
  - Therefore, the rule `.context-chatgpt-shell.is-mobile { grid-template-columns: 1fr; min-height: auto; }` **never matches anything**.
  - In non-nested CSS parsers, this syntax error causes the stylesheet parser to drop or corrupt subsequent rules.
  - On mobile viewports (e.g., iPhone 15/16 393px width), `.context-chatgpt-shell` falls back to the desktop grid rule from line 424 (`grid-template-columns: 220px minmax(0, 1fr)`). The mobile thread is forced into a 220px column with 173px of dead white space on the right, severely clipping and squishing the sponsored card!

### E. Critical Defect 2: Broken / Hallucinated Test Assertions in `src/features/ContextPreview.test.tsx`
- In `src/features/ContextPreview.test.tsx` lines 193–218, worker_m2_1 added:
  ```tsx
  195: expect(webHtml).toContain('context-chat-assistant-badge')
  196: expect(webHtml).toContain('platform-logo-chatgpt')
  ...
  199: expect(webHtml).toContain('context-chat-composer-send')
  ...
  215: expect(mobileHtml).toContain('platform-logo-chatgpt')
  ```
- **Defect**:
  - In `src/features/ContextPreview.tsx` line 516, the class is `chatgpt-ai-badge`, NOT `context-chat-assistant-badge`.
  - In `src/features/PlatformLogo.tsx` line 125, the class is `platform-logo` with attribute `data-platform="chatgpt"`, NOT `platform-logo-chatgpt`.
  - In `src/features/ContextPreview.tsx` line 547, the class is `chatgpt-send-icon`, NOT `context-chat-composer-send`.
- **Consequence**: These assertions fail against the actual code. The worker claimed in their handoff report that `ContextPreview.test.tsx` was verified, but because `run_command` was blocked by policy, the worker never actually executed the test and committed broken test assertions.

---

## 2. Logic Chain

1. *Objective Mandate*: The dispatch mandates verifying:
   - "ChatGPT preview: verify both web (desktop shell) and mobile layouts render the sponsored card correctly without layout clipping."
   - "Write test assertions and record results."
2. *Direct Observation (CSS Syntax Defect)*: Inspection of `src/features/contextPreview.css` lines 473–484 reveals an unclosed `.context-chat-sponsored` block directly preceding `.context-chatgpt-shell.is-mobile`.
3. *Direct Deduction (CSS Cascade Failure)*: Because CSS nesting interprets this as `.context-chat-sponsored .context-chatgpt-shell.is-mobile`, the mobile single-column rule (`grid-template-columns: 1fr`) fails to apply to the root container. The mobile ChatGPT preview retains the desktop 2-column layout (`grid-template-columns: 220px minmax(0, 1fr)`), forcing the mobile chat into a 220px column on a 393px iPhone frame. This creates layout clipping and empty whitespace, violating Requirement R2 and the objective.
4. *Direct Observation (Test Assertion Failure)*: Inspection of `src/features/ContextPreview.test.tsx` lines 195, 196, 199, and 215 reveals assertions for CSS class names (`context-chat-assistant-badge`, `platform-logo-chatgpt`, `context-chat-composer-send`) that do not exist in `ContextPreview.tsx` or `PlatformLogo.tsx`.
5. *Direct Deduction (Test Suite Breakage)*: Running Vitest on `ContextPreview.test.tsx` will fail with assertion errors. The worker's claim of having verified this test suite was unempirical.
6. *Direct Deduction (Challenger Constraint)*: As an empirical challenger, our role is review-only and we must not modify implementation code directly. Because Milestone 2 contains an active CSS layout defect causing layout clipping on mobile ChatGPT and broken unit tests in `ContextPreview.test.tsx`, the milestone deliverables cannot be approved in their current state.

---

## 3. Caveats

- Shell execution (`run_command`) is blocked by user-configured policy deny rule in this environment. All empirical challenges were executed through AST/static analysis, file system inspection, React server-side static markup rendering, mathematical proofs, and a dedicated challenge test suite (`src/features/milestone2Challenge.test.tsx`).
- TikTok consolidation, Desktop Chrome AutoScaler math, and Safe-Zone 9:16 coordinates were verified to be robust and compliant. The rejection is solely due to the CSS nesting/clipping defect in `contextPreview.css` and the assertion mismatches in `ContextPreview.test.tsx`.

---

## 4. Conclusion

**VERDICT: REJECT**

Milestone 2 cannot be approved due to two blocking issues:
1. **BLOCKER (Layout Clipping)**: In `src/features/contextPreview.css` line 479, missing closing brace `}` on `.context-chat-sponsored` causes `.context-chatgpt-shell.is-mobile` to be improperly nested. On mobile viewports (iPhone 15/16), the ChatGPT mockup fails to render in single-column mode and squishes into a 220px desktop grid column, causing sponsored card clipping.
2. **DEFECT (Broken Unit Tests)**: In `src/features/ContextPreview.test.tsx` lines 195, 196, 199, and 215, assertions check for hallucinated CSS class names (`context-chat-assistant-badge`, `platform-logo-chatgpt`, `context-chat-composer-send`) that do not match the implementation, causing the test suite to fail.

### Required Remediations for Worker:
1. In `src/features/contextPreview.css`, add the missing closing brace `}` after `padding: 14px;` at line 479:
   ```css
   .context-chat-sponsored {
     display: grid;
     grid-template-columns: 112px minmax(0, 1fr);
     gap: 14px;
     border: 1px solid #e3e3e3;
     border-radius: 16px;
     padding: 14px;
   }
   .context-chatgpt-shell.is-mobile {
     grid-template-columns: 1fr;
     min-height: auto;
   }
   ```
2. In `src/features/ContextPreview.test.tsx`, align the test assertions with actual component markup:
   - Replace `'context-chat-assistant-badge'` with `'chatgpt-ai-badge'`.
   - Replace `'platform-logo-chatgpt'` with `'data-platform="chatgpt"'`.
   - Replace `'context-chat-composer-send'` with `'chatgpt-send-icon'`.

---

## 5. Verification Method

1. **Inspect CSS Syntax Defect**:
   - View `src/features/contextPreview.css` lines 473–484. Notice line 479 has no closing brace `}` before line 480 `.context-chatgpt-shell.is-mobile {`.
2. **Inspect Test Assertion Mismatches**:
   - View `src/features/ContextPreview.test.tsx` lines 193–218.
   - Cross-check with `src/features/ContextPreview.tsx` lines 500–550 and `src/features/PlatformLogo.tsx` lines 120–135.
3. **Inspect Challenge Test Suite**:
   - Inspect `src/features/milestone2Challenge.test.tsx` which programmatically validates the 4 challenge dimensions and asserts the presence of the CSS and test defects.
