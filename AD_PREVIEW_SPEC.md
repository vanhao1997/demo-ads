# Adcraft Preview Lab

Đặc tả cho công cụ nội bộ xem trước và kiểm tra quảng cáo đa nền tảng.

Ngày khảo sát: 12/10/2026, múi giờ Asia/Ho_Chi_Minh. Trạng thái: đặc tả và plan triển khai đã được khóa ở mức tài liệu; workspace có MVP React/TypeScript local với kết quả kiểm tra ghi tại [release evidence](docs/RELEASE_EVIDENCE.md). Kiểm tra runtime không đồng nghĩa coverage platform đã verified. Đã đọc giao diện công khai và tài liệu; không có mã nguồn/private API của hai website tham chiếu.

Tài liệu đi kèm: [ma trận phạm vi và bằng chứng](PLATFORM_MATRIX.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md), [data model](docs/DATA_MODEL.md), [source registry](docs/SOURCE_REGISTRY.md), [design guideline](design.md), [UI/UX spec](UI_UX_SPEC.md), [acceptance tests](ACCEPTANCE_TESTS.md) và [visual QA](VISUAL_QA.md). Danh sách của Noti là inventory tham chiếu gồm 34 mẫu placement/device/size, không phải bằng chứng rằng 34 placement đều đang chạy hoặc mọi định dạng đều được hỗ trợ.

## 1. Mục tiêu và ranh giới

Team nhập nội dung và tài nguyên một lần, sau đó xem cùng một creative ở nhiều nền tảng, định dạng và vị trí. Công cụ cần chỉ ra lỗi kích thước, tỷ lệ, dung lượng, số lượng asset, giới hạn ký tự và vùng an toàn trước khi team gửi quảng cáo lên nền tảng.

MVP chỉ preview và preflight trong trình duyệt. Không đăng quảng cáo, không OAuth, không gọi API quảng cáo, không lưu ảnh/video lên server. Persisted metadata (nếu bật ở V1) phải tách khỏi binary asset.

Không dùng mockup để tuyên bố quảng cáo chắc chắn được duyệt. Mỗi kết quả phải có nhãn `official`, `estimated`, `heuristic` hoặc `unsupported`.

Vai trò sử dụng: designer kiểm tra crop/safe zone, copywriter kiểm tra nội dung, media buyer chọn target, reviewer phê duyệt phiên bản nội bộ. Ngôn ngữ nội dung ưu tiên tiếng Việt; có tùy chọn UI quảng cáo Việt/Anh. Không đưa ngân sách, targeting, bidding hay báo cáo ROAS vào scope preview.

## 2. Mô hình dữ liệu chuẩn

```text
Workspace
  Project
    CreativeSet
      CopySet
      Asset[]
      CreativeVariant[]
        PlacementTarget[]
          ValidationResult[]
```

Các bảng/entity chính:

| Entity | Trường chính |
|---|---|
| `Workspace` | `id`, `name`, `timezone`, `created_at` |
| `Project` | `id`, `workspace_id`, `name`, `owner_id`, `status` |
| `CreativeSet` | `id`, `project_id`, `name`, `objective`, `locale`, `version` |
| `CopySet` | `brand_name`, `handle`, `primary_text[]`, `headlines[]`, `descriptions[]`, `cta`, `destination_url`, `display_path[]`, `disclaimer` |
| `Asset` | `id`, `kind=image\|video\|audio`, `roles[]`, `blob_ref`, `mime`, `bytes`, `width`, `height`, `duration_ms`, `codec`, `metadata_status`, `sha256` |
| `CreativeVariant` | `id`, `creative_set_id`, `composition=single_image\|multi_image_grid\|single_video\|carousel\|text_only\|responsive_asset_set`, `copy_overrides`, `asset_ids[]`, `items[]` |
| `PlacementTarget` | `platform_id`, `ad_product_id`, `surface_id`, `placement_id`, `composition`, `device`, `locale`, `objective`, `identity_mode` |
| `CompatibilityProfile` | tổ hợp target, `support_status`, điều kiện objective/market/account, danh sách field được dùng, số card và liên kết |
| `SpecProfile` | `platform`, `product`, `placement`, `composition`, `spec_version`, `effective_at`, `source_url`, `source_checked_at`, `confidence` |
| `ValidationRule` | `rule_id`, `spec_profile_id`, `field`, `operator`, `value`, `severity`, `message`, `source_ref` |
| `ValidationResult` | `rule_id`, `status=pass\|warn\|fail\|unknown`, `actual`, `expected`, `evidence`, `created_at` |
| `ReviewSnapshot` | `creative_version_id`, `selected_targets[]`, `resolved_inputs`, `asset_hashes[]`, `renderer_version`, `spec_versions[]`, `render_settings`, `validation_summary`, `created_by` |

`workspace_id` phải có trên mọi entity lưu lâu dài. Asset lưu local trong MVP; nếu có server storage, dùng signed URL, mã hóa at rest, TTL và xóa theo workspace.

`logo`, `avatar`, `thumbnail`, `cover` là vai trò của asset, không phải MIME/media type. `Form`, `Message`, `Display` là ad product hoặc trải nghiệm sau click; không trộn với composition. Mỗi variant có thể có cả creative trước click và Form/kịch bản tin nhắn sau click.

Quy tắc quan hệ và phiên bản:

- Tenant-owned tables dùng `UNIQUE(workspace_id, id)` và foreign key có `workspace_id` để không liên kết project/asset khác workspace. Catalog công khai là dữ liệu chung, không chứa creative.
- `CreativeVersion` bất biến khi gửi review; giữ input đã resolve, asset hash, crop/focal point từng target, và phiên bản rule/renderer.
- `CarouselCard` có thứ tự, asset, title/description/URL tùy profile; âm thanh hoặc URL chung đặt ở creative. Không bật URL từng card cho TikTok Standard Carousel.
- Copy override dùng trạng thái `inherit`, `replace`, `clear`; xóa chủ ý không tự rơi về nội dung mặc định. Field không dùng vẫn được giữ khi đổi target.
- Index V1: project `(workspace_id, updated_at)`, creative `(workspace_id, project_id, updated_at)`, version `(workspace_id, creative_id, version_no)` unique, asset `(workspace_id, sha256)`, comment `(workspace_id, review_snapshot_id, created_at)`.
- Timestamp lưu UTC; hiển thị Asia/Ho_Chi_Minh mặc định. Spec không biết ngày có hiệu lực phải lưu `effective_at=null`, không lấy ngày khảo sát thay cho ngày hiệu lực.

### Canonical creative schema

```ts
type CreativeInput = {
  identity: { brandName: string; handle?: string; logo?: AssetRef; avatar?: AssetRef };
  copy: {
    primaryText?: string;
    headlines: string[];
    descriptions: string[];
    cta?: string;
    destinationUrl?: string;
    displayPath?: string[];
    disclaimer?: string;
  };
  media: {
    primary?: AssetRef;
    items?: Array<{ id: string; order: number; asset: AssetRef; title?: string; description?: string; url?: string }>;
    thumbnail?: AssetRef;
    audio?: AssetRef;
  };
  form?: {
    title: string;
    body: string;
    cover?: AssetRef;
    questions: Array<{ key: string; label: string; required: boolean }>;
  };
};
```

`CreativeInput` là dữ liệu chung. Adapter của từng nền tảng quyết định field nào được dùng, cắt ở đâu và render thế nào. Không copy logic giới hạn ký tự vào từng component preview.

Schema trên là minh họa contract, chưa phải code triển khai. `AssetRef` tham chiếu asset đã parse metadata; Object URL chỉ dùng trong session. Validation server V1 phải lặp lại kiểm tra, không tin metadata phía client.

## 3. Catalog nền tảng và placement

Các trục bắt buộc: `platform`, `ad_product`, `surface`, `placement`, `composition`, `device`. UI có thể chọn theo thứ tự, nhưng database lưu compatibility profile cho từng tổ hợp; device không phải placement, kích thước banner không phải nền tảng. Mỗi mục có `status=active\|deprecated\|needs_review` và nguồn.

### Catalog kế thừa từ Noti

- Meta: Facebook Feed, Video Feeds, Stories, Reels, Reels banner, In-stream, Marketplace, Search results, Right column, Audience Network.
- Instagram: Feed, Stories, Reels.
- Threads: Feed.
- TikTok: In-feed, TopView.
- YouTube: skippable in-stream, non-skippable in-stream, bumper, desktop in-stream, in-feed, Shorts.
- Google Search: mobile, desktop.
- Google Display: 300x250, 336x280, 728x90, 300x600, 160x600, 320x100, 320x50, native in-article.
- ChatGPT: web, mobile app; standard chat card.

### Zalo Ads cần bổ sung

Ad Checker của Zalo hiện có các luồng `Kiểm tra chữ trên ảnh`, `Nội dung Form`, `Quảng cáo Display` và `Safe zone Video`. Trang vị trí hiển thị nêu các card Zalo News Feed, Zalo Article, Zalo Article Native, OA Suggestion, Baomoi App Native 1/2/3 và Zing.vn App Native; nhãn “7 vị trí” và số card hiển thị cần được kiểm tra lại theo từng phiên bản.

Product/format cần có:

| Product | Format/field cần preview |
|---|---|
| Website/OA/Message | single image, video, text, CTA, brand/logo, description |
| Form | OA name, form title, form body, avatar 150x150, cover 1024x533, fixed name/phone fields, custom questions |
| Commerce/Product | product image(s), price/product data, CTA; multi-image riêng với carousel |
| Video | MP4 H.264, ratio 16:9/9:16/1:1, caption, thumbnail, audio state, safe zone |
| Display | masthead, masthead mobile, in-page/full-page, welcome mobile, halfpage, medium rectangle |

Multi-image Zalo (512x512, tối đa 4 ảnh theo hướng dẫn tạo quảng cáo) phải có mode riêng. Chỉ gọi là `carousel` khi placement/spec chính thức xác nhận hành vi vuốt và card-level URL/title.

## 4. Spec profile quan trọng

### Google Search / Responsive Search Ad

- 3–15 headlines, tối đa 30 ký tự mỗi headline.
- 2–4 descriptions, tối đa 90 ký tự mỗi description.
- Display path tối đa 15 ký tự mỗi phần.
- Preview phải render nhiều tổ hợp, không coi một tổ hợp là toàn bộ output.
- Ký tự CJK có thể tính hai đơn vị; bộ đếm phải khai báo counting mode.

### Google Display

MVP có bộ banner cốt lõi trong ma trận. V1 mở rộng catalog uploaded display chính thức (GIF/JPG/PNG, max 150KB; 20 size gồm 200x200, 240x400, 250x250, 250x360, 300x250, 336x280, 580x400, 120x600, 160x600, 300x600, 300x1050, 468x60, 728x90, 930x180, 970x90, 970x250, 980x120, 300x50, 320x50, 320x100), lưu điều kiện thị trường nếu có. Responsive Display dùng asset set và nhiều mẫu output; không lấy banner JPG cố định để đại diện toàn bộ Responsive Display.

### TikTok

Ngoài video In-feed/TopView, scope MVP có Standard Carousel: 2–35 ảnh, JPG/JPEG/PNG, các khung horizontal 1200x628, square 640x640, vertical 720x1280; một caption, CTA và URL chung; music bắt buộc. 100KB/ảnh là mức khuyến nghị trong nguồn, không được biến thành lỗi cứng. VSA Carousel và TikTok Ad Network có profile riêng ở V1/Future vì card/link/music khác. Không nhúng hoặc sao chép thư viện nhạc nền tảng; team khai báo nguồn và quyền sử dụng nhạc.

### ChatGPT Ads

Standard `chat_card`: title 3–50 ký tự, body tối đa 100, HTTP(S) destination, ảnh JPEG/PNG/WebP tối thiểu 640x640. Availability và spec phải có ngày kiểm tra; không giả định mọi workspace đều được phân phối.

### Zalo: nguồn và xung đột cần version hóa

- Nội dung chung trên Ad Checker: brand/OA 30, content 90, description 60, extra 60; Form checker riêng: OA 40, form title 40, form body 600; avatar 150x150, tối đa 2MB.
- Cover Form: 1024x533, tối đa 2MB.
- Display: masthead 970x250, masthead mobile 640x360, in-page/full-page/welcome 640x1500, halfpage 300x600, medium rectangle 300x250; tài liệu Display ghi tối đa 250KB.
- Video Ad Checker: MP4 H.264, 16:9/9:16/1:1, tối đa 150MB. Hướng dẫn tạo video có giới hạn thời lượng 60 giây; FAQ cũ có nơi ghi 10MB và 16:9. UI phải hiển thị nguồn, ngày kiểm tra và `needs_review` khi profile xung đột.
- Hướng dẫn tạo quảng cáo nêu ảnh 1024x533 tối đa 2MB hoặc tối đa 4 ảnh 512x512; caption tối đa 90 ký tự và không chứa số điện thoại/link website.

## 5. UX đề xuất

1. **Creative workspace**: trái là input theo nhóm Identity, Copy, Media, Form; phải là preview.
2. **Target matrix**: filter platform/product/device/format; lưu bộ target hay dùng.
3. **Preview modes**: single card, carousel swipe, video frame scrubber, placement grid, fullscreen phone/desktop.
4. **Preflight rail**: group lỗi theo asset, copy, placement, policy; mỗi lỗi có actual/expected, source, severity và nút focus field.
5. **Spec drawer**: xem thông số, nguồn, `checked_at`, confidence, conflict.
6. **Review snapshot**: xuất PNG + manifest ở MVP, PDF/share nội bộ ở V1; snapshot phải ghi hash asset và spec version để tái lập kết quả.

Không tự biến nhiều ảnh upload thành carousel. Hỏi chọn bố cục trong UI: album/grid, carousel, bộ biến thể A/B hoặc responsive asset set. Khi target không hỗ trợ bố cục đã chọn, hiển thị lý do và gợi ý tạo variant, không âm thầm bỏ asset.

Thiết lập render bao gồm kích thước viewport, safe zone, crop `contain/cover`, focal point, hướng thiết bị, ngôn ngữ UI, thời điểm video và caption mở/đóng. Giao diện review ở mobile phải dùng được; không chỉ thu nhỏ nguyên layout desktop.

Form/Message là mô phỏng: nút submit/send không thu lead hoặc gửi tin nhắn thật. Số reaction, bình luận và nội dung bài xung quanh là dữ liệu demo được đánh dấu, không phải số liệu hiệu suất quảng cáo.

Accessibility: keyboard navigation, visible focus, no color-only error state, text alternative cho preview, reduced-motion option.

## 6. Kiến trúc kỹ thuật

- Frontend React/TypeScript; renderer dùng component registry: `PlatformAdapter`, `PlacementRenderer`, `RuleEngine`.
- Worker local cho metadata video, thumbnail và frame sampling; không gửi binary đi ngoài.
- Spec catalog là JSON versioned trong repo ở MVP; backend/Postgres ở V1 khi cần team sharing.
- Render không được mutate canonical input. Adapter nhận `CreativeInput + SpecProfile + RenderContext` và trả `RenderTree + ValidationResult[]`.
- Tách `official` rules khỏi `estimated` UI geometry. Không đưa heuristic text/OCR vào kết quả “pass” chính thức.

Module đề xuất:

```text
src/domain/       creative, asset, version, review, compatibility contracts
src/catalog/      profiles, source registry, version migrations
src/adapters/     facebook, instagram, threads, tiktok, youtube, google, zalo, chatgpt
src/validation/   rule engine, counting strategies, media checks
src/renderers/    feed, vertical-video, carousel, search, banner, form, chat-card
src/workers/      media metadata, thumbnails, frame sampling
src/storage/      memory, optional IndexedDB, versioned import/export
src/features/     editor, target picker, compare grid, preflight, export
```

MVP trình duyệt đã dùng React + TypeScript + Vite, history hook cho undo/redo và parser kiểm tra schema import. Web Worker là hướng tách tác vụ nặng khi có phép đo cần thiết. V1 đề xuất backend TypeScript, PostgreSQL và S3-compatible private storage nếu cần cộng tác; chưa chốt nhà cung cấp hosting.

Export image cần font và ảnh đã decode; ảnh remote có thể gây lỗi canvas/CORS. MVP chỉ nhận file local, URL đích được hiển thị như text, không tự fetch landing page. Video export MVP là still frame có ghi timestamp, không xuất video động; PDF cần snapshot chứ không giữ tương tác.

### Contract validation

`validate(resolvedCreative, target, specProfile)` trả danh sách `{ruleId, fieldPath, severity, status, actual, expected, source, confidence}`. `render()` dùng cùng input đã resolve và giữ nội dung gốc.

- `fail`: vi phạm thông số bắt buộc đã xác minh.
- `warn`: khuyến nghị hoặc rủi ro bố cục.
- `unknown`: rule xung đột, chưa có nguồn, hoặc metadata không đọc được.
- `pass`: chỉ cho rule đã thực sự kiểm tra; không có lỗi không đồng nghĩa toàn creative đạt chuẩn.
- Đếm ký tự hiển thị bằng grapheme để người dùng hiểu; đếm giới hạn nền tảng bằng strategy riêng. Có fixture emoji, dấu tiếng Việt tổ hợp, CJK, xuống dòng và ký tự zero-width. Không khẳng định mọi nền tảng đều đếm theo grapheme.
- Codec không xác định từ MIME/đuôi file: `unknown` nếu parser không xác minh được. Browser phát được video không chứng minh codec được nền tảng nhận.
- Crop/truncation là kết quả mô phỏng, không sửa asset/copy gốc. Thiếu media vẫn dựng placeholder có nhãn.
- Giữ preview khi creative có lỗi để team sửa. Khi export, kèm lỗi; không xuất nhãn “pass” nếu fail/unknown chưa giải quyết.
- Giới hạn tài nguyên của ứng dụng tách khỏi giới hạn nền tảng. Nếu browser thiếu bộ nhớ, báo rõ file chưa được phân tích, không kết luận file sai chuẩn quảng cáo.

### API nội bộ V1 (đề xuất)

Các endpoint: `/api/projects`, `/api/creatives/:id/versions`, `/api/assets/uploads`, `/api/reviews`, `/api/reviews/:id/comments`, `/api/spec-profiles` và `/api/exports`. Server lấy workspace từ session membership, kiểm tra quyền cho từng resource; spec profile write chỉ admin được duyệt. Version save dùng optimistic concurrency (`If-Match`/version), export job dùng idempotency key. Danh sách dùng cursor pagination; lỗi `{code, message, fieldErrors, requestId}` không chứa creative hay token. Asset upload có hai bước authorize/complete và trạng thái `pending -> ready/failed`.

### Lưu nháp, review và retry

MVP mặc định session-only; bật lưu nháp trên thiết bị phải có thông báo rõ và nút xóa. IndexedDB có quota/error handling; đóng tab không được hứa xóa dữ liệu nếu đã bật persist. Import/export package gồm manifest version và asset; JSON đơn lẻ chỉ mang metadata, cần chọn lại asset nếu không có binary. Import file không thực thi script và phải migrate schema hoặc từ chối có lý do.

V1 review: `draft -> in_review -> approved_internal/changes_requested -> archived`. Duyệt gắn với phiên bản cụ thể; sửa nội dung tạo phiên bản mới và cần review lại. Quyền reviewer chỉ cho đọc/comment/duyệt, không sửa creative. Upload/export retry có backoff, cancellation, timeout và idempotency; đồng bộ không được ghi đè thay đổi mới hơn.

Publishing status trong MVP/V1 luôn `not_connected`; không có retry gửi quảng cáo. Nếu Future thêm publish, tách `draft/submitted/in_platform_review/approved/rejected/paused/active` theo connector, lưu external ID và retry request idempotently khi mất mạng/429/5xx; lỗi policy/auth không tự retry.

## 7. Lộ trình

### MVP

- Local-first single workspace.
- Phủ 8 nền tảng thương hiệu: Facebook, Instagram, Threads, TikTok, YouTube, Google, ChatGPT và Zalo; Google chia Search/Display thành 2 mục chọn, tổng 9 nhóm UI.
- Làm các tổ hợp cốt lõi ghi `MVP` trong ma trận. Profile chưa xác minh có mockup tham khảo và nhãn pending, không quảng cáo là hỗ trợ đầy đủ placement.
- Zalo: feed ảnh/video/multi-image theo product phù hợp, Form trước/sau click, banner cốt lõi, video safe zone. Form không thu dữ liệu thực.
- Admicro: full CPD homepage source catalog theo snapshot E17, simulated publisher context, asset-per-slot và package nhiều slot; không claim current pricing/availability.
- Asset count tùy profile, ví dụ TikTok Standard Carousel 2–35; không đặt trần 10 cho toàn ứng dụng. Có app resource budget riêng được đo trên máy team.
- Image/video/carousel/text preview; counter/rule checks; safe-zone overlays; compare grid; undo/redo và crop theo target.
- Export package + PNG có manifest/lỗi; session-only mặc định. Chạy local không cần login; bản hosting nội bộ phải được giới hạn qua SSO/VPN/access gateway trước khi sử dụng.

### V1

- Persist workspace/project/creative/version và review snapshot.
- RBAC nội bộ (owner/editor/reviewer/viewer), audit log, share link có expiry.
- Phủ toàn bộ 34 mẫu tham chiếu nếu placement còn hợp lệ, thay mẫu deprecated bằng mẫu hiện hành có giải thích. Google Display expanded catalog/RDA, TikTok VSA conditional, Zalo product/Message/OA/Commerce và Display còn lại.
- OCR/visual heuristic chỉ là advisory; rule catalog admin với approval và `effective_at`.
- Batch compare creative variants, comments, approve/reject nội bộ.

### Future

- OAuth/ad account connectors và import draft creative; chỉ làm sau security review.
- API sync policy/spec updates, automated regression screenshots, vendor change alerts.
- AI copy suggestions, safe-zone risk ranking, auto-resize/crop with human review.
- Export package theo nền tảng, không tự publish nếu chưa có explicit approval workflow.
- LinkedIn, Microsoft Ads, Pinterest, Snapchat, X, retail media, HTML5/playable và catalog automation chỉ thêm khi team cần; chưa xác minh trong khảo sát này.

### Work packages và ước lượng

| Gói | Kết quả | Điều kiện hoàn tất |
|---|---|---|
| P0A | Documentation, source/evidence governance, design/UX/QA acceptance | Plan hardening hoàn tất, không còn claim stale/conflict thành verified |
| P0B | Domain/schema, catalog, source registry E01-E18, Admicro raw import | Review schema và không lẫn product/format/placement/slot/package |
| P1 | Local editor, asset parsing, copy inheritance, rule engine | Save/import cùng nội dung và test boundary |
| P2 | MVP renderers, Zalo, Admicro simulated publisher, safe zone, export package | Các acceptance MVP đạt; unknown luôn hiển thị |
| P3 | Đối chiếu mockup thật, browser/mobile QA, internal access | Team chạy thử 10 creative đại diện, không có bug chặn |
| P4 | V1 backend/SSO/storage/review, mở rộng catalog | RBAC/tenant tests, snapshot immutable, parity inventory |

Ước lượng ban đầu: MVP 3–5 tuần, V1 thêm 4–6 tuần với 1 frontend, backend/QA hỗ trợ bán thời gian và một media buyer xác minh mẫu. Đây là khoảng planning, chưa phải cam kết; số format và bằng chứng platform có thể thay đổi effort. Gate P0 phải xong trước P1/P2.

## 8. Security, tenant isolation, data sync, billing risks

- Internal app vẫn phải enforce workspace authorization ở server; không tin `workspace_id` từ client.
- Binary quảng cáo có thể chứa thông tin khách hàng chưa công bố: local-first, CSP, không log nội dung, không gửi tới OCR/AI bên ngoài nếu chưa có opt-in.
- Nếu thêm object storage: signed upload, malware scan, MIME sniffing, size limits, retention/erasure, audit trail.
- Spec platform thay đổi thường xuyên; mọi rule có source URL, effective date, checked date, version, reviewer và trạng thái conflict.
- Nếu thêm connector: token vault, least privilege, revoke, rate-limit, retry/idempotency; import read-only trước.
- Công cụ nội bộ không cần subscription/payment. Rủi ro chi phí là storage/egress, export worker, transcoding và API AI nếu bật; đặt quota vận hành/cost alert theo workspace. Chỉ thiết kế billing/plan gating khi có yêu cầu thương mại hóa riêng.
- SSO/MFA dùng hệ thống công ty; asset/project/share link phải được kiểm tra membership cả ở DB, API và object storage. Không coi URL khó đoán là tenant isolation.
- Không nhúng SDK tracking quảng cáo vào preview. Không chạy HTML5/JS quảng cáo upload trong origin của ứng dụng; nếu Future thêm phải sandbox và có thiết kế riêng.
- Privacy và retention áp dụng cả nội dung Form, tên file và log. Chưa gửi file nào lên hai công cụ tham chiếu trong khảo sát này; chưa kiểm tra network để xác nhận tuyên bố bảo mật của chúng.

## 9. Acceptance checks

- Nhập một creative duy nhất và mở được ít nhất 1 preview cho mỗi platform adapter trong MVP.
- Chọn composition và ad product thì field/validation đổi theo compatibility; không hiện field không dùng, không tự xóa dữ liệu khi đổi target.
- Một lỗi luôn chỉ rõ: placement, field, actual, expected, severity, source/spec version.
- Kết quả Zalo hiển thị được Form cover/avatar, Display size, Video safe zone và cảnh báo giới hạn nguồn xung đột.
- File nguy hiểm/không đọc được bị từ chối có lý do; lỗi thông số vẫn có preview/cảnh báo để sửa. Không có binary creative gửi tới server trong MVP, kiểm tra bằng network log khi triển khai.
- Snapshot render cùng input + spec version cho kết quả ổn định; không phụ thuộc kích thước cửa sổ ngoài `RenderContext`.
- Không có kết quả nào ghi “được duyệt”; chỉ ghi “pass theo profile” hoặc “estimated/needs review”.
- Test desktop/mobile, keyboard, reduced motion, carousel 2/35/36 ảnh TikTok, media vượt giới hạn, video sai codec/không đọc được, Unicode/CJK, copy clear/inherit và storage quota.
- Đối chiếu ít nhất 1 mẫu có nguồn/screenshot hợp lệ cho mỗi profile phát hành; profile thiếu bằng chứng nằm `pending`, không tính vào coverage đã xác minh.
- V1: user khác workspace không đọc/sửa/export/download/comment được resource; viewer không upload/sửa, reviewer không sửa; token share hết hạn/revoke không dùng được.
- V1: hai editor lưu cùng phiên bản gây conflict được xử lý, không mất nội dung; snapshot đã duyệt không đổi khi catalog/copy thay đổi.

Các check này là tiêu chí nghiệm thu cho phần triển khai, chưa phải kết quả test ứng dụng. Bằng chứng đã thu thập cho lượt đặc tả nằm trong ma trận nguồn.

## 9A. Duy trì catalog và đo hiệu quả

Mỗi profile có owner, `checked_at`, `next_review_at`, nguồn theo field và điều kiện thị trường/tài khoản. Đề xuất review hàng tháng và khi platform công bố thay đổi; rule thay đổi qua pull request/reviewer, regression fixtures rồi phát hành version mới. Mâu thuẫn nguồn phải được giải quyết bằng Ads Manager/account kiểm chứng hoặc tài liệu rõ hơn; không tự chọn số dễ nhất.

Scope không có đồng bộ số liệu quảng cáo. V1 đồng bộ project/asset/review khi người dùng save; autosave debounce đề xuất 2 giây và retry có giới hạn. Dữ liệu cập nhật phải có revision và timestamp, upload chưa xong phải báo pending. Không lấy metrics bên ngoài để trang trí mockup.

Nếu team muốn đo adoption, dùng event nội bộ không có nội dung creative:

| Metric | Nguồn/công thức | Grain/thời gian/tần suất |
|---|---|---|
| Thời gian hoàn tất preflight | Khoảng từ bắt đầu review đến export/review submit; median và p90 | Một review session, UTC lưu/Asia/Ho_Chi_Minh hiển thị, ghi khi session kết thúc |
| Coverage verified | Số target có profile và golden reference / tổng target team đã chọn | Một snapshot, tính theo spec version mỗi lần review |
| Rework nội bộ | Số version bị `changes_requested` / số version submitted | Theo project/tuần, tính hằng ngày nếu đã bật event logging |

Các metric và mục tiêu performance là đề xuất, chưa có baseline sử dụng thực. Không dùng coverage verified để suy ra tỉ lệ platform duyệt quảng cáo.

## 9B. Design, UI và UX

Design system chi tiết nằm trong [design guideline](design.md) và [UI/UX spec](UI_UX_SPEC.md). Hướng đã khóa: workspace operational green, Manrope cho body, IBM Plex Mono cho metadata, target-first flow, single preview mặc định và compare 2-4 target khi cần. Noti Ad Preview được dùng làm reference workflow: editor nhập một lần, controls platform/placement sát preview, warning list cùng ngữ cảnh, privacy/local-only rõ. Không copy token/pixel của Noti và không biến app thành landing page public.

Visual QA và accessibility gate nằm trong [VISUAL_QA.md](VISUAL_QA.md). Không claim mobile visual acceptance nếu chưa có screenshot/overflow check tại 320/375/414/768 px.

## 10. Nguồn tham khảo đã kiểm tra

- [Noti Ad Preview](https://go.noti.vn/cong-cu/xem-truoc-quang-cao)
- [Zalo Ads Creative Ad Checker](https://ads.zalo.me/business/creative/adchecker/)
- [Zalo vị trí hiển thị](https://ads.zalo.me/business/creative/adchecker/index.html#position_preview)
- [Zalo hướng dẫn tạo quảng cáo](https://ads.zalo.me/business/thiet-lap-quang-cao-de-dang/)
- [Zalo Form](https://ads.zalo.me/business/huong-dan-tao-form/)
- [Zalo Display](https://ads.zalo.me/business/huong-dan-tao-quang-cao-display-ads/)
- [Zalo Video](https://ads.zalo.me/business/huong-dan-tao-quang-cao-video/)
- [Zalo FAQ có thông số video cũ](https://ads.zalo.me/business/cate/faq/faq-tao-quang-cao/)
- [Google Responsive Search Ads](https://support.google.com/google-ads/answer/7684791)
- [Google uploaded display specs](https://support.google.com/google-ads/answer/1722096)
- [Google video formats](https://support.google.com/google-ads/answer/2375464)
- [TikTok carousel specs](https://ads.tiktok.com/resources/help/article/specifications-for-carousel-ads?lang=en)
- [ChatGPT Ads creative API](https://learn.chatgpt.com/ads/api-reference/ads)
- [ChatGPT Ads campaign management / ảnh creative](https://learn.chatgpt.com/ads/campaign-management)
