# Acceptance tests

Trạng thái: canonical acceptance checklist cho plan MVP/V1.  
Các case dưới đây là tiêu chí nghiệm thu. Kết quả runtime và phạm vi bằng chứng
hiện tại nằm trong [release evidence](docs/RELEASE_EVIDENCE.md).

## 1. Creative/editor cases

| ID | Phase | Input | Expected |
|---|---|---|---|
| C01 | MVP | Ảnh đơn, đổi Facebook Feed sang Stories/Reels | Crop/focal point theo target; asset gốc giữ nguyên; issue đổi theo target |
| C02 | MVP | 4 ảnh album, chọn target chỉ hỗ trợ carousel | Báo unsupported composition và gợi ý tạo variant; không tự đổi album thành carousel |
| C03 | MVP | TikTok Standard Carousel 1/2/35/36 ảnh | 1 và 36 fail min/max; 2 và 35 pass count; vẫn kiểm media/audio |
| C04 | MVP | TikTok Carousel có URL từng card hoặc thiếu music | Báo field không hỗ trợ hoặc thiếu music; không tự bỏ URL; không coi mute là có quyền nhạc |
| C05 | MVP | Google RSA copy vượt/đúng giới hạn, có CJK/emoji | Counter theo strategy; actual/expected/source rõ; không chỉ dùng JS `.length` |
| C06 | MVP | Zalo Form OA 40 ký tự, creative brand 31 ký tự | Form dùng rule riêng; creative chung fail/warn theo rule riêng; không trộn limit |
| C07 | MVP | Zalo video nằm giữa conflict 10 MB và 150 MB | Result `unknown/needs_review`, có nguồn conflict; không xanh pass chung |
| C08 | MVP | Video seek timestamp có content trong vùng CTA | Overlay bám RenderContext; export still đúng timestamp |
| C09 | MVP | Override `clear`, đổi target rồi quay lại | Field trống chủ ý giữ nguyên; `inherit` mới fallback về copy chung |
| C10 | MVP | Import JSON schema lạ hoặc thiếu asset binary | Migrate version đã biết hoặc reject rõ; asset missing cần chọn lại; không crash |
| C11 | V1 | Approved version rồi editor sửa copy hoặc catalog đổi | Snapshot cũ giữ nguyên; version mới cần review lại |
| C12 | V1 | User workspace B dùng ID asset/review của A | API/DB/storage từ chối; không lộ binary, metadata, comment |

## 2. Data/catalog cases

| ID | Phase | Input | Expected |
|---|---|---|---|
| D01 | MVP | Source registry có E01-E18 | IDs ổn định, checkedAt, authority, evidence và limitation rõ |
| D02 | MVP | Rule tham chiếu source | Rule có source/evidence/confidence; source missing làm test fail |
| D03 | MVP | Profile có implementation nhưng evidence reference_only | UI không tính verified; preview vẫn có badge reference |
| D04 | MVP | Target có objective/market/account condition chưa match | Target hiển thị needs_review/unknown, không auto pass |
| D05 | MVP | Deprecated placement | Không hiện mặc định; có lý do và source nếu user bật xem |
| D06 | MVP | Meta/TikTok row chưa inspect đủ | Catalog giữ pending; không phát hành verified |
| D07 | MVP | Media metadata import tự khai codec/size | Parser status quyết định; metadata không xác minh giữ unknown |
| D08 | MVP | Admicro raw rows import | Giữ raw row/cell/source snapshot; không mất duplicate/conflict |
| D09 | MVP | Admicro package nhiều slot | Package tạo nhiều SlotSpec; asset binding từng slot |
| D10 | MVP/V1 | Source conflict dimension hoặc byte limit | Validation unknown/conflict, source drawer hiển thị giá trị nguồn |
| D11 | V1 | Catalog version mới đổi rule | Snapshot cũ dùng specVersion cũ; new validation dùng version mới |
| D12 | V1 | Workspace foreign key cross-tenant | DB/API reject theo workspace boundary |

## 3. Accessibility/UI cases

| ID | Phase | Input | Expected |
|---|---|---|---|
| A01 | MVP | Keyboard-only từ header tới export | Focus order logic, focus ring visible, drawer close returns focus |
| A02 | MVP | Fail/warn/unknown/pass issue list | Không color-only; contrast AA; icon/text label rõ |
| A03 | MVP | Viewports 320/375/414/768/1024/1440 | No horizontal scroll; text không overlap; mobile order đúng |
| A04 | MVP | Click issue/source badge | Focus đúng field/preview region; source drawer mở với source/version |
| A05 | MVP | Export with unresolved unknown/conflict | Manifest giữ unresolved items; UI không nói approved |
| A06 | MVP | Reduced motion và loading/error states | Spatial motion giảm; loading/error không làm mất input |

## 4. Renderer/export cases

| ID | Phase | Input | Expected |
|---|---|---|---|
| R01 | MVP | Single preview target verified/reference/estimated | Badge đúng evidence; renderer không overclaim |
| R02 | MVP | Compare 2-4 targets | Mỗi target giữ RenderContext/crop riêng; issue summary riêng |
| R03 | MVP | Admicro publisher slot/package | Simulated publisher page, slot labels, asset per slot, conflict visible |
| R04 | MVP | Export PNG/package | Manifest có creative version, target IDs, asset hashes, spec/renderer versions, validation summary |

## 5. Release evidence

MVP release candidate cần:

- `npm test` pass.
- `npm run build` pass.
- Visual QA theo [VISUAL_QA.md](VISUAL_QA.md) có screenshot/overflow evidence.
- C01-C10, D01-D10, A01-A06, R01-R04 pass hoặc có accepted exception.
- Không có profile pending/conflict bị tính verified coverage.
- Network check chứng minh binary không rời browser trong MVP flow.

V1 release candidate cần thêm:

- C11-C12, D11-D12 pass.
- RBAC/tenant isolation tests pass.
- Snapshot immutability tests pass.
- Share link expiry/revoke tests pass.

## 6. Metrics nếu bật event nội bộ

| Metric | Source | Formula | Grain | Timezone | Sync |
|---|---|---|---|---|---|
| Preflight completion time | app events | review/export end minus first validation start | review session | stored UTC, displayed Asia/Ho_Chi_Minh | on session end |
| Verified coverage | snapshot manifest | verified target count / selected target count | snapshot | spec checkedAt | per review/export |
| Internal rework | review events | changes_requested versions / submitted versions | project/week | UTC stored | daily if backend exists |

Không dùng các metric này để suy ra platform approval rate.
