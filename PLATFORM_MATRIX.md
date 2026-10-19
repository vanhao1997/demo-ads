# Ma trận nền tảng, định dạng và bằng chứng

Khảo sát ngày 12/10/2026. Đây là backlog triển khai và coverage, không phải danh sách release verified. Workspace hiện có MVP local cho nhiều profile/renderer, nhưng coverage chỉ được tính verified khi acceptance và golden/reference evidence đạt. Đọc cùng [đặc tả sản phẩm](AD_PREVIEW_SPEC.md), [source registry](docs/SOURCE_REGISTRY.md), [acceptance tests](ACCEPTANCE_TESTS.md) và [bằng chứng kiểm tra runtime](docs/RELEASE_EVIDENCE.md).

## 1. Quy ước coverage

Không lấy tích Descartes giữa nền tảng và định dạng. Một nền tảng có carousel không có nghĩa mọi placement đều nhận carousel. Objective, market, account, identity mode và thiết bị là điều kiện của profile.

Hai trục trạng thái riêng:

- `implementation`: planned / implemented / tested. Đây là trạng thái release/acceptance của profile, không chỉ là code tồn tại trong `src/`.
- `evidence`: primary_documented / reference_only / estimated / conflict / unknown.

Một số scaffold hiện đã có code, nhưng profile vẫn chưa được tính release verified nếu chưa qua acceptance/golden reference. `primary_documented` chỉ xác nhận điều kiện ghi trong nguồn, không xác nhận mọi pixel mockup hoặc quyền truy cập của tài khoản team. `reference_only` được hiển thị như mockup tham khảo; không được tính là profile đã xác minh.

MVP phủ các mẫu cốt lõi của 9 nhóm chọn. V1 đạt parity với inventory 34 mẫu tham chiếu, ngoại trừ mục deprecated/không còn hợp lệ được ghi lý do và thay bằng mẫu hiện hành. Future thêm nền tảng và sản phẩm ngoài phạm vi.

## 2. Inventory tham chiếu

| Nhóm | Mẫu trên Noti | Composition đề xuất, cần xác minh từng tổ hợp |
|---|---|---|
| Facebook | Feed, Video Feeds, Stories, Reels, Reels banner, In-stream, Marketplace, Search, Right column, Audience Network (10) | Ảnh, video, carousel; album/grid chỉ nơi có bằng chứng |
| Instagram | Feed, Stories, Reels (3) | Ảnh, video, carousel theo placement |
| Threads | Feed (1) | Ảnh trước; video/carousel để pending tới khi xác minh |
| TikTok | In-feed, TopView (2) | Video; bổ sung Standard Carousel riêng tại In-feed |
| YouTube | Skippable, non-skippable, bumper, desktop in-stream, in-feed, Shorts (6) | Video, thumbnail/copy theo format và thiết bị |
| Google Search | Mobile, desktop (2) | Responsive Search Ad, tổ hợp text và extensions/assets |
| Google Display | 300x250, 336x280, 728x90, 300x600, 160x600, 320x100, 320x50, native (8) | Banner cố định; Responsive Display asset set riêng |
| ChatGPT | Web, mobile (2) | Chat card ảnh + text; geometry mô phỏng |
| Zalo | Bổ sung, ngoài 34 mẫu | Ảnh đơn, nhiều ảnh, video; Form/Message/Display là product riêng |
| Admicro | Bổ sung ngoài Noti | CPD homepage publisher/slot/package; simulated publisher context |

Nguồn inventory: [Noti Ad Preview](https://go.noti.vn/cong-cu/xem-truoc-quang-cao). Cộng 10 + 3 + 1 + 2 + 6 + 2 + 8 + 2 = 34. Đây là mẫu placement/device/size, không phải 34 loại quảng cáo độc lập.

## 3. Backlog renderer theo nhóm

| ID/profile family | MVP | V1 | Evidence và gate |
|---|---|---|---|
| `facebook.feed` | Ảnh/video, carousel, crop và caption | Album/grid nếu xác minh; objective-specific footer | Reference only; Ads Guide và screenshot tài khoản team trước khi phát hành verified |
| `facebook.stories`, `facebook.reels` | Video dọc, overlay/safe zone; ảnh khi profile xác minh | Carousel/asset customization có điều kiện | Reels có tài liệu Meta; geometry/format từng target vẫn cần golden reference |
| `facebook.other` | Catalog placeholder, không tính coverage đã kiểm thử | Video Feeds, banner, in-stream, Marketplace, Search, right column, Audience Network | Tách từng profile; Audience Network còn phụ thuộc app publisher |
| `instagram.feed` | Ảnh/video/carousel | Hoàn thiện card CTA/identity/điều kiện objective | Reference only trong lượt khảo sát này |
| `instagram.stories`, `instagram.reels` | Video dọc + safe zone | Các composition khác khi có evidence | Không áp overlay Facebook nguyên xi cho Instagram |
| `threads.feed` | Mockup ảnh tham khảo | Các format được Ads Manager xác nhận | Reference only; số lượng card/limits pending |
| `tiktok.in_feed.video` | Non-Spark video/caption/CTA | Spark identity và metadata bài đã có | Non-Spark/Spark tách profile, không lấy một giới hạn caption áp chung |
| `tiktok.in_feed.standard_carousel` | 2–35 ảnh + audio metadata, CTA/URL chung | Identity variants và quy tắc account/objective | Primary documented cho quy tắc carousel; card pixels estimated |
| `tiktok.topview` | Mockup video tham khảo | Profile đặt mua/account đủ điều kiện | Không dùng In-feed profile thay cho TopView |
| `youtube.in_stream.skippable` | Video, CTA, trạng thái trước/sau bỏ qua | Companion/device variants | Video family có nguồn Google; thời điểm UI cần mẫu xác minh |
| `youtube.in_stream.non_skippable`, `youtube.bumper` | Preview và duration rules theo nguồn | Chi tiết điều kiện chiến dịch/device | Không dùng một giới hạn thời lượng chung cho mọi video YouTube |
| `youtube.in_feed`, `youtube.shorts` | Thumbnail/text hoặc video dọc | Đối chiếu CTA/campaign/device | Primary documented cho family; geometry estimated |
| `youtube.desktop_in_stream` | Kế thừa family nếu có evidence đủ | Desktop layout và companion | Là device variant, không tạo ad format mới |
| `google.search.rsa` | Mobile/desktop, headline/description arrays, pin và tổ hợp | Sitelink/callout đầy đủ, nhiều layout thực tế | Rule numeric có nguồn Google; thứ tự hiển thị là mô phỏng |
| `google.display.fixed` | 300x250, 728x90, 300x600, 320x50, 320x100 | 336x280, 160x600 và bộ 20 size chính thức | Source xác nhận kích thước/dung lượng; context trang là demo |
| `google.display.responsive` | Catalog pending | Asset set, logo, headline ngắn/dài, nhiều sample layout/native | Cần source riêng RDA; không gán uploaded-banner rules |
| `chatgpt.chat_card` | Ảnh + title/body, web/mobile mockup | Product feed template nếu cần | Creative fields có OpenAI Docs; layout estimated, access pending |
| `zalo.native` | Single/multi-image/video trên feed phù hợp | Các native card và surface hiện hành | Multi-image có nguồn; tương thích product/surface cần kiểm chứng |
| `zalo.form` | Ad trước click + Form sau click | Custom/advanced Form và profile tài khoản cá nhân | Checker và hướng dẫn Form; không thu lead thật |
| `zalo.message` | Catalog và điểm đến placeholder | Kịch bản text/image sau click | Cần source/flow Message Ads và điều kiện OA |
| `zalo.display` | Masthead mobile 640x360, medium rectangle 300x250 | Masthead PC, fullscreen/welcome, halfpage | Các dimension có nguồn; safe zone lấy đúng profile banner |
| `zalo.video` | Video + safe zone theo channel; conflict badge | Đối chiếu profile upload/video source/account | Checker và tài liệu cũ khác nhau; chưa gọi max bytes là verified chung |
| `zalo.commerce`, `zalo.oa_article` | Catalog pending | Product page/OA/article và CTA chuyên biệt | Chưa xác minh đủ layout và compatibility trong lượt này |

MVP được coi hoàn tất khi các profile cốt lõi đã có evidence hoặc được trình bày rõ là preview tham khảo. Mục pending không được dùng để tuyên bố ứng dụng phủ toàn bộ vị trí. V1 phát hành verified phải có source và golden reference cho từng tổ hợp được hỗ trợ.

## 4. Phân loại nội dung

| Kiểu | Dữ liệu và tương tác | Hành vi bắt buộc |
|---|---|---|
| Single image | Một ảnh + copy + identity + CTA | Crop/focal point riêng theo target; giữ asset gốc |
| Multi-image album/grid | Bộ ảnh có thứ tự/bố cục | Bố cục khác carousel; không tự thêm URL/title từng card |
| Single video | Video + poster + copy + CTA | Play/pause/mute/seek; safe zone, metadata/duration, timestamp export |
| Carousel | Card có thứ tự, ảnh hoặc video khi được phép | Vuốt/next/back; min/max theo profile; field chung hay từng card theo spec |
| Text / RSA | Mảng headline/description, URL/path, pin | Không bắt buộc upload ảnh; validate tổ hợp và field count |
| Responsive asset set | Nhiều ảnh/logo/video/copy như input cho nền tảng | Không render toàn bộ asset như một album; đưa nhiều sample có nhãn |
| Form experience | Tiêu đề/body/cover/questions | Xem trang sau click; không submit dữ liệu ra ngoài |
| Message experience | Greeting, nội dung text/image, buttons | Mô phỏng kịch bản sau click; không gửi tin nhắn thật |
| Fixed display | Một banner đúng khung | Giữ kích thước pixel thật; không kéo giãn image để “đạt” |

Collection/catalog, dynamic product ads, shopping, playable/HTML5 và text-only social post là scope khác, không tự sinh thêm vì người dùng upload nhiều tệp. Chỉ mở khi compatibility profile có nguồn.

## 5. Bằng chứng đã thu thập và giới hạn

| Mã | Nguồn đã đọc | Kết luận được dùng | Giới hạn |
|---|---|---|---|
| E01 | [Noti](https://go.noti.vn/cong-cu/xem-truoc-quang-cao) qua browser | Inventory, shared editor, all-placement grid, safe-zone controls | Chưa có source code hoặc test media/network; tuyên bố client-only là của website |
| E02 | [Zalo Checker](https://ads.zalo.me/business/creative/adchecker/) qua browser; mở Form/Display/Video/placement | Luồng checker và những thông số hiện trên UI | UI và tên surface có thể tồn tại qua nhiều phiên bản; không xác nhận active inventory |
| E03 | [Zalo tạo quảng cáo](https://ads.zalo.me/business/thiet-lap-quang-cao-de-dang/) | Single image, nhiều ảnh tối đa 4, caption, video source | Phải ràng buộc product/account khi implement |
| E04 | [Zalo Form](https://ads.zalo.me/business/huong-dan-tao-form/) | Cover, câu hỏi, trường họ tên/điện thoại cố định | Profile OA và cá nhân có thể khác |
| E05 | [Zalo Display](https://ads.zalo.me/business/huong-dan-tao-quang-cao-display-ads/) | Các dimension và 250KB | Không lấy dimension của một banner áp mọi banner |
| E06 | [Zalo Video](https://ads.zalo.me/business/huong-dan-tao-quang-cao-video/), [FAQ](https://ads.zalo.me/business/cate/faq/faq-tao-quang-cao/) | Video ratios/duration và xung đột tài liệu cũ | 150MB Checker / 10MB FAQ cũ chưa hợp thành một upload limit chung |
| E07 | [TikTok Carousel specs](https://ads.tiktok.com/resources/help/article/specifications-for-carousel-ads?lang=en) | Standard 2–35; VSA khác; music/CTA/link constraints | Source cập nhật 09/2026; account/objective availability cần kiểm tra |
| E08 | [Google RSA](https://support.google.com/google-ads/answer/7684791), [hướng dẫn tạo trên app](https://support.google.com/google-ads/answer/9438230) | Headlines/descriptions/path giới hạn; input count chuẩn hướng dẫn | Link RSA canonical bị redirect challenge trong một lần fetch; đọc được excerpt từ official search/hướng dẫn |
| E09 | [Google uploaded display](https://support.google.com/google-ads/answer/1722096) | Image formats, 150KB, 20 sizes | Không xác nhận RDA/HTML5 cho mọi tài khoản |
| E10 | [Google video formats](https://support.google.com/google-ads/answer/2375464) | Video families và bumper | Desktop là context/device, không ad format riêng |
| E11 | [OpenAI Ads creative](https://learn.chatgpt.com/ads/api-reference/ads), [campaign management](https://learn.chatgpt.com/ads/campaign-management) | Chat card title/body/image constraints | Không xác nhận tài khoản team được mua quảng cáo hoặc geometry web/mobile |
| E12 | [Meta Reels](https://www.facebook.com/business/ads/facebook-instagram-reels-ads) | Video dọc/audio/safe zone và placement asset customization | Ads Guide carousel fetch thất bại; chưa xác minh toàn bộ Meta compatibility |
| E13-E18 | [Source registry](docs/SOURCE_REGISTRY.md) | Google objectives, Meta matrix, TikTok TRAY/placement, Admicro chain, Noti icon library | Source IDs đã có trong runtime; E13-E16 giữ `unknown/needs_review` khi thiếu điều kiện account/market, E17 dùng dynamic Admicro snapshot catalog, E18 vẫn là asset/licence evidence gate |

Không có file khách hàng gửi lên website tham chiếu; không đăng nhập account quảng cáo; không tạo campaign hay phát sinh chi phí. App local đã có renderer regression, test file boundary và browser QA; kết quả nằm trong [release evidence](docs/RELEASE_EVIDENCE.md). Tenant isolation ở API/DB/storage thuộc V1, chưa được triển khai hoặc kiểm chứng.

## 6. Các quyết định cần khóa ở P0

1. Team cung cấp mẫu được phép sử dụng và screenshot Ads Manager cho các platform đang mua; ghi account/market/device để xác minh profile.
2. Chốt creative cốt lõi cho MVP theo nhu cầu thực tế, giữ mục tiêu V1 phủ catalog tham chiếu và Zalo hiện hành.
3. Phân công owner catalog; giải quyết video Zalo, inventory native và Admicro conflict trước khi gắn verified.
4. Chốt SSO/access gateway khi hosting nội bộ; kiểm tra chính sách lưu binary/share/export trước khi mở cộng tác.
5. Đo performance trên browser/máy team rồi đặt resource budget; không lấy max 10 của website tham chiếu làm giới hạn tổng.

Đây là gate triển khai, không phải yêu cầu người dùng trả lời ngay để hoàn tất bản đặc tả.

## 7. Bộ nghiệm thu mẫu

| Case | Input | Kết quả kỳ vọng |
|---|---|---|
| C01 | Ảnh đơn rồi đổi Feed sang Stories | Crop độc lập, input gốc giữ nguyên; lỗi/khuyến nghị theo target mới |
| C02 | 4 ảnh album, chọn target chỉ hỗ trợ carousel | Báo composition không hợp lệ và gợi ý tạo variant; không âm thầm đổi |
| C03 | TikTok Standard 1/2/35/36 ảnh | Fail min/max ở 1/36, count pass ở 2/35; vẫn validate media/nhạc |
| C04 | TikTok Standard có URL khác mỗi card hoặc không music | Báo field không hỗ trợ/thiếu music; không tự bỏ URL hoặc coi nhạc mute là có quyền |
| C05 | Google RSA copy đúng/vượt một đơn vị; CJK/emoji | Counter theo strategy; actual/expected và nguồn rõ; không dựa chỉ vào JS `.length` |
| C06 | Zalo tên OA 40 trong Form, brand 31 trong creative chung | Hai field/profile khác nhau; không dùng giới hạn Form cho brand ad |
| C07 | Video Zalo file thuộc vùng giới hạn tài liệu xung đột | `unknown/needs_review` kèm nguồn; không xanh “pass” chung |
| C08 | Video đổi kích thước preview, seek mốc có text dưới CTA | Overlay bám render context; export still frame đúng timestamp |
| C09 | Copy override `clear` rồi đổi target và quay lại | Nội dung trống chủ ý giữ nguyên; `inherit` mới dùng copy chung |
| C10 | JSON/package import có schema version lạ hoặc thiếu asset | Migrate đã biết hoặc từ chối rõ; không lỗi crash/âm thầm mất media |
| C11 | V1 approved version rồi editor sửa/đổi catalog | Snapshot cũ giữ nguyên; version mới cần review lại |
| C12 | V1 user workspace B dùng ID asset/review của A | API/DB/storage từ chối; không lộ binary, metadata hay comment |

Ngoài boundary checks: visual fixtures cho chữ Việt dài, xuống dòng, không CTA, ảnh dọc/ngang, cover mờ, mute/unmute, loading/error, keyboard, mobile reviewer và CPU/memory khi nhiều video. Accessibility và security phải được test trên bản thật, không suy ra từ đặc tả.
