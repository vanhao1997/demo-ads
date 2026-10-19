# Source registry và evidence policy

Ngày kiểm tra baseline: 12/10/2026, timezone `Asia/Ho_Chi_Minh`.  
Registry này ghi nguồn và giới hạn claim. Nó không biến một tài liệu thành bằng
chứng platform đang active cho mọi market/account.

## 1. Quy ước

Mỗi source có ID ổn định. Không đổi ID khi URL/label thay đổi; tạo revision và
ghi `checkedAt`. Rule phải tham chiếu source cụ thể; claim nhỏ nên dùng
`EvidenceClaim` ở [DATA_MODEL.md](DATA_MODEL.md).

Evidence:

- `primary_documented`: tài liệu chính thức nêu claim được dùng.
- `reference_only`: nguồn tham chiếu UI/inventory, chưa đủ làm platform spec.
- `estimated`: hình học hoặc ngưỡng mô phỏng, không phải điều kiện duyệt.
- `conflict`: nguồn chính thức có thông tin mâu thuẫn.
- `unknown`: chưa đủ bằng chứng hoặc chưa xác minh điều kiện account/market.

## 2. Registry E01-E18

| ID | Nguồn | URL | Authority | Evidence | Được phép dùng | Giới hạn |
|---|---|---|---|---|---|---|
| E01 | Noti Ad Preview inventory | [Noti](https://go.noti.vn/cong-cu/xem-truoc-quang-cao) | reference | reference_only | Inventory 34 mẫu, flow editor, all-placement grid, safe-zone controls | Không phải source spec chính thức; không suy ra availability |
| E02 | Zalo Ads Creative Ad Checker | [Checker](https://ads.zalo.me/business/creative/adchecker/) | official | primary_documented | Luồng chữ, Form, Display, Video, position preview; field/dimension hiển thị trên checker | UI có thể đổi; không xác nhận mọi placement/account |
| E03 | Zalo hướng dẫn tạo quảng cáo | [Guide](https://ads.zalo.me/business/thiet-lap-quang-cao-de-dang/) | official | primary_documented | Single image, tối đa 4 ảnh theo hướng dẫn, caption và yêu cầu media | Phải ràng buộc product/account; multi-image không tự gọi carousel |
| E04 | Zalo hướng dẫn tạo Form | [Form](https://ads.zalo.me/business/huong-dan-tao-form/) | official | primary_documented | OA/form title/body, cover, câu hỏi, field cố định | OA cá nhân/OA business có thể khác |
| E05 | Zalo Display Ads | [Display](https://ads.zalo.me/business/huong-dan-tao-quang-cao-display-ads/) | official | primary_documented | Dimension và giới hạn banner được tài liệu nêu | Không áp một dimension cho mọi Display |
| E06 | Zalo Video Ads và FAQ cũ | [Video guide](https://ads.zalo.me/business/huong-dan-tao-quang-cao-video/) | official | conflict | MP4/H.264, ratio, duration theo guide; giữ FAQ cũ để phát hiện conflict | Checker có nơi ghi 150 MB, FAQ cũ có nơi ghi 10 MB; không pass limit chung |
| E07 | TikTok Standard Carousel specs | [TikTok Carousel](https://ads.tiktok.com/resources/help/article/specifications-for-carousel-ads?lang=en) | official | primary_documented | 2-35 ảnh, khung, music/CTA/URL constraints | Account/objective/market availability cần kiểm tra |
| E08 | Google Responsive Search Ads | [Google RSA](https://support.google.com/google-ads/answer/7684791) | official | primary_documented | Headline/description/path count và character limits | Layout/thứ tự hiển thị là mô phỏng |
| E09 | Google uploaded display specs | [Google Display](https://support.google.com/google-ads/answer/1722096) | official | primary_documented | Format, 150 KB, bộ size uploaded display | Không áp cho RDA/HTML5 nếu chưa có source riêng |
| E10 | Google video ad formats | [Google Video](https://support.google.com/google-ads/answer/2375464) | official | primary_documented | Video families, bumper và context device | Không dùng một duration chung cho mọi video family |
| E11 | ChatGPT Ads creative docs | [Creative API](https://learn.chatgpt.com/ads/api-reference/ads), [campaign](https://learn.chatgpt.com/ads/campaign-management) | official | primary_documented | Title/body/image constraints | Workspace availability và geometry web/mobile chưa xác nhận |
| E12 | Meta Reels business reference | [Meta Reels](https://www.facebook.com/business/ads/facebook-instagram-reels-ads) | official | reference_only | Dọc/audio/safe-zone direction và placement customization | Chưa đủ Ads Manager/golden reference cho toàn Meta matrix |
| E13 | Google Ads objectives/types | [Google objectives](https://support.google.com/google-ads/answer/7450050?hl=vi#zippy=) | official | primary_documented | Campaign objective/type/context filter | Không phải creative dimension/placement spec |
| E14 | Meta objective × placement × format | [Meta matrix](https://www.facebook.com/business/help/279271845888065?id=369787570424415) | official | primary_documented (phạm vi giới hạn) | Quan hệ objective, placement, format; làm input compatibility | Lượt khảo sát chưa trích đủ mọi accordion/row; row chưa inspect phải `needs_review` |
| E15 | TikTok TRAY integration help | [TikTok TRAY](https://ads.tiktok.com/resources/help/article/grow-business-tiktok-tray?lang=vi) | official | reference_only | Ghi nhận integration-specific material và điều kiện triển khai | Tài liệu tháng 02/2025; không dùng làm creative spec chung |
| E16 | TikTok placement help | [TikTok placement](https://ads.tiktok.com/resources/help/article/tiktok-placement?lang=vi) | official | primary_documented | For You/search/additional surfaces và market restriction được nêu | Availability phụ thuộc market/account; cần checked claim từng surface |
| E17 | Admicro CPD source chain | [Admicro page](https://admicro.vn/baogia?file=13-bao-gia-cpd-trang-chu-pdf), [PDF](https://drive.google.com/file/d/1ECMCbeaxrUcWh3SD-uqq2GjZGklhruNt/view?usp=drive_link), [sheet](https://docs.google.com/spreadsheets/d/1xB2UW-NO8rczy6_HBVBQgdem0_aSqzkEzSanuA2ntKU/edit?gid=435416766#gid=435416766) | official/publisher | conflict | Publisher names, raw slot rows, dimensions/demo refs, package labels | PDF cover 28/05/2026, pages 05/02/2025, sheet footnote 04/2022; không claim current pricing/availability |
| E18 | Noti SVG/icon library | [Noti icons](https://go.noti.vn/icon/svg) | reference | reference_only | Inventory/logo source, icon family/license notes, local bundle input | Trademark guidelines vẫn áp dụng; chưa phải legal clearance cho brand use |

E13-E18 là source registry additions. Runtime `SourceRefId` đã khai báo đầy đủ
E01-E18. Source ID mới phải đi qua cập nhật type/migration; không được silently
cast ID chưa có vào code.

## 3. Source chain cho Admicro

E17 là một chain, không phải một claim duy nhất:

1. Landing page trỏ tới PDF và spreadsheet.
2. PDF dùng để đọc package/position context và các dòng hiển thị.
3. Spreadsheet dùng để giữ raw row, dimension/device/demo và phát hiện trùng/
   mâu thuẫn.
4. Catalog phải lưu URL chain, source row/cell và ngày snapshot.

Không đưa giá CPD, CTR, ranking hoặc current availability vào rule pass. Các
giá trị đó có thể được lưu như source-only metadata nếu team cần đối chiếu,
nhưng phải có `effectiveAt`, market và owner xác nhận.

## 4. Claim policy

Mỗi claim cần:

```text
claimId
sourceRefIds[]
fieldPath
claim
checkedAt
effectiveAt?
evidence
confidence
market?
accountCondition?
reviewer?
notes?
```

Nếu source không ghi effective date, lưu `effectiveAt=null`. Ngày khảo sát
không thay cho ngày hiệu lực. Khi hai source conflict, tạo hai claim và kết
quả rule `unknown/needs_review`; không chọn số thuận tiện.

## 5. Review cadence và owner

- Platform source: review hàng tháng và sau announcement lớn.
- Admicro source: review khi publisher/sales gửi bảng mới hoặc tối đa hàng quý
  trong giai đoạn MVP.
- Brand/icon asset: kiểm tra license/trademark trước mỗi release bundle.
- Evidence reviewer phải ghi người kiểm tra, market, account condition nếu có.
- Source diff phải đi cùng catalog PR và regression fixture.

Acceptance tham chiếu: `D01-D06`, `D08-D12`, `R01`, `A05`.
