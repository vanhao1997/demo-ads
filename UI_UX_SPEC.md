# UI/UX specification — Adcraft Preview Lab

Trạng thái: MVP/V1 UX contract, ngày 12/10/2026.  
Mục tiêu: biến plan dữ liệu thành workflow editor/preview/preflight đủ rõ để
triển khai tiếp mà không phát sinh UI tùy tiện.

## 1. Product goal

Người dùng nhập creative một lần, chọn target quảng cáo cần kiểm tra, xem
preview và sửa lỗi theo bằng chứng. UX phải luôn trả lời ba câu:

1. Creative này đang xem ở target nào?
2. Target đó dùng field/rule/source nào?
3. Cần sửa gì trước khi team gửi quảng cáo đi?

## 2. Personas và jobs

| Persona | Job chính | UI cần ưu tiên |
|---|---|---|
| Designer | kiểm tra crop, safe zone, asset role | preview lớn, overlay, focal point |
| Copywriter | kiểm tra giới hạn ký tự và truncation | counters, target-specific copy |
| Media buyer | chọn placement/format đúng campaign | target picker, context filters, source |
| Reviewer | duyệt bản nội bộ | compare, issue list, snapshot/export |
| Catalog owner | cập nhật rule/source | source drawer, conflict state, fixtures |

## 3. Information architecture

Primary surfaces:

- **Header/status bar**: project name, privacy status, export/import, spec
  version, last saved/imported.
- **Platform rail/tabs**: 9 nhóm UI hiện tại và Admicro khi catalog nhập xong.
- **Target picker**: platform/product/surface/placement/device/composition,
  context filters, evidence badges.
- **Editor**: Identity, Copy, Media, Form/Message, Overrides.
- **Preview stage**: single target hoặc compare 2-4.
- **Preflight rail**: issue list, grouped checks, source drawer.
- **Export/review drawer**: manifest, validation summary, unresolved items.

Trên mobile: target picker rút gọn phía trên, preview ngay sau đó, issues kế
tiếp, editor accordion bên dưới.

## 4. Navigation model

Default path:

1. Chọn platform group.
2. Chọn product/surface/placement.
3. Chọn composition hoặc để app gợi ý từ target.
4. Nhập/assign content.
5. Xem preview.
6. Sửa issue.
7. Compare target khác nếu cần.
8. Export snapshot/manifest.

Shortcut path:

- User có thể nhập creative trước, sau đó chọn target; app vẫn phải hiển thị
  unsupported composition thay vì tự đổi nội dung.
- Recent target sets và saved target groups là V1, không bắt buộc MVP.

## 5. Target selection

Target card fields:

- Platform logo/text.
- Product label.
- Placement/surface.
- Device.
- Composition support.
- Evidence badge.
- Implementation/renderer badge.
- Issue summary for current creative.

Filters:

- Platform.
- Product.
- Surface/placement.
- Device.
- Composition.
- Objective.
- Campaign type.
- Market, default Vietnam.
- Account condition, default “không kết nối account”.

Rules:

- Không tạo Cartesian product trong UI.
- Deprecated target không hiện mặc định; có toggle “Hiện mục cũ”.
- Pending/unknown target vẫn có thể xem nếu renderer có skeleton, nhưng không
  tính verified coverage.
- Admicro target có thêm publisher, package và slot filters.

## 6. Editor UX

### Identity

Fields: brand name, handle, logo, avatar.  
Behavior: logo/avatar là asset role; missing logo dùng text fallback; platform
logo không thay thế logo thương hiệu.

### Copy

Fields: primary text, headlines, descriptions, CTA, URL, display path,
disclaimer/extra text khi profile cần.  
Behavior:

- Counter theo target đang active.
- Nếu counting strategy khác grapheme, hiển thị “CJK tính 2” hoặc note tương tự.
- Override theo target có ba mode: inherit, replace, clear.
- “Clear” hiển thị nhãn rõ, không trông như lỗi missing field.

### Media

Fields/actions: upload, role assignment, crop/focal point, order, audio,
thumbnail, metadata status.  
Behavior:

- Nhiều file không tự biến thành carousel nếu user chưa chọn composition.
- Asset role có thể khác target; app gợi ý nhưng không silent mutate.
- File reject có lý do rõ: MIME/signature, SVG/HTML nguy hiểm, size budget,
  unreadable metadata.
- Video still frame giữ timestamp trong render context.

### Form/Message

Fields: form title/body/cover/avatar/questions; message greeting/body/buttons.  
Behavior: preview sau click là mô phỏng; submit/send disabled hoặc noop có nhãn
“Mô phỏng nội bộ”.

### Admicro slot binding

Fields: publisher, slot/package, asset per slot, crop/focal point per slot.  
Behavior:

- Package hiển thị nhiều slot cùng lúc.
- Slot thiếu asset vẫn hiện placeholder.
- Conflict dimension/source hiện ngay trên slot.

## 7. Preview UX

Modes:

- Single preview: default.
- Compare: 2-4 targets.
- Source/Spec drawer overlay.
- Safe zone overlay.
- Export preview review.

Renderer expectations:

- Feed renderer: social/native cards, carousel/multi-image where supported.
- Vertical renderer: stories/reels/shorts/TikTok/Zalo video safe zone.
- Search renderer: Google RSA mobile/desktop variants.
- Banner renderer: fixed display dimensions and simulated context.
- Form renderer: Zalo form after click.
- Chat renderer: ChatGPT web/mobile card.
- Publisher renderer: Admicro simulated page/slot/package.

Preview disclaimers:

- Simulated content must be labelled where relevant.
- Estimated geometry must show badge.
- Reference-only target must not look like verified output.
- No preview says “approved”.

## 8. Preflight UX

Issue groups:

- Blocking fail.
- Warning/recommendation.
- Unknown/conflict.
- Passed checks, collapsed by default.

Each issue shows:

- Target/profile.
- Field or asset role.
- Actual.
- Expected.
- Severity.
- Evidence/source.
- Spec version.
- Action: focus field, show overlay, open source.

Interaction:

- Click issue focuses editor field or preview slot.
- Hover/focus issue highlights preview region when available.
- Source drawer opens without leaving workspace.
- Unknown/conflict remains visible even when all fail/warn fixed.

## 9. Empty, loading and error states

Empty states:

- No target selected: show target picker prompt, not a marketing card.
- No media: render target ratio placeholder with role requirement.
- No source: show `unknown`, owner action and release blocker.
- No Admicro package slot: show source filter instructions and raw source state.

Loading states:

- Media parser pending.
- Import/migration pending.
- Export generating.
- Source drawer loading.

Error states:

- Invalid import schema.
- Asset missing after import.
- Storage quota exceeded.
- Browser cannot decode media.
- Renderer unsupported for target.
- Catalog source conflict.

## 10. Accessibility and keyboard

Keyboard order:

1. Header commands.
2. Platform/target picker.
3. Editor sections.
4. Preview controls.
5. Issue list.
6. Source drawer.
7. Export drawer.

Requirements:

- Every input has visible label.
- Icon-only controls have accessible name.
- Focus ring visible at 3:1 contrast or better.
- Target/issue status not color-only.
- Preview has text alternative for selected target and unresolved state.
- Accordions expose expanded/collapsed state.
- Compare cards preserve logical heading order.

## 11. Responsive behavior

Desktop ≥1240 px:

- Multi-column workspace.
- Preview and preflight visible together.
- Platform/target controls stay near preview.

Tablet 900-1239 px:

- Two columns: editor and preview/issues.
- Target picker compresses into horizontal/stacked sections.

Mobile <900 px:

- Single column: target, preview, issues, editor.
- Sticky bottom command bar for export/compare optional after MVP.
- No horizontal scroll; long platform names wrap inside cards or use shorter
  verified labels.

Minimum visual QA widths: 320, 375, 414, 768, 1024, 1440 px.

## 12. MVP, V1, future

### MVP

Target picker, editor, preview, preflight, source drawer, local export, Admicro
catalog flow, Zalo flow, responsive single-column mobile.

### V1

Persistent projects, review/comments, share links, snapshot history, saved
target sets, RBAC-specific UI, source owner workflow.

### Future

OAuth/import/publish, AI suggestions, billing/entitlements, scheduled reports,
connector health, platform review status. These add security and consent
surfaces and require separate UX spec.

## 13. Acceptance mapping

- `C01-C10`: creative/editor/rule/storage behavior.
- `C11-C12`: V1 review/tenant behavior.
- `D01-D12`: catalog/evidence/source/data behavior.
- `A01-A06`: accessibility and responsive UI behavior.
- `R01-R04`: renderer/export behavior.

Acceptance detail lives in [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md).
