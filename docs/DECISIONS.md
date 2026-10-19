# Decision log

Decision log ghi các lựa chọn đã khóa để triển khai không quay lại các nhánh
đã loại. Mỗi quyết định có thể được thay bằng ADR mới; không sửa lịch sử và
không đổi ID profile/source đã phát hành.

Ngày baseline: 12/10/2026.

## ADR-001 — Local-first MVP

**Status:** accepted  
**Decision:** MVP chạy trong browser, session-only mặc định; không gửi binary
creative lên server.

**Why:** Creative có thể là tài sản chưa công bố; giảm privacy risk, setup và
backend effort.  
**Impact:** Export/import phải xử lý asset reselection; P3 phải kiểm tra
network. V1 mới cân nhắc private storage.  
**Revisit when:** Team cần cộng tác, review xuyên máy hoặc retention policy.

## ADR-002 — Target-first selection

**Status:** accepted  
**Decision:** User chọn platform/product/surface/placement/device/composition
trước khi xem rule và preview chi tiết.

**Why:** Giảm nhầm giữa placement, device và format; rule context rõ hơn.  
**Impact:** Catalog phải có compatibility profile; UI target picker là entry
point chính.  
**Acceptance:** `C01-C04`, `D04-D07`, `A03`.

## ADR-003 — Single preview mặc định, compare 2-4

**Status:** accepted  
**Decision:** Một target là view mặc định; compare hỗ trợ từ 2 đến 4 target.

**Why:** Single preview dễ đọc và nhẹ; compare phục vụ review cross-placement.  
**Impact:** RenderContext phải độc lập; compare không được dùng một crop chung
cho mọi target.  
**Acceptance:** `C01`, `C08`, `R01-R02`.

## ADR-004 — Evidence và implementation độc lập

**Status:** accepted  
**Decision:** `implementation`, `supportStatus`, `evidence`, `rendererStatus`
là các state riêng.

**Why:** Code có thể dựng mockup trước khi source đủ; tránh tuyên bố “được hỗ
trợ” chỉ vì có component.  
**Impact:** UI luôn hiển thị pending/reference/estimated/conflict/unknown;
release coverage chỉ tính verified.  
**Acceptance:** `D01-D06`, `R01`, `R04`.

## ADR-005 — Match reference đã xác minh, phần còn lại gắn nhãn

**Status:** accepted  
**Decision:** Chỉ gọi preview verified khi có source + golden reference đủ;
hình học chưa xác minh dùng `estimated` hoặc `reference_only`.

**Why:** Platform UI và approval behavior thay đổi; mockup không thay thế
Ads Manager.  
**Impact:** Có thể ít profile verified ở MVP; unknown phải được nhìn thấy và
không bị biến thành pass.  
**Acceptance:** `C07`, `R01-R04`.

## ADR-006 — Workspace operational green, không copy platform chrome

**Status:** accepted  
**Decision:** App dùng style operational green/Manrope riêng; platform-specific
skin chỉ nằm trong preview renderer.

**Why:** Giữ orientation và state nhất quán khi chuyển target; không giả danh
website platform.  
**Impact:** Brand logo/icon guideline nằm riêng trong
[BRAND_ASSETS.md](BRAND_ASSETS.md); preview phải ghi rõ simulated content.  
**Acceptance:** `A01-A06`, `R01-R02`.

## ADR-007 — Admicro full CPD raw catalog trong MVP

**Status:** accepted  
**Decision:** Nhập full CPD homepage source snapshot, gồm raw rows, 14 publisher,
253 named rows trước dedup và package nhiều slot.

**Why:** Team cần catalog để chọn vị trí; source có duplicate/conflict nên phải
giữ lineage.  
**Impact:** Không claim current availability/pricing; simulated publisher page,
asset-per-slot binding; exact conflicts pending.  
**Acceptance:** `D08-D12`, `R03-R04`.

## ADR-008 — Package nhiều slot, không flatten

**Status:** accepted  
**Decision:** Homepage Plus/Premium và Billboard Plus/Premium là package gồm
nhiều `SlotSpec`; renderer gán asset theo slot.

**Why:** Một package không phải một banner kéo giãn; team cần thấy phân bổ asset
theo vị trí.  
**Impact:** `PackageSpec`, `TargetAssetBinding`, publisher context bắt buộc.  
**Acceptance:** `C02`, `D08-D10`, `R03`.

## ADR-009 — Source IDs versioned, claim-level provenance

**Status:** accepted  
**Decision:** Giữ E01-E12; bổ sung E13-E18 cho Google objectives, Meta matrix,
TikTok TRAY/placement, Admicro chain và Noti icons. Claim nhỏ tham chiếu source
và field cụ thể.

**Why:** Tài liệu platform khác loại và có giới hạn evidence khác nhau.  
**Impact:** Runtime type cần migration; source URL/checked/effective/reviewer
phải đi cùng rule/catalog PR.  
**Acceptance:** `D01-D06`, `A05`.

## ADR-010 — Media metadata không đáng tin nếu chưa parse

**Status:** accepted  
**Decision:** Không tin MIME/đuôi file hoặc metadata import; parser đánh dấu
`pending`, `unreadable`, `unknown`; browser phát được video không chứng minh
codec platform chấp nhận.

**Why:** Tránh pass giả do client metadata.  
**Impact:** Preview vẫn giữ placeholder/cảnh báo để user sửa; server V1 lặp
kiểm tra.  
**Acceptance:** `C07`, `C10`, `D07`.

## ADR-011 — Catalog extensions trước, renderer chuyên biệt sau

**Status:** accepted  
**Decision:** Messenger/WhatsApp và TikTok Search/Lite/Lemon8/PineDrama có thể
vào catalog MVP với `needs_review`; renderer chuyên biệt để V1 sau khi current
availability và golden reference đủ.

**Why:** Giữ inventory và kế hoạch mà không overclaim support.  
**Impact:** Không render giả như profile verified; deprecated entry không active
 mặc định.  
**Acceptance:** `D04-D06`, `R04`.

## ADR-012 — Không có billing/publishing trong MVP

**Status:** accepted  
**Decision:** Không OAuth, publish, booking, subscription, billing hoặc
performance analytics trong MVP; V1 chỉ thêm persistence/review/RBAC nếu cần.

**Why:** Preview/preflight là job cốt lõi; connector/payment tạo security,
platform review và retry risk riêng.  
**Impact:** `publishingStatus=not_connected`; không có retry gửi quảng cáo.
Billing entitlement tách domain nếu sau này mở.  
**Acceptance:** `C11-C12`, `D10-D12`.

## 13. Open evidence gates

- Meta full objective × placement × format matrix chưa extract đủ row.
- TikTok TRAY chỉ integration-specific; không áp làm creative limits chung.
- TikTok placement cần market/account confirmation.
- Admicro source dates, duplicates, dimensions và current availability chưa
  resolve.
- Zalo video byte limit conflict còn `unknown/needs_review`.
- Brand SVG và hash đã bundle từ Simple Icons; E18 chỉ là inventory reference.
  Trademark review vẫn mở (`review_required`).

## 14. Cách thay đổi quyết định

Decision mới phải ghi:

```text
id
date
status
decision
why
impact
revisit trigger
affected source/profile IDs
acceptance IDs
```

Thay đổi catalog/spec phải tạo version mới, migration hoặc deprecation note.
Không sửa source ID, profile ID hoặc approved snapshot để che lịch sử.

Các acceptance ID trong decision log liên kết tới
[ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md); wording chi tiết nằm ở tài liệu
đó.
