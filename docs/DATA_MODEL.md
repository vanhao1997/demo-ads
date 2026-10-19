# Data model và contract chuẩn

Trạng thái: đề xuất P0B, ngày 12/10/2026. Schema này là contract để triển khai
catalog/editor/renderer; không đồng nghĩa mọi entity đã có trong runtime.

Liên quan:

- [Đặc tả sản phẩm](../AD_PREVIEW_SPEC.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Source registry](SOURCE_REGISTRY.md)
- [Admicro catalog](ADMICRO_CPD_CATALOG.md)
- [Acceptance tests](../ACCEPTANCE_TESTS.md)

## 1. Nguyên tắc

- Creative input, platform spec, evidence và renderer reference là bốn lớp
  khác nhau.
- `platform`, `product`, `surface`, `placement`, `device`, `composition` là
  các trục riêng. Device không phải placement; banner size không phải platform.
- Render và validate dùng resolved input nhưng không mutate canonical input.
- Mọi claim về giới hạn phải có source claim, checked date và evidence level.
- `official`, `estimated`, `reference_only`, `conflict`, `unknown` là trạng
  thái hiển thị; không suy diễn “pass” từ việc preview vẽ được.
- Timestamp lưu UTC; UI mặc định hiển thị `Asia/Ho_Chi_Minh`.

## 2. Entity ownership

### 2.1 Workspace và creative

| Entity | Trường chính | MVP | V1 |
|---|---|---:|---:|
| `Workspace` | `id`, `name`, `timezone`, `accessMode` | local implicit | yes |
| `Project` | `id`, `workspaceId`, `name`, `ownerId`, `status` | session | yes |
| `CreativeSet` | `id`, `projectId`, `name`, `locale`, `version` | local | yes |
| `CreativeVersion` | immutable input, `versionNo`, `createdBy`, `createdAt` | local snapshot | yes |
| `CopySet` | primary text, headlines, descriptions, CTA, URL, paths, disclaimer | yes | yes |
| `Asset` | metadata, role, hash, local/blob ref, parser status | browser memory | private storage |
| `Composition` | kind, asset order, crop, focal point, audio, thumbnail | yes | yes |
| `FormExperience` | OA name, title, body, cover, avatar, questions | simulated | simulated |
| `MessageExperience` | greeting, body, asset, buttons | placeholder | simulated |

MVP asset binary chỉ ở browser session hoặc optional device persistence có
consent. V1 `workspaceId` phải có trên mọi bảng tenant-owned.

### 2.2 Target và catalog

| Entity | Vai trò |
|---|---|
| `Platform` | Facebook, Instagram, Threads, TikTok, YouTube, Google Search, Google Display, ChatGPT, Zalo, Admicro |
| `AdProduct` | social, video, search, display, form, message, commerce, article, website |
| `Surface` | feed, stories, reels, search results, publisher page, app native |
| `PlacementTarget` | target người dùng chọn: platform/product/surface/placement/device/composition |
| `CompatibilityProfile` | điều kiện tổ hợp: objective, campaign type, market, account, identity, fields |
| `SlotSpec` | một vị trí hiển thị có geometry, device/context, asset binding rules |
| `PackageSpec` | một gói gồm nhiều `SlotSpec`, thứ tự và policy asset |
| `SpecProfile` | versioned rule bundle cho một target hoặc slot/package |

`PlacementTarget` là selection state. `CompatibilityProfile` là catalog rule.
Không lưu một object vừa là target selection vừa là source catalog record.

### 2.3 Evidence và renderer

| Entity | Trường chính | Ý nghĩa |
|---|---|---|
| `SourceRef` | `id`, label, URL, authority, checkedAt | nguồn gốc tài liệu |
| `EvidenceClaim` | `id`, sourceRefIds, claim, fieldPath, evidence, confidence, checkedAt, notes | claim nhỏ có provenance |
| `ValidationRule` | rule, operator, expected, severity, claim IDs | điều kiện máy kiểm tra |
| `RendererReference` | target/profile, reference kind, asset/sample ID, capturedAt, status | golden/sample cho hình học |
| `TargetAssetBinding` | target/slot, role, assetId, crop, focal point, resolved source | asset nào đi vào slot |
| `ValidationResult` | rule, status, actual, expected, evidence, source | output của engine |
| `RenderContext` | viewport, locale, UI language, safe zone, video time, device | input tái lập render |
| `ReviewSnapshot` | resolved inputs, hashes, spec/renderer versions, validation summary | snapshot bất biến |

`EvidenceClaim` là nơi lưu claim-level provenance. `SourceRef` không đủ để
biết một source xác nhận field nào; renderer và rule phải tham chiếu claim
hoặc source IDs cụ thể.

## 3. Canonical input

Contract TypeScript mục tiêu:

```ts
type CreativeInput = {
  id: string
  name: string
  locale: string
  version: number
  identity: {
    brandName: string
    handle?: string
    logoAssetId?: string
    avatarAssetId?: string
  }
  copy: {
    primaryText: string
    headlines: string[]
    descriptions: string[]
    cta?: string
    destinationUrl?: string
    displayPath: string[]
    disclaimer?: string
    extraText?: string
  }
  media: {
    primaryAssetId?: string
    items: Array<{
      id: string
      order: number
      assetId: string
      title?: string
      description?: string
      url?: string
    }>
    thumbnailAssetId?: string
    audioAssetId?: string
  }
  form?: FormExperience
  message?: MessageExperience
  composition: Composition
}
```

Adapter profile quyết định field nào được dùng. Không copy max length vào từng
component preview. URL không được fetch trong MVP; chỉ hiển thị/validate scheme.

## 4. Campaign context

```text
CampaignContext
  objective?: awareness | traffic | leads | sales | engagement | unknown
  campaignType?: string
  market: string           // mặc định vi-VN/Vietnam
  accountCondition?: string
  identityMode?: string
  device?: DeviceClass
  locale?: string
  effectiveAt?: timestamp
```

Context là filter/condition, không phải performance analytics. Nếu profile
không có bằng chứng cho context, hiển thị `unknown` hoặc `needs_review`.

## 5. Slot và package

### SlotSpec

```text
SlotSpec
  id
  catalogEntryId
  publisherId?
  label
  surface
  placement
  device
  width?
  height?
  ratio?
  allowedCompositions[]
  assetRoles[]
  copyFields[]
  safeZone?
  evidenceClaimIds[]
  rendererReferenceIds[]
  status: active | deprecated | needs_review
```

`width/height` là source geometry; không tự suy ra “responsive” khi số đo
không có. `safeZone` phải có source/evidence hoặc gắn estimated.

### PackageSpec

```text
PackageSpec
  id
  publisherId
  label
  packageType: homepage_plus | homepage_premium | billboard_plus |
    billboard_premium | other
  slotIds[]
  assetAssignment: per_slot | shared | mixed
  context: CampaignContext
  sourceRefIds[]
  status
```

Admicro package cho phép nhiều slot trong một simulated publisher page. Asset
binding từng slot phải rõ; không biến package thành một ảnh kéo dãn.

## 6. TargetAssetBinding

Mỗi target hoặc slot có thể có binding độc lập:

```text
TargetAssetBinding
  id
  targetId
  slotId?
  assetId
  role
  crop: contain | cover
  focalPoint?: { x: number; y: number }
  order?
  source: inherited | target_override | slot_override
  createdAt
```

Binding không sửa asset gốc. Khi đổi target, binding cũ được giữ để quay lại
không mất crop/focal point. Override copy dùng `inherit`, `replace`, `clear`;
`clear` là chủ ý để trống và không rơi về default.

## 7. Rule và result contract

```text
validate(resolvedCreative, target, specProfile, context)
  -> ValidationResult[]

ValidationResult
  ruleId
  fieldPath
  status: pass | warn | fail | unknown
  severity: fail | warn
  actual?
  expected?
  sourceRefIds[]
  evidence
  confidence
  specVersion
  createdAt
  notes?
```

Semantics:

- `fail`: vi phạm bắt buộc đã đủ evidence.
- `warn`: recommendation hoặc geometry risk.
- `unknown`: source conflict, metadata không đọc được, hoặc điều kiện chưa rõ.
- `pass`: chỉ khi rule thật sự được kiểm tra. Không có lỗi không có nghĩa toàn
  creative đã được platform duyệt.

Counting strategy phải lưu trong rule (`grapheme`, `cjk_weighted`, v.v.). Fixture
phải có emoji, dấu tiếng Việt tổ hợp, CJK, newline và zero-width.

## 8. Versioning và snapshot

- `catalogVersion`, `specVersion`, `rendererVersion` là immutable identifiers.
- Profile ID hiện có phải giữ nguyên; rename dùng display label/migration.
- `effectiveAt=null` khi source không nêu ngày hiệu lực.
- `checkedAt` không được dùng thay `effectiveAt`.
- `ReviewSnapshot` lưu resolved input, asset hash, crop/focal point, render
  context, validation summary, source/spec/renderer versions.
- Approved snapshot V1 không thay đổi khi catalog/copy mới; sửa tạo version mới.
- Import schema lạ phải migrate đã biết hoặc từ chối rõ; không âm thầm bỏ asset.
- Không tin metadata import/media do client gửi; parser/server V1 phải xác minh.

### Device mockup context (MVP renderer 0.3)

`DeviceMockupContext` lưu `id`, `viewport: { width, height }` và `scrollTop`.
Hai preset hiện có: `iphone-15-16` (393 x 852 logical points) và `pc-1440`
(1440 x 900 CSS pixels). Kích thước screen độc lập với bezel, stand và metadata
review ở ngoài frame; 6.1 inch là nhãn thiết bị, không phải kích thước vật lý
đo trên màn hình người xem.

Lựa chọn `target | mobile | pc` là view state trong session. Auto dùng PC cho
target `Desktop`/`Web`, iPhone cho target còn lại. Không sửa profile, crop,
asset binding hoặc rule validation khi đổi frame. Scale dùng cùng một hệ số
cho cả hai trục, giới hạn theo width/height của panel và không phóng lớn quá 1x.

Khi export, viewport và vị trí cuộn lấy từ DOM tại thời điểm capture, lưu ở
`manifest.renderContext.deviceMockup` và `snapshot.renderSettings.deviceMockup`.
PNG gồm frame và metadata review, raster ở 2x kích thước canonical. Clone export
dịch nội dung theo `scrollTop` để giữ phần đang xem; video giữ `videoTimeMs`.
Review ZIP schema 1 thêm field optional; package cũ không cần field này.
Mockup là mô phỏng thiết bị, không nâng trạng thái nguồn thành verified.

### Platform presentation context (MVP renderer 0.4)

`PreviewPresentation` is display state: `locale: vi | en`, `appChrome: boolean`,
`captionMask: boolean`, `topViewPhase: intro | feed`. It belongs to the current
view, outside EditorDraft, media metadata, catalog validation and analytics.
Placement variant derives from profile ID. Guides use normalized percentage
rectangles on the creative canvas, carry `estimated` confidence and the public
Noti reference. Red marks baseline occlusion; orange marks optional caption
expansion. Zalo video uses an independent estimated preset, not a Noti sample.

Engagement counts and surrounding posts/articles/prompts are static demo
fixtures. They are not real impressions or metrics, have no sync interval,
and never enter validation, hashes, creative copy or spec evidence.
VI/EN changes native UI labels and known CTA presets only, preserving custom
advertiser copy. TopView intro hides simulated app overlays; selected guides
remain independent. Frame choice does not change the selected placement.

Review context schema1 adds optional `appChrome`, `captionMask`, `topViewPhase`
alongside existing `locale`. Snapshot settings retain the same fields; old
packages remain readable. Export records rendered state from DOM and renderer
version0.4 so a screenshot's UI language and guides can be audited.
See [Noti study](NOTI_STUDY.md) for observations, primary cross-checks and limits.

## 9. Persistence, tenant và retention

MVP:

- Session-only mặc định.
- Optional device draft phải báo rõ và có nút xóa.
- JSON không chứa Blob/Object URL; asset không có binary phải chọn lại.
- Không upload binary qua network; verify bằng network log ở P3.

V1:

- Mọi bảng tenant-owned có `workspaceId`.
- Foreign key và unique key phải kèm workspace boundary.
- Private object storage, signed URL ngắn hạn, encryption at rest, TTL và
  deletion theo workspace.
- API lấy workspace từ session membership, không tin `workspaceId` trong body.

Index đề xuất: project `(workspaceId, updatedAt)`, creative
`(workspaceId, projectId, updatedAt)`, version unique
`(workspaceId, creativeId, versionNo)`, asset `(workspaceId, sha256)`,
comment `(workspaceId, reviewSnapshotId, createdAt)`.

## 10. Freshness và sync

| Dữ liệu | Grain | Nguồn | Freshness/sync |
|---|---|---|---|
| Creative input | creative version/target | user input | realtime trong session |
| Media metadata | từng asset | browser parser | khi chọn file; pending nếu chưa đọc |
| Platform rule | spec/profile/rule | source registry | review hàng tháng hoặc khi source đổi |
| Admicro slot | slot/package/source row | PDF + spreadsheet chain | snapshot source; không hứa current availability |
| Validation | target + rule + render context | rule engine | mỗi khi input/target/context đổi |
| Review snapshot | immutable version | resolved input + catalog | ghi lúc export/review |

Không có sync quảng cáo, metrics, campaign performance hoặc publishing trong
MVP. V1 autosave đề xuất debounce 2 giây và optimistic concurrency.

## 11. Acceptance mapping

- `D01-D12`: schema, source provenance, catalog, package/slot, versioning.
- `C01-C10`: input/override/rule/storage boundary hiện có.
- `C11-C12`: immutable review và tenant isolation V1.
- `R01-R04`: renderer/reference/snapshot/export.
- `A01-A06`: keyboard, labels, focus, contrast, reduced motion và responsive.

Wording chi tiết nằm ở [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md); schema này
chưa phải migration SQL hoặc API implementation.
