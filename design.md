# Design guideline — Adcraft Preview Lab

Trạng thái: locked design direction cho MVP, ngày 12/10/2026.  
Nguồn tham chiếu chính: [Noti Ad Preview](https://go.noti.vn/cong-cu/xem-truoc-quang-cao) dùng để học cấu trúc workflow, không copy pixel.

## 1. Design goal

Adcraft là tool vận hành nội bộ cho marketer, designer và reviewer. UI phải
giúp team soát creative nhanh, thấy rủi ro theo target, và không nhầm giữa
mockup tham khảo với preview đã verified.

Tính cách sản phẩm: bình tĩnh, chính xác, rõ nguồn, ít phô trương. Đây là
workspace làm việc lặp lại mỗi ngày, không phải landing page.

## 2. Pre-flight findings

- Framework: React + TypeScript + Vite.
- Font stack hiện tại: `@fontsource-variable/manrope` cho body và
  `@fontsource/ibm-plex-mono` cho metadata.
- Palette hiện tại: nền xanh xám nhạt, panel trắng, accent xanh lá vận hành.
- Motion: không có motion library; dùng CSS transition nhẹ.
- Layout hiện tại: header 68 px, rail icon trái, platform tabs, workspace 3
  cột trên desktop, 2 cột dưới 1240 px, stacked dưới 900 px.
- Token chính nằm trong `src/styles.css`; chưa có `design.md` trước lượt này.

Hướng thiết kế này được giữ. Noti là reference UX, không phải source token.

## 3. DNA học từ Noti

Quan sát từ Noti:

- Page dùng Inter, nền trắng, ink đen, border xám, accent cam `#ff7849`.
- Màn chính đặt editor bên trái, controls platform/placement và preview bên
  phải.
- Platform là các lựa chọn rõ trạng thái, có nhãn lỗi ngay trên mục chọn.
- Placement đổi theo platform; warning list nằm sát preview đang xem.
- Input mặc định có nền/dashed border để phân biệt placeholder từ website với
  nội dung user nhập.
- Text counter nằm ngay trên field liên quan.
- Privacy/local-only được nói rõ, giúp user tin tưởng upload media vào tab.
- Các phần giải thích phía dưới phục vụ public SEO/education.

Áp dụng cho Adcraft:

- Giữ editor + target + preview trong một workspace; không biến thành trang
  marketing.
- Đưa issue navigation và source/evidence gần preview.
- Dùng label trạng thái trên target, không chỉ trong preflight rail.
- Dùng visual treatment riêng cho inherited/default/override content.
- Privacy/local-only là system status trong app, không chỉ là copy giới thiệu.

Không áp dụng:

- Không dùng public hero dài, FAQ và cross-link sections trong app shell.
- Không dùng toàn bộ Inter/white/orange system vì app đã có operational green.
- Không dùng checkbox grid cho mọi target nếu catalog nhiều; dùng target picker
  có search/filter và compare queue.
- Không dùng câu “đủ vị trí đang chạy được” nếu evidence chưa verified.

## 4. Token system

### 4.1 Color

| Token | Value | Use |
|---|---:|---|
| `--color-bg` | `#f4f5f1` | app background |
| `--color-panel` | `#ffffff` | primary panels |
| `--color-panel-soft` | `#f8f9f5` | muted zones, preview stage |
| `--color-ink` | `#20231f` | primary text |
| `--color-muted` | `#6a7068` | secondary text |
| `--color-rule` | `#d9ded3` | default border |
| `--color-rule-strong` | `#b7c0af` | active/structural border |
| `--color-accent` | `#2f6f4e` | selected state, primary command |
| `--color-accent-soft` | `#e0eee5` | selected surface |
| `--color-danger` | `#b42318` | fail/destructive |
| `--color-danger-soft` | `#fee4e2` | fail surface |
| `--color-warning` | `#9a5b00` | warn |
| `--color-warning-soft` | `#fff1d6` | warn surface |
| `--color-unknown` | `#5d5a8a` | unknown/conflict |
| `--color-unknown-soft` | `#ecebff` | unknown/conflict surface |

Semantic rules:

- `fail`, `warn`, `unknown` always include text/icon, never color only.
- `reference_only`, `estimated`, `conflict`, `unknown` use badges plus source
  text; do not reuse success green.
- Platform preview may use platform colors inside mockup only.
- App chrome stays neutral/green even when Facebook/TikTok/Zalo target active.

### 4.2 Typography

- Body: Manrope Variable, 14-16 px; tight but readable for operational density.
- Metadata: IBM Plex Mono, 11-12 px; source IDs, rule IDs, version, counts.
- Headings inside app panels stay compact; no hero-scale headings inside tool
  surfaces.
- Display text for app shell: 28-36 px max on desktop, 22-28 px on mobile.
- Letter spacing default 0; uppercase labels use weight/size, not tracking.
- No italic headings.

### 4.3 Space, radius and layout

- Space scale: 4, 8, 12, 16, 20, 24, 32.
- Radius: 6 for controls, 8 for cards/items, 12 for major panels. Avoid large
  pill overload except icon-only buttons or small badges.
- Desktop workspace: target rail/controls, editor, preview, preflight. If
  screen width is limited, prioritize preview and target context over static
  help text.
- Mobile: stack as Target → Preview → Issues → Editor sections. Do not shrink a
  3-column desktop tool into unreadable columns.

## 5. Component principles

### Target picker

- Target selection starts with platform group, then product/surface/placement,
  then composition/device/context.
- Every target row shows implementation/evidence status.
- Selected target includes profile ID, checked date and spec version in a
  compact source drawer.
- Compare queue supports 2-4 targets and shows why additional target cannot be
  added.

### Editor

- Separate Identity, Copy, Media, Form/Message and Overrides.
- Field counters show actual/expected and counting strategy when different from
  visible grapheme count.
- Default/inherited content has subtle dashed/soft treatment; user override uses
  normal solid field.
- `clear` state is explicit and visible; empty override must not look like a
  missing field.
- Drag/drop media shows role assignment and parser status.

### Preview

- Single preview is default. Compare view is a deliberate mode.
- Preview contains simulated platform chrome; app UI never pretends the creative
  is live.
- Safe zone overlay has labels and toggle, with source/evidence status.
- Missing media still renders placeholder with ratio/role so user can fix
  without losing context.
- Video preview still frame shows timestamp and media status.

### Preflight

- Issue list groups by target, field, asset and source/evidence.
- Clicking issue focuses field or preview overlay.
- `unknown` has same visibility as `fail`; it blocks “verified” coverage.
- Source drawer opens from every issue and target badge.

### Export

- Export button remains available when warnings exist, but manifest includes
  unresolved warnings/fails/unknowns.
- Export never labels output “approved by platform”.
- PNG/still preview must include target/profile/version context in manifest,
  not necessarily burned into image.

## 6. Brand and icon use

- Use local platform SVG assets from [Noti SVG library](https://go.noti.vn/icon/svg)
  only after bundling and manifest review; see `docs/BRAND_ASSETS.md`.
- UI icons come from `lucide-react` where possible.
- Every icon-only action has accessible name and tooltip/focus name.
- Admicro uses text fallback until a reviewed brand asset exists.
- Platform logo is context, not proof that platform approved output.

## 7. States

Every interactive component supports:

- Default
- Hover
- Focus visible
- Active
- Disabled
- Loading
- Error
- Success

Data states:

- Empty
- Partial/pending media metadata
- Unreadable media
- Unsupported composition
- Unknown/conflict evidence
- Source unavailable
- Import migrated
- Import rejected
- Network/storage quota error

## 8. Motion

- Motion is quiet and functional: panel reveal, issue highlight, compare row
  add/remove and preview overlay fade.
- Animate transform/opacity only.
- Default duration 120-180 ms; 240 ms max for panel transitions.
- `prefers-reduced-motion: reduce` collapses motion to opacity or no motion.
- Focus ring appears immediately, never animated.

## 9. Accessibility

- Keyboard path: target picker, editor fields, preview controls, issue list and
  source drawer.
- All target status badges have text, not color only.
- Field errors use `aria-describedby` and visible text.
- Preview has text alternative describing target, composition, media status and
  unresolved issues.
- Compare grid keeps reading order target by target.
- Minimum contrast target: WCAG AA for text and actionable controls.

## 10. Content voice

Use Vietnamese operational wording:

- Good: “Chưa đủ bằng chứng”, “Nguồn xung đột”, “Đang dùng nội dung chung”,
  “Tạo biến thể riêng”, “Mở nguồn”.
- Avoid user-facing P0/P1/spec jargon in product UI.
- Do not say “được duyệt”, “chắc chắn chạy”, “đủ mọi vị trí” unless platform
  source and account verification truly support the statement.
- Use exact platform terms in source drawer; translate help text only when it
  does not change meaning.

## 11. Phase split

### MVP

Operational green UI, target-first flow, single preview default, compare 2-4,
preflight/source drawer, privacy status, local brand assets, responsive stacked
mobile layout.

### V1

Review workflow, comments, immutable snapshots, share link states, multi-user
presence conflict UI, reviewer role constraints.

### Future

Connector/auth UI, publishing status, AI recommendations, billing/usage. These
need separate design review because security, retry and consent surface change.

## 12. Acceptance mapping

- `A01`: keyboard and focus path.
- `A02`: status badges include text/icon and pass contrast.
- `A03`: mobile layout usable without horizontal scroll.
- `A04`: source drawer and issue navigation work for target/editor/preview.
- `A05`: privacy/source/evidence claims visible and non-misleading.
- `A06`: reduced motion and loading/error states behave consistently.

Detailed cases live in [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md) and
[VISUAL_QA.md](VISUAL_QA.md).
