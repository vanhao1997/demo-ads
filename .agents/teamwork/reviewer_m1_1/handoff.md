# Handoff Report — Quality & Adversarial Review of Milestone 1

**Agent**: `reviewer_m1_1` (Roles: Reviewer, Critic)  
**Parent**: Project Orchestrator (`853b94d8-915a-4180-baf9-463270ce3714`)  
**Target Milestone**: Milestone 1 (Core Layout, Tokens & Ad Content Editor)  
**Verdict**: **`REQUEST_CHANGES`**  
**Date**: 2026-10-17  

---

## 1. Observation

Direct observations from codebase inspection across `src/styles.css`, `src/App.tsx`, `src/features/`, and `tests/`:

1. **Design Tokens & Theme (`src/styles.css:2-27`)**:
   - Authorized CSS variables match `go.noti.vn`:
     `--brand: #ed3c47`, `--brand-600: #d62e3a`, `--brand-050: #fdedef`, `--bg-subtle: #f6f6f7`, `--border: #e7e7ea`.
   - Glass tokens: `--glass-bg: #ffffff8c`, `--glass-border: #ffffff59`, `--glass-blur: 16px`, `--glass-saturate: 160%`, `--glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80` applied to `.glass, .glass-card` in `src/styles.css:1072-1079`.
   - Status: **VERIFIED & CONFORMANT**.

2. **Mobile Viewport Grid Flaw (`src/styles.css:678-720`)**:
   - In `src/styles.css:678-690`:
     ```css
     .workbench {
       display: grid;
       grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
       column-gap: 24px;
       row-gap: 0;
       align-items: start;
     }
     @media (max-width: 1023px) {
       .workbench {
         grid-template-columns: minmax(0, 1fr);
       }
     }
     ```
   - Immediately following that, outside any `@media` block in lines 696-720:
     ```css
     .workbench > .editor-panel {
       grid-column: 1;
       grid-row: 1 / span 3;
     }
     .workbench > .target-bar {
       grid-column: 2;
       grid-row: 1;
     }
     .workbench > .preview-panel {
       grid-column: 2;
       grid-row: 2;
       ...
     }
     .workbench > .validation-panel {
       grid-column: 2;
       grid-row: 3;
       ...
     }
     ```
   - On viewports `< 1024px`, CSS Grid creates an implicit column 2 because items specify `grid-column: 2`. The workbench fails to collapse to a single column, producing side-by-side columns and horizontal blowout on mobile devices.

3. **Section Structure & Heading Divergence (`src/App.tsx:1497-1501, 1894-1898`, `src/features/EditorPanel.tsx`)**:
   - Left column is wrapped in `<details className="editor-panel min-w-0">` with heading `<h2><span>01</span>Nội dung quảng cáo</h2>` and `<summary className="editor-disclosure">Chỉnh nội dung creative</summary>`, lacking `<section aria-label="Nội dung quảng cáo">`.
   - Right column is rendered as `<section className="preview-panel min-w-0 glass" aria-label="Preview quảng cáo">` with heading `<h2><span>02</span>Xem trước Live</h2>` instead of `aria-label="Khung xem trước"` and title `"Khung xem trước"` matching `go.noti.vn` and Tier 1 test 1.3.

4. **Input State & Placeholder vs Pre-filled Values (`src/App.tsx:210-239`, `src/features/editorModel.ts:41-53`)**:
   - In `src/features/editorModel.ts:45-53`, `initialDraft` initializes `brandName`, `handle`, `primaryText`, `headlines[0]`, `descriptions[0]`, and `destinationUrl` as empty strings `""` (relying on `placeholder="noti.vn"`, etc.).
   - In `go.noti.vn`, the ad preview is pre-populated with default template content with pink dashed borders (`input-default`), switching to solid neutral border upon modification.
   - In `tests/tier1-feature-coverage.js:116-144, 150, 258`, tests query `input.value === DEFAULT_CAMPAIGN_DRAFT.brandName` and `textarea.value.length > 10`, which fail when values are empty.

5. **Multi-File Upload Cap & Carousel Auto-Switch (`src/media/inspect.ts:19`, `src/App.tsx:624-684`)**:
   - `MAX_CAROUSEL_FILES = 10` is defined and enforced in `addFiles`.
   - Auto-switches `draft.composition` to `'carousel'` when `creativeCount >= 2`.
   - Initializes `draft.cardDetails[asset.id]` with `title`, `description`, and `url`.
   - Per-card inputs rendered for each creative card in both copy and media tabs (`App.tsx:2161-2205, 2600-2644`).
   - Status: **VERIFIED & CONFORMANT**.

6. **Platform Override Accordions (`src/App.tsx:2212-2420`)**:
   - Accordions exist for Google Search, GDN, YouTube, and ChatGPT.
   - In `src/App.tsx:2224`, the Google Search summary reads `"Google Search (Responsive Ads)"` in English rather than Vietnamese `"Google Tìm kiếm"`, causing Tier 1 test 10.1 selector match failure.
   - State updates in `updateGdnOverride`, `updateYoutubeHeadline`, `updateYoutubeCta`, `updateChatgptTitle`, `updateChatgptBody` legitimately mutate both `draft.copy` and `draft.overrides[p.id]`.

7. **Iconography Audit & Regression in Unit Test (`src/features/PlatformLogo.tsx`, `PlatformLogo.test.tsx`)**:
   - 9 non-essential decorative icons (pulsing pencils, decorative shields, button sparkles) are pruned. Authentic 18x18 monochrome platform SVGs and device frames are preserved.
   - `CUSTOM_PLATFORM_SVGS` for `chatgpt`, `linkedin`, and `admicro` were added to `PlatformLogo.tsx:52-56`.
   - However, `src/features/PlatformLogo.test.tsx:31-37` explicitly tests that `chatgpt` renders the fallback badge `>Ch</span>` with `data-asset-status="unavailable"`. Because `CUSTOM_PLATFORM_SVGS.chatgpt` now exists, this test fails with an assertion failure.

---

## 2. Logic Chain

1. **Mobile Layout Failure (Observation 2)**:
   - Defining `grid-template-columns: minmax(0, 1fr)` at `@media (max-width: 1023px)` only defines track 1.
   - Because child rules `.workbench > .target-bar`, `.preview-panel`, `.validation-panel` have unqualified `grid-column: 2`, CSS Grid spec requires the browser to create an implicit 2nd track.
   - Consequently, elements do not stack vertically; instead, mobile screens render a squished two-column layout that overflows horizontally.
   - This directly violates R1, R2, and Acceptance Criteria.

2. **Test Regression in PlatformLogo (Observation 7)**:
   - Pre-existing unit test `PlatformLogo.test.tsx` verified that unsupported platforms gracefully render text abbreviations (`>Ch</span>`).
   - When ChatGPT was given an inline SVG in `PlatformLogo.tsx`, the fallback branch in `PlatformLogo` was bypassed, causing `PlatformLogo.test.tsx` to fail.
   - Upstream worker did not note this test regression.

3. **Contract and E2E Test Incompatibilities (Observations 3, 4, 6)**:
   - E2E Tier 1 test runner was published in M0 (`TEST_READY.md`) as the project's acceptance contract.
   - Discrepancies in markup (`<details>` vs `<section>`, `"Preview quảng cáo"` vs `"Khung xem trước"`, `"Google Search (Responsive Ads)"` vs `"Google Tìm kiếm"`, empty input values vs pre-populated default values) cause multiple Tier 1 tests to fail.

---

## 3. Caveats

- Shell command execution (`run_command`) is disabled in this environment by policy. Direct running of `vitest` or `vite build` via CLI was not possible. Verification was performed by exact AST, CSS, and DOM trace analysis against test specifications.
- `demo-app.html` in the workspace root will be formally synchronized in Milestone 5 as planned in `PROJECT.md`.

---

## 4. Conclusion & Findings

### Verdict: **`REQUEST_CHANGES`**

### Summary of Findings:

| # | Severity | Category | Description | Required Action |
|---|---|---|---|---|
| **F-01** | **Critical** | CSS Layout / Mobile | `.workbench > *` children have global `grid-column: 2` rules that force implicit 2nd column on mobile (< 1024px). | Move `.workbench > .editor-panel`, `.target-bar`, `.preview-panel`, `.validation-panel` inside `@media (min-width: 1024px)`. |
| **F-02** | **Major** | Test Regression | `src/features/PlatformLogo.test.tsx` fails because `chatgpt` now returns SVG instead of fallback text. | Update `PlatformLogo.test.tsx` (or adjust `PlatformLogo.tsx`) so that test assertions align with the new custom SVG assets. |
| **F-03** | **Major** | Visual Fidelity / Test Selector | Right column is labeled `"Preview quảng cáo"` / `"02 Xem trước Live"` instead of `"Khung xem trước"` (matching `go.noti.vn`). | Use `aria-label="Khung xem trước"` and title `"Khung xem trước"` on the preview panel. |
| **F-04** | **Major** | Test Selector | Left column uses `<details className="editor-panel">` without `aria-label="Nội dung quảng cáo"`. | Add `aria-label="Nội dung quảng cáo"` to the left column container. |
| **F-05** | **Minor** | Test Selector | Google Search accordion summary is `"Google Search (Responsive Ads)"` in English instead of `"Google Tìm kiếm"`. | Update accordion summary to include `"Google Tìm kiếm"`. |
| **F-06** | **Minor** | Contract | File count indicator in `App.tsx:1930` is a `<div>` instead of a `<span>`. | Render `<span className="editor-file-count">...</span>` or add test-compatible selector. |

---

## 5. Verification Method

1. **Verify Mobile Grid Fix**:
   - Inspect `src/styles.css` around line 680–725.
   - Confirm that `.workbench > .editor-panel`, `.target-bar`, `.preview-panel`, and `.validation-panel` are enclosed inside `@media (min-width: 1024px) { ... }`.
   - Verify that on screens `< 1024px`, `.workbench` elements use default automatic flow.

2. **Verify Section Labels**:
   - Check `src/App.tsx`:
     - Left editor panel has `aria-label="Nội dung quảng cáo"`.
     - Right preview section has `aria-label="Khung xem trước"` and heading includes `"Khung xem trước"`.
     - Google Search accordion contains `"Google Tìm kiếm"`.

3. **Verify PlatformLogo Tests**:
   - Inspect `src/features/PlatformLogo.test.tsx` to confirm assertions match the custom SVGs for `chatgpt`, `linkedin`, and `admicro`.
