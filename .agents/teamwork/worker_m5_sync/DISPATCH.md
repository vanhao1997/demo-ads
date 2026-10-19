# Task Assignment: worker_m5_sync

## Identity
- Role: Standalone Deliverable Sync Worker
- Working Directory: `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m5_sync`
- Parent: Project Orchestrator (Conversation ID: `853b94d8-915a-4180-baf9-463270ce3714`)

## Mandatory Reading
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\PROJECT.md`

## Objective
The parent Sentinel explicitly instructed:
"Please ensure `demo-app.html` is synchronized to `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` (the parent user prompt path) in addition to `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` before claiming victory."

Your task:
Synchronize the completed, approved deliverable at `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` (3,539 lines, 194,468 bytes) to:
`C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`.

## Procedure
1. Inspect `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\demo-app.html` to confirm it has 3,539 lines.
2. Transfer the file in 5 chunks using `view_file` on the source and `write_to_file` on the target:
   - Chunk 1: Lines 1–700 -> write_to_file(TargetFile="C:\\Users\\PC\\.gemini\\antigravity\\brain\\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\\scratch\\demo-app.html", Overwrite=true, ...)
   - Chunk 2: Lines 701–1400 -> write_to_file(TargetFile="C:\\Users\\PC\\.gemini\\antigravity\\brain\\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\\scratch\\demo-app.html", Append=true, ...)
   - Chunk 3: Lines 1401–2100 -> write_to_file(TargetFile="C:\\Users\\PC\\.gemini\\antigravity\\brain\\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\\scratch\\demo-app.html", Append=true, ...)
   - Chunk 4: Lines 2101–2800 -> write_to_file(TargetFile="C:\\Users\\PC\\.gemini\\antigravity\\brain\\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\\scratch\\demo-app.html", Append=true, ...)
   - Chunk 5: Lines 2801–3539 -> write_to_file(TargetFile="C:\\Users\\PC\\.gemini\\antigravity\\brain\\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\\scratch\\demo-app.html", Append=true, ...)
3. Verify that `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html` has exactly 3,539 lines and 194,468 bytes, and that lines 1–10 and lines 3520–3539 match byte-for-byte.
4. Write your handoff report to `c:\Users\PC\.gemini\antigravity\scratch\demo-ads\.agents\teamwork\worker_m5_sync\handoff.md` and send a completion message to the Project Orchestrator.
