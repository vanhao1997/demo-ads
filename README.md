# Adcraft Preview Lab

Internal React/TypeScript MVP for previewing ad creatives across platforms,
checking placement rules, and exporting review snapshots. The app is local-first
in MVP: no OAuth, no publishing, no booking, no billing, and no server upload of
creative binary.

## Current status

The workspace has a React/Vite local MVP with catalog, editor, preview,
validation, media inspection, Admicro CPD publisher simulation, source registry
E01-E18, package bindings, review drawer/export and tests. Renderer
`adcraft-renderer/0.5` adds placement-specific app context, immersive vertical
mockups, VI/EN controls, estimated occlusion guides, Noti-style landing content,
all-placement Compare and zoom/fullscreen preview controls. It passes 107
unit/integration tests, 68 placement samples in both locales, 8 mobile vertical
checks, 6 chrome-toggle checks and 24/24 browser smoke assertions. See the
release evidence for coverage and limits; platform source conflicts stay
`unknown` or `needs_review`.

## Scripts

```bash
npm ci
npm test
npm run build
npm run dev
```

Production local preview after build:

```bash
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
node scripts/acceptance-browser.mjs --url http://127.0.0.1:4176/ --session final-qa
```

Browser acceptance uses `npx @playwright/cli` and requires its Chromium runtime.
Creative edits are session-only; export JSON or review ZIP before refreshing.

## Device mockups

Choose **Khung xem** in Workspace or Compare: automatic by target, Mobile, or PC.
The iPhone 15/16 preset uses a 393 x 852 logical-point screen; the PC preset uses
1440 x 900 CSS pixels. Both scale uniformly to the available panel width and
height. The 6.1-inch label identifies the phone preset, not a physical display
measurement on your monitor.

Long content scrolls inside the device, including with the keyboard. Switching
frames preserves the creative, target, crop and video timestamp. PNG/review ZIP
includes the device frame at canonical size with 2x raster resolution and the
viewed scroll position; mockup settings do not change platform validation.
Renderer `adcraft-renderer/0.5` records device viewport, scroll position and
presentation settings in the review manifest and snapshot. See
[current QA evidence](docs/RELEASE_EVIDENCE.md#native-platform-context---renderer-05-current).

## Platform presentation

The [Noti study](docs/NOTI_STUDY.md) covers 34 placement variants in both VI and
EN. The local renderer covers additional catalog variants: Facebook placements,
Instagram Feed/Stories/Reels, Threads, TikTok In-Feed/TopView, YouTube
watch/In-feed/Shorts, Search results, Display article slots, ChatGPT conversations
and Zalo. Admicro uses source-based publisher slot families and original demo
links; its publisher content is illustrative.

Use **Ngôn ngữ app** to change platform labels while retaining advertiser copy.
**Giao diện app**, safe-zone guides and the additional TikTok caption mask are
independent controls. TopView has intro and feed phases. **Tất cả vị trí** opens
the complete active placement set for the selected platform in Compare.
**Phóng to** opens a focused preview surface and **Toàn màn hình** uses the
browser fullscreen API; Escape exits native fullscreen. Reaction/like/comment/
save/share counts are static demo fixtures. Search includes organic context;
YouTube includes a host video/channel and skip/countdown context; ChatGPT keeps
the sponsored card separate below the answer.

PNG/review ZIP preserves locale, app chrome, caption-mask setting, TopView phase,
crop, card/RSA selection, video time and device context. Occlusion geometry is
estimated. No current platform pixel match, approval or inventory availability
is claimed. Local video detail/OCR detection is not implemented.

## Documentation map

- [Product spec](AD_PREVIEW_SPEC.md)
- [Platform matrix](PLATFORM_MATRIX.md)
- [Design guideline](design.md)
- [UI/UX specification](UI_UX_SPEC.md)
- [Acceptance tests](ACCEPTANCE_TESTS.md)
- [Visual QA plan](VISUAL_QA.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Data model](docs/DATA_MODEL.md)
- [Noti placement and language study](docs/NOTI_STUDY.md)
- [Source registry](docs/SOURCE_REGISTRY.md)
- [Brand assets](docs/BRAND_ASSETS.md)
- [Admicro CPD catalog](docs/ADMICRO_CPD_CATALOG.md)
- [Decision log](docs/DECISIONS.md)
- [MVP release evidence](docs/RELEASE_EVIDENCE.md)
- [Local release and rollback](docs/RELEASE_OPERATIONS.md)

## MVP scope

- Target-first catalog and editor.
- Single preview by default, compare any active target set or all placements for
  the selected platform.
- Rule engine with actual/expected/source/evidence.
- Local media parsing and safe-zone/preview overlays.
- Placement-specific app context, VI/EN UI and static demo interactions.
- Zalo native/Form/Display/Video conflict handling.
- Admicro CPD source catalog and simulated publisher context.
- Export PNG/package manifest for internal review.
- Noti-style landing sections for usage, feature, placement, privacy and FAQ
  content below the tool.

## Non-goals for MVP

- OAuth/ad account connection.
- Publishing ads or booking media.
- Server storage of creative binary.
- Real publisher iframes or ad scripts.
- Billing/subscription.
- Platform approval guarantees.

## Later phases

- V1: current platform-account goldens and original Admicro publisher-demo
  verification; persistence/sharing requires auth, RBAC and tenant-isolated
  private storage before going online.
- Future: measured local video detail/OCR assistance, approved connectors/data
  sync, publishing/retry and billing/entitlements. These are not implemented.

## Evidence rule

Every profile/rule must keep source, checked date, evidence and confidence.
`reference_only`, `estimated`, `conflict` and `unknown` must stay visible in UI
and export. A renderer existing in code does not make a placement verified.
