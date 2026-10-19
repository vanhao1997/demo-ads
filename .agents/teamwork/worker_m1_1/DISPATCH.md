## 2026-10-17T01:58:35Z
Identity: You are worker_m1_1, working in directory c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m1_1.
Your parent is the Project Orchestrator (conversation ID: 853b94d8-915a-4180-baf9-463270ce3714).

MANDATORY: You MUST read c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read:
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\spec_miner_survey_1\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_codebase_survey_1\handoff.md
- c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\explorer_standalone_survey_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement Milestone 1: Core Layout, Tokens & Ad Content Editor (Requirements R1 and R4).

Scope & Implementation Tasks:
1. Layout & Design Tokens:
   - Update src/styles.css with authoritative CSS variables matching go.noti.vn:
     --brand: #ed3c47, --brand-600: #d62e3a, --brand-050: #fdedef, --bg-subtle: #f6f6f7, --border: #e7e7ea, --glass-bg: #ffffff8c, --glass-border: #ffffff59, --glass-blur: 16px, --glass-shadow: 0 8px 32px #1011161f, inset 0 1px 0 #ffffff80.
   - Align grid layout in src/App.tsx and src/styles.css to lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] with min-w-0 on both child containers.
2. Input State & Dashed Default Styling:
   - Fix dashed border handling: inputs should render with dashed pink border (border-dashed border-brand/50 bg-brand-050/40) ONLY when showing default placeholder values. When the user edits or inputs content, it must switch to solid border (border-border bg-surface).
3. Multi-File Carousel Upload:
   - Update upload handler in src/App.tsx / src/features/EditorPanel.tsx / src/media/inspect.ts:
     - Enforce maximum 10 files cap.
     - Automatically switch composition to 'carousel' when 2 or more creative files are uploaded.
     - Support per-card title, description, URL inputs when composition === 'carousel'.
4. Collapsible Platform Overrides:
   - Move platform-specific overrides into expandable collapsible accordions (<details> / <summary> or collapsible section) directly inline inside the Nội dung quảng cáo editor below primary copy fields:
     - Google Search Responsive Ads: headlines (3-15), descriptions (2-4), paths (2), sitelinks (2-8), callouts.
     - GDN: Long Headline (max 90 chars).
     - YouTube: Headline (max 15 chars), CTA (max 10 chars).
     - ChatGPT: Title (3-50 chars), Body (max 100 chars).
5. Minimal Decorative Iconography (R4):
   - Prune all 9 decorative icons identified in explorer_standalone_survey_1/handoff.md:
     - Remove pulsing pencil icons from inputs and notice banners.
     - Remove shield icon from privacy notice.
     - Remove upload and reset icons from buttons.
     - Remove device icons from placement pills.
   - Retain 18x18 monochrome platform logos and native mockup chrome (status bar, dynamic island, home bar).
   - Add missing SVGs for chatgpt, linkedin, and admicro into src/features/PlatformLogo.tsx.

Write Ownership:
You own: src/App.tsx, src/styles.css, src/features/EditorPanel.tsx, src/features/PlatformLogo.tsx, src/media/inspect.ts.
Do NOT modify test files under tests/ or create standalone HTML yet (handled in subsequent milestones).

Verification:
- Document all changes and verification steps in c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m1_1\handoff.md.
