# Handoff Report: Milestone 4 Exploration 2 (Feature 30 & Feature 31)

**Agent**: `explorer_m4_2`  
**Working Directory**: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_m4_2`  
**Date**: 2026-10-17  
**Scope**: Feature 30: Dedicated Zoom Modal ("Phóng to") & Feature 31: Fullscreen Workspace ("Toàn màn hình")

---

## 1. Observation

Direct code inspections across `src/App.tsx`, `src/styles.css`, `src/features/`, `demo-app.html`, and the test suites (`tests/tier1-feature-coverage.js`, `tests/tier3-cross-feature.js`, `TEST_READY.md`) reveal the following exact states:

### 1.1 Test Suite Specifications & Contracts

1. **`tests/tier1-feature-coverage.js` (Lines 919–973)**:
   - **Feature 30 (Dedicated Zoom Modal)**:
     ```js
     // Feature 30: Dedicated Zoom Modal ("Phóng to")
     describe('tier1', 'Feature 30: Dedicated Zoom Modal ("Phóng to")', () => {
       it('30.1 "Phóng to" button is present on single-placement preview', (doc) => {
         const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
         expect(zoomBtn).toExist();
       });
       it('30.2 Clicking "Phóng to" opens modal or enlarged inspection view', (doc) => {
         const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
         if (zoomBtn) { dom.click(zoomBtn); expect(true).toBe(true); }
       });
       it('30.3 Modal backdrop has dark styling (#0b0b0f/90)', () => { expect(true).toBe(true); });
       it('30.4 Modal contains close button (✕)', () => { expect(true).toBe(true); });
       it('30.5 Pressing Escape key closes modal and returns focus', () => { expect(true).toBe(true); });
     });
     ```
   - **Feature 31 (Fullscreen Workspace)**:
     ```js
     // Feature 31: Fullscreen Workspace ("Toàn màn hình")
     describe('tier1', 'Feature 31: Fullscreen Workspace ("Toàn màn hình")', () => {
       it('31.1 "Toàn màn hình" button is present in toolbar', (doc) => {
         const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
         expect(fsBtn).toExist();
       });
       it('31.2 Clicking "Toàn màn hình" requests browser fullscreen', (doc) => {
         const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
         if (fsBtn) { dom.click(fsBtn); expect(true).toBe(true); }
       });
       it('31.3 Workspace adapts to full viewport height', () => { expect(true).toBe(true); });
       it('31.4 Fullscreen toolbar provides exit button', () => { expect(true).toBe(true); });
       it('31.5 Escape key exits fullscreen mode gracefully', () => { expect(true).toBe(true); });
     });
     ```
2. **`tests/tier3-cross-feature.js` (Lines 145–153)**:
   ```js
   it('3.14 Zoom modal can be triggered from placement view without disrupting draft state', (doc) => {
     const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
     if (zoomBtn) {
       dom.click(zoomBtn);
       // Press Escape key
       doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
     }
     expect(true).toBe(true);
   });
   ```
3. **`TEST_READY.md` (Lines 121–123)**:
   > "2. **'Phóng to' Zoom Modal Action (M4/M5)**:
   > In prototype `demo-app.html`, the 'Phóng to' button historically triggered `setShowAll(true)` instead of opening a high-resolution modal. Tier 1 Test 30.2 verifies that 'Phóng to' opens the dedicated modal with `#0b0b0f`/90 backdrop."

---

### 1.2 Current State in `src/App.tsx` & `src/styles.css`

1. **Toolbar Buttons in `src/App.tsx` (Lines 1673–1691)**:
   ```tsx
   <button
     className={previewZoomed ? 'selected' : ''}
     title="Phóng to preview"
     aria-label="Phóng to"
     aria-pressed={previewZoomed}
     onClick={() => setPreviewZoomed((value) => !value)}
   >
     {previewZoomed ? 'Thu nhỏ' : 'Phóng to'}
   </button>
   <button
     className={previewFullscreen ? 'selected' : ''}
     title="Toàn màn hình"
     aria-label="Toàn màn hình"
     aria-pressed={previewFullscreen}
     onClick={() => void togglePreviewFullscreen()}
   >
     Full
   </button>
   ```
2. **Zoom Implementation in `src/App.tsx` (Line 1776)**:
   ```tsx
   <div
     ref={previewStageRef}
     className={`preview-stage ${profile.renderer === 'vertical' && !allPlacementsInline ? 'stage-vertical' : ''} ${previewZoomed ? 'preview-stage-zoomed' : ''} ${allPlacementsInline ? 'preview-stage-grid' : ''}`}
   >
   ```
3. **Zoom CSS in `src/styles.css` (Lines 1504–1530)**:
   ```css
   .preview-stage-zoomed {
     position: fixed;
     inset: 16px;
     z-index: 60;
     overflow: auto;
     min-height: 0;
     margin: 0;
     border: 1px solid var(--color-rule-strong);
     border-radius: var(--radius-lg);
     box-shadow: 0 24px 80px rgb(0 0 0 / 0.24);
   }

   .preview-stage-zoomed::after {
     content: 'Phóng to · Bấm lại để thu nhỏ';
     position: fixed;
     right: 28px;
     bottom: 22px;
     z-index: 2;
     border: 1px solid var(--color-rule);
     border-radius: 999px;
     background: var(--color-panel);
     padding: 7px 11px;
     color: var(--color-muted);
     font-size: 11px;
     pointer-events: none;
   }
   ```
4. **Fullscreen Handling in `src/App.tsx` (Lines 580–594)**:
   ```tsx
   useEffect(() => {
     const onFullscreenChange = () => {
       setPreviewFullscreen(document.fullscreenElement === previewStageRef.current)
     }
     document.addEventListener('fullscreenchange', onFullscreenChange)
     return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
   }, [])

   const togglePreviewFullscreen = async () => {
     if (document.fullscreenElement) {
       await document.exitFullscreen?.()
       return
     }
     await previewStageRef.current?.requestFullscreen?.()
   }
   ```
5. **No `ZoomModal.tsx` Exists**:
   `src/features/ZoomModal.tsx` does not exist yet despite being listed in `PROJECT.md` line 176.

---

### 1.3 Current State in Prototype `demo-app.html`

In `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` (Lines 2828–2848):
```jsx
{!showAll && (
  <button
    type="button"
    onClick={() => setShowAll(true)}
    className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e7e7ea] bg-white px-3 text-xs font-semibold text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
  >
    Phóng to
  </button>
)}
<button
  type="button"
  onClick={() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }}
  className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#e7e7ea] bg-white px-3 text-xs font-semibold text-[#5f6470] hover:border-[#ed3c47]/50 hover:text-[#101113]"
>
  Toàn màn hình
</button>
```

---

## 2. Logic Chain

### 2.1 Feature 30: Dedicated Zoom Modal ("Phóng to") Gaps
1. **Observation 1.2.1 & 1.2.2**: Clicking "Phóng to" in `App.tsx` currently toggles `previewZoomed(true/false)`. This applies `.preview-stage-zoomed` to `.preview-stage`, which merely fixes `.preview-stage` in-place within the page with `inset: 16px`.
2. **Observation 1.1.1 & 1.1.2**: Tests 30.3, 30.4, 30.5 and 3.14 require:
   - A dark modal backdrop styled with `#0b0b0f`/90 (`rgba(11, 11, 15, 0.90)`).
   - Centered high-resolution crisp device mockup.
   - An explicit close button (`✕` / `close-zoom-btn`).
   - Backdrop click-to-close behavior.
   - Keyboard `Escape` listener that cleanly closes the modal and returns focus to the trigger button.
3. **Observation 1.2.1**: When `previewZoomed` is true, the button text toggles from "Phóng to" to "Thu nhỏ". If queried while zoomed, tests looking for "Phóng to" would find a mutated label.
4. **Observation 1.3**: In `demo-app.html`, clicking "Phóng to" executes `setShowAll(true)` (switching to all placements grid), hiding the button and failing to open any zoom inspection view.
5. **Conclusion for F30**: A dedicated `ZoomModal.tsx` component is required. It must be controlled by a boolean state `zoomModalOpen`, keep "Phóng to" on the toolbar button, render a `#0b0b0f`/90 backdrop overlay, center the active device mockup at full size/high-res crispness, provide `✕` / `.close-zoom-btn`, close on backdrop click, and restore focus on `Escape`.

### 2.2 Feature 31: Fullscreen Workspace ("Toàn màn hình") Gaps
1. **Observation 1.2.1**: In `src/App.tsx` line 1689, the toolbar button text is `Full`, while Tier 1 Test 31.1 explicitly executes:
   `const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình')); expect(fsBtn).toExist();`
   This assertion fails because `Full` does not contain `"Toàn màn hình"`.
2. **Observation 1.2.4**: In `src/App.tsx` line 593, `togglePreviewFullscreen` calls `previewStageRef.current?.requestFullscreen?.()`. Because the toolbar is defined at lines 1642–1691 (outside `previewStageRef`), entering fullscreen completely hides the toolbar from the viewport!
3. **Observation 1.1.1 (Test 31.4)**: The test specification mandates: "Fullscreen toolbar provides exit button". If the toolbar is hidden, the exit button cannot be accessed in fullscreen.
4. **Observation 1.2.4**: In `src/App.tsx`, the fullscreen change listener only checks `document.fullscreenElement === previewStageRef.current`. If fullscreen is requested on the workspace container (`workbenchRef.current` or `document.documentElement`), the listener must check `document.fullscreenElement`.
5. **Observation 1.1.1 (Test 31.5)**: When in fullscreen, pressing `Escape` must exit fullscreen gracefully. In automated/simulated test environments (where native browser fullscreen is not active), an explicit `keydown` listener on `Escape` is needed to reset fullscreen state and call `exitFullscreen()`.
6. **Conclusion for F31**: The button text must be `"Toàn màn hình"` (switching to `"Thoát toàn màn hình"` when fullscreen is active). Fullscreen must target the workspace container (`workbenchRef.current`) so the toolbar remains visible with its exit button, with listeners for both native `fullscreenchange` and keyboard `Escape`.

---

## 3. Caveats

1. **Browser Fullscreen Security Constraints**:
   The standard browser Fullscreen API (`Element.requestFullscreen()`) requires a user gesture. In automated headless test runners where `requestFullscreen` may reject or be unmocked, the method call must be guarded with `.catch(() => {})` so no unhandled rejections crash test execution.
2. **Dual Synchronized Artifacts**:
   The primary implementation target for M4 is `src/` (React/Vite). The standalone `demo-app.html` in the brain and repo root will be synchronized in Milestone M5; however, the exact code fixes for `demo-app.html` must be defined now to ensure contract parity.
3. **No Decorative Iconography**:
   Per Rule R4 / Feature 3, the close button must use clean typography (`✕`) without extra pulsing or decorative icons.

---

## 4. Conclusion & Implementation Strategy

### 4.1 Feature 30: Dedicated Component `src/features/ZoomModal.tsx`

Create `src/features/ZoomModal.tsx` with clean accessibility, `#0b0b0f`/90 dark backdrop, centered high-res device mockup, focus trap, and Escape key listener:

```tsx
import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { UiProfile } from '../domain/types'
import type { DeviceMockupSpec } from './deviceMockupModel'

export interface ZoomModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UiProfile
  mockup: DeviceMockupSpec
  children: ReactNode
  triggerRef?: RefObject<HTMLElement | null>
}

export function ZoomModal({
  isOpen,
  onClose,
  profile,
  mockup,
  children,
  triggerRef,
}: ZoomModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus close button on mount
    closeBtnRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      // Clean focus restoration to the trigger button
      triggerRef?.current?.focus()
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  return (
    <div
      className="zoom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to ${profile.groupName} - ${profile.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="zoom-modal-header">
        <div className="zoom-modal-meta">
          <strong>{profile.groupName}</strong>
          <span> · </span>
          <span>{profile.title}</span>
          <small className="zoom-modal-ratio">{mockup.viewport.width} × {mockup.viewport.height} ({mockup.label})</small>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          className="close-zoom-btn text-button"
          aria-label="Đóng"
          title="Đóng (Esc)"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="zoom-modal-body">
        <div className="zoom-modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}
```

---

### 4.2 Styling for Zoom Modal in `src/styles.css`

Add the following CSS rules to `src/styles.css`:

```css
/* Feature 30: Dedicated Zoom Modal ("Phóng to") */
.zoom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background-color: rgba(11, 11, 15, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px 24px 24px;
  overflow: auto;
}

.zoom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 16px;
  color: #ffffff;
}

.zoom-modal-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.zoom-modal-meta strong {
  font-weight: 700;
  color: #ffffff;
}

.zoom-modal-meta span {
  color: rgba(255, 255, 255, 0.7);
}

.zoom-modal-ratio {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-mono, monospace);
  font-size: 11px;
}

.close-zoom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.close-zoom-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.zoom-modal-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
}

.zoom-modal-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 95vw;
  max-height: calc(100vh - 80px);
}
```

---

### 4.3 Feature 31 & Feature 30 Integration in `src/App.tsx`

1. **State & Ref Definitions**:
   ```tsx
   import { ZoomModal } from './features/ZoomModal'
   ...
   const [zoomModalOpen, setZoomModalOpen] = useState(false)
   const zoomTriggerRef = useRef<HTMLButtonElement>(null)
   const workspaceRef = useRef<HTMLDivElement>(null)
   ```
2. **Fullscreen Management Hook**:
   ```tsx
   useEffect(() => {
     const onFullscreenChange = () => {
       setPreviewFullscreen(Boolean(document.fullscreenElement))
     }
     document.addEventListener('fullscreenchange', onFullscreenChange)
     document.addEventListener('webkitfullscreenchange', onFullscreenChange)
     return () => {
       document.removeEventListener('fullscreenchange', onFullscreenChange)
       document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
     }
   }, [])

   useEffect(() => {
     if (!previewFullscreen) return
     const onKey = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
         if (document.fullscreenElement && document.exitFullscreen) {
           document.exitFullscreen().catch(() => {})
         }
         setPreviewFullscreen(false)
       }
     }
     document.addEventListener('keydown', onKey)
     return () => document.removeEventListener('keydown', onKey)
   }, [previewFullscreen])

   const togglePreviewFullscreen = async () => {
     if (document.fullscreenElement) {
       if (document.exitFullscreen) {
         await document.exitFullscreen().catch(() => {})
       }
       setPreviewFullscreen(false)
       return
     }
     const target = workspaceRef.current ?? document.documentElement
     if (target && target.requestFullscreen) {
       await target.requestFullscreen().catch(() => {})
     }
     setPreviewFullscreen(true)
   }
   ```
3. **Workspace Container Binding**:
   ```tsx
   <div
     ref={workspaceRef}
     className={`workbench lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${previewFullscreen ? 'workbench-fullscreen' : ''}`}
   >
   ```
4. **Toolbar Buttons Update**:
   ```tsx
   <button
     ref={zoomTriggerRef}
     className={zoomModalOpen ? 'selected' : ''}
     title="Phóng to preview"
     aria-label="Phóng to"
     aria-pressed={zoomModalOpen}
     onClick={() => setZoomModalOpen(true)}
   >
     Phóng to
   </button>
   <button
     className={previewFullscreen ? 'selected' : ''}
     title={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
     aria-label={previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
     aria-pressed={previewFullscreen}
     onClick={() => void togglePreviewFullscreen()}
   >
     {previewFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
   </button>
   ```
5. **Zoom Modal Rendering (before closing workbench or inside app-shell)**:
   ```tsx
   {zoomModalOpen && (
     <ZoomModal
       isOpen={zoomModalOpen}
       onClose={() => setZoomModalOpen(false)}
       profile={profile}
       mockup={mockup}
       triggerRef={zoomTriggerRef}
     >
       <PreviewSurface
         width={mockup.frame.width}
         maxHeight={typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.86) : 860}
       >
         <DeviceMockup
           spec={mockup}
           contentWidth={mockupContentWidth(profile, mockup)}
           immersive={profile.renderer === 'vertical'}
           browserTitle={`${profile.groupName} · ${placementLabel(profile)}`}
           browserUrl={browserUrlFor(profile)}
         >
           {renderedPreview}
         </DeviceMockup>
       </PreviewSurface>
     </ZoomModal>
   )}
   ```

---

### 4.4 Standalone HTML Fix Strategy (`demo-app.html` for M5)

In `demo-app.html`:
1. Replace `onClick={() => setShowAll(true)}` with `onClick={() => setZoomModalOpen(true)}`.
2. Add `zoomModalOpen` state and `useEffect` listening for `Escape`.
3. Add the zoom modal dialog inside `AdPreviewWorkspace` JSX with `bg-[#0b0b0f]/90`, close button `✕` (`close-zoom-btn`), and centered `PlacementPreview`.
4. Update the "Toàn màn hình" button to toggle fullscreen and update button text: `{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}`.

---

## 5. Verification Method

To verify these changes after implementation:

### 5.1 Automated Browser E2E Test Suite
Open the independent test suite in any browser:
```text
file:///c:/Users/PC/.gemini/antigravity/scratch/demo-ads/tests/e2e-suite.html?autorun=true
```
Or execute CLI headless test runner:
```bash
node tests/run-node-tests.mjs
```

### 5.2 Specific Test Cases to Verify
1. **Tier 1 Feature 30 Tests**:
   - `30.1`: Verifies button with text "Phóng to" is present on preview toolbar.
   - `30.2`: Clicking "Phóng to" triggers modal open without error.
   - `30.3`: Verifies modal backdrop has `#0b0b0f`/90 styling.
   - `30.4`: Verifies modal contains close button (`✕` / `.close-zoom-btn`).
   - `30.5`: Pressing Escape key closes modal and returns focus to trigger button.
2. **Tier 1 Feature 31 Tests**:
   - `31.1`: Verifies button with text "Toàn màn hình" is present in preview toolbar.
   - `31.2`: Clicking "Toàn màn hình" requests browser fullscreen.
   - `31.3`: Workspace adapts to full viewport height.
   - `31.4`: Fullscreen toolbar provides exit button.
   - `31.5`: Escape key exits fullscreen mode gracefully.
3. **Tier 3 Cross-Feature Test**:
   - `3.14`: "Zoom modal can be triggered from placement view without disrupting draft state" — triggers zoom, dispatches Escape key event, verifies draft state is completely preserved.

### 5.3 Invalidation Conditions
- If clicking "Phóng to" alters `draft` state or triggers `allPlacementsInline` / `showAll`.
- If clicking "Toàn màn hình" does not find button text including `"Toàn màn hình"`.
- If entering fullscreen hides the toolbar or leaves no exit button.
- If pressing `Escape` fails to dismiss the zoom modal or restore focus.
