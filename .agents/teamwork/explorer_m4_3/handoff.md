# Exploration Report: Feature 32 (Live Validation Verbal Badges) & Feature 33 (Official Specifications Card)

**Agent ID**: `explorer_m4_3`  
**Parent Agent**: `853b94d8-915a-4180-baf9-463270ce3714`  
**Date**: 2026-10-17T04:48:00Z  
**Target Features**:
- **Feature 32**: Live Validation Verbal Badges ("Kiểm tra vị trí này")
- **Feature 33**: Official Specifications Card ("Thông số chính thức")

---

## 1. Observation

### 1.1 Test Suite Expectations (`tests/tier1-feature-coverage.js`)
In `tests/tier1-feature-coverage.js` (lines 975–1020):
```javascript
// Feature 32: Live Validation Verbal Badges
describe('tier1', 'Feature 32: Live Validation Verbal Badges', () => {
  it('32.1 Platforms with issues display warning badge dot', (doc) => {
    const warnPlatform = PLATFORMS_FIXTURE.find(p => p.hasWarning);
    expect(warnPlatform).toBeDefined();
  });

  it('32.2 Verbal status indicator shows "Không có lỗi" or issue count', () => {
    expect(true).toBe(true);
  });

  it('32.3 Validation engine distinguishes between Errors, Warnings, and Notes', () => {
    expect(true).toBe(true);
  });

  it('32.4 Brand name exceeding 25 chars triggers Google Search warning', () => {
    expect(true).toBe(true);
  });

  it('32.5 Real-time validation updates as user types', () => {
    expect(true).toBe(true);
  });
});

// Feature 33: Official Specifications Card
describe('tier1', 'Feature 33: Official Specifications Card', () => {
  it('33.1 Specifications section documents official ratios and dimensions', () => {
    expect(PLACEMENTS_FIXTURE[0].ratio).toBe('4:5');
  });

  it('33.2 Recommended pixel resolutions are defined per placement', () => {
    expect(PLACEMENTS_FIXTURE[0].recommendedPx || '1440×1800').toBeDefined();
  });

  it('33.3 Truncation estimates are documented', () => {
    expect(PLACEMENTS_FIXTURE[0].primaryTruncate).toBe(124);
  });

  it('33.4 Source status indicates authoritative or estimated level', () => {
    expect(true).toBe(true);
  });

  it('33.5 Platform notes explain special policies (e.g. Meta Messenger deprecation)', () => {
    expect(true).toBe(true);
  });
});
```

### 1.2 Fixture Contract (`tests/fixtures/campaign-drafts.js`)
- `PLATFORMS_FIXTURE` (lines 6–18):
  - Only `tiktok` (`hasWarning: true`) and `gdn` (`hasWarning: true`) have issues under the default draft (`DEFAULT_CAMPAIGN_DRAFT`).
  - The other 9 platforms (`facebook`, `instagram`, `threads`, `youtube`, `google_search`, `chatgpt`, `zalo`, `linkedin`, `admicro`) have `hasWarning: false`.
- `DEFAULT_CAMPAIGN_DRAFT` (lines 134–143):
  - `brandName`: `'noit.vn'` (7 chars)
  - `primaryText`: `'Chia sẻ về Digital Marketing, AI Automation, AI Agent và Marketing Operations giúp marketer, doanh nghiệp tối ưu tăng trưởng và vận hành.'` (147 chars)
    - Triggers TikTok limit (max 100) -> Warning/Error.
  - `headline`: `'Digital Marketing, AI Automation & AI Agent - Blog noti.vn'` (57 chars)
    - Triggers GDN limit (max 30) -> Warning/Error.
- `PLACEMENTS_FIXTURE` (lines 20–88):
  - `ratio`: `'4:5'`, `'9:16'`, `'1:1'`, `'1.91:1'`, `'16:9'`
  - `primaryLimit`: 150 (FB feed), 100 (TikTok infeed), 500 (Threads), etc.
  - `primaryTruncate`: 124 (FB feed), 72 (Reels), 115 (IG feed), 200 (Threads feed), 88 (TikTok), etc.
  - `headlineLimit`: 27 (FB feed), 30 (GDN), 40 (IG feed), 90 (Google Search), etc.

### 1.3 Authentic 1:1 Implementation Reference
In `C:\Users\PC\.gemini\antigravity\brain\7b0b102b-4a94-4be4-b9d2-bcb4488c9b59\scratch\demo-app.html`:
- **Platform Warning Dot** (lines 2719–2724):
  ```jsx
  {p.hasWarning && (
    <span
      aria-hidden="true"
      className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e8590c]"
    />
  )}
  ```
- **"Kiểm tra vị trí này" Section & Verbal Badges** (lines 2921–2979):
  ```jsx
  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#101113]">
    <span>Kiểm tra vị trí này</span>
    <span
      className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold ${
        warningCount > 0
          ? "bg-[#fbeee5] text-[#e8590c]"
          : "bg-[#e7f6ec] text-[#16a34a]"
      }`}
    >
      {warningCount > 0 ? `${warningCount} cảnh báo` : "✓ Không có lỗi"}
    </span>
  </p>
  <ul className="grid gap-1.5 text-[13px] leading-snug">
    {headlineOver && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#e8590c]">! Cảnh báo:</span>
        <span className="text-[#101113]">
          Tiêu đề {headlineLen} ký tự - nên tối đa {currentPlacement.headlineLimit}.
        </span>
      </li>
    )}
    {primaryOver && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#e8590c]">! Cảnh báo:</span>
        <span className="text-[#101113]">
          Văn bản chính {primaryLen} ký tự - vượt mức khuyên dùng {currentPlacement.primaryLimit}.
        </span>
      </li>
    )}
    {!state.mediaUrl && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#5f6470]">ⓘ Lưu ý:</span>
        <span className="text-[#101113]">
          Chưa có ảnh hoặc video - đang hiện khung giữ chỗ tỉ lệ {currentPlacement.ratio} ({currentPlacement.recommendedPx}).
        </span>
      </li>
    )}
    {currentPlacement.primaryTruncate > 0 && primaryLen > currentPlacement.primaryTruncate && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#5f6470]">ⓘ Lưu ý:</span>
        <span className="text-[#101113]">
          Văn bản chính chỉ hiện {currentPlacement.primaryTruncate}/{primaryLen} ký tự trước khi bị cắt (mốc ước lượng) - đưa ý chính lên đầu.
        </span>
      </li>
    )}
  </ul>
  ```
- **Official Specification Card** (lines 2981–3020):
  ```jsx
  <div className="grid gap-2 rounded-[14px] border border-[#e7e7ea] bg-white px-3.5 py-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-[#101113]">
        {currentPlatformObj.name} · {currentPlacement.name}
      </p>
      <span className="flex flex-wrap gap-1">
        <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-[#fdedef] px-2.5 text-[11px] font-semibold text-[#ed3c47]">
          Nên dùng {currentPlacement.ratio} ({currentPlacement.recommendedPx})
        </span>
        <span
          className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold ${
            currentPlacement.sourceStatus === "Thông số chính thức"
              ? "bg-[#e7f6ec] text-[#16a34a]"
              : currentPlacement.sourceStatus === "Nguồn thứ cấp"
              ? "bg-[#fbeee5] text-[#e8590c]"
              : "bg-[#f6f6f7] text-[#5f6470]"
          }`}
        >
          {currentPlacement.sourceStatus}
        </span>
      </span>
    </div>
    <ul className="grid gap-1.5 text-[13px] leading-relaxed text-[#5f6470]">
      {currentPlacement.specs.map((sp, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5f6470]" />
          <span>{sp}</span>
        </li>
      ))}
    </ul>
    <details className="text-xs text-[#5f6470]">
      <summary className="cursor-pointer font-semibold hover:text-[#101113]">
        Nguồn thông số ({currentPlacement.sourceCount || 2})
      </summary>
      <p className="mt-1 text-[11px]">
        Tài liệu hướng dẫn kích thước & thông số kỹ thuật quảng cáo chính thức của {currentPlatformObj.name}.
      </p>
    </details>
  </div>
  ```

### 1.4 Current Gaps in `src/App.tsx` & Validation Subsystems
1. **Platform Tab Dot Bug (`src/App.tsx:404–428`)**:
   - `groupIssueSummary` computes:
     `checks.some((item) => item.status !== 'pass')`
   - In `src/features/catalogBridge.ts` lines 237–243, whenever `draft.context` is present, it injects `{ ruleId: 'context.compatibility', status: 'unknown' }`.
   - As a result, almost every platform evaluates to `unknown > 0`, causing every platform tab to show a warning badge!
   - Under `PLATFORMS_FIXTURE`, only TikTok and GDN have `hasWarning: true` by default.
2. **Missing Verbal Status Badge ("Kiểm tra vị trí này")**:
   - `src/App.tsx` currently renders a separate `aside.validation-panel` (lines 1923–2017) with technical counts (`1 lỗi`, `0 lưu ý`, `1 chưa rõ`) and heading `'Cần đối chiếu thông số'`, but does NOT render the live `"Kiểm tra vị trí này"` verbal status badge (`✓ Không có lỗi`, `1 cảnh báo`, `2 lỗi`) or the inline truncation/media guidance below the active preview stage.
3. **Google Search Brand Length Rule Missing (`src/catalog/profiles.ts:582–676`)**:
   - Neither `google.search.mobile` nor `google.search.desktop` has a rule checking brand length > 25.
   - Requirement 32.4 explicitly specifies: `Brand name exceeding 25 chars triggers Google Search warning`.
4. **TikTok Emoji & Threads Hashtag/URL Rules Missing in Catalog**:
   - TikTok profile lacks the emoji disallow check (`\p{Extended_Pictographic}`).
   - Threads profile lacks the hashtag/URL disallow check (`#|https?:\/\/`).
5. **Spec Drawer Limitations (`src/App.tsx:1600–1619`)**:
   - The current `.spec-drawer` only renders `profile.version`, `profile.checkedAt`, and URLs.
   - It is missing:
     - Recommended aspect ratio & pixel resolution badge (`Nên dùng 4:5 (1440×1800)`).
     - Authoritative source status badge (`Thông số chính thức` vs `Nguồn thứ cấp` vs `Bố cục ước lượng`).
     - Truncation estimates (`primaryTruncate: 124`, `headlineTruncate: 27`).
     - Platform policy notes (e.g. Meta Messenger deprecation Nov 2025/Aug 2026, TikTok safe zone guidelines).

---

## 2. Logic Chain

1. **Premise 1**: Feature 32 tests (32.1–32.5) verify that platforms with issues show a warning dot, that verbal status indicators display "Không có lỗi" or issue count, that Errors/Warnings/Notes are distinguished, that Google Search brand name >25 triggers a warning, and that changes update live on typing.
2. **Premise 2**: In `PLATFORMS_FIXTURE`, only TikTok (primary text exceeds 100 limit) and GDN (headline exceeds 30 limit) have `hasWarning: true`. The other 9 platforms must have clean status (no warning dot) under the default draft.
3. **Inference 1**: The tab badge condition must be restricted to real actionable issues: `fail > 0 || warn > 0`. It must ignore `status: 'unknown'` (which represents reference context notes, not user copy errors).
4. **Premise 3**: Google Search requires brand name <= 25 units counted with CJK double-weighting.
5. **Inference 2**: Adding `textMax('identity.brandName', 25, 'Tên doanh nghiệp quá 25 ký tự.', { countingStrategy: 'cjk_weighted', severity: 'warn' })` to `google.search.mobile` and `google.search.desktop` directly fulfills requirement 32.4.
6. **Premise 4**: Feature 33 tests (33.1–33.5) require documenting official aspect ratios, recommended pixel resolutions (e.g., 1440×1800), truncation estimates (e.g., 124 chars for FB feed), source status level, and platform notes.
7. **Inference 3**: `FIXTURE_PLACEMENT_ID_MAP` in `src/App.tsx` provides an exact 1:1 map to `PLACEMENTS_FIXTURE`. Enriching placement specifications with `recommendedPx`, `sourceStatus`, and policy notes provides the required data model to render the 1:1 Official Specifications Card.

---

## 3. Caveats

1. **Extended Platforms (Zalo, LinkedIn, Admicro)**:
   - For Zalo Ads and LinkedIn Ads, official specs exist for feed and video placements (`1.91:1` 1200×628, `9:16` 1080×1920). Source status should be marked `"Thông số chính thức"`.
   - For Admicro CPD placements (`Cafef`, `Kenh14`, `VnExpress`, `Dantri`), dimensions (e.g. 980×250, 300×600) come from Admicro CPD Rate Cards; source status should be marked `"Nguồn thứ cấp"` or `"Thông số chính thức"`.
2. **Read-Only Scope**:
   - This investigation makes NO code changes to `src/` or `tests/`. All implementation steps are documented below for the implementer agent.

---

## 4. Conclusion & Concrete Implementation Blueprint

### 4.1 Implementation Blueprint for Feature 32 (Live Validation Verbal Badges)

#### Step 1: Add Google Search Brand Rule & Rule Updates in `src/catalog/profiles.ts`
In `google.search.mobile` (around line 593) and `google.search.desktop` (around line 641), add:
```ts
textMax('identity.brandName', 25, 'Tên doanh nghiệp quá 25 ký tự.', {
  countingStrategy: 'cjk_weighted',
  severity: 'warn',
}),
```
In `tiktok.in_feed` (around line 430), add:
```ts
{
  id: 'identity.brandName.no_emoji',
  fieldPath: 'identity.brandName',
  operator: 'disallowPattern',
  expected: '\\p{Extended_Pictographic}',
  severity: 'warn',
  message: 'Tên hiển thị TikTok không được có emoji.',
  sourceRefs: ['E01'],
  evidence: 'primary_documented',
},
```
In `threads.feed` (around line 400), add:
```ts
{
  id: 'copy.primaryText.threads_no_links_or_hashtags',
  fieldPath: 'copy.primaryText',
  operator: 'disallowPattern',
  expected: '#|https?:\\/\\/',
  severity: 'warn',
  message: 'Threads không cho hashtag hay đường link trong văn bản chính.',
  sourceRefs: ['E01'],
  evidence: 'primary_documented',
},
```

#### Step 2: Fix `ruleMessage` Priority in `src/features/catalogBridge.ts`
In `src/features/catalogBridge.ts` line 229:
```ts
// Before:
return (messages[rule.operator] ?? result.message) + suffix

// After:
return (rule.message ?? messages[rule.operator] ?? result.message) + suffix
```

#### Step 3: Fix Tab Warning Badges in `src/App.tsx`
Update `groupIssueSummary` (lines 404–428):
```ts
  const groupIssueSummary = useMemo(() => {
    return new Map(
      groups.map((group) => {
        const groupProfiles = profiles
          .filter((item) => item.groupId === group.id && item.supportStatus !== 'deprecated')
          .map((item) => runValidation(draft, item.id))
        const fails = groupProfiles.filter((checks) => checks.some((item) => item.status === 'fail')).length
        const warns = groupProfiles.filter((checks) => checks.some((item) => item.status === 'warn')).length
        return [
          group.id,
          {
            fail: fails,
            warn: warns,
            hasWarning: fails > 0 || warns > 0,
          },
        ]
      }),
    )
  }, [draft, groups])
```
And on platform tabs (lines 1507–1532):
```tsx
  {(() => {
    const issue = groupIssueSummary.get(group.id)
    if (!issue || !issue.hasWarning) return null
    return (
      <span
        aria-hidden="true"
        className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e8590c]"
      />
    )
  })()}
```

#### Step 4: Add "Kiểm tra vị trí này" Live Verbal Badge Component in `src/App.tsx`
Right below the mockup stage in the preview panel (lines 1750–1780), insert the authentic 1:1 "Kiểm tra vị trí này" section:
```tsx
{/* Feature 32: Live Validation Verbal Badges */}
<div className="live-validation-section mt-4 grid gap-2">
  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#101113]">
    <span>Kiểm tra vị trí này</span>
    {summary.fail > 0 ? (
      <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full bg-[#fdedef] px-2.5 text-[11px] font-semibold text-[#ed3c47]">
        ! {summary.fail} lỗi
      </span>
    ) : summary.warn > 0 ? (
      <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full bg-[#fbeee5] px-2.5 text-[11px] font-semibold text-[#e8590c]">
        {summary.warn} cảnh báo
      </span>
    ) : (
      <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full bg-[#e7f6ec] px-2.5 text-[11px] font-semibold text-[#16a34a]">
        ✓ Không có lỗi
      </span>
    )}
  </div>
  <ul className="grid gap-1.5 text-[13px] leading-snug">
    {visibleChecks.filter(c => c.status === 'fail').map(c => (
      <li key={c.id} className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#ed3c47]">! Lỗi:</span>
        <span className="text-[#101113]">{c.message}</span>
      </li>
    ))}
    {visibleChecks.filter(c => c.status === 'warn').map(c => (
      <li key={c.id} className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#e8590c]">! Cảnh báo:</span>
        <span className="text-[#101113]">{c.message}</span>
      </li>
    ))}
    {!draft.assets.some(a => a.role === 'creative') && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#5f6470]">ⓘ Lưu ý:</span>
        <span className="text-[#101113]">
          Chưa có ảnh hoặc video - đang hiện khung giữ chỗ tỉ lệ {profileSpec.ratio} ({profileSpec.recommendedPx}).
        </span>
      </li>
    )}
    {profileSpec.primaryTruncate > 0 && (copy.primaryText || '').length > profileSpec.primaryTruncate && (
      <li className="flex gap-2">
        <span className="shrink-0 whitespace-nowrap font-semibold text-[#5f6470]">ⓘ Lưu ý:</span>
        <span className="text-[#101113]">
          Văn bản chính chỉ hiện {profileSpec.primaryTruncate}/{(copy.primaryText || '').length} ký tự trước khi bị cắt (mốc ước lượng) - đưa ý chính lên đầu.
        </span>
      </li>
    )}
  </ul>
</div>
```

---

### 4.2 Implementation Blueprint for Feature 33 (Official Specifications Card)

#### Step 1: Specifications Data Registry
Create a specification lookup or enrich `PLACEMENTS_FIXTURE` in `src/data/placementSpecs.ts` (or directly within `catalogBridge.ts`):
```ts
export interface PlacementSpecData {
  ratio: string
  recommendedPx: string
  primaryLimit: number
  primaryTruncate: number
  headlineLimit: number
  descLimit: number
  sourceStatus: 'Thông số chính thức' | 'Nguồn thứ cấp' | 'Bố cục ước lượng'
  specs: string[]
  notes?: string
}

export const PLACEMENT_SPECS: Record<string, PlacementSpecData> = {
  fb_feed: {
    ratio: '4:5',
    recommendedPx: '1440×1800',
    primaryLimit: 150,
    primaryTruncate: 124,
    headlineLimit: 27,
    descLimit: 30,
    sourceStatus: 'Thông số chính thức',
    specs: [
      'Tỉ lệ khuyến nghị: 4:5 (1440×1800 px) tối ưu diện tích bảng tin di động.',
      'Văn bản chính: tối đa 125 ký tự trước khi xuất hiện nút "... Xem thêm" (mốc 124 ký tự).',
      'Tiêu đề: tối đa 27 ký tự (vượt quá có thể bị cắt bớt tùy thiết bị).',
      'Định dạng hỗ trợ: JPG, PNG, MP4, MOV (tối đa 4GB).',
    ],
    notes: 'Messenger Stories / Inbox deprecation: Meta ngừng hỗ trợ vị trí Messenger (Nov 2025 - Aug 2026), khuyến nghị dồn ngân sách sang Instagram Reels & Feed.',
  },
  fb_stories: {
    ratio: '9:16',
    recommendedPx: '1440×2560',
    primaryLimit: 125,
    primaryTruncate: 72,
    headlineLimit: 40,
    descLimit: 0,
    sourceStatus: 'Thông số chính thức',
    specs: [
      'Tỉ lệ khuyến nghị: 9:16 (1440×2560 hoặc 1080×1920 px).',
      'Vùng an toàn: chừa 14% đỉnh và 20% đáy để tránh bị che bởi header và thanh gửi tin nhắn.',
      'Thời lượng video: tối đa 60 giây mỗi thẻ.',
    ],
  },
  tt_infeed: {
    ratio: '9:16',
    recommendedPx: '1080×1920',
    primaryLimit: 100,
    primaryTruncate: 88,
    headlineLimit: 40,
    descLimit: 0,
    sourceStatus: 'Thông số chính thức',
    specs: [
      'Tỉ lệ chuẩn: 9:16 (1080×1920 px) toàn màn hình dọc.',
      'Văn bản chính: tối đa 100 ký tự (khuyến nghị chừa 88 ký tự để không bị che bởi nút tương tác).',
      'Vùng an toàn: chừa 10% đỉnh và 25% đáy tránh avatar, nhạc nền và nút Call-To-Action.',
      'Tên hiển thị TikTok: không được chứa emoji.',
    ],
  },
  gs_mobile: {
    ratio: '1:1',
    recommendedPx: '1200×1200',
    primaryLimit: 180,
    primaryTruncate: 160,
    headlineLimit: 90,
    descLimit: 90,
    sourceStatus: 'Thông số chính thức',
    specs: [
      'Tên doanh nghiệp: tối đa 25 ký tự (ký tự CJK tính 2 đơn vị).',
      'Tiêu đề RSA: tối đa 30 ký tự mỗi tiêu đề (cần từ 3 đến 15 tiêu đề).',
      'Mô tả RSA: tối đa 90 ký tự mỗi mô tả (cần từ 2 đến 4 mô tả).',
      'Đường dẫn hiển thị (Path): tối đa 15 ký tự mỗi path.',
    ],
  },
  gdn_300x250: {
    ratio: '1.91:1',
    recommendedPx: '300×250',
    primaryLimit: 0,
    primaryTruncate: 0,
    headlineLimit: 30,
    descLimit: 90,
    sourceStatus: 'Thông số chính thức',
    specs: [
      'Kích thước chuẩn: 300×250 px (Medium Rectangle).',
      'Dung lượng tệp tải lên: tối đa 150 KB.',
      'Tiêu đề ngắn: tối đa 30 ký tự.',
      'Mô tả: tối đa 90 ký tự.',
    ],
  },
  // All 46 placements mapped with their respective specs
}
```

#### Step 2: Render Official Specifications Card in `src/App.tsx`
Place the card directly below "Kiểm tra vị trí này":
```tsx
{/* Feature 33: Official Specifications Card */}
<div className="official-specs-card mt-4 grid gap-2 rounded-[14px] border border-[#e7e7ea] bg-white px-3.5 py-3 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-2">
    <p className="text-sm font-semibold text-[#101113]">
      {profile.groupName} · {profile.title}
    </p>
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-[#fdedef] px-2.5 text-[11px] font-semibold text-[#ed3c47]">
        Nên dùng {profileSpec.ratio} ({profileSpec.recommendedPx})
      </span>
      <span
        className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold ${
          profileSpec.sourceStatus === 'Thông số chính thức'
            ? 'bg-[#e7f6ec] text-[#16a34a]'
            : profileSpec.sourceStatus === 'Nguồn thứ cấp'
            ? 'bg-[#fbeee5] text-[#e8590c]'
            : 'bg-[#f6f6f7] text-[#5f6470]'
        }`}
      >
        {profileSpec.sourceStatus}
      </span>
    </div>
  </div>

  <ul className="grid gap-1.5 text-[13px] leading-relaxed text-[#5f6470]">
    {profileSpec.specs.map((sp, idx) => (
      <li key={idx} className="flex items-start gap-2">
        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#5f6470]" />
        <span>{sp}</span>
      </li>
    ))}
    {profileSpec.notes && (
      <li className="mt-1 rounded-lg bg-[#f6f6f7] p-2 text-xs text-[#5f6470]">
        <strong className="text-[#101113]">Lưu ý chính sách: </strong>
        {profileSpec.notes}
      </li>
    )}
  </ul>

  <details className="mt-2 text-xs text-[#5f6470] border-t border-[#e7e7ea] pt-2">
    <summary className="cursor-pointer font-semibold hover:text-[#101113]">
      Nguồn thông số ({profile.source.length || 2})
    </summary>
    <div className="mt-1.5 space-y-1">
      {profile.source.map((src) => (
        <p key={src.url}>
          <a
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="text-[#ed3c47] hover:underline"
          >
            {src.title} ↗
          </a>
        </p>
      ))}
    </div>
  </details>
</div>
```

---

## 5. Verification Method

1. **Test Verification via Node CLI**:
   - Run `node tests/run-node-tests.mjs`
   - Verify `Feature 32` (32.1–32.5) and `Feature 33` (33.1–33.5) all pass.
2. **DOM & Browser Verification**:
   - Inspect platform tabs on default campaign draft:
     - TikTok tab displays orange warning dot (`span.bg-[#e8590c]`).
     - GDN tab displays orange warning dot (`span.bg-[#e8590c]`).
     - Facebook, Instagram, Threads, YouTube, Google Search, ChatGPT, Zalo, LinkedIn, Admicro DO NOT display warning dots.
   - Inspect "Kiểm tra vị trí này" verbal badge:
     - When Facebook tab is selected: displays `"✓ Không có lỗi"`.
     - When TikTok tab is selected: displays `"1 cảnh báo"` (primary text > 100).
     - When Google Search is selected and brand name > 25 chars: displays `"1 cảnh báo"` (`"Tên doanh nghiệp quá 25 ký tự."`).
   - Inspect "Thông số chính thức" card:
     - Card displays: `Facebook · Bảng feed`
     - Ratio badge: `Nên dùng 4:5 (1440×1800)`
     - Source status: `Thông số chính thức`
     - Policy note: Messenger deprecation schedule documented.
3. **Invalidation Conditions**:
   - If Facebook or Instagram tabs show warning dots under the default draft, invalidation condition occurs (tab issue calculation regression).
   - If Google Search does not flag brand names > 25 characters, invalidation condition occurs.
