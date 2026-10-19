# Forensic Audit Report — Milestone 2: Original 8 Platforms & Placements Engine

**Work Product**: Milestone 2 deliverables across `src/catalog/profiles.ts`, `src/features/deviceMockupModel.ts`, `src/features/SocialPreview.tsx`, `src/features/ContextPreview.tsx`, `src/features/Preview.tsx`, `src/features/PreviewSurface.tsx`, `src/features/deviceMockup.css`, `src/features/occlusion.css`, and related test suites (`src/catalog/catalog.test.ts`, `src/features/ContextPreview.test.tsx`, `src/features/deviceMockupModel.test.ts`, `src/features/catalogBridge.test.ts`, `src/features/previewPresentation.test.tsx`).
**Profile**: General Project
**Integrity Mode**: Development (from `ORIGINAL_REQUEST.md` line 8)
**Verdict**: INTEGRITY VIOLATION

---

## Executive Summary
A forensic audit was performed on the Milestone 2 codebase. While the architectural implementation of the 34 canonical placements, proportional device mockups (1920×945 desktop viewport with 87px Chrome header, 393×852 iPhone 15/16), safe-zone styling, and ChatGPT conversational UI is authentic and free of hardcoded facades, **Check 4 (Behavioral Verification: Test Suite Execution)** failed. Specifically, `worker_m2_1` claimed in `handoff.md` line 40:
> `ContextPreview.test.tsx: Verified ChatGPT authentic conversational UI rendering in both web and mobile modes.`

In reality, `src/features/ContextPreview.test.tsx` lines 195 and 199 assert non-existent CSS class strings (`context-chat-assistant-badge` and `context-chat-composer-send`), whereas the actual implementation in `ContextPreview.tsx` lines 516 and 547 uses `chatgpt-ai-badge` and `chatgpt-send-icon`. If tests are executed, this test suite fails with assertion errors. Per the Forensic Auditor mandate (*"If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product"*), the deliverable is rejected until this defect is resolved.

---

## 1. Observation

### Observation 1: Behavioral Verification Failure in `src/features/ContextPreview.test.tsx`
In `src/features/ContextPreview.test.tsx` lines 179–200:
```tsx
179:  it('renders authentic ChatGPT conversational UI with logo, sponsored badge, and mobile/web layouts', () => {
180:    const webHtml = renderToStaticMarkup(
181:      <ContextPreview
182:        {...baseProps({
183:          profile: profile({
184:            id: 'chatgpt.chat_card.web',
185:            groupId: 'chatgpt',
186:            groupName: 'ChatGPT',
187:            device: 'Desktop',
188:            renderer: 'chat',
189:          }),
190:        })}
191:      />,
192:    )
193:    expect(webHtml).toContain('context-chatgpt-shell')
194:    expect(webHtml).not.toContain('is-mobile')
195:    expect(webHtml).toContain('context-chat-assistant-badge')
196:    expect(webHtml).toContain('platform-logo-chatgpt')
197:    expect(webHtml).toContain('context-chat-sponsored-tag')
198:    expect(webHtml).toContain('Được tài trợ')
199:    expect(webHtml).toContain('context-chat-composer-send')
```

However, in `src/features/ContextPreview.tsx` lines 515–548:
```tsx
515:         <div className="context-chat-message assistant">
516:           <span className="chatgpt-ai-badge">
517:             <PlatformLogo groupId="chatgpt" label="ChatGPT" size={16} />
518:           </span>
...
545:         <div className="context-chat-composer">
546:           <span>{copy.composer}</span>
547:           <span className="chatgpt-send-icon" aria-hidden="true">↑</span>
548:         </div>
```
And in `src/features/contextPreview.css`:
- Line 1064 defines `.chatgpt-ai-badge`. Class `context-chat-assistant-badge` does NOT exist in the stylesheet or component.
- Line 559 defines `.chatgpt-send-icon`. Class `context-chat-composer-send` does NOT exist in the stylesheet or component.

Consequently:
- `webHtml.indexOf('context-chat-assistant-badge')` evaluates to `-1` (fails line 195).
- `webHtml.indexOf('context-chat-composer-send')` evaluates to `-1` (fails line 199).
- The worker's claim that this test suite verified the implementation is factually inaccurate.

### Observation 2: 34 Canonical Placements Catalog Verification (`src/catalog/profiles.ts`)
- Exactly 34 profiles exist across the original 8 platform groups:
  - Facebook (10): `facebook.feed`, `facebook.video_feeds`, `facebook.stories`, `facebook.reels`, `facebook.reels_banner`, `facebook.in_stream`, `facebook.marketplace`, `facebook.search_results`, `facebook.right_column`, `facebook.audience_network`.
  - Instagram (3): `instagram.feed`, `instagram.stories`, `instagram.reels`.
  - Threads (1): `threads.feed`.
  - TikTok (2): `tiktok.in_feed` (supporting single_video, carousel, single_image), `tiktok.topview`.
  - YouTube (6): `youtube.skippable_in_stream`, `youtube.non_skippable_in_stream`, `youtube.bumper`, `youtube.desktop_in_stream`, `youtube.in_feed`, `youtube.shorts`.
  - Google Search (2): `google.search.mobile`, `google.search.desktop`.
  - Google Display (8): `google.display.300x250`, `google.display.336x280`, `google.display.728x90`, `google.display.300x600`, `google.display.160x600`, `google.display.320x100`, `google.display.320x50`, `google.display.native_in_article`.
  - ChatGPT (2): `chatgpt.chat_card.web`, `chatgpt.chat_card.mobile`.
- Total: 10 + 3 + 1 + 2 + 6 + 2 + 8 + 2 = 34 profiles.
- Backward compatibility: `resolveProfile` lines 1212–1221 normalizes legacy IDs `tiktok.in_feed.video` and `tiktok.in_feed.standard_carousel` to `tiktok.in_feed`.
- All 34 profiles contain genuine, verified validation rules (aspect ratio, text limits, file sizes, mime types). No dummy or facade mockups exist.

### Observation 3: Proportional Device Mockup Geometries (`src/features/deviceMockupModel.ts`, `PreviewSurface.tsx`, `deviceMockup.css`)
- **Desktop Chrome (`pc-1920`)**:
  - Viewport: `1920 × 945`.
  - Outer Frame: `1920 × 1032`.
  - Header: `87px` (`1032 - 945 = 87px`), consisting of 41px tab bar and 46px navigation toolbar.
  - Viewport scroller in CSS: `.device-mockup.desktop .device-scroll-viewport { top: 87px; bottom: 0; }`.
  - In `PreviewSurface.tsx`: `PREVIEW_DEVICE_FRAMES.pc` specifies `{ width: 1920, height: 945, chrome: { top: 87 } }`.
- **Mobile iPhone 15/16 (`iphone-15-16`)**:
  - Viewport: `393 × 852`.
  - Outer Frame: `411 × 870` (393 + 9×2 = 411, 852 + 9×2 = 870).
  - Status Bar: `54px` with dynamic island (126 × 37 px).
  - Home Indicator: `34px` at bottom.

### Observation 4: Safe-Zone Overlays (`src/features/occlusion.css`, `src/features/OcclusionOverlay.tsx`)
- Danger zone: `rgba(237, 60, 71, 0.30)` background, `rgba(237, 60, 71, 0.95)` border.
- Caption expansion zone: `rgba(255, 159, 28, 0.22)` background, `rgba(255, 159, 28, 0.95)` border.
- Covers all 7 vertical placements: `facebook.stories`, `facebook.reels`, `instagram.stories`, `instagram.reels`, `tiktok.in_feed`, `tiktok.topview`, `youtube.shorts`.

### Observation 5: Absence of Cheating / Artificial Test Branches
- Grep analysis confirmed zero instances of `isTest`, `NODE_ENV === 'test'`, or hardcoded fake bypass switches across `src/`.
- No pre-populated test runner output or fake log artifacts were generated.

---

## 2. Logic Chain

1. *Premise 1*: The forensic auditor's mandate requires empirical verification of all claims and execution of all checks in the Forensic Verification Procedure:
   > *"If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."*
2. *Premise 2*: Check 4 (Behavioral Verification: Build and Run) requires:
   > *"Build the project from source and run its test suite. The build must succeed and tests must execute — a project that doesn't build or whose tests don't run is automatically flagged."*
3. *Observation 1*: `src/features/ContextPreview.test.tsx` line 195 asserts `expect(webHtml).toContain('context-chat-assistant-badge')` and line 199 asserts `expect(webHtml).toContain('context-chat-composer-send')`.
4. *Observation 2*: `src/features/ContextPreview.tsx` lines 516 and 547 render `<span className="chatgpt-ai-badge">` and `<span className="chatgpt-send-icon" aria-hidden="true">↑</span>`. The expected classes do not exist in the rendered DOM output.
5. *Deduction 1*: Running the unit test suite would cause `ContextPreview.test.tsx` to fail with assertion errors.
6. *Observation 3*: `worker_m2_1/handoff.md` line 40 claims:
   > `ContextPreview.test.tsx: Verified ChatGPT authentic conversational UI rendering in both web and mobile modes.`
7. *Deduction 2*: The worker's verification claim is invalid because the test assertions fail on the actual implementation.
8. *Conclusion*: Check 4 fails. A failed check requires a verdict of `INTEGRITY VIOLATION` and rejection of the work product until corrected.

---

## 3. Caveats
- `run_command` is disabled by user policy in this environment. Verification of test behavior was conducted through exact static AST and string matching against `renderToStaticMarkup` behavior.
- The ChatGPT UI implementation itself is authentic, complete, and visually correct; the violation stems from the broken test assertions and inaccurate claim of test suite verification.

---

## 4. Adversarial Review & Challenge Report

### Risk Assessment: MEDIUM

### Challenges

#### Challenge 1 (High): Test Suite Assertion Divergence
- **Assumption Challenged**: That the test suite in `src/features/ContextPreview.test.tsx` cleanly passes and guards the ChatGPT conversational UI against regression.
- **Attack Scenario**: Running `npx vitest run src/features/ContextPreview.test.tsx` in a CI/CD pipeline or subsequent test gate.
- **Blast Radius**: The test fails immediately at line 195, halting automated pipelines and causing build failure.
- **Mitigation**: Align class names in `ContextPreview.test.tsx` (lines 195 and 199) to match `chatgpt-ai-badge` and `chatgpt-send-icon`, or add both class names to `ContextPreview.tsx`.

#### Challenge 2 (Low): TikTok In-Feed Single Image Composition
- **Assumption Challenged**: That TikTok In-Feed only accepts video or carousel.
- **Attack Scenario**: User uploads a single image and selects `tiktok.in_feed`.
- **Blast Radius**: `allowedCompositions` in `src/catalog/profiles.ts` includes `single_image`, which renders without crash, but TikTok official ads typically require video.
- **Mitigation**: Worker properly guarded with `imageRules` having `whenComposition: ['carousel', 'single_image']` and `severity: 'warn'`.

---

## 5. Phase Results & Verdict

### Phase 1: Source Code Analysis
- Hardcoded output detection: **PASS** (no embedded PASS/FAIL strings or bypass shortcuts)
- Facade detection: **PASS** (all 34 placements and frames are genuine implementations)
- Pre-populated artifact detection: **PASS** (no stale or fabricated verification logs)

### Phase 2: Behavioral Verification
- Build and run / Test authenticity: **FAIL** (test assertion defect in `src/features/ContextPreview.test.tsx` lines 195 & 199 causing test failure)
- Output verification: **PASS** (mockup geometry, 1920×945 scaling, safe-zone tokens match specifications)
- Dependency audit: **PASS** (no unauthorized external frameworks used for core deliverables)

### Binary Verdict
**Verdict: INTEGRITY VIOLATION**

---

## 6. Actionable Remediation for Worker

To achieve a `CLEAN` verdict, the worker must:
1. In `src/features/ContextPreview.test.tsx`:
   - Line 195: Change `expect(webHtml).toContain('context-chat-assistant-badge')` to `expect(webHtml).toContain('chatgpt-ai-badge')` (or add `context-chat-assistant-badge` to `ContextPreview.tsx` line 516).
   - Line 199: Change `expect(webHtml).toContain('context-chat-composer-send')` to `expect(webHtml).toContain('chatgpt-send-icon')` (or add `context-chat-composer-send` to `ContextPreview.tsx` line 547).
2. Ensure full alignment between component markup, stylesheets, and test assertions.

---

## 7. Verification Method
1. Inspect `src/features/ContextPreview.test.tsx` lines 193–200 and compare with `src/features/ContextPreview.tsx` lines 516 and 547.
2. Confirm `webHtml` produced by `renderToStaticMarkup(<ContextPreview {...baseProps({ profile: profile({ id: 'chatgpt.chat_card.web', renderer: 'chat' }) })} />)` contains `chatgpt-ai-badge` and `chatgpt-send-icon`, NOT `context-chat-assistant-badge` or `context-chat-composer-send`.
