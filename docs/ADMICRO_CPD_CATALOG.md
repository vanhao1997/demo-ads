# Admicro CPD homepage catalog

Trạng thái: scope MVP và import contract. Đây là catalog source snapshot, không
phải bảng giá/current inventory của Admicro.

Nguồn E17:

- [Landing page](https://admicro.vn/baogia?file=13-bao-gia-cpd-trang-chu-pdf)
- [PDF](https://drive.google.com/file/d/1ECMCbeaxrUcWh3SD-uqq2GjZGklhruNt/view?usp=drive_link)
- [Spreadsheet](https://docs.google.com/spreadsheets/d/1xB2UW-NO8rczy6_HBVBQgdem0_aSqzkEzSanuA2ntKU/edit?gid=435416766#gid=435416766)

## 1. Quyết định phạm vi

MVP phải có **full CPD homepage catalog** theo source snapshot. “Full” nghĩa là
giữ toàn bộ named slot/package rows đọc được từ source, cùng raw cells và
conflict; không nghĩa mọi vị trí đang bán, đang active hoặc có thể book ở mọi
thời điểm.

MVP hỗ trợ:

- Browse/filter publisher, page/section, slot, device, dimension, package.
- Simulated publisher context, không mở live page/iframe.
- Asset assignment theo slot.
- Package gồm nhiều slot trên cùng một simulated publisher page.
- Evidence badge và source drawer cho từng slot/package.
- Optional context: objective, campaign type, market, account condition;
  mặc định Vietnam, không kết nối account quảng cáo.

MVP không tuyên bố:

- Giá CPD hiện hành, CTR, ranking, traffic hoặc booking availability.
- Exact current placement nếu source snapshot không có effective date.
- Publisher render pixel-perfect khi chưa có golden reference.

## 2. Source snapshot đã quan sát

Snapshot ngày 12/10/2026:

- Sheet `CPD`: 1.196 rows, 23 columns.
- Bảng có nội dung đáng kể tập trung khoảng 398 rows đầu.
- 14 publisher được nhận diện.
- 253 named slot rows trước deduplication.
- `Homepage Plus`, `Homepage Premium`, `Billboard Plus`, `Billboard Premium`
  là nhóm package nhiều slot.
- PDF cover ghi 28/05/2026; các trang khác có ngày 05/02/2025; footnote
  spreadsheet tham chiếu tháng 04/2022.

`253` là số raw named rows trước dedupe trong snapshot khảo sát, không phải
“253 vị trí hợp lệ/current” và không được dùng làm coverage KPI.

Publisher đã nhận diện:

1. CafeF
2. CafeBiz
3. VTV
4. Kenh14
5. Soha
6. aFamily
7. Phu Nu Viet Nam
8. Gia Dinh & Suc khoe doi song
9. GameK
10. GenK
11. AutoPro
12. Thanh Nien
13. Tuoi Tre
14. VnEconomy

Tên publisher hiển thị cần giữ label nguồn; normalization chỉ dùng search key,
không xóa raw label.

## 3. Catalog record

Mỗi raw row được giữ dưới một record:

```text
AdmicroCatalogEntry
  id: stable source snapshot ID
  publisherId
  publisherLabel
  pageOrSection
  slotLabel
  packageId?
  device?
  width?
  height?
  ratio?
  demoUrl?
  rawRowNumber
  rawCells
  sourceRefIds: [E17]
  sourceSnapshotDate
  effectiveAt: null unless source states it
  evidence: primary_documented | conflict | unknown
  status: active_reference | needs_review | deprecated
  conflictNotes[]
```

Raw row phải chứa đủ source cell để reviewer quay lại PDF/sheet. ID ổn định
không dựa vào row number đơn lẻ nếu source được tải lại; dùng snapshot ID +
publisher/slot slug và giữ row number làm provenance.

`SlotSpec` và `PackageSpec` chuẩn hóa từ record theo [DATA_MODEL.md](DATA_MODEL.md).
Không flatten package thành một slot ảo.

## 4. Normalization và dedup

Pipeline đề xuất:

1. Import landing/PDF/sheet metadata.
2. Lưu raw row/cell trước khi normalize.
3. Trim whitespace, chuẩn hóa dimension thành số khi parse được.
4. Tạo publisher/slot slug để search, giữ nguyên display label.
5. Gắn package theo các nhãn nguồn.
6. Exact dedup theo publisher + normalized slot + dimensions + device trong
   cùng snapshot.
7. Nếu duplicate có dimension/demo khác, giữ record riêng và gắn `conflict`.
8. Nếu continuation row do merged cell, giữ row lineage về row gốc.
9. Reviewer duyệt canonical `SlotSpec` nhưng không xóa raw records.

Không dedup theo tên gần giống nếu có thể là hai vị trí hiển thị khác nhau.
Không chọn dimension “đẹp hơn” khi source conflict.

## 5. Package và publisher context

Publisher renderer nhận:

```text
PublisherContext
  publisher
  pageTemplate: homepage | section | article | app_native | unknown
  slots: Array<{
    slotId
    assetBinding
    slotGeometry
    copyBinding?
    evidence
  }>
  packageId?
  renderContext
```

Hành vi:

- User chọn slot hoặc package.
- Mỗi slot có binding asset/crop/focal point riêng.
- Package render nhiều slot theo thứ tự source, có indicator slot pending/
  conflict.
- Slot thiếu asset vẫn dựng placeholder có nhãn, không tự bỏ slot.
- Export ghi catalog version, source snapshot, package/slot IDs, asset hashes.
- Context là demonstration content; không giả lập impression/click.

Không dùng real publisher HTML, third-party script, ad tag hoặc iframe. Đây là
biên privacy, stability và tránh nhầm lẫn với booking.

## 6. Evidence/status policy

| Trạng thái | UI behavior |
|---|---|
| `active_reference` | Cho browse và preview simulated; badge “Theo source snapshot” |
| `needs_review` | Cho browse; preview estimated/skeleton; warning bắt buộc |
| `deprecated` | Không chọn mặc định; giữ trong source history và ghi lý do |
| `conflict` | Hiển thị các giá trị nguồn; validation `unknown`, không pass chung |

Admicro exact verified chỉ khi có:

- source row/cell đủ provenance,
- current publisher/account confirmation hoặc golden reference hợp lệ,
- renderer fixture được reviewer duyệt,
- acceptance D/R pass.

## 7. MVP, V1, Future

### MVP

Full raw CPD catalog, 14 publisher, browse/filter, slot/package selection,
simulated publisher context, asset-per-slot binding, source/conflict labels,
export manifest.

### V1

Golden reference per publisher/slot, canonical dedup review UI, source refresh
workflow, package-specific renderer, internal review/comment, versioned catalog
API và snapshot.

### Future

Current availability sync, booking/inventory integration, pricing workflow,
campaign performance, publisher API/measurement. Các chức năng này cần auth,
contract và billing/commercial approval riêng.

## 8. Evidence gates còn mở

- Source dates không đồng nhất; chưa có effective date chung.
- Duplicate/conflicting dimensions cần reviewer quyết định.
- Current availability/pricing không được suy ra từ snapshot.
- Một số publisher/package chưa có golden screenshot.
- Chưa có runtime import artifact; file export khảo sát là temporary local
  artifact, không phải source committed.

Acceptance tham chiếu: `C02`, `C08`, `D08-D12`, `R03-R04`. Exact cases do
[ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md) định nghĩa.
