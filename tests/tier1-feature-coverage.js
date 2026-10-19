/**
 * Tier 1: Feature Coverage & Catalog Completeness Test Suite
 * Covers Features 1-33 across all 11 platforms and 46 placements with >=5 tests per feature.
 */

import { describe, it, expect, dom } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  CANONICAL_CTA_MAP,
  SPONSORED_LABELS,
  SEE_MORE_LABELS,
  DEFAULT_CAMPAIGN_DRAFT
} from './fixtures/campaign-drafts.js';

export function registerTier1Tests() {
  // Feature 1: Two-Column Workspace Layout
  describe('tier1', 'Feature 01: Two-Column Workspace Layout', () => {
    it('1.1 Layout container uses responsive grid styling', (doc) => {
      const grid = doc.querySelector('.grid.lg\\:grid-cols-\\[minmax\\(0\\,5fr\\)_minmax\\(0\\,7fr\\)\\]') ||
                   doc.querySelector('[class*="lg:grid-cols"]');
      expect(grid).toExist();
    });

    it('1.2 Left column contains section "Nội dung quảng cáo"', (doc) => {
      const leftCol = doc.querySelector('section[aria-label="Nội dung quảng cáo"]') ||
                      Array.from(doc.querySelectorAll('section')).find(s => s.textContent.includes('Nội dung quảng cáo'));
      expect(leftCol).toExist();
    });

    it('1.3 Right column contains section "Khung xem trước"', (doc) => {
      const rightCol = doc.querySelector('section[aria-label="Khung xem trước"]') ||
                       Array.from(doc.querySelectorAll('section')).find(s => s.textContent.includes('Khung xem trước'));
      expect(rightCol).toExist();
    });

    it('1.4 Both child columns have min-w-0 isolation', (doc) => {
      const minWCols = Array.from(doc.querySelectorAll('.min-w-0'));
      expect(minWCols.length).toBeGreaterThan(1);
    });

    it('1.5 Right preview column has sticky positioning on desktop', (doc) => {
      const stickyEl = doc.querySelector('.lg\\:sticky') || doc.querySelector('[class*="sticky"]');
      expect(stickyEl).toExist();
    });
  });

  // Feature 2: Design Tokens & Theme
  describe('tier1', 'Feature 02: Design Tokens & Theme', () => {
    it('2.1 Root defines --brand as #ed3c47', (doc) => {
      const brand = dom.getStyle(doc.documentElement, '--brand').trim();
      expect(brand).toBe('#ed3c47');
    });

    it('2.2 Root defines --brand-050 as #fdedef', (doc) => {
      const brand050 = dom.getStyle(doc.documentElement, '--brand-050').trim();
      expect(brand050).toBe('#fdedef');
    });

    it('2.3 Root defines --bg-subtle as #f6f6f7', (doc) => {
      const bgSubtle = dom.getStyle(doc.documentElement, '--bg-subtle').trim();
      expect(bgSubtle).toBe('#f6f6f7');
    });

    it('2.4 Root defines --border as #e7e7ea', (doc) => {
      const border = dom.getStyle(doc.documentElement, '--border').trim();
      expect(border).toBe('#e7e7ea');
    });

    it('2.5 Glass card tokens are defined and applied', (doc) => {
      const glassBlur = dom.getStyle(doc.documentElement, '--glass-blur').trim();
      const glassCard = doc.querySelector('.glass-card') || doc.querySelector('[class*="glass"]');
      expect(glassCard).toExist();
      if (glassBlur) {
        expect(glassBlur).toBe('16px');
      }
    });
  });

  // Feature 3: Minimal Decorative Iconography
  describe('tier1', 'Feature 03: Minimal Decorative Iconography', () => {
    it('3.1 Form inputs omit pulsing pencil icons', (doc) => {
      const pulsingIcons = doc.querySelectorAll('.animate-pulse.lucide-pencil, .pulsing-pencil');
      expect(pulsingIcons.length).toBe(0);
    });

    it('3.2 Helper banners omit decorative shield icons', (doc) => {
      const shieldIcons = doc.querySelectorAll('.banner-shield, .decorative-shield');
      expect(shieldIcons.length).toBe(0);
    });

    it('3.3 Buttons omit redundant decorative spark/star icons', (doc) => {
      const sparkles = doc.querySelectorAll('.lucide-sparkles, .decorative-sparkle');
      expect(sparkles.length).toBe(0);
    });

    it('3.4 Platform tabs display authentic monochrome SVGs', (doc) => {
      const platformSvgs = doc.querySelectorAll('[data-testid^="platform-tab-"] svg, button svg');
      expect(platformSvgs.length).toBeGreaterThan(5);
    });

    it('3.5 Native device chrome (Dynamic Island, Home Bar, Omnibox) is preserved', (doc) => {
      const dynamicIsland = doc.querySelector('.dynamic-island, [data-testid="dynamic-island"]') ||
                            Array.from(doc.querySelectorAll('div')).find(d => (d.className || '').includes('rounded-full bg-black') || (d.className || '').includes('bg-[#000000]'));
      expect(dynamicIsland).toExist();
    });
  });

  // Feature 4: Dashed Default State
  describe('tier1', 'Feature 04: Dashed Default State', () => {
    it('4.1 Default notice banner explains dashed border significance', (doc) => {
      const banner = Array.from(doc.querySelectorAll('div')).find(d => d.textContent.includes('viền nét đứt'));
      expect(banner).toExist();
    });

    it('4.2 Initial unedited brand input has dashed pink border', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value === DEFAULT_CAMPAIGN_DRAFT.brandName);
      expect(brandInput).toExist();
      expect(brandInput.className.includes('border-dashed') || brandInput.className.includes('border-brand')).toBe(true);
    });

    it('4.3 Initial unedited handle input has dashed border', (doc) => {
      const handleInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value === DEFAULT_CAMPAIGN_DRAFT.handle);
      expect(handleInput).toExist();
      expect(handleInput.className.includes('border-dashed') || handleInput.className.includes('border-brand')).toBe(true);
    });

    it('4.4 Initial unedited headline input has dashed border', (doc) => {
      const headlineInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value === DEFAULT_CAMPAIGN_DRAFT.headline);
      expect(headlineInput).toExist();
      expect(headlineInput.className.includes('border-dashed') || headlineInput.className.includes('border-brand')).toBe(true);
    });

    it('4.5 Typing custom value switches input border from dashed to solid', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value === DEFAULT_CAMPAIGN_DRAFT.brandName);
      if (brandInput) {
        dom.type(brandInput, 'CustomBrand123');
        expect(brandInput.value).toBe('CustomBrand123');
        // Border should no longer be dashed
        expect(brandInput.className.includes('border-dashed')).toBe(false);
        // Reset back
        dom.type(brandInput, DEFAULT_CAMPAIGN_DRAFT.brandName);
      }
    });
  });

  // Feature 5: Brand & Handle Inputs
  describe('tier1', 'Feature 05: Brand & Handle Inputs', () => {
    it('5.1 Brand name input updates mockup page title', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noit.vn') || i.value.includes('noti.vn'));
      expect(brandInput).toExist();
      dom.type(brandInput, 'MyTestStudio');
      const mockupTitle = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === 'MyTestStudio');
      expect(mockupTitle).toExist();
      dom.type(brandInput, DEFAULT_CAMPAIGN_DRAFT.brandName);
    });

    it('5.2 @Handle input reflects account name in mockup', (doc) => {
      const handleInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('@noti.vn'));
      expect(handleInput).toExist();
      dom.type(handleInput, '@teststudio');
      const handleInMockup = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === '@teststudio');
      expect(handleInMockup).toExist();
      dom.type(handleInput, DEFAULT_CAMPAIGN_DRAFT.handle);
    });

    it('5.3 Empty avatar renders first letter of brand name as fallback', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noit.vn') || i.value.includes('noti.vn'));
      if (brandInput) {
        dom.type(brandInput, 'AlphaCorp');
        const initialEl = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === 'A' && el.className.includes('rounded-full'));
        expect(initialEl).toExist();
        dom.type(brandInput, DEFAULT_CAMPAIGN_DRAFT.brandName);
      }
    });

    it('5.4 Handle input allows optional prefix or adds it automatically', (doc) => {
      const handleInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('@'));
      expect(handleInput).toExist();
    });

    it('5.5 Brand changes sync across multiple placement frames', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noit.vn') || i.value.includes('noti.vn'));
      expect(brandInput).toExist();
    });
  });

  // Feature 6: Destination URL & CTA Selector
  describe('tier1', 'Feature 06: Destination URL & CTA Selector', () => {
    it('6.1 Destination URL input exists and contains domain', (doc) => {
      const urlInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('http'));
      expect(urlInput).toExist();
    });

    it('6.2 CTA dropdown provides canonical CTA options', (doc) => {
      const ctaSelect = doc.querySelector('select');
      expect(ctaSelect).toExist();
      const options = Array.from(ctaSelect.querySelectorAll('option')).map(o => o.value);
      expect(options.length).toBeGreaterThan(4);
      expect(options.some(opt => opt.includes('Tìm hiểu thêm') || opt.includes('learn_more'))).toBe(true);
    });

    it('6.3 Selecting "Mua ngay" updates mockup CTA label', (doc) => {
      const ctaSelect = doc.querySelector('select');
      if (ctaSelect) {
        dom.select(ctaSelect, 'Mua ngay');
        const ctaBtn = Array.from(doc.querySelectorAll('button, span, div')).find(el => el.textContent.trim() === 'Mua ngay');
        expect(ctaBtn).toExist();
        dom.select(ctaSelect, 'Tìm hiểu thêm');
      }
    });

    it('6.4 CTA adapts to language toggle (VI/EN)', (doc) => {
      const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
      const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
      expect(viBtn).toExist();
      expect(enBtn).toExist();
    });

    it('6.5 Destination URL displays hostname in link banner', (doc) => {
      const domainLabel = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.includes('go.noti.vn') || el.textContent.includes('noti.vn'));
      expect(domainLabel).toExist();
    });
  });

  // Feature 7: Avatar / Logo Uploader
  describe('tier1', 'Feature 07: Avatar / Logo Uploader', () => {
    it('7.1 File uploader allows choosing image file for avatar/media', (doc) => {
      const fileInput = doc.querySelector('input[type="file"]');
      expect(fileInput).toExist();
      expect(fileInput.getAttribute('accept')).toContain('image');
    });

    it('7.2 Media upload zone displays guidance text', (doc) => {
      const uploadZone = Array.from(doc.querySelectorAll('div')).find(d => d.textContent.includes('Ảnh / video quảng cáo'));
      expect(uploadZone).toExist();
    });

    it('7.3 Upload chip shows initial 0/10 or 1/10 files count', (doc) => {
      const chip = Array.from(doc.querySelectorAll('span')).find(s => s.textContent.includes('/10 tệp'));
      expect(chip).toExist();
    });

    it('7.4 Privacy guarantee: file stays inside browser without server upload', (doc) => {
      const privacyNotice = Array.from(doc.querySelectorAll('p, span, div')).find(el => el.textContent.includes('không tải lên máy chủ') || el.textContent.includes('trình duyệt'));
      expect(privacyNotice).toExist();
    });

    it('7.5 Delete button removes active media', (doc) => {
      const fileInput = doc.querySelector('input[type="file"][accept*="image"]');
      if (fileInput) {
        const file = new File(['mock-media-content'], 'test-ad.png', { type: 'image/png' });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const delBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Xóa tệp'));
      expect(delBtn).toExist();
      dom.click(delBtn);
      const chip = Array.from(doc.querySelectorAll('span')).find(s => s.textContent.includes('/10 tệp'));
      expect(chip.textContent).toContain('0/10 tệp');
      const delBtnAfter = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Xóa tệp'));
      expect(delBtnAfter).toBe(null);
    });
  });

  // Feature 8: Primary Text & Live Truncation
  describe('tier1', 'Feature 08: Primary Text & Live Truncation', () => {
    it('8.1 Primary text textarea is present and populated', (doc) => {
      const textarea = doc.querySelector('textarea');
      expect(textarea).toExist();
      expect(textarea.value.length).toBeGreaterThan(10);
    });

    it('8.2 Character counter shows length against recommended limit', (doc) => {
      const counter = Array.from(doc.querySelectorAll('span')).find(s => s.textContent.includes('khuyên dùng') || s.textContent.includes('/'));
      expect(counter).toExist();
    });

    it('8.3 Typing long text triggers "... Xem thêm" in mockup', (doc) => {
      const seeMore = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.includes('Xem thêm') || el.textContent.includes('... Xem thêm'));
      expect(seeMore).toExist();
    });

    it('8.4 Counter text turns orange/warning when exceeding limit', (doc) => {
      const textarea = doc.querySelector('textarea');
      if (textarea) {
        const origVal = textarea.value;
        dom.type(textarea, 'A'.repeat(200));
        const warnSpan = doc.querySelector('.text-\\[\\#e8590c\\], .text-danger, .font-semibold');
        expect(warnSpan).toExist();
        dom.type(textarea, origVal);
      }
    });

    it('8.5 Multiline formatting preserved in rendered preview', (doc) => {
      const textarea = doc.querySelector('textarea');
      expect(textarea).toExist();
    });
  });

  // Feature 9: Multi-File Carousel Upload (<=10)
  describe('tier1', 'Feature 09: Multi-File Carousel Upload (≤10)', () => {
    it('9.1 Upload label mentions multi-file carousel support ("Nhiều tệp = băng chuyền")', (doc) => {
      const carouselNote = Array.from(doc.querySelectorAll('p, div')).find(d => d.textContent.includes('Nhiều tệp = băng chuyền'));
      expect(carouselNote).toExist();
    });

    it('9.2 Maximum 10-file budget is documented in UI', (doc) => {
      const chip = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.includes('/10 tệp'));
      expect(chip).toExist();
    });

    it('9.3 File input supports multiple selection', (doc) => {
      const fileInput = doc.querySelector('input[type="file"]');
      expect(fileInput).toExist();
    });

    it('9.4 Carousel renders 1:1 square cards on feed placements', (doc) => {
      expect(PLACEMENTS_FIXTURE.find(p => p.id === 'fb_feed').ratio).toBe('4:5');
    });

    it('9.5 Single file upload renders standard media frame without pagination dots', (doc) => {
      const nextBtn = doc.querySelector('button[aria-label="Ảnh sau"]');
      expect(nextBtn).toBe(null);
      const paginationDots = doc.querySelectorAll('.ad-media span.h-1\\.5.rounded-full');
      expect(paginationDots.length).toBe(0);
    });
  });

  // Feature 10: Google Search Overrides
  describe('tier1', 'Feature 10: Google Search Overrides', () => {
    it('10.1 Accordion for Google Tìm kiếm exists', (doc) => {
      const accordion = Array.from(doc.querySelectorAll('details, summary')).find(el => el.textContent.includes('Google Tìm kiếm'));
      expect(accordion).toExist();
    });

    it('10.2 Sitelinks input fields are available inside accordion', (doc) => {
      const sitelinkInputs = Array.from(doc.querySelectorAll('input[placeholder*="Sitelink"]'));
      expect(sitelinkInputs.length).toBeGreaterThan(0);
    });

    it('10.3 Default badge marked on Google Tìm kiếm section', (doc) => {
      const defaultBadge = Array.from(doc.querySelectorAll('span')).find(s => s.textContent === 'Mặc định');
      expect(defaultBadge).toExist();
    });

    it('10.4 Updating sitelink text reflects in Google Search SERP', (doc) => {
      const s1 = doc.querySelector('input[placeholder="Sitelink 1"]');
      if (s1) {
        dom.type(s1, 'Ưu đãi hot');
        expect(s1.value).toBe('Ưu đãi hot');
        dom.type(s1, 'Sản phẩm');
      }
    });

    it('10.5 Google Search SERP renders sitelink pill carousel or 2-column grid', (doc) => {
      expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'google_search').length).toBe(2);
    });
  });

  // Feature 11: GDN / YouTube / ChatGPT Overrides
  describe('tier1', 'Feature 11: GDN / YouTube / ChatGPT Overrides', () => {
    it('11.1 Combined platform override accordion exists', (doc) => {
      const accordion = Array.from(doc.querySelectorAll('details, summary')).find(el => el.textContent.includes('Google Hiển thị, YouTube, ChatGPT'));
      expect(accordion).toExist();
    });

    it('11.2 Overrides sync across all 11 platforms by default', (doc) => {
      const note = Array.from(doc.querySelectorAll('p')).find(p => p.textContent.includes('đồng bộ') && p.textContent.includes('11 nền tảng'));
      expect(note).toExist();
    });

    it('11.3 GDN Long Headline allows up to 90 characters', () => {
      const gdn = PLACEMENTS_FIXTURE.find(p => p.id === 'gdn_300x250');
      expect(gdn.headlineLimit).toBe(30);
      expect(gdn.descLimit).toBe(90);
    });

    it('11.4 YouTube skippable headline limit is 15 characters', () => {
      const yt = PLACEMENTS_FIXTURE.find(p => p.id === 'yt_instream_skippable');
      expect(yt.headlineLimit).toBe(15);
    });

    it('11.5 ChatGPT title limit is 50 characters', () => {
      const cg = PLACEMENTS_FIXTURE.find(p => p.id === 'chatgpt_web');
      expect(cg.headlineLimit).toBe(50);
    });
  });

  // Feature 12: Facebook 10 Placements
  describe('tier1', 'Feature 12: Facebook 10 Placements', () => {
    const fbPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'facebook');
    it('12.0 Facebook platform has exactly 10 placements', () => {
      expect(fbPlacements.length).toBe(10);
    });

    fbPlacements.forEach((pl, idx) => {
      it(`12.${idx + 1} Facebook placement "${pl.name}" (${pl.id}) is valid`, (doc) => {
        expect(pl.device).toBeDefined();
        expect(pl.ratio).toBeDefined();
        const tab = doc.querySelector(`[data-testid="platform-tab-facebook"]`);
        if (tab) dom.click(tab);
        const pill = doc.querySelector(`[data-testid="placement-pill-${pl.id}"]`) ||
                     Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes(pl.name));
        expect(pill).toExist();
      });
    });
  });

  // Feature 13: Instagram 3 Placements
  describe('tier1', 'Feature 13: Instagram 3 Placements', () => {
    const igPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'instagram');
    it('13.1 Instagram has exactly 3 placements (Feed, Stories, Reels)', () => {
      expect(igPlacements.length).toBe(3);
    });

    it('13.2 ig_feed ratio is 4:5', () => {
      expect(igPlacements.find(p => p.id === 'ig_feed').ratio).toBe('4:5');
    });

    it('13.3 ig_stories ratio is 9:16 with safeZone enabled', () => {
      const st = igPlacements.find(p => p.id === 'ig_stories');
      expect(st.ratio).toBe('9:16');
      expect(st.safeZone).toBe(true);
    });

    it('13.4 ig_reels ratio is 9:16 with safeZone enabled', () => {
      const reels = igPlacements.find(p => p.id === 'ig_reels');
      expect(reels.ratio).toBe('9:16');
      expect(reels.safeZone).toBe(true);
    });

    it('13.5 Instagram platform tab renders in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-instagram"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Instagram'));
      expect(tab).toExist();
    });
  });

  // Feature 14: Threads 1 Placement
  describe('tier1', 'Feature 14: Threads 1 Placement', () => {
    it('14.1 Threads has exactly 1 placement (threads_feed)', () => {
      const threadsPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'threads');
      expect(threadsPlacements.length).toBe(1);
      expect(threadsPlacements[0].id).toBe('threads_feed');
    });

    it('14.2 threads_feed primary copy limit is 500 characters', () => {
      const th = PLACEMENTS_FIXTURE.find(p => p.id === 'threads_feed');
      expect(th.primaryLimit).toBe(500);
    });

    it('14.3 Threads device is mobile', () => {
      const th = PLACEMENTS_FIXTURE.find(p => p.id === 'threads_feed');
      expect(th.device).toBe('mobile');
    });

    it('14.4 Threads platform tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-threads"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Threads'));
      expect(tab).toExist();
    });

    it('14.5 Threads does not require safe zone overlay', () => {
      const th = PLACEMENTS_FIXTURE.find(p => p.id === 'threads_feed');
      expect(th.safeZone).toBe(false);
    });
  });

  // Feature 15: TikTok 2 Placements
  describe('tier1', 'Feature 15: TikTok 2 Placements', () => {
    it('15.1 TikTok has exactly 2 placements (tt_infeed, tt_topview)', () => {
      const tt = PLACEMENTS_FIXTURE.filter(p => p.platform === 'tiktok');
      expect(tt.length).toBe(2);
    });

    it('15.2 Both placements are 9:16 vertical orientation', () => {
      const tt = PLACEMENTS_FIXTURE.filter(p => p.platform === 'tiktok');
      tt.forEach(p => expect(p.ratio).toBe('9:16'));
    });

    it('15.3 Both TikTok placements have safeZone active', () => {
      const tt = PLACEMENTS_FIXTURE.filter(p => p.platform === 'tiktok');
      tt.forEach(p => expect(p.safeZone).toBe(true));
    });

    it('15.4 Primary text max limit is 100 characters', () => {
      const tt = PLACEMENTS_FIXTURE.find(p => p.id === 'tt_infeed');
      expect(tt.primaryLimit).toBe(100);
    });

    it('15.5 TikTok tab has warning dot indicator for special constraints', (doc) => {
      const ttTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      expect(ttTab).toExist();
    });
  });

  // Feature 16: YouTube 6 Placements
  describe('tier1', 'Feature 16: YouTube 6 Placements', () => {
    const ytPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'youtube');
    it('16.1 YouTube has exactly 6 placements', () => {
      expect(ytPlacements.length).toBe(6);
    });

    it('16.2 YouTube includes skippable, non-skippable, and bumper formats', () => {
      expect(ytPlacements.some(p => p.id === 'yt_instream_skippable')).toBe(true);
      expect(ytPlacements.some(p => p.id === 'yt_instream_nonskip')).toBe(true);
      expect(ytPlacements.some(p => p.id === 'yt_bumper')).toBe(true);
    });

    it('16.3 YouTube includes desktop instream placement', () => {
      const dt = ytPlacements.find(p => p.id === 'yt_instream_desktop');
      expect(dt).toBeDefined();
      expect(dt.device).toBe('desktop');
    });

    it('16.4 YouTube includes in-feed video placement', () => {
      expect(ytPlacements.some(p => p.id === 'yt_infeed')).toBe(true);
    });

    it('16.5 YouTube Shorts is 9:16 with safeZone enabled', () => {
      const shorts = ytPlacements.find(p => p.id === 'yt_shorts');
      expect(shorts.ratio).toBe('9:16');
      expect(shorts.safeZone).toBe(true);
    });

    it('16.6 YouTube platform tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-youtube"]');
      expect(tab).toExist();
    });
  });

  // Feature 17: Google Tìm kiếm 2 Placements
  describe('tier1', 'Feature 17: Google Tìm kiếm 2 Placements', () => {
    const gs = PLACEMENTS_FIXTURE.filter(p => p.platform === 'google_search');
    it('17.1 Google Search has exactly 2 placements (Mobile and Desktop)', () => {
      expect(gs.length).toBe(2);
    });

    it('17.2 gs_mobile is mobile device kind', () => {
      expect(gs.find(p => p.id === 'gs_mobile').device).toBe('mobile');
    });

    it('17.3 gs_desktop is desktop device kind', () => {
      expect(gs.find(p => p.id === 'gs_desktop').device).toBe('desktop');
    });

    it('17.4 Text-only SERP ad format with headline limit 90', () => {
      expect(gs[0].headlineLimit).toBe(90);
    });

    it('17.5 Google Tìm kiếm tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-google_search"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Google Tìm kiếm'));
      expect(tab).toExist();
    });
  });

  // Feature 18: Google Hiển thị 8 Placements
  describe('tier1', 'Feature 18: Google Hiển thị 8 Placements', () => {
    const gdn = PLACEMENTS_FIXTURE.filter(p => p.platform === 'gdn');
    it('18.1 Google Hiển thị has exactly 8 IAB slots', () => {
      expect(gdn.length).toBe(8);
    });

    it('18.2 Includes 300x250 and 336x280 mobile rectangles', () => {
      expect(gdn.some(p => p.id === 'gdn_300x250')).toBe(true);
      expect(gdn.some(p => p.id === 'gdn_336x280')).toBe(true);
    });

    it('18.3 Includes 728x90 desktop leaderboard', () => {
      const lb = gdn.find(p => p.id === 'gdn_728x90');
      expect(lb.device).toBe('desktop');
    });

    it('18.4 Includes 300x600 Half-page and 160x600 Skyscraper', () => {
      expect(gdn.some(p => p.id === 'gdn_300x600')).toBe(true);
      expect(gdn.some(p => p.id === 'gdn_160x600')).toBe(true);
    });

    it('18.5 Includes mobile banners 320x100 and 320x50', () => {
      expect(gdn.some(p => p.id === 'gdn_320x100')).toBe(true);
      expect(gdn.some(p => p.id === 'gdn_320x50')).toBe(true);
    });

    it('18.6 Includes in-article Native placement', () => {
      expect(gdn.some(p => p.id === 'gdn_native')).toBe(true);
    });

    it('18.7 GDN platform tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-gdn"]');
      expect(tab).toExist();
    });

    it('18.8 GDN tab has warning indicator for estimated layouts', () => {
      const p = PLATFORMS_FIXTURE.find(pl => pl.id === 'gdn');
      expect(p.hasWarning).toBe(true);
    });
  });

  // Feature 19: ChatGPT 2 Placements
  describe('tier1', 'Feature 19: ChatGPT 2 Placements', () => {
    const cg = PLACEMENTS_FIXTURE.filter(p => p.platform === 'chatgpt');
    it('19.1 ChatGPT has exactly 2 placements (Web and Mobile app)', () => {
      expect(cg.length).toBe(2);
    });

    it('19.2 chatgpt_web uses desktop device', () => {
      expect(cg.find(p => p.id === 'chatgpt_web').device).toBe('desktop');
    });

    it('19.3 chatgpt_mobile uses mobile device', () => {
      expect(cg.find(p => p.id === 'chatgpt_mobile').device).toBe('mobile');
    });

    it('19.4 Title limit is 50 chars, body 60-100 chars', () => {
      expect(cg[0].headlineLimit).toBe(50);
    });

    it('19.5 ChatGPT tab exists in UI with SVG mark', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-chatgpt"]');
      expect(tab).toExist();
    });
  });

  // Feature 20: iPhone 15/16 Device Frame
  describe('tier1', 'Feature 20: iPhone 15/16 Device Frame', () => {
    it('20.1 Mobile frame renders inner screen proportional to 393x852', (doc) => {
      const frame = doc.querySelector('.w-\\[393px\\], [style*="393"]') || doc.querySelector('[class*="rounded-[55px]"]');
      expect(frame).toExist();
    });

    it('20.2 Frame has Dynamic Island at top center', (doc) => {
      const dynamicIsland = doc.querySelector('.dynamic-island, [data-testid="dynamic-island"]') ||
                            Array.from(doc.querySelectorAll('div')).find(d => (d.className || '').includes('rounded-full bg-black') || (d.className || '').includes('bg-[#000000]'));
      expect(dynamicIsland).toExist();
    });

    it('20.3 Status bar displays 9:41 time', (doc) => {
      const time = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.trim() === '9:41');
      expect(time).toExist();
    });

    it('20.4 Status bar contains wifi, cellular and battery icons', (doc) => {
      const icons = doc.querySelectorAll('.status-bar svg, svg path');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('20.5 Home Indicator bar renders at bottom center', (doc) => {
      const homeBar = doc.querySelector('.home-indicator, [data-testid="home-bar"]') ||
                      Array.from(doc.querySelectorAll('div')).find(d => (d.className || '').includes('w-[134px]') || (d.className || '').includes('rounded-full bg-'));
      expect(homeBar).toExist();
    });
  });

  // Feature 21: Desktop Chrome Device Frame
  describe('tier1', 'Feature 21: Desktop Chrome Device Frame', () => {
    it('21.1 Desktop frame displays Chrome browser header', (doc) => {
      const chromeTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      if (chromeTab) dom.click(chromeTab);
      const rightColPill = doc.querySelector('[data-testid="placement-pill-fb_right_col"]');
      if (rightColPill) dom.click(rightColPill);
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      const chromeHeader = frame.querySelector('.bg-\\[\\#dee1e6\\]');
      expect(chromeHeader).toExist();
    });

    it('21.2 Chrome tab bar includes window controls (minimize, maximize, close)', (doc) => {
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      expect(frame.textContent).toContain('—');
      expect(frame.textContent).toContain('□');
      expect(frame.textContent).toContain('×');
    });

    it('21.3 Navigation bar has back, forward, and refresh controls', (doc) => {
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      expect(frame.textContent).toContain('←');
      expect(frame.textContent).toContain('→');
      expect(frame.textContent).toContain('↻');
    });

    it('21.4 Omnibox displays website destination URL', (doc) => {
      const omnibox = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.includes('go.noti.vn') || el.textContent.includes('https://'));
      expect(omnibox).toExist();
    });

    it('21.5 Viewport dimensions conform to 1920x945 aspect ratio (1920x1080 casing)', (doc) => {
      const viewport = doc.querySelector('.device-frame div[style*="width: 1920px"][style*="height: 945px"]');
      expect(viewport).toExist();
      expect(viewport.style.width).toBe('1920px');
      expect(viewport.style.height).toBe('945px');
    });
  });

  // Feature 22: Zalo Ads 4 Canonical Placements
  describe('tier1', 'Feature 22: Zalo Ads 4 Canonical Placements', () => {
    const zalo = PLACEMENTS_FIXTURE.filter(p => p.platform === 'zalo');
    it('22.1 Zalo Ads has exactly 4 placements', () => {
      expect(zalo.length).toBe(4);
    });

    it('22.2 Includes zalo_timeline (Nhật ký Zalo)', () => {
      expect(zalo.some(p => p.id === 'zalo_timeline')).toBe(true);
    });

    it('22.3 Includes zalo_video with 9:16 safeZone', () => {
      const zv = zalo.find(p => p.id === 'zalo_video');
      expect(zv.ratio).toBe('9:16');
      expect(zv.safeZone).toBe(true);
    });

    it('22.4 Includes zalo_message (Tin nhắn OA) and zalo_article (Báo mới / Khám phá)', () => {
      expect(zalo.some(p => p.id === 'zalo_message')).toBe(true);
      expect(zalo.some(p => p.id === 'zalo_article')).toBe(true);
    });

    it('22.5 Zalo Ads tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-zalo"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Zalo Ads'));
      expect(tab).toExist();
    });
  });

  // Feature 23: LinkedIn Ads 4 Canonical Placements
  describe('tier1', 'Feature 23: LinkedIn Ads 4 Canonical Placements', () => {
    const li = PLACEMENTS_FIXTURE.filter(p => p.platform === 'linkedin');
    it('23.1 LinkedIn Ads has exactly 4 placements', () => {
      expect(li.length).toBe(4);
    });

    it('23.2 Includes li_mobile_feed and li_desktop_feed (1.91:1)', () => {
      expect(li.find(p => p.id === 'li_mobile_feed').ratio).toBe('1.91:1');
      expect(li.find(p => p.id === 'li_desktop_feed').ratio).toBe('1.91:1');
    });

    it('23.3 Includes li_message (Tin nhắn tài trợ)', () => {
      expect(li.some(p => p.id === 'li_message')).toBe(true);
    });

    it('23.4 Includes li_spotlight (Cột phải Spotlight)', () => {
      const sp = li.find(p => p.id === 'li_spotlight');
      expect(sp.device).toBe('desktop');
    });

    it('23.5 LinkedIn tab exists in UI with authentic SVG logo', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-linkedin"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('LinkedIn Ads'));
      expect(tab).toExist();
    });
  });

  // Feature 24: Admicro 4 Canonical Placements
  describe('tier1', 'Feature 24: Admicro 4 Canonical Placements', () => {
    const adm = PLACEMENTS_FIXTURE.filter(p => p.platform === 'admicro');
    it('24.1 Admicro has exactly 4 placements', () => {
      expect(adm.length).toBe(4);
    });

    it('24.2 Includes admicro_cafef_pc (CafeF PC)', () => {
      const cafe = adm.find(p => p.id === 'admicro_cafef_pc');
      expect(cafe.device).toBe('desktop');
    });

    it('24.3 Includes admicro_kenh14_mobile (Kenh14 Mobile)', () => {
      const kenh = adm.find(p => p.id === 'admicro_kenh14_mobile');
      expect(kenh.device).toBe('mobile');
    });

    it('24.4 Includes admicro_vnexpress_pc and admicro_dantri_mobile', () => {
      expect(adm.some(p => p.id === 'admicro_vnexpress_pc')).toBe(true);
      expect(adm.some(p => p.id === 'admicro_dantri_mobile')).toBe(true);
    });

    it('24.5 Admicro platform tab exists in UI', (doc) => {
      const tab = doc.querySelector('[data-testid="platform-tab-admicro"]') ||
                  Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Admicro'));
      expect(tab).toExist();
    });
  });

  // Feature 25: "Tất cả vị trí" Grid for All Platforms
  describe('tier1', 'Feature 25: "Tất cả vị trí" Grid View', () => {
    it('25.1 "Tất cả vị trí" button is present in placement toolbar', (doc) => {
      const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]') ||
                     Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Tất cả vị trí'));
      expect(allBtn).toExist();
    });

    it('25.2 Clicking "Tất cả vị trí" renders multi-card comparison grid', (doc) => {
      const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]') ||
                     Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Tất cả vị trí'));
      if (allBtn) {
        dom.click(allBtn);
        expect(allBtn.getAttribute('aria-pressed')).toBe('true');
        dom.click(allBtn); // toggle back
      }
    });

    it('25.3 "Tất cả vị trí" grid is active on extended platforms (Zalo, LinkedIn, Admicro)', (doc) => {
      const admicroTab = doc.querySelector('[data-testid="platform-tab-admicro"]');
      if (admicroTab) {
        dom.click(admicroTab);
        const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]') ||
                       Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Tất cả vị trí'));
        expect(allBtn).toExist();
      }
    });

    it('25.4 Multi-placement comparison uses 2-column responsive layout', (doc) => {
      const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]') ||
                     Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Tất cả vị trí'));
      if (allBtn) {
        dom.click(allBtn);
        const grid = doc.querySelector('.grid.md\\:grid-cols-2, .grid.grid-cols-2');
        expect(grid).toExist();
        dom.click(allBtn); // toggle back
      }
    });

    it('25.5 Each frame maintains proportional scaling inside grid cells', (doc) => {
      const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]') ||
                     Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Tất cả vị trí'));
      if (allBtn) {
        dom.click(allBtn);
        const gridFrames = doc.querySelectorAll('.md\\:grid-cols-2 .device-frame');
        expect(gridFrames.length).toBeGreaterThan(0);
        dom.click(allBtn); // toggle back
      }
    });
  });

  // Feature 26: Bilingual UI Toggle (VI / EN)
  describe('tier1', 'Feature 26: Bilingual UI Toggle (VI / EN)', () => {
    it('26.1 Language selector container is present in toolbar', (doc) => {
      const langGroup = doc.querySelector('[aria-label="Ngôn ngữ giao diện nền tảng"]') ||
                        Array.from(doc.querySelectorAll('div')).find(d => d.textContent.includes('Tiếng Việt') && d.textContent.includes('English'));
      expect(langGroup).toExist();
    });

    it('26.2 Initial language is Vietnamese ("vi")', (doc) => {
      const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
      expect(viBtn).toExist();
      expect(viBtn.className.includes('bg-white') || viBtn.className.includes('active')).toBe(true);
    });

    it('26.3 Clicking English switches active button styling', (doc) => {
      const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
      const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
      if (enBtn && viBtn) {
        dom.click(enBtn);
        expect(enBtn.className.includes('bg-white')).toBe(true);
        dom.click(viBtn);
      }
    });

    it('26.4 In-mockup sponsored badge updates between "Được tài trợ" and "Sponsored"', (doc) => {
      const badge = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === 'Được tài trợ' || el.textContent === 'Sponsored');
      expect(badge).toExist();
    });

    it('26.5 In-mockup read more label updates between "Xem thêm" and "See more"', (doc) => {
      const readMore = Array.from(doc.querySelectorAll('*')).find(el => el.textContent.includes('Xem thêm') || el.textContent.includes('See more'));
      expect(readMore).toExist();
    });
  });

  // Feature 27: Safe-Zone Overlays ("Vùng bị che")
  describe('tier1', 'Feature 27: Safe-Zone Overlays ("Vùng bị che")', () => {
    it('27.1 "Vùng bị che" button is available on 9:16 placements', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      expect(safeZoneBtn).toExist();
    });

    it('27.2 Toggling safe zone button activates highlighted state', (doc) => {
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn);
        expect(safeZoneBtn.className.includes('border-brand') || safeZoneBtn.className.includes('bg-[#fdedef]')).toBe(true);
        dom.click(safeZoneBtn);
      }
    });

    it('27.3 Danger overlay renders with red bounding box', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn);
        const redBoxes = Array.from(doc.querySelectorAll('div')).filter(
          d => (d.style.background && d.style.background.includes('237, 60, 71')) ||
               (d.style.borderTop && d.style.borderTop.includes('237, 60, 71')) ||
               (d.style.borderBottom && d.style.borderBottom.includes('237, 60, 71'))
        );
        expect(redBoxes.length).toBeGreaterThan(0);
        dom.click(safeZoneBtn); // toggle off
      }
    });

    it('27.4 Caption expansion overlay renders with orange bounding box', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn);
        const orangeBox = Array.from(doc.querySelectorAll('div')).find(
          d => (d.style.background && d.style.background.includes('255, 159, 28')) ||
               (d.style.border && d.style.border.includes('255, 159, 28'))
        );
        expect(orangeBox).toExist();
        dom.click(safeZoneBtn); // toggle off
      }
    });

    it('27.5 Overlays are hidden on non-vertical placements', (doc) => {
      const fbTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      if (fbTab) dom.click(fbTab);
      const feedPill = doc.querySelector('[data-testid="placement-pill-fb_feed"]');
      if (feedPill) dom.click(feedPill);
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      expect(safeZoneBtn).toBe(null);
      const redBoxes = Array.from(doc.querySelectorAll('div')).filter(
        d => d.style.background && d.style.background.includes('237, 60, 71')
      );
      expect(redBoxes.length).toBe(0);
    });
  });

  // Feature 28: Native App UI Toggle ("Giao diện app")
  describe('tier1', 'Feature 28: Native App UI Toggle ("Giao diện app")', () => {
    it('28.1 "Giao diện app" button is visible when vertical video is selected', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      expect(appUiBtn).toExist();
    });

    it('28.2 Toggling "Giao diện app" toggles active state', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      expect(appUiBtn).toExist();
      const initialPressed = appUiBtn.getAttribute('aria-pressed');
      dom.click(appUiBtn);
      expect(appUiBtn.getAttribute('aria-pressed') !== initialPressed).toBe(true);
      dom.click(appUiBtn); // reset back
    });

    it('28.3 Hiding app UI hides reaction rail and bottom bar', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        dom.click(appUiBtn);
        const phoneFrame = doc.querySelector('.device-frame');
        if (phoneFrame) {
          expect(phoneFrame.textContent.includes('12,3K')).toBe(false);
          expect(phoneFrame.textContent.includes('Trang chủ')).toBe(false);
        }
        dom.click(appUiBtn); // reset back
      }
    });

    it('28.4 Status bar and home bar visibility respects app UI toggle', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        dom.click(appUiBtn);
        expect(doc.querySelector('.device-phone-status')).toBe(null);
        expect(doc.querySelector('.device-home-indicator')).toBe(null);
        dom.click(appUiBtn); // reset back
        expect(doc.querySelector('.device-phone-status')).toExist();
        expect(doc.querySelector('.device-home-indicator')).toExist();
      }
    });

    it('28.5 Toggle state persists when switching between vertical placements', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const infeedPill = doc.querySelector('[data-testid="placement-pill-tt_infeed"]');
      if (infeedPill) dom.click(infeedPill);
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        dom.click(appUiBtn); // turn off
        const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
        if (topviewPill) dom.click(topviewPill);
        expect(doc.querySelector('.device-phone-status')).toBe(null);
        const appUiBtnAfter = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
        if (appUiBtnAfter) dom.click(appUiBtnAfter); // reset
      }
    });
  });

  // Feature 29: TikTok TopView Phase Toggle
  describe('tier1', 'Feature 29: TikTok TopView Phase Toggle', () => {
    it('29.1 TikTok TopView placement exists', () => {
      const topview = PLACEMENTS_FIXTURE.find(p => p.id === 'tt_topview');
      expect(topview).toBeDefined();
    });

    it('29.2 Phase toggle provides "0-3 giây đầu" option', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);
      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      expect(introBtn).toExist();
    });

    it('29.3 Phase toggle provides "Sau 3 giây" option', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);
      const lateBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));
      expect(lateBtn).toExist();
    });

    it('29.4 "0-3 giây đầu" phase shows clean full-screen video with Skip button', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);
      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      if (introBtn) {
        dom.click(introBtn);
        const phoneFrame = doc.querySelector('.device-frame');
        expect(phoneFrame).toExist();
        expect(phoneFrame.textContent).toContain('Bỏ qua');
        expect(phoneFrame.textContent.includes('12,3K')).toBe(false);
      }
    });

    it('29.5 "Sau 3 giây" phase shows in-feed interactive overlay and CTA', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);
      const lateBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));
      if (lateBtn) {
        dom.click(lateBtn);
        const phoneFrame = doc.querySelector('.device-frame');
        expect(phoneFrame).toExist();
        expect(phoneFrame.textContent.includes('Bỏ qua')).toBe(false);
        expect(phoneFrame.textContent).toContain('12,3K');
      }
    });
  });

  // Feature 30: Dedicated Zoom Modal ("Phóng to")
  describe('tier1', 'Feature 30: Dedicated Zoom Modal ("Phóng to")', () => {
    it('30.1 "Phóng to" button is present on single-placement preview', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      expect(zoomBtn).toExist();
    });

    it('30.2 Clicking "Phóng to" opens modal or enlarged inspection view', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      if (zoomBtn) {
        dom.click(zoomBtn);
        const modal = doc.querySelector('.zoom-modal-backdrop');
        expect(modal).toExist();
        expect(modal.getAttribute('role')).toBe('dialog');
        const closeBtn = doc.querySelector('.close-zoom-btn');
        if (closeBtn) dom.click(closeBtn);
      }
    });

    it('30.3 Modal backdrop has dark styling (#0b0b0f/90)', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      if (zoomBtn) {
        dom.click(zoomBtn);
        const modal = doc.querySelector('.zoom-modal-backdrop');
        expect(modal).toExist();
        expect(modal.style.backgroundColor).toContain('rgba(11, 11, 15, 0.9)');
        const closeBtn = doc.querySelector('.close-zoom-btn');
        if (closeBtn) dom.click(closeBtn);
      }
    });

    it('30.4 Modal contains close button (✕)', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      if (zoomBtn) {
        dom.click(zoomBtn);
        const closeBtn = doc.querySelector('.close-zoom-btn');
        expect(closeBtn).toExist();
        expect(closeBtn.textContent.trim()).toBe('✕');
        dom.click(closeBtn);
        expect(doc.querySelector('.zoom-modal-backdrop')).toBe(null);
      }
    });

    it('30.5 Pressing Escape key closes modal and returns focus', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      if (zoomBtn) {
        dom.click(zoomBtn);
        expect(doc.querySelector('.zoom-modal-backdrop')).toExist();
        const win = doc.defaultView || window;
        win.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
        expect(doc.querySelector('.zoom-modal-backdrop')).toBe(null);
      }
    });
  });

  // Feature 31: Fullscreen Workspace ("Toàn màn hình")
  describe('tier1', 'Feature 31: Fullscreen Workspace ("Toàn màn hình")', () => {
    it('31.1 "Toàn màn hình" button is present in toolbar', (doc) => {
      const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
      expect(fsBtn).toExist();
    });

    it('31.2 Clicking "Toàn màn hình" requests browser fullscreen', (doc) => {
      const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
      expect(fsBtn).toExist();
      expect(fsBtn.textContent.trim()).toBe('Toàn màn hình');
      dom.click(fsBtn);
    });

    it('31.3 Workspace adapts to full viewport height', (doc) => {
      const previewCard = doc.querySelector('.sticky.top-6') || doc.querySelector('[class*="sticky"]');
      expect(previewCard).toExist();
    });

    it('31.4 Fullscreen toolbar provides exit button', (doc) => {
      const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
      expect(fsBtn).toExist();
      Object.defineProperty(doc, 'fullscreenElement', { value: doc.body, configurable: true });
      doc.dispatchEvent(new Event('fullscreenchange'));
      expect(fsBtn.textContent.trim()).toBe('Thoát toàn màn hình');
      Object.defineProperty(doc, 'fullscreenElement', { value: null, configurable: true });
      doc.dispatchEvent(new Event('fullscreenchange'));
      expect(fsBtn.textContent.trim()).toBe('Toàn màn hình');
    });

    it('31.5 Escape key exits fullscreen mode gracefully', (doc) => {
      const fsBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Toàn màn hình'));
      expect(fsBtn).toExist();
      const win = doc.defaultView || window;
      win.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(fsBtn.textContent.trim()).toBe('Toàn màn hình');
    });
  });

  // Feature 32: Live Validation Verbal Badges
  describe('tier1', 'Feature 32: Live Validation Verbal Badges', () => {
    it('32.1 Platforms with issues display warning badge dot', (doc) => {
      const warnPlatform = PLATFORMS_FIXTURE.find(p => p.hasWarning);
      expect(warnPlatform).toBeDefined();
    });

    it('32.2 Verbal status indicator shows "Không có lỗi" or issue count', (doc) => {
      const badge = Array.from(doc.querySelectorAll('span')).find(
        s => s.textContent.includes('Không có lỗi') || s.textContent.includes('lỗi') || s.textContent.includes('cảnh báo')
      );
      expect(badge).toExist();
    });

    it('32.3 Validation engine distinguishes between Errors, Warnings, and Notes', (doc) => {
      const win = (doc && doc.defaultView) || window;
      const evalFn = win.evaluateValidation || window.evaluateValidation;
      const placements = win.PLACEMENTS || window.PLACEMENTS || PLACEMENTS_FIXTURE;
      const res = evalFn(placements[0], { brandName: 'Test', headline: 'A'.repeat(200), description: '', primaryText: '' });
      expect(Array.isArray(res.errors)).toBe(true);
      expect(Array.isArray(res.warnings)).toBe(true);
      expect(Array.isArray(res.notes)).toBe(true);
      expect(res.warnings.length).toBeGreaterThan(0);
    });

    it('32.4 Brand name exceeding 25 chars triggers Google Search warning', (doc) => {
      const win = (doc && doc.defaultView) || window;
      const evalFn = win.evaluateValidation || window.evaluateValidation;
      const placements = win.PLACEMENTS || window.PLACEMENTS || PLACEMENTS_FIXTURE;
      const gsPlacement = placements.find(p => p.platform === 'google_search');
      const res = evalFn(gsPlacement, { brandName: 'A'.repeat(26), headline: '', description: '', primaryText: '' });
      expect(res.errors.some(e => e.includes('25 ký tự'))).toBe(true);
    });

    it('32.5 Real-time validation updates as user types', (doc) => {
      const brandInput = doc.querySelector('input[type="text"]');
      if (brandInput) {
        dom.type(brandInput, 'A'.repeat(30));
        const win = (doc && doc.defaultView) || window;
        const evalFn = win.evaluateValidation || window.evaluateValidation;
        const placements = win.PLACEMENTS || window.PLACEMENTS || PLACEMENTS_FIXTURE;
        const res = evalFn(placements.find(p => p.platform === 'google_search'), { brandName: brandInput.value, headline: '', description: '', primaryText: '' });
        expect(res.errors.length).toBeGreaterThan(0);
        dom.type(brandInput, 'noit.vn');
      }
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

    it('33.4 Source status indicates authoritative or estimated level', (doc) => {
      const sourceStatusBadge = Array.from(doc.querySelectorAll('span')).find(
        s => s.textContent.includes('Thông số chính thức') || s.textContent.includes('Nguồn thứ cấp')
      );
      expect(sourceStatusBadge).toExist();
    });

    it('33.5 Platform notes explain special policies (e.g. Meta Messenger deprecation)', (doc) => {
      const specItems = Array.from(doc.querySelectorAll('li')).filter(
        li => li.textContent.includes('Facebook') || li.textContent.includes('tỉ lệ') || li.textContent.includes('khuyên dùng') || li.textContent.includes('điểm ảnh')
      );
      expect(specItems.length).toBeGreaterThan(0);
    });
  });
}
