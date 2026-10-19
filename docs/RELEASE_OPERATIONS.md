# Local MVP release operations

This release is the browser-only Adcraft preview/preflight workspace. It has
no server persistence, OAuth, publishing or billing. Simulated/reference
layouts and unresolved source conflicts remain visible in UI and exports.

## Build and run

Use Node.js 22.12+ (22.x), 24.x or 26+ and the committed package lock. The full
build/test toolchain is verified on Node.js 22.23.2; Vitest 5 excludes Node 20:

```powershell
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
```

Open `http://127.0.0.1:4176/`. Serve the built `dist/` through HTTP; opening
`index.html` directly as a file does not support the module/blob workflow.
Keep the preview server bound to loopback for local use.

## Acceptance evidence

The canonical checklist is [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md).
[RELEASE_EVIDENCE.md](RELEASE_EVIDENCE.md) records current checks and their
limits. `output/playwright/` contains the latest production browser evidence;
`.qa/` contains earlier synthetic media and visual fixtures. None of these
fixtures are customer uploads or platform approval evidence.

## Performance decision

For this local MVP, initial budgets are 1 MB decoded bootstrap JavaScript,
LCP below 2.5 seconds and CLS below 0.1 on the current desktop local preview.
The observed build keeps the full static Admicro provenance catalog in the
bootstrap. Export/image/ZIP libraries load when needed. Vite's 500 KB chunk
warning remains visible; it is not suppressed by raising its limit.

These are local operational checks, not mobile-network or real-user INP
claims. Validate the intended browser/network before hosting for a wider
team. V1 can move the catalog behind cached/versioned queries when its
persistence and access model are selected.

## Release archive and rollback

Keep each `dist/` release as a separate archive with SHA-256. Preserve an
already-working release before replacing the hosted static directory.

After acceptance passes, package the build, source, configuration, docs and
compact QA reports:

```powershell
node scripts/package-release.mjs 2026-10-13
Get-FileHash output/releases/adcraft-local-mvp-2026-10-13.zip -Algorithm SHA256
```

Nếu đã có release cùng ngày, đặt revision để giữ bản cũ. Có thể chọn report
acceptance mới làm gate và lưu trong ZIP dưới tên canonical:

```powershell
node scripts/package-release.mjs 2026-10-13 renderer04-final output/playwright/mvp-recheck/acceptance-browser-final-qa.json
Get-FileHash output/releases/adcraft-local-mvp-2026-10-13-renderer04-final.zip -Algorithm SHA256
```

The packager verifies every archived file after compression, writes a per-file
`release-manifest.json` and a separate `.sha256`, and refuses to replace an
existing archive. Original QA media, `.env` and `node_modules` are excluded.
Extract the release into a new directory; run `npm ci` then the preview command
to serve its included `dist/`. Run build/tests there when changing the source.

1. Verify the archive hash against its recorded release hash.
2. Extract into a new directory and serve it locally. Run the import/export
   smoke checks before making it the active release.
3. If a new release regresses, switch the server's static root to the previous
   verified directory. Do not delete or overwrite that directory during rollout.
4. Re-run smoke checks and record the active catalog/renderer versions.

For this local MVP, users export JSON or a review ZIP before switching builds;
refreshing the page ends the browser session. A ZIP includes creative binary,
so share it only with intended reviewers.

## Wrong catalog rule or renderer

Do not edit an existing review ZIP. Mark the affected rule/profile evidence
`unknown` or `conflict`, include the source limitation, and rebuild after its
regression tests pass. If the renderer cannot safely show the target, remove
that target from the renderer picker and keep a catalog-only pending entry.
The previous release archive provides rollback while the fix is validated.
Changing a label to `verified` is never a workaround for missing evidence.

## Hosting boundaries

An internal hosted release needs the company's SSO/VPN/access gateway before
using client confidential creatives. Configure HTTP security headers at that
gateway, including `frame-ancestors` (which cannot be enforced in a meta CSP),
`X-Content-Type-Options: nosniff` and a referrer policy. The bundled CSP allows
same-origin modules/fonts and local blob/data media; loopback WebSocket access
supports Vite development. Remove the development WebSocket allowances in a
production HTTP CSP header when a hosting provider is selected.

V1 requires server-side membership/RBAC, tenant isolation at API/DB/storage,
private assets, immutable snapshots and expiring/revocable share links.
Future connectors require OAuth token protection, permission review, bounded
retries and idempotency. Billing needs a separate subscription/entitlement
design if commercialization is requested. These are not implemented here.
