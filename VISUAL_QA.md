# Visual QA plan

Trạng thái: QA checklist cho design/UI; kết quả runtime nằm trong
[release evidence](docs/RELEASE_EVIDENCE.md).  
Mục tiêu: phát hiện layout overflow, state sai, preview misleading và lỗi
responsive trước khi coi MVP có thể dùng nội bộ.

## 1. Viewports

Phải kiểm tra:

- 320 × 700
- 375 × 812
- 414 × 896
- 768 × 1024
- 1024 × 768
- 1280 × 800
- 1440 × 900

Không claim mobile visual acceptance nếu chưa có screenshot hoặc DOM overflow
check ở 320/375/414/768.

## 2. Pages/surfaces

- Workspace default empty media.
- Workspace with single image.
- Workspace with 4-image multi-image.
- TikTok Standard Carousel with 2, 35 and 36 assets.
- Zalo Form with cover/avatar missing and present.
- Zalo video conflict state.
- Google RSA mobile and desktop.
- Google Display fixed banner 300x250, 300x600, 320x50.
- ChatGPT web/mobile card.
- Admicro publisher slot and multi-slot package.
- Import JSON missing assets.
- Export drawer with unresolved issues.

## 3. Visual checks

Layout:

- No horizontal scroll on root.
- No text clipped inside buttons, badges, tabs, cards or issue rows.
- No nested card-on-card clutter beyond repeated items/tool panels.
- Preview stays visually framed but not confused with live platform UI.
- Compare 2-4 cards keeps equal height controls and readable labels.
- Mobile order is target, preview, issues, editor.

Typography:

- Panel headings compact.
- Metadata mono is readable at 11-12 px.
- Long Vietnamese strings wrap without overlap.
- CJK/emoji counters do not shift layout.
- No italic headings.

Color:

- Fail/warn/unknown/pass visually distinct and text-labelled.
- Unknown/conflict not shown in success green.
- Platform colors appear only inside preview or brand/logo context.
- Contrast passes WCAG AA for body/control text.

Interaction states:

- Default, hover, focus-visible, active, disabled, loading, error and success
  visible for buttons, fields, tabs, target cards and issue rows.
- Focus ring not hidden behind panel clipping.
- Reduced motion removes spatial animation.

Preview:

- Safe zone overlay labels fit.
- Placeholder ratio and role are clear.
- Estimated/reference/conflict badges visible inside preview context.
- Video timestamp visible when exporting still.
- Simulated publisher/page content is labelled.

## 4. Accessibility QA

Keyboard:

- Tab from header to target picker to editor to preview controls to issue list.
- Arrow/enter/space behavior works for tabs, segmented controls, accordions.
- Escape closes source/export drawers.
- Focus returns to invoking control after closing drawer.

Screen reader:

- Target cards have platform/product/placement/device/evidence in name or
  description.
- Issue row announces severity, field, actual/expected and action.
- Preview has alt/description summarizing target and unresolved state.
- Upload controls announce accepted media and privacy/local-only boundary.

## 5. Evidence and wording QA

- No UI label says “approved”, “chắc chắn chạy”, “đủ mọi vị trí” or similar.
- Every source drawer shows checked date and evidence status.
- `unknown`, `conflict`, `estimated`, `reference_only` remain visible in export.
- Admicro source dates/conflicts are not hidden behind success labels.
- Privacy/local-only wording does not promise deletion if optional persistence
  is enabled.

## 6. Tooling

Manual:

- Browser screenshots at required viewports.
- Keyboard-only pass.
- Reduced-motion pass.
- High zoom 150% pass for desktop and mobile.

Automated/semiautomated:

- DOM overflow check for `document.documentElement.scrollWidth > innerWidth`.
- Screenshot diff for golden fixtures.
- Axe or equivalent accessibility scan when added.
- Build and unit tests before release.

## 7. Acceptance mapping

- `A01`: keyboard/focus path.
- `A02`: contrast/status states.
- `A03`: responsive/no overflow.
- `A04`: issue/source navigation.
- `A05`: evidence/privacy wording.
- `A06`: reduced motion/loading/error.
- `R01-R04`: preview/export visual integrity.

Visual QA is required after implementation changes. This document is a plan and
does not certify current screenshots.
