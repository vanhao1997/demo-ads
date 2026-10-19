# Review & Adversarial Challenge Report — Milestone 1: Core Layout, Tokens & Ad Content Editor

**Agent**: `reviewer_m1_2`  
**Parent**: Project Orchestrator (`853b94d8-915a-4180-baf9-463270ce3714`)  
**Timestamp**: 2026-10-17T02:35:00Z  
**Verdict**: **APPROVE**  
**Integrity Status**: **CLEAN (Zero Integrity Violations Found)**  

---

## 1. Observation

Direct observations from independent code inspection and adversarial stress-testing across all Milestone 1 targets:

### 1.1 State Management & History Synchronization (`src/App.tsx`, `src/features/useHistory.ts`)
- In `src/features/useHistory.ts:7-28`, history management is implemented with an immutable state machine reducer (`past`, `present`, `future`):
  ```ts
  export function historyReducer<T>(state: History<T>, action: Action<T>): History<T> {
    if (action.type === 'reset') return { past: [], present: action.value, future: [] }
    if (action.type === 'set') {
      if (action.value === state.present) return state
      return { past: [...state.past.slice(-59), state.present], present: action.value, future: [] }
    }
    if (action.type === 'undo' && state.past.length) {
      return {
        past: state.past.slice(0, -1),
        present: state.past.at(-1)!,
        future: [state.present, ...state.future],
      }
    }
    if (action.type === 'redo' && state.future.length) {
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      }
    }
    return state
  }
  ```
  The history stack is capped at 60 steps via `state.past.slice(-59)`.
- In `src/App.tsx:246-249`, state and ref synchronization is established:
  ```tsx
  const history = useHistory(initialDraft)
  const draft = history.value
  const draftRef = useRef(draft)
  draftRef.current = draft
  ```
- In `src/App.tsx:374-377`, `setDraft` guarantees synchronization across both ref and history:
  ```tsx
  const setDraft = (next: EditorDraft) => {
    draftRef.current = next
    history.set(next)
  }
  ```
- In `src/App.tsx:598-613`, keyboard undo/redo handles shortcuts (`Ctrl+Z` / `Cmd+Z`, `Ctrl+Shift+Z` / `Cmd+Shift+Z`), properly skipping execution when focused on native input controls:
  ```tsx
  if (
    exportBusy.current ||
    uploadBusy.current ||
    !(event.ctrlKey || event.metaKey) ||
    event.key.toLowerCase() !== 'z' ||
    (event.target as HTMLElement).closest('input, textarea, select')
  )
    return
  event.preventDefault()
  if (event.shiftKey) history.redo()
  else history.undo()
  ```
- In `src/App.tsx:1899-1925`, history buttons render with disable states bound to `!history.canUndo || uploading` and `!history.canRedo || uploading`.
- In `src/App.tsx:1916-1925`, the "Về nội dung mặc định" reset button calls `onClick={() => setDraft(initialDraft)}`. Because it routes through `setDraft`, the action is recorded in history, allowing the user to undo if clicked accidentally.

### 1.2 Character Count Bounds & Platform Overrides (`src/App.tsx`)
- In `src/App.tsx:36-37`, character counting uses `Intl.Segmenter` for grapheme cluster accuracy:
  ```tsx
  const count = (value: string) =>
    [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(value)].length
  ```
- In `src/App.tsx:210-221`, `Field` marks over-limit character counts:
  ```tsx
  <span className={limit && count(value) > limit ? 'over-limit' : ''}>
    {count(value)}
    {limit ? ` / ${limit}` : ''}
  </span>
  ```
- In `src/App.tsx:3161-3210`, `ArrayField` enforces bounds on dynamic lists:
  - Deletion button is rendered if and only if `values.length > minCount` (`src/App.tsx:3193`).
  - Addition button is rendered if and only if `values.length < maxCount` (`src/App.tsx:3203`).
- In `src/App.tsx:2217-2420`, collapsible `<details className="platform-accordion">` elements enforce exact field limits:
  - **Google RSA Headlines**: `minCount={3}`, `maxCount={15}`, `limit={30}` (`src/App.tsx:2230-2237`).
  - **Google RSA Descriptions**: `minCount={2}`, `maxCount={4}`, `limit={90}` (`src/App.tsx:2239-2246`).
  - **Google RSA Paths**: 2 items in `field-pair`, `limit={15}` each (`src/App.tsx:2248-2264`).
  - **Google Sitelinks**: `minCount={2}`, `maxCount={8}`, `limit={25}` (`src/App.tsx:2267-2281`).
  - **Google Callouts**: `minCount={1}`, `maxCount={10}`, `limit={25}` (`src/App.tsx:2283-2296`).
  - **GDN Long Headline**: `limit={90}` (`src/App.tsx:2313-2320`).
  - **YouTube Headline**: `limit={15}` (`src/App.tsx:2344-2357`).
  - **YouTube CTA**: `limit={10}` (`src/App.tsx:2358-2370`).
  - **ChatGPT Title**: `limit={50}` with helper text `"Tối thiểu 3 ký tự, tối đa 50 ký tự."` (`src/App.tsx:2387-2400`).
  - **ChatGPT Body**: `limit={100}` with helper text `"Tối đa 100 ký tự."` (`src/App.tsx:2402-2417`).

### 1.3 Upload Handling & Security Sniffing (`src/App.tsx`, `src/media/inspect.ts`)
- In `src/media/inspect.ts:19`, `MAX_CAROUSEL_FILES = 10` is defined.
- In `src/media/inspect.ts:21-35`, binary magic byte sniffing checks raw header bytes:
  - PNG: `bytes[0] === 0x89 && text(1, 4) === 'PNG'`
  - JPEG: `bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff`
  - GIF: `text(0, 3) === 'GIF'`
  - WebP: `text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP'`
  - MP4: `text(4, 8) === 'ftyp'`
  - MP3: `text(0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)`
  - WAV: `text(0, 4) === 'RIFF' && text(8, 12) === 'WAVE'`
  Non-conforming files (including SVG, HTML, or renamed executables) throw an explicit error (`src/media/inspect.ts:76-78`).
- In `src/App.tsx:624-633`, the 10-file budget is enforced:
  - If `currentAssetCount >= 10`: displays notice `'Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ).'` and immediately halts.
  - If incoming files exceed `10 - currentAssetCount`: takes only the permitted slice and logs notice: `'Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua ${incoming.length - allowedCount} tệp thừa.'`.
- In `src/App.tsx:647-653`, duplicate SHA-256 assets are detected, their blob URLs revoked, and error messages added to the status notice.
- In `src/App.tsx:666-684`, uploading 2+ creative files automatically switches `composition` to `'carousel'` and initializes per-card `cardDetails`.
- In `src/App.tsx:1067-1075`, notice messages are displayed in `<div className="notice" role="status">` with a dismiss button.

### 1.4 Layout Styles & CSS Variable Inheritance (`src/styles.css`, `src/features/deviceMockup.css`)
- In `src/styles.css:2-27`, authoritative `:root` variables are defined:
  - `--bg: #ffffff`, `--bg-subtle: #f6f6f7`, `--surface: #ffffff`, `--text: #101113`, `--text-muted: #5f6470`, `--border: #e7e7ea`
  - `--brand: #ed3c47`, `--brand-600: #d62e3a`, `--brand-050: #fdedef`, `--accent: #ff7849`
  - `--glass-bg: #ffffff8c`, `--glass-border: #ffffff59`, `--glass-blur: 16px`, `--glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80`
- In `src/styles.css:678-700`, the 2-column layout uses:
  ```css
  .workbench {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: 24px;
    row-gap: 0;
    align-items: start;
  }
  .workbench > * {
    min-width: 0;
  }
  .workbench > .editor-panel {
    grid-column: 1;
    grid-row: 1 / span 3;
  }
  ```
  On screens `<= 900px` (`src/styles.css:3177-3205`), the workbench shifts to flex column layout with `.editor-panel` having `order: 1`, ensuring the editor remains accessible on mobile.
- In `src/styles.css:945-977`, input default states are styled with pink dashed borders (`border-style: dashed; border-color: rgb(237 60 71 / 0.5); background-color: rgb(253 237 239 / 0.4)`), transitioning to solid border when edited or focused.
- In `src/features/deviceMockup.css:89-108`, dark and immersive mockups (TikTok 9:16, YouTube Shorts, Reels) isolate dark backgrounds (`#050505`) and invert status bar indicators to white (`#ffffff` with text-shadow) without leaking into the outer workspace.

### 1.5 Minimal Iconography & Custom SVGs (`src/features/PlatformLogo.tsx`, `src/App.tsx`)
- Pulsing pencil icons, shield icons, button sparkles, and device icons on placement pills have been pruned.
- In `src/features/PlatformLogo.tsx:52-56`, custom SVG paths for `chatgpt`, `linkedin`, and `admicro` are provided and sanitized, eliminating text fallback badges.

---

## 2. Logic Chain

1. **Integrity Verification**:
   - Grep searches across all `.ts`, `.tsx`, and `.css` files in `src/` for hardcoded test results, test harness identifiers (`__TEST`, `tier1`, `tier2`), or test fixture names (`CustomBrand123`, `Sale 50%`) returned zero occurrences.
   - All components (`useHistory`, `Field`, `ArrayField`, `addFiles`, `inspectFile`, `PlatformLogo`) implement authentic production logic rather than stubbed facades.
   - Result: No integrity violations detected.

2. **State Management & History Safety**:
   - `useHistory` maintains past and future state immutable arrays with a 60-step cap, preventing unbounded memory consumption during typing.
   - `(event.target as HTMLElement).closest('input, textarea, select')` correctly prevents intercepting native input undo.
   - `uploadBusy` and `exportBusy` guards block history modifications during asynchronous operations, preventing race conditions.
   - "Về nội dung mặc định" dispatches `setDraft(initialDraft)`, creating an undo point so accidental resets can be reversed.
   - Result: State management is robust, predictable, and memory-safe.

3. **Character Bounds & Accordion Overrides**:
   - `ArrayField` encapsulates array mutation logic with strict guards: the remove button is conditionally rendered only when `values.length > minCount`, and the add button is conditionally rendered only when `values.length < maxCount`.
   - Google RSA bounds (headlines 3–15, descriptions 2–4, paths 2, sitelinks 2–8, callouts 1–10) and override character limits (GDN 90, YouTube 15/10, ChatGPT 50/100) match the specifications in `PROJECT.md` and `go.noti.vn`.
   - `updateGdnOverride`, `updateYoutubeHeadline`, `updateYoutubeCta`, `updateChatgptTitle`, and `updateChatgptBody` update both `draft.copy` and `draft.overrides[p.id]` across all relevant profiles, ensuring `resolvedCopy` immediately feeds into previews and validation.
   - Result: Bounds and overrides are strictly enforced and properly synchronized.

4. **Upload Handling & Sanitization**:
   - Magic byte inspection prevents MIME-spoofing attacks (e.g. executable or SVG disguised as JPEG/PNG).
   - The 10-file ceiling is checked both before processing (`currentAssetCount >= 10`) and during batch ingestion (`incoming.slice(0, allowedCount)`), with feedback in the notice banner.
   - Multi-file uploads (>= 2 creative files) automatically set `composition = 'carousel'` and populate `cardDetails`, matching requirement R1.
   - Result: Upload handling meets all security and functional constraints.

5. **Layout & Styling Inheritance**:
   - Authoritative `:root` design tokens match `go.noti.vn` (`--brand: #ed3c47`, `--border: #e7e7ea`, `--glass-bg: #ffffff8c`).
   - The workbench grid uses responsive `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` with `min-w-0` on children to eliminate flex/grid blowout.
   - Device mockups isolate dark and immersive stages without CSS variable pollution.
   - Result: Visual styling and layout geometry conform to design specifications.

---

## 3. Caveats

1. **Initial RSA Headlines Count in Default Draft**:
   In `src/features/editorModel.ts`, `initialDraft.copy.headlines` initializes with `['']` (length 1), matching the source tool's single headline for social feed ads. When expanding the Google Search RSA accordion from the initial state, 1 headline is initially displayed alongside the "+ Thêm tiêu đề rsa" button, and the validation panel accurately flags "Google RSA can 3-15 headlines" as a required item. For a smoother initial out-of-the-box experience on Google Search, downstream milestones could optionally initialize 3 empty headline fields when switching to the Google Search profile.
2. **Standalone HTML Prototype Sync**:
   `demo-app.html` in the workspace will be synchronized in Milestone 5 as planned in `PROJECT.md`. The React codebase in `src/` represents the authoritative component implementation for Milestone 1.

---

## 4. Conclusion

Milestone 1 satisfies all functional, architectural, and security requirements outlined in `PROJECT.md`, `ORIGINAL_REQUEST.md`, and the review dispatch. The implementation uses genuine logic with zero shortcuts, facades, or integrity violations.

**Verdict: APPROVE**

---

## 5. Verification Method

To independently verify the Milestone 1 implementation:

1. **State Management & History**:
   - Inspect `src/features/useHistory.ts:7-28` to verify the 60-step history reducer with `set`, `undo`, `redo`, and `reset` actions.
   - Inspect `src/App.tsx:598-613` to confirm `Ctrl+Z` / `Cmd+Z` handling and input bypass.
   - Inspect `src/App.tsx:1899-1925` to confirm history buttons and the default reset button routing through `setDraft(initialDraft)`.
2. **Character Count Bounds & Overrides**:
   - Inspect `src/App.tsx:2229-2296` to confirm RSA bounds: headlines (3–15, max 30), descriptions (2–4, max 90), paths (2, max 15), sitelinks (2–8, max 25), callouts (1–10, max 25).
   - Inspect `src/App.tsx:2312-2418` to confirm GDN (90), YouTube (15/10), and ChatGPT (50/100) fields and helpers.
   - Inspect `src/App.tsx:3161-3210` to confirm `ArrayField` `minCount` and `maxCount` button disabling.
3. **Upload Handling & Magic Byte Sniffing**:
   - Inspect `src/media/inspect.ts:21-35` for binary magic byte detection (PNG, JPEG, GIF, WebP, MP4, MP3, WAV) and SVG rejection.
   - Inspect `src/App.tsx:624-634` for 10-file budget capping and excess file notice.
   - Inspect `src/App.tsx:666-684` for carousel auto-switch on >= 2 creative files.
4. **Layout Styles & CSS Tokens**:
   - Inspect `src/styles.css:2-27` for authoritative tokens (`--brand: #ed3c47`, `--border: #e7e7ea`, glass tokens).
   - Inspect `src/styles.css:678-700` and `src/App.tsx:1357` for `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` and `min-w-0`.
   - Inspect `src/styles.css:945-977` for dashed pink default input styling (`input-default`, `:placeholder-shown`).
