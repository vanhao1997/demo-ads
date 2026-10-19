# BRIEFING — 2026-10-17T04:47:00Z

## Mission
Investigate codebase state and formulate an exact implementation strategy for Features 26, 27, 28, and 29 (Bilingual UI Toggle, Safe-Zone Overlays, Native App UI Toggle, TikTok TopView Phase Toggle).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1
- Original parent: 853b94d8-915a-4180-baf9-463270ce3714
- Milestone: Milestone 4 (Preview Controls & Realism Overlays)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify project source code
- Provide structured report in handoff.md following 5-component protocol

## Current Parent
- Conversation ID: 853b94d8-915a-4180-baf9-463270ce3714
- Updated: 2026-10-17T04:47:00Z

## Investigation State
- **Explored paths**:
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\fixtures\campaign-drafts.js`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier1-feature-coverage.js` (F26-29)
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\tests\tier3-cross-feature.js` (Combos 1, 4, 5)
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\App.tsx` (Lines 3190-3260, 1640-1750, 1200-1230)
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\PreviewSurface.tsx`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\OcclusionOverlay.tsx`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\occlusion.css`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\previewPresentation.ts`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\SocialPreview.tsx`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\socialPreview.css`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\ContextPreview.tsx`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\DeviceMockup.tsx`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\features\editorModel.ts`
  - `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\src\catalog\profiles.ts`
  - `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`
- **Key findings**:
  1. Feature 26: `App.tsx:3215` uses `<select>` instead of segmented buttons (`Tiếng Việt` / `English`) with `.bg-white` / `.active`. `previewPresentation.ts` is missing 6 canonical CTAs. `translations.ts` does not yet exist.
  2. Feature 27: Button text in toolbar is `"Safe zone"` instead of `"Vùng bị che"`, and in `PresentationControls` it is a checkbox labeled `"Vùng caption dài"`. Tests expect initial state to be inactive (`safeZone: false`) so that clicking highlights with `.border-brand` / `.bg-[#fdedef]`. Exactly 8 vertical 9:16 placements need this button.
  3. Feature 28: Button is currently an `<input type="checkbox">` labeled `"Giao diện app"`, failing button query in test 28.1. `DeviceMockup.tsx` needs to wire `appChrome` to hide status bar & home indicator.
  4. Feature 29: TikTok TopView phase toggle is a `<select>` with EN DASH `0–3 giây đầu`. Tests expect segmented options `"0-3 giây đầu"` / `"Sau 3 giây"`. Underlying CSS and `SocialPreview.tsx` already support full video vs in-feed overlay switching via `data-topview-phase="intro"|"feed"`.
- **Unexplored areas**: None within the scope of Features 26–29.

## Key Decisions Made
- Formulated complete implementation strategy covering code changes across `App.tsx`, `translations.ts`, `previewPresentation.ts`, `OcclusionOverlay.tsx`, `DeviceMockup.tsx`, and `occlusion.css`.

## Artifact Index
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1\BRIEFING.md` — persistent working memory
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1\progress.md` — liveness heartbeat
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_1\handoff.md` — full 5-component report
