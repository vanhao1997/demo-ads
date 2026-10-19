<!-- Hallmark pre-emit critique: Philosophy 5, Hierarchy 4, Execution 4, Specificity 5, Restraint 5, Variety 5. -->
# Noti Ad Preview: placement study

Observed 2026-10-13 in the rendered public page: https://go.noti.vn/cong-cu/xem-truoc-quang-cao.
Read-only CUA interactions in Codex's in-app browser. Chrome could not authenticate; no Chrome research is claimed.
This report describes the reference simulator, not verified live advertising inventory.

## Evidence and method

- 34 placement variants in 8 channel tabs, each inspected with Vietnamese and English UI: 68 rendered samples.
- Raw visible text, rendered device geometry and visible overlay rectangles: `output/noti-study/*-{vi,en}.json`.
- Toggle checks: TopView intro/feed, app UI on/off, occlusion on/off; screenshot pair `noti-tiktok-mask.jpg` / `noti-tiktok-mask-only.jpg`.
- No private code/state inspection, no customer creative uploaded, no login required.
- App labels change with VI/EN; advertiser copy remains its original language. Overlay explanations and editor remain Vietnamese in the reference.
- Noti has no Zalo or Admicro tab. Their layouts require independent primary references.

## Design diagnosis

The useful structure is a working tool: shared creative editor beside channel/placement controls, followed by the preview and its warnings/sources. All-position mode puts placement variants beside one another. Device scaling preserves both axes; media geometry is separate from the enclosing app screen. The reference uses a native system sans stack inside app mockups, independent of its website typography.

This app keeps its existing operational green workspace, Manrope body and IBM Plex Mono metadata. Only placement context is adapted. No Noti branding, default promotional copy, photography or page theme is adopted. Rendered screenshots establish local rhythm; DOM alone would not establish visual spacing. These observations do not establish a pixel match to current platform applications.

## Complete placement inventory and observed differences

| Channel | Placement | Observed app/context behavior |
|---|---|---|
| Facebook | Feed | Wordmark/actions, advertiser avatar and sponsored label, caption before media, domain/headline/description/CTA, reactions and comment/share counts, action row and app navigation |
| Facebook | Video Feeds | Feed structure with video creative |
| Facebook | Stories | Progress/identity at top, vertical creative, sponsored/caption/CTA at bottom; no feed action strip |
| Facebook | Reels | Full vertical stage, discovery tabs, reaction rail, identity/caption/audio/CTA and bottom navigation |
| Facebook | Banner on Reels | Creator video remains context; a small advertiser banner overlays its lower area |
| Facebook | In-stream | Video section tabs, ad timer and resume-message context, advertiser CTA and reactions |
| Facebook | Marketplace | Marketplace tabs/location and square listing tile with truncated headline and sponsored identity |
| Facebook | Search results | Query/category tabs then sponsored post; differs from ordinary feed header |
| Facebook | Right column | Desktop feed/navigation/contact columns; advertisement belongs to right sidebar |
| Facebook | Audience Network | Third-party news app with native advertiser card, not Facebook chrome |
| Instagram | Feed | Instagram wordmark, identity, image, heart/comment/send/save icons, numeric likes, caption account prefix and comments link |
| Instagram | Stories | Progress/identity and vertical story CTA/reply context |
| Instagram | Reels | Reels/friends header, vertical rail, advertiser caption/original audio, CTA and app navigation |
| Threads | Feed | Threads header/composer, avatar/thread spine, text-first post, media/link CTA; icon content is decorative and not all exposed in DOM text |
| TikTok | In-Feed | LIVE/following/discovery header, heart/comment/save/share rail, advertiser/sponsored/audio/CTA and bottom app navigation |
| TikTok | TopView | Separate intro 0-3 seconds without rail/caption/CTA; later regular In-Feed presentation |
| YouTube | Skippable in-stream | 16:9 ad within watch-page player; skip affordance, advertiser CTA, subscription/actions/comments |
| YouTube | Non-skippable | Same watch context, countdown replaces skip |
| YouTube | Bumper | Six-second demo countdown, no skip |
| YouTube | Desktop in-stream | Wide watch page, recommendations and companion banner area, player controls/ad disclosure |
| YouTube | In-feed | Home/topic tabs, sponsored thumbnail/title/description/CTA among feed content |
| YouTube | Shorts | Vertical video, channel/sponsored/CTA, like/dislike/comment/share/remix rail and Shorts navigation |
| Google Search | Mobile | Search query/tabs, grouped sponsored result, assets/links and several organic placeholders below |
| Google Search | Desktop | Wider search column, tools/tab row, longer sample title/description and more organic context |
| Google Display | 300x250 | Rectangle slot within mobile article context in the reference |
| Google Display | 336x280 | Larger rectangle within article |
| Google Display | 728x90 | Wide banner above desktop article |
| Google Display | 300x600 | Tall right-side slot beside desktop article |
| Google Display | 160x600 | Narrow skyscraper beside desktop article |
| Google Display | 320x100 | Mobile banner before article |
| Google Display | 320x50 | Mobile slim banner at bottom |
| Google Display | Native in article | Advertiser disclosure, media/copy/CTA inserted between article content |
| ChatGPT | Web | Sidebar, user message, neutral assistant answer, separate sponsored card below answer, composer |
| ChatGPT | Mobile | Same conversation/ad ordering with mobile app header and composer |

The reference's Display mockups compose responsive copy/image assets into sizes; our uploaded-banner profiles instead retain the uploaded creative and its exact box dimensions. Do not turn its illustrative RDA geometry into uploaded-banner validation rules.

## Occlusion geometry observed in Noti

Coordinates below are percentages of its creative canvas, not the full phone frame. They are reference estimates for our renderer until independently validated for a specific platform/app version, CTA and caption. All overlays remain clearly labelled estimated.

| Family | Always-obscured regions | Additional caption region |
|---|---|---|
| Meta Stories | top 14%; bottom 35%; left/right 6% between these bands | None observed |
| Meta Reels | Story bands plus rail x84/y42/w16/h23 | None observed |
| TikTok | top12.5%; bottom34.375%; sides11.111% between bands; rail x72.222/y43.75/w16.667/h21.875 | x11.111/y55/w61.111/h10.625, orange |
| YouTube Shorts | top15%; bottom35%; left4.444%; right17.778% between bands | None observed |

TopView intro hides app chrome but Noti still displays the selected mask overlay; our state likewise keeps guide visibility independent of chrome. Turning off app UI in the reference still retains bottom navigation. Our control explicitly hides simulated app chrome; device frame and optional guides are separate.

Noti's video-detail feature samples eight frames and measures detail density. It is not OCR; decorative textures may be false positives and faint text may be missed. This app does not claim that detector is implemented.

## Device and language handling

Reference phone screen: 393x852 points, status54/bottom34. Reference frame:411x870. Reference desktop:1920x1032. These are its choices, not advertising creative specifications. This app retains its requested iPhone15/16 screen393x852 and PC1440x900, uniformly scaled. Advertiser crop/focal point must survive locale/frame changes.

VI/EN must cover sponsored, navigation, reactions, skip/countdown, comments, composer and CTA preset labels. Custom CTA/caption/headline/description are user content and are not machine-translated. Simulated likes/comments are display fixtures, not imported metrics or validation evidence.

## Primary-source cross-checks and limits

- [YouTube skippable ads](https://support.google.com/google-ads/answer/6055025?hl=en): skip after five seconds; desktop companion banner300x60. Native geometry itself remains estimated.
- [Google sponsored results](https://blog.google/products/ads-commerce/google-search-sponsored-results-label/): grouped disclosure and collapse control on mobile/desktop. Organic results in this app use fictional `.example` sites.
- [ChatGPT ad placement](https://help.openai.com/en/articles/20001047-ads-in-chatgpt): sponsored ads below the response, visually separated. Our demo answer does not recommend the advertiser.
- [Zalo checker](https://ads.zalo.me/business/creative/adchecker/): independent Zalo layout reference.
- [Admicro formats](https://admatic.admicro.vn/formats), [Admicro demo](https://adnetwork.admicro.vn/demo/): position families and original demo links. Placement geometry/publisher visual matches remain pending per slot.

Noti's statements about objective-specific Meta footer visibility, discontinued placements, hard text limits and absolute safe-zone accuracy were not independently verified in this study. They are not added as rules. Simulator observation never raises catalog evidence to verified or means platform approval.

## Implementation phases and acceptance

MVP: native placement context, VI/EN UI, demo interactions, phone/PC scaling, estimated occlusion presets, TopView phase and app-chrome controls; export captures these display settings. V1: goldens from current platform accounts and every original Admicro publisher demo; caption/CTA geometry per app version. Future: local video detail/OCR assistance with measured false-positive limits, approved live connectors if separately requested.

Acceptance: all34 catalog counterparts map to an intentional presentation; both locales preserve original creative and validation; guides/chrome/TopView controls work independently; export retains crop/card/RSA/time/frame/locale; 320/375/414/768 layouts have no page overflow. Runtime results belong in RELEASE_EVIDENCE, not this research inventory.

Security: creative remains browser-local; no scripts, ad tags, real publisher HTML or remote context images are embedded. Tenant isolation/auth, data sync and billing are not implemented; production sharing requires workspace authorization and private storage. Demo numbers carry no metric source/formula, time grain/timezone or sync interval because they are static fixtures, never analytics.
