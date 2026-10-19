# Task Assignment: reviewer_m5_2

## Identity
- Role: Code Reviewer M5 2 (Interactive Tools, Modals & Validation)
- Working Directory: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m5_2`
- Parent: Project Orchestrator (Conversation ID: `853b94d8-915a-4180-baf9-463270ce3714`)

## Mandatory Reading
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\TEST_READY.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m5_1\handoff.md`

## Objective
Independently review the interactive tools, modal handling, bilingual plumbing, and validation for Milestone 5:
1. Feature 30: Dedicated Accessible Zoom Modal (\"Phóng to\"):
   - Inspect `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html`.
   - Confirm elimination of legacy `onClick={() => setShowAll(true)}` from the \"Phóng to\" button.
   - Inspect `ZoomModal` component: `.zoom-modal-backdrop` (`background-color: rgba(11, 11, 15, 0.9)`, `backdrop-filter: blur(8px)`, `role=\"dialog\"`, `aria-modal=\"true\"`).
   - Inspect `.close-zoom-btn` (`✕` glyph, `aria-label=\"Đóng\"`).
   - Inspect `Escape` key event listener, backdrop click-to-close, and focus restoration to the trigger button without altering draft state.
2. Feature 26: Bilingual UI & In-Mockup Translation:
   - Verify `CANONICAL_CTA_MAP` (18 CTAs), `SPONSORED_LABELS` (11 platforms, LinkedIn 'Được quảng bá' ↔ 'Promoted'), `SEE_MORE_LABELS`.
   - Verify segmented buttons in toolbar: `Tiếng Việt` (.bg-white .active) and `English`.
   - Verify `lang` is plumbed down into all platform renderers dynamically.
3. Feature 27: Safe-Zone Overlays (\"Vùng bị che\"):
   - Verify initial state defaults strictly to `false` (`useState(false)`).
   - Verify button text \"Vùng bị che\", active styles `.border-brand` and `.bg-[#fdedef]`.
   - Verify button and overlays are restricted strictly to the 8 vertical 9:16 placements (exclude `facebook.reels_banner` / `fb_reels_overlay`).
4. Feature 28: Native App UI Toggle (\"Giao diện app\"):
   - Verify `IPhoneFrame` status bar (`.device-phone-status` with `9:41`) and home bar (`.device-home-indicator`) unmount/hide when `showAppUi === false`.
   - Verify reaction rails and bottom action bars unmount when `showAppUi === false`.
5. Feature 29: TikTok TopView Phase Toggle:
   - Verify segmented control \"0-3 giây đầu\" vs \"Sau 3 giây\".
   - Verify clean intro mode (Skip button) vs in-feed overlay mode.
6. Feature 31: Fullscreen Workspace:
   - Verify button toggles between \"Toàn màn hình\" and \"Thoát toàn màn hình\", with `fullscreenchange` event listener.
7. Features 32 & 33: Live Validation & Official Specs Card:
   - Verify CJK double-width weighting (`countGoogleCharacters`).
   - Verify verbal badges `✓ Không có lỗi`, `! X lỗi`, `X cảnh báo`.
   - Verify TikTok brand name validation and official specs card rendering.

## Deliverable
Write your complete review report to `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\reviewer_m5_2\handoff.md`.
Include your clear binary verdict: **APPROVE** or **REQUEST_CHANGES**.
When done, send a message to the Project Orchestrator.
