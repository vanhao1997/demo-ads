# Kế hoạch triển khai Adcraft Preview Lab

Trạng thái: kế hoạch triển khai và quản trị dữ liệu, baseline ngày 12/10/2026.  
Plan và contract vẫn là chuẩn phạm vi. Kết quả triển khai/QA hiện tại nằm trong
[release evidence](RELEASE_EVIDENCE.md); code có renderer không đồng nghĩa
coverage platform đã verified.

Đọc cùng:

- [Đặc tả sản phẩm](../AD_PREVIEW_SPEC.md)
- [Ma trận platform](../PLATFORM_MATRIX.md)
- [Design guideline](../design.md)
- [UI/UX spec](../UI_UX_SPEC.md)
- [Acceptance tests](../ACCEPTANCE_TESTS.md)
- [Visual QA](../VISUAL_QA.md)
- [Data model](DATA_MODEL.md)
- [Source registry](SOURCE_REGISTRY.md)
- [Brand assets](BRAND_ASSETS.md)
- [Admicro CPD catalog](ADMICRO_CPD_CATALOG.md)
- [Decision log](DECISIONS.md)

## 1. Mục tiêu sản phẩm

Team nhập một creative và chọn các target quảng cáo cần kiểm tra. Ứng dụng dựng
preview theo từng platform, product, placement, device và composition; đồng thời
chỉ ra lỗi hoặc điều kiện chưa đủ bằng chứng trước khi creative được đưa vào
Ads Manager.

Mục tiêu MVP:

- Chọn target theo catalog, có target-first flow.
- Một preview làm mặc định; compare từ 2 đến 4 target khi cần.
- Nhập copy, media, logo/avatar, form và audio theo profile.
- Chạy rule engine chung cho editor và preview.
- Hiển thị `pass`, `warn`, `fail`, `unknown` cùng actual, expected, nguồn và
  phiên bản spec.
- Preview các tổ hợp cốt lõi của Facebook, Instagram, Threads, TikTok,
  YouTube, Google Search, Google Display, ChatGPT và Zalo.
- Bổ sung catalog CPD homepage của Admicro, kèm mô phỏng publisher context và
  package nhiều slot.
- Export still image/package có manifest để review nội bộ.

Ranh giới MVP:

- Local-first, session-only mặc định; binary không gửi lên server.
- Không OAuth, không kết nối tài khoản quảng cáo, không publish, không booking
  vị trí, không payment/subscription.
- Không dùng live publisher iframe hoặc script quảng cáo.
- Không gọi mockup là quảng cáo chắc chắn được duyệt.

## 2. Baseline hiện tại

MVP local hiện có React/TypeScript/Vite, editor, target picker, preview feed /
vertical / search / banner / form / chat, copy override, undo/redo, import /
export JSON, media inspection và validation engine. Catalog runtime hiện có
nhóm platform chính, các profile Zalo, source IDs E13-E18 và dynamic Admicro
CPD profiles. Admicro source snapshot vẫn `needs_review`; chưa phải current
availability hoặc pricing.

Test, build, visual QA và acceptance được ghi theo lần kiểm tra trong release
evidence. P3 phải chạy lại các check liên quan khi code thay đổi.
`implementation=implemented` chỉ nói renderer/rule đang có code; không thay
thế điều kiện `evidence`, golden reference hoặc acceptance.

## 3. Nguyên tắc kiến trúc

### 3.1 Tách bốn lớp dữ liệu

1. **Creative input**: copy, asset, identity, form, message, composition.
2. **Catalog/spec**: platform, product, surface, placement, slot/package,
   rule, điều kiện market/account/objective.
3. **Evidence**: nguồn, claim, ngày kiểm tra, độ tin cậy, conflict.
4. **Renderer**: adapter và reference dùng để dựng preview.

Renderer không sửa canonical input. Rule engine không suy ra support chỉ từ
việc renderer có thể vẽ một card. Catalog không lấy dữ liệu pricing hoặc
availability cũ làm trạng thái active.

### 3.2 Công nghệ

- MVP: React + TypeScript + Vite, catalog JSON versioned trong repo.
- State: reducer hoặc Zustand có history; giữ API có thể thay bằng store server
  ở V1.
- Validation: một rule engine dùng chung cho editor, preflight và export.
- Media metadata/frame sampling: Web Worker khi tác vụ nặng.
- V1: TypeScript API, PostgreSQL, private object storage nếu team cần cộng tác.

Đây là lựa chọn triển khai, chưa chốt hosting/provider. Mọi package mới phải
được ghi trong decision log và kiểm tra license/bundle impact.

## 4. Work packages

### P0A — Documentation và governance

Deliverables:

- Sáu tài liệu trong `docs/`.
- Root design/UI/UX/QA docs do owner tương ứng duy trì.
- Source ID E01-E18, status/evidence vocabulary, decision log.
- Danh sách evidence gate và owner catalog.

Điều kiện hoàn tất:

- Không có claim “MVP hoàn tất” trong docs khi acceptance chưa chạy.
- Mỗi work package có acceptance reference.
- Nguồn stale/conflict được hiển thị như rào chắn, không bị ép thành pass.

Acceptance tham chiếu: `D01-D03`, `A01-A02`, `R01`.

### P0B — Canonical data và catalog

Deliverables:

- Bổ sung schema cho `CampaignContext`, `SlotSpec`, `PackageSpec`,
  `TargetAssetBinding`, `EvidenceClaim`, `RendererReference`.
- Migrate source registry E01-E12 thành E01-E18 mà không đổi ID cũ.
- Normalize catalog platform hiện có.
- Nhập Admicro CPD raw snapshot, giữ source row/cell/conflict.
- Đặt trạng thái độc lập: support, implementation, evidence, renderer.

Điều kiện hoàn tất:

- Có fixture cho source provenance, conflict và deprecated profile.
- Không dedupe làm mất dòng nguồn.
- Import không làm biến raw source thành current availability.
- `workspace_id` và version rule được thiết kế trước V1 API/DB.

Acceptance tham chiếu: `C02`, `C05-C07`, `D01-D12`.

### P1 — Editor, target selection và rule engine

Deliverables:

- Target-first flow: platform/product/surface/placement/device/composition.
- Context filter tùy chọn: objective, campaign type, market, account condition;
  mặc định Vietnam, không cần kết nối account.
- Copy override `inherit | replace | clear`.
- Asset role, crop/focal point, safe-zone settings, video timestamp.
- Rule output có actual/expected/severity/source/spec version.
- Unknown/conflict không bị chuyển thành pass.

Điều kiện hoàn tất:

- Editor và preview nhận cùng resolved input.
- Đổi target không làm mất copy/asset gốc hoặc override target khác.
- Composition không tự đổi khi upload nhiều file.
- Form/Message là mô phỏng, không submit/gửi dữ liệu thật.

Acceptance tham chiếu: `C01-C10`, `D04-D07`, `A03-A04`.

### P2 — Renderers và Admicro publisher context

Deliverables:

- Renderer registry theo `RendererKind` và profile.
- Single preview mặc định; compare 2-4.
- Feed, vertical, search, fixed banner, form, chat, carousel/multi-image và
  still video frame.
- Overlay safe zone và nhãn estimated/reference/needs review.
- Admicro simulated publisher page: chọn publisher, slot, package; gán asset
  theo slot; hỗ trợ package nhiều slot.

Điều kiện hoàn tất:

- Mỗi profile phát hành có renderer reference hoặc nhãn pending rõ.
- Admicro không dùng iframe/live page; slot không có evidence chỉ dựng
  skeleton/estimated.
- Render ổn định theo `RenderContext`, không phụ thuộc viewport ngoài contract.
- Export ghi timestamp, asset hash, renderer version và spec version.

Acceptance tham chiếu: `C01-C04`, `C08`, `D08-D12`, `R01-R04`.

### P3 — QA, accessibility và release gate

Deliverables:

- Unit/integration regression cho catalog, rule, storage, media.
- Golden fixtures cho target đã verified.
- Visual QA desktop/mobile theo `VISUAL_QA.md`.
- Keyboard, focus, reduced motion, text alternative, contrast và no-color-only
  states.
- Network check chứng minh binary không rời browser trong MVP.
- Performance budget đo trên máy/browser team, không lấy trần website tham
  chiếu làm resource limit.

Điều kiện hoàn tất:

- Các case MVP C01-C10, D01-D10 pass hoặc có exception được ghi rõ;
  C11-C12 và D11-D12 thuộc release V1/P4.
- A01-A06 và R01-R04 pass theo acceptance owner.
- Profile pending/conflict không được tính vào verified coverage.
- Có rollback/disable path khi catalog rule sai.

Acceptance tham chiếu: `C01-C12`, `A01-A06`, `R01-R04`.

### P4 — V1 cộng tác nội bộ

Deliverables:

- SSO/access gateway, workspace/project/creative/version persistence.
- RBAC owner/editor/reviewer/viewer, audit log, review workflow.
- Review snapshot bất biến, share link expiry/revoke.
- Backend validation lặp lại client rule; private asset storage.
- Optimistic concurrency, cursor pagination, idempotent export/upload.

Điều kiện hoàn tất:

- Tenant isolation ở API, DB, object storage.
- Viewer/reviewer không có quyền sửa/upload ngoài contract.
- Snapshot cũ không thay đổi khi catalog/copy mới.
- Không triển khai billing/subscription nếu chưa có business case.

Acceptance tham chiếu: `C11-C12`, `D10-D12`, `A05-A06`.

## 5. Phân kỳ tính năng

### MVP

Catalog và editor local; rule engine; preview core; Zalo native/Form/Display/
Video conflict; Admicro CPD catalog và publisher simulation; compare; export
manifest/still; session-only; source/evidence labels.

### V1

SSO/RBAC; persistence; review/comment; snapshot/share; expanded renderer;
verified golden references; Admicro conflict resolution; API/DB/private
storage; server-side validation.

### Future

OAuth/connectors; sync spec/creative; publishing; AI review; HTML5/playable;
booking/media buying; billing; analytics performance. Mọi feature Future cần
security, consent, platform review và retry contract riêng.

## 6. Thứ tự triển khai

1. P0A: merge docs và acceptance vocabulary.
2. P0B: chốt data model, source registry, Admicro raw import.
3. P1: target/context/editor/rule contract.
4. P2: renderer registry, verified samples, Admicro context.
5. P3: functional, visual, accessibility, privacy/network và release gate.
6. P4: chỉ bắt đầu khi team xác nhận nhu cầu cộng tác và access model.

Không bắt đầu feature renderer mới nếu profile chưa có evidence status và
reference policy. Không mở backend chỉ để lưu binary trước khi có yêu cầu
cộng tác, retention và tenant model được duyệt.

## 7. Security, tenant, sync và billing boundary

- MVP không đăng nhập, không multi-tenant server, không gửi binary, không
  publish và không billing. Khi host nội bộ, phải có SSO/VPN/access gateway
  trước khi team dùng dữ liệu khách hàng.
- V1 tenant isolation phải enforce ở API/DB/storage; không dựa vào hidden
  field ở frontend.
- Token/OAuth chỉ xuất hiện ở Future connector; secret không vào catalog,
  export manifest hoặc client log.
- Sync V1 dùng revision/timestamp, debounce autosave đề xuất 2 giây, retry
  bounded/backoff; conflict phải giữ nội dung mới hơn và báo người dùng.
- Billing/subscription không thuộc MVP/V1 mặc định. Nếu mở, entitlement và
  usage limit là domain riêng, không trộn vào validation pass/fail.

## 8. Evidence gates chưa đóng

- E13 chỉ mô tả Google campaign objectives/types; chưa dùng làm creative
  dimension rule.
- E14 là quan hệ objective × placement × format; toàn bộ row Meta vẫn cần
  Ads Manager/golden reference trước khi gắn verified.
- E15 TikTok TRAY là tài liệu integration-specific; không áp làm spec chung.
- E16 TikTok placement có market restriction; phải lưu điều kiện thị trường.
- E17 Admicro có ngày tài liệu không đồng nhất, duplicate/conflicting rows và
  không đủ bằng chứng current availability/pricing.
- E18 xác nhận inventory icon/brand source; bảy SVG và file/hash local đã
  bundle từ Simple Icons. Trademark review vẫn mở (`review_required`).
- Zalo video vẫn có conflict 150 MB và 10 MB; không xanh pass chung.

## 9. Validation cadence

- Mỗi source/profile: `checked_at`, `next_review_at`, owner, claim-level source.
- Review hàng tháng hoặc ngay khi platform phát hành thay đổi.
- Mỗi catalog PR phải có fixture trước/sau, source diff và reviewer.
- Mỗi renderer PR phải chạy C/R acceptance liên quan và screenshot golden.
- Release note phải nói rõ profile nào mới verified, pending, deprecated hoặc
  conflict.

Các acceptance ID trong tài liệu này là liên kết rộng tới bộ test; wording và
case cụ thể do [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md) định nghĩa. Đây là
plan triển khai, chưa phải kết quả nghiệm thu.
