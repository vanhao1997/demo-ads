# MVP release evidence

Ngày kiểm tra: 13/10/2026, Asia/Ho_Chi_Minh. Kết quả: local MVP release candidate
đạt các kiểm tra chức năng dưới đây. Đây là nghiệm thu công cụ preview/preflight
trong browser, không xác nhận platform approval, availability hay pixel-perfect
layout theo tài khoản quảng cáo.

## Native platform context - renderer 0.5 (current)

Ngày 14/10/2026. Bản hiện tại trong `dist/` là renderer 0.5; kiểm trên
`http://127.0.0.1:4176/`. [Browser sweep 34 vị trí](../output/playwright/renderer05-final/mockup-34.json)
kiểm 68 mẫu VI/EN, 8 mockup dọc ở viewport 375 px và 6 trường hợp tắt
`Giao diện app`: 82/82 pass, không page error. Mỗi mẫu có placement component,
locale, screen dimensions và không tràn ngang trong device scroller.

- Facebook Right column dùng ngữ cảnh sidebar thay cho banner trần. Display
  300x250/336x280 dùng khung mobile article như demo Noti.
- Stories/Reels/TikTok/Shorts phủ media trong màn hình phone; status bar phủ lên
  sân khấu. Shorts có navigation dưới. Tắt chrome vẫn giữ navigation và vùng
  quảng cáo Search/Display/YouTube/ChatGPT.
- Workspace có badge trạng thái theo nền tảng, action `Tất cả vị trí` mở toàn bộ
  placement active trong Compare, không còn giới hạn 4 card. Preview có `Phóng to`
  và `Toàn màn hình`; Escape dùng để thoát native fullscreen.
- Landing page phía dưới công cụ bám cấu trúc Noti: hero, cách dùng, tính năng,
  vị trí hỗ trợ, giới hạn, riêng tư, FAQ và footer. Responsive smoke tại 320,
  375, 414, 768 và 1440px giữ `scrollWidth === innerWidth`.
- `npm test`: 17 files, 107 tests pass. `npm run build`: TypeScript/Vite pass.
  Bootstrap `index-CM1Cn7YH.js`: 837.64 kB. Cảnh báo chunk >500 kB còn mở.
- [Regression smoke](../output/playwright/clone-final-20261014b/acceptance-browser-final-qa.json):
  24/24 assertions pass trên build 0.5, gồm upload, crop, compare, review export,
  keyboard, CSP và không external request. `reviewPackage.test.ts` cũng pass 9/9,
  giữ manifest renderer `adcraft-renderer/0.5`.
- [Landing responsive check](../output/playwright/landing-responsive.run-code.mjs):
  5/5 viewport pass, không tràn ngang.

Giới hạn: sweep kiểm cấu trúc, geometry, locale và chrome trên local production;
chưa là pixel comparison tự động với screenshot Noti hoặc golden hiện tại của
platform. Các slot/occlusion và số tương tác vẫn là mô phỏng. ZIP 0.4 phía dưới
giữ làm lịch sử, không chứa renderer 0.5.

## Native platform context - renderer 0.4 (history)

Ngày 13/10/2026. Đây là bằng chứng lịch sử của renderer 0.4, giữ lại để so sánh.
Các mục renderer 0.2/0.3 phía sau cũng là lịch sử; không dùng chúng để kết luận
renderer 0.5 hiện tại.

- [Nghiên cứu Noti](NOTI_STUDY.md): 34 vị trí trong 8 channel, mỗi vị trí kiểm
  VI/EN, tổng 68 mẫu render. Raw observations và screenshot nằm trong
  `output/noti-study/`. Chrome không xác thực được; nghiên cứu dùng CUA in-app
  browser. Noti không có Zalo/Admicro; hai channel dùng nguồn riêng.
- `npm test`: 17 test files, 106 tests pass. `npm run build`: TypeScript/Vite
  production pass. Bootstrap `index-CQafm069.js`: 837,448 bytes, gzip 165.68 kB;
  CSS `index-DQ8maobb.css`: 96,800 bytes. Cảnh báo chunk >500 kB vẫn còn; chưa đo
  lại LCP/INP của bản 0.4 trên mạng mobile.
- Chạy lại acceptance trên build renderer 0.4 ngày 13/10/2026:
  [24/24 assertions](../output/playwright/mvp-recheck/acceptance-browser-final-qa.json),
  không có failure. Đây là smoke/regression của các luồng chính; báo cáo 202
  assertions bên dưới kiểm phạm vi presentation rộng hơn.
- [Browser report 0.4](../output/noti-study/renderer04-browser-qa.json):
  47 vị trí ngoài publisher x 2 ngôn ngữ = 94/94 observations đạt; 202/202
  assertions đạt trên build `index-CQafm069.js`. Synthetic media kiểm giao diện,
  locale, crop, guides/chrome, TopView, GDN slot, Search/RSA, video và Compare.
  Console warnings/errors trong luồng đã chạy: không có. Đây là kiểm tra local,
  không chứng nhận pixel match hoặc toàn bộ platform inventory.
- Responsive ở 320/375/414/768/1440 px không tràn ngang. Screen iPhone giữ
  393 x 852, media rộng 393 và transform scale đồng nhất hai trục. Compare 4
  targets gồm Facebook/Instagram/TikTok phone và YouTube PC giữ locale chung,
  không tràn ngang. PC screen giữ preset 1440 x 900.
- [Admicro browser report](../output/playwright/admicro-context-qa.json):
  22/22 checks đạt cho các ca đại diện billboard/background/right column,
  top-banner mobile, inpage, TVC, publisher switch và package chưa đủ nguồn.
  Report này được tạo trước tích hợp 0.4 cuối; unit tests publisher/layout có
  trong bộ 106 tests hiện tại. Không suy ra mọi demo Admicro đã được đối chiếu
  pixel hoặc mọi package đã xác minh.

### Nghiệm thu presentation và export

| Hạng mục | Hành vi và bằng chứng |
|---|---|
| Social | Facebook có reaction/comment/share; IG có likes/actions; Threads có thread spine/actions; TikTok có heart/comment/save/share, caption/audio/CTA/navigation. Stories/Reels, Marketplace/Search/right column/Audience Network có ngữ cảnh riêng. Browser report và SocialPreview tests. |
| Context | YouTube trong watch/feed/Shorts, host channel tách advertiser, skip sau 5s/countdown và companion PC 300x60; Search có nhóm sponsored/collapse và organic results; GDN trong bài báo với slot/crop riêng; ChatGPT có sponsored card tách dưới answer; Zalo dùng feed riêng. ContextPreview tests và browser report. |
| Presentation | VI/EN đổi nhãn app, giữ advertiser copy. App chrome/guides độc lập; TikTok có caption mask và TopView intro/feed. Intro không làm mất rail ở In-Feed. Vùng che mang nhãn ước lượng. previewPresentation/Preview tests và browser report. |
| Crop/state | Đổi locale/chrome/device giữ media/focal point, card/RSA và video time. Browser phát hiện video node bị tạo lại khi tắt chrome làm time về 0; Preview.tsx đã restore time qua metadata/duration events, retest giữ 5000ms và Skip ad. Lỗi trước sửa được giữ trong report. |
| Video ZIP | [Package check](../output/noti-study/renderer04-video-package-check.json) đạt version/locale/chrome/5000ms/device/scroll/binary hash/needs_review. [Manifest](../output/noti-study/renderer04-youtube-review-manifest.json) và [PNG 2968x2270](../output/noti-study/renderer04-youtube-review.png) giữ PC 1440x900, scroll158, English và frame tại 0:05. Không biến 13 unknown thành pass. |
| Image ZIP | Bằng chứng bổ sung trước các chỉnh sửa social cuối: [manifest](../output/noti-study/renderer04-review-manifest.json), [PNG](../output/noti-study/renderer04-review.png) giữ renderer0.4, English/chrome off, focal23/71, cardIndex1, phone393x852 và media binary. |

ZIP video lần đầu ghi 5541ms nên kiểm exact5000ms không đạt. Video đã chạy thêm
khi click để đưa mockup vào screenshot. Retest dừng video, tua bằng keyboard và
xuất trực tiếp đạt 5000ms; cả failed attempt và kết quả cuối giữ trong package
report. Range `.fill()` của harness chỉ đổi DOM value, không phát React input
event; crop/time được kiểm bằng keyboard. Đây là giới hạn harness, không dùng
DOM value đơn lẻ làm bằng chứng state.

Visual inspection: [TikTok phone](../output/noti-study/renderer04-tiktok-mobile.jpg),
[YouTube PC](../output/noti-study/renderer04-youtube-pc.jpg),
[Compare](../output/noti-study/renderer04-compare.jpg), PNG video xuất và Admicro
newsroom screenshots. Native font/spacing thuộc mockup; workspace xanh giữ
nguyên. Guides là hình học ước lượng, tương tác là fixture tĩnh, publisher/host
content là minh họa; không có golden screenshot từ tài khoản platform hiện tại.

### Phases và ranh giới

- MVP đạt: preview theo placement, VI/EN, phone/PC scale, demo interactions,
  occlusion/chrome/TopView controls và export presentation context. Contract
  renderer0.4 có trong [data model](DATA_MODEL.md).
- V1 còn: goldens từ platform account hiện tại và từng demo publisher Admicro,
  hình học caption/CTA theo app version; persistence/sharing online cần auth,
  RBAC, private storage và tenant isolation trước triển khai.
- Future: video detail/OCR với đánh giá false-positive, OAuth/connectors, data
  sync, publishing/retry/rate-limit và billing/entitlements chưa triển khai.
- Creative vẫn ở browser; không nhúng real publisher HTML/ad scripts/remote
  context images. Auth, tenant isolation, data sync và billing chưa có. ZIP chứa
  media binary; session-only draft cần xuất JSON/ZIP trước reload. Các trạng thái
  reference/estimated/conflict/unknown tiếp tục giữ nguyên bằng chứng nguồn.

## Bản build và kiểm tra cuối - renderer 0.2 (lịch sử)

- `npm test`: 14 test files, 80 tests pass (10:34:06 giờ local).
- `npm run build`: TypeScript và Vite 8.3.4 production build pass.
- Bootstrap `index-BPYqvisr.js`: 774,281 bytes, gzip 149.14 kB. Export/ZIP/image
  libraries tải riêng khi cần. Cảnh báo Vite >500 kB vẫn được giữ.
- `node scripts/acceptance-browser.mjs --url http://127.0.0.1:4176/ --session final-completion`:
  24/24 assertions pass, không có console/page error, failed request, CSP violation
  hoặc external request trong luồng upload/đổi target/preview/export.
- [Browser report](../output/playwright/acceptance-browser-final-qa.json),
  [video/responsive report](../output/playwright/media-current-qa.json),
  [package verification](../output/playwright/package-current-checks.json) và
  [pixel verification](../output/playwright/video-pixel-check.json) là bằng chứng
  production local cuối. Fixture ảnh được tạo với PNG chunk CRC hợp lệ; crop được
  kiểm tra qua input event và rendered object-position.

## Nghiệm thu MVP theo ID

| ID | Kết quả và bằng chứng |
|---|---|
| C01 | Browser: Feed 23/76, Stories 76/23, Reels 50/50; quay về Feed giữ 23/76, cùng blob URL và asset. `c01` trong browser report. |
| C02 | [catalogBridge tests](../src/features/catalogBridge.test.ts): 4-image album giữ composition/asset, target carousel báo unsupported và gợi ý variant. Screenshot `.qa/surface-album-four-{375,1440}.png`. |
| C03 | [engine tests](../src/validation/engine.test.ts): boundary 1/2/35/36; screenshot `.qa/surface-carousel-{2,35,36}-{375,1440}.png`, count được kiểm riêng với music/media. |
| C04 | catalogBridge tests giữ URL từng card trong review và fail constraint TikTok; thiếu music vẫn fail. Không dùng mute để chứng nhận quyền nhạc. |
| C05 | engine tests: CJK/emoji đúng 30 units pass, 31 fail với actual/expected/counting strategy. [Preview tests](../src/features/Preview.test.tsx) kiểm RSA combinations và path; `.qa/rsa-export-fixed.png` kiểm render. |
| C06 | engine tests: Form OA 40 pass; creative brand 31 fail theo rule riêng. |
| C07 | engine tests: video 40 MiB nằm giữa limit conflict, result unknown. `.qa/surface-zalo-conflict-{375,1440}.png` giữ cảnh báo. |
| C08 | Production video seek 3.9s, PNG 720x1662 có pixel giữa `[0,0,255,255]`; ZIP giữ 3900ms, asset bytes/hash đúng. Video/responsive, pixel và package reports. |
| C09 | Browser: clear headline giữ sau Mobile → Desktop → Mobile; Desktop inherit. catalogBridge/draft tests kiểm resolved input không fallback khi clear. |
| C10 | [draft tests](../src/storage/draft.test.ts), [reviewPackage tests](../src/storage/reviewPackage.test.ts): schema lạ, unsafe keys/depth/path/hash bị từ chối; JSON metadata không chứng nhận binary. `.qa/missing-assets.json` và missing-assets screenshots kiểm thông báo chọn lại asset. |
| D01 | [source registry](SOURCE_REGISTRY.md), [runtime registry](../src/catalog/sources.ts), catalog/admicro tests: E01-E18 ổn định, checkedAt/authority/evidence và limitation giữ rõ. |
| D02 | [catalog tests](../src/catalog/catalog.test.ts) kiểm source refs của từng rule, evidence và confidence (rule hoặc profile); source thiếu làm test fail. Resolver/engine giữ source và version trong result. |
| D03 | [audit tests](../src/catalog/audit.test.ts), catalogBridge tests và UI screenshots: reference không trở thành verified vì có renderer. |
| D04 | catalogBridge context test: unknown objective/market/account giữ unknown trong validation và manifest. |
| D05 | audit tests: deprecated fixture mặc định ẩn, bật reveal giữ source/lý do. Snapshot thật không có deprecated row; không tạo dữ liệu runtime giả để chứng minh case. |
| D06 | [inventory tests](../src/catalog/inventory.test.ts), audit tests: Meta/TikTok pending chỉ trong Catalog, evidence unknown, không có renderer/verified claim. |
| D07 | draft/reviewPackage tests: metadata JSON không được tin; ZIP chỉ khôi phục sau reinspection và SHA-256. Codec MP4 chưa xác minh vẫn unknown. |
| D08 | [Admicro tests](../src/catalog/admicro.test.ts): raw row/cell/snapshot, duplicates/conflicts và 14 publisher labels được giữ. |
| D09 | Admicro/[publisher tests](../src/features/publisherModel.test.ts): package nhiều SlotSpec và binding riêng; `.qa/admicro-final-desktop.png` có 3 slot. |
| D10 | engine/Admicro tests và source drawer: byte/dimension conflict giữ unknown và giá trị nguồn. Không dùng source cũ làm current pricing/availability. |
| A01 | Browser report: Tab qua header/target/editor/preview/issues/export; drawer trap, Escape đóng và trả focus. `.qa/keyboard-focus.json` ghi focus outline. |
| A02 | Status có icon/text; `.qa/contrast-tokens.json` cho body/control tokens 4.64:1 trở lên. Đây là token/DOM audit, không phải chứng nhận WCAG toàn bộ bằng screen reader. |
| A03 | Production DOM/screenshot 320/375/414/768/1024/1280/1440 không overflow; mobile preview trước issues trước editor. `responsive` trong video/responsive report, `output/playwright/final-current-*.png`. |
| A04 | Browser report: issue composition focus đúng `#composition`, source drawer mở và trả focus. Source/spec/evidence vẫn hiện trong drawer. |
| A05 | Facebook ZIP giữ 4 unknown, `needs_review`; review drawer hiện unresolved, không nói approved. Package verification và [export report](../output/playwright/export-qa-result.json). |
| A06 | Browser report: reduced-motion có animation/transition 0s. Export report: error hiển thị, retry thành công, cancel không tải file; copy giữ nguyên. |
| R01 | Preview/catalog tests và screenshot: evidence badge đúng; mô phỏng/reference/estimated được ghi rõ. Không có target claim pixel-verified. |
| R02 | Browser `r02`: 4 compare cards, 3 crop Facebook khác nhau và summary riêng. [Compare screenshot](../output/playwright/screenshots/final-qa-compare.png). |
| R03 | Publisher tests và `.qa/admicro-final-desktop.png`: simulated publisher, slot labels, asset binding, conflict; không live iframe/ad script. |
| R04 | reviewPackage tests và package verification: creative version/target IDs/hash/spec/renderer/validation đầy đủ. Renderer `adcraft-renderer/0.2`, catalog `2026.10.12-mvp`. |

## Visual, export và hiệu năng

Workspace, single image, album, carousel 2/35/36, Form thiếu/đủ media, video
conflict, Google Display 300x250/300x600/320x50, ChatGPT web/mobile, publisher,
compare và JSON missing-assets có screenshot synthetic trong `.qa/`. RSA và
publisher có screenshot export riêng. Artifact cũ là bằng chứng bổ sung cho
surface tương ứng; browser reports production phía trên kiểm các luồng cuối.
Không có target nào được claim verified geometry nên không dùng screenshot
mockup thay golden screenshot lấy từ platform account.

Review drawer ở 320/375/768/1440 không overflow, close button nhìn thấy và focus
trả về đúng trigger. Error/retry/cancel có [export report](../output/playwright/export-qa-result.json)
và `output/playwright/review-drawer-*.png`, `review-error.png`.
Reflow tương đương 150% ở logical viewport 960x600/250x541 không overflow
(`.qa/zoom-reflow.json`); không claim đây là browser zoom/native screen-reader test.

Đo local desktop: LCP 272 ms, CLS 0, DOMContentLoaded 136.2 ms, không initial
long task; bootstrap 774,281 decoded bytes. Đạt budget 1 MB / LCP <2.5s / CLS <0.1
trong [release operations](RELEASE_OPERATIONS.md). Không suy ra mobile-network
performance hoặc real-user INP từ kết quả này.

## Release artifact và ranh giới

Gói renderer 0.4 hiện tại:
[adcraft-local-mvp-2026-10-13-renderer04-final.zip](../output/releases/adcraft-local-mvp-2026-10-13-renderer04-final.zip),
với [SHA-256](../output/releases/adcraft-local-mvp-2026-10-13-renderer04-final.sha256).
Gói giữ build, source/config, docs và acceptance report 24/24 của bản hiện tại.
Packager kiểm SHA-256 từng file sau khi giải nén in-memory. Bundle lớn hơn 500 kB
và mobile-network LCP/INP vẫn là giới hạn chưa đo, không phải release gate đã đạt.

Gói lịch sử renderer 0.2:

Gói [adcraft-local-mvp-2026-10-13.zip](../output/releases/adcraft-local-mvp-2026-10-13.zip)
giữ `dist/`, source/config/package lock và tài liệu. Hash nằm tại
[SHA-256](../output/releases/adcraft-local-mvp-2026-10-13.sha256).
Gói không chứa `.env`, `node_modules` hoặc binary QA media. Quy trình phục hồi,
rollback và disable rule/renderer sai có trong release operations.

- MVP: session local, CSP, import guards, media ở browser. Network evidence chỉ
  chứng minh các luồng đã chạy; chưa public deploy. ZIP chứa creative binary.
- V1: SSO/RBAC, API/DB/storage tenant isolation, persistence, immutable snapshot,
  share expiry/revoke và C11-C12/D11-D12 vẫn cần triển khai trước cộng tác online.
- Future: OAuth/token protection, data sync, publishing/retry/rate-limit và
  billing/entitlement chưa triển khai. Không có kết nối quảng cáo hoặc thu phí.
- Gate nguồn vẫn mở: Meta/TikTok account/market, Admicro pricing/availability,
  Zalo video byte conflict và trademark review. Các trạng thái reference,
  estimated, conflict, unknown/pending không được tính verified coverage.

## Device mockups - renderer 0.3

Bổ sung ngày 13/10/2026. Bằng chứng renderer 0.2 và ZIP release phía trên giữ
nguyên như bản phát hành trước; ZIP đó chưa chứa tính năng device mockup.

- MVP: Khung xem trong Workspace/Compare gồm Theo target, iPhone 15/16 và PC.
  Screen iPhone đúng 393 x 852 logical points; PC 1440 x 900 CSS pixels.
  Bezel/stand nằm ngoài screen. Scale đồng nhất hai trục, không vượt 1x.
- `npm test`: 14 files, 81 tests pass. `npm run build`: TypeScript/Vite pass.
  Bootstrap 780.65 kB, gzip 150.99 kB; cảnh báo chunk >500 kB vẫn còn.
- [Device browser report](../output/playwright/device-mockup-qa.json): 18/18
  assertions pass. Workspace 1440/768/375/320 px không tràn ngang; screen dimensions
  và scale được đo bằng DOM. Đổi frame giữ asset, target, validation và video 3900ms.
  Nội dung dài cuộn bằng keyboard, desktop target tự chọn PC. Không console/page
  error hoặc external request trong các luồng này.
- [Compare report](../output/playwright/mockup-compare-qa.json): 4/4 assertions
  pass cho Mobile/PC ở 1440/375 px. Hai card đều đúng screen dimensions và scale,
  không tràn ngang. Screenshot có trong `output/playwright/mockup-compare-*.png`.
- [Regression report](../output/playwright/mockup-regression/acceptance-browser-final-qa.json):
  24/24 assertions pass, gồm target crop riêng, clear override, keyboard/drawer,
  compare 4, export, reduced motion và network/CSP checks.
- [Package verification](../output/playwright/mockup-package-checks.json): cả
  PC/phone ZIP giữ binary asset bytes và SHA-256, renderer 0.3, viewport/scroll
  context trùng snapshot. `unknown` vẫn là `needs_review`.
- [Pixel verification](../output/playwright/mockup-video-pixel-check.json): PNG
  834 x 1994, sau cuộn 1051 px và seek 3900ms, pixel video tại (417,843) là
  `[0,0,255,255]`. Xác nhận ảnh xuất giữ phần nội dung đang xem và đúng frame video.
- Visual inspection: phone/PC Workspace, phone trên màn hình 375 px, PC Compare
  và PNG video sau cuộn đều hiển thị khung, chrome và nội dung đúng tỉ lệ.
- V1: chưa thêm persistence online, auth/RBAC, tenant isolation hoặc share.
  Cần các lớp bảo vệ đó trước khi lưu/cộng tác qua server.
- Future: OAuth/token storage, data sync, publishing và billing chưa triển khai.
  Thay đổi này vẫn chỉ xử lý media local; ZIP chứa creative binary. Mockup không
  xác nhận platform approval hoặc pixel-perfect geometry từ tài khoản quảng cáo.
