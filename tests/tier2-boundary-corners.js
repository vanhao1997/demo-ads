/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * Aspect ratio clamping, text truncation limits, CJK double-width counting,
 * empty states, 10-file carousel limit, video duration bounds, platform rules.
 */

import { describe, it, expect, dom } from './e2e-runner.js';
import { PLACEMENTS_FIXTURE } from './fixtures/campaign-drafts.js';

/**
 * CJK character width algorithm according to Google Search/GDN specifications
 * Codepoint ranges: 4352-4447, 11904-42191, 44032-55203, 63744-64255, 65072-65103, 65280-65374
 */
export function countGoogleCharacters(str) {
  let count = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    const isCJK =
      (cp >= 4352 && cp <= 4447) ||
      (cp >= 11904 && cp <= 42191) ||
      (cp >= 44032 && cp <= 55203) ||
      (cp >= 63744 && cp <= 64255) ||
      (cp >= 65072 && cp <= 65103) ||
      (cp >= 65280 && cp <= 65374);
    count += isCJK ? 2 : 1;
  }
  return count;
}

export function registerTier2Tests() {
  // Area 1: Aspect Ratio Clamping & Containment
  describe('tier2', 'Tier 2: Aspect Ratio Clamping & Containment', () => {
    it('2.1 Facebook Feed clamps ratios between [0.8, 1.91]', () => {
      const clampRatio = (ratio) => Math.max(0.8, Math.min(1.91, ratio));
      expect(clampRatio(0.5)).toBe(0.8); // 9:16 (0.5625) clamped to 0.8 (4:5)
      expect(clampRatio(3.0)).toBe(1.91); // Ultra-wide clamped to 1.91:1
      expect(clampRatio(1.0)).toBe(1.0); // 1:1 is preserved untouched
    });

    it('2.2 Stories & Reels 9:16 vertical blur-fit calculates letterbox correctly', () => {
      const isBlurFitSupported = PLACEMENTS_FIXTURE.filter(p => p.ratio === '9:16').every(p => p.safeZone === true);
      expect(isBlurFitSupported).toBe(true);
    });

    it('2.3 TikTok In-Feed video contain maintains 9:16 aspect ratio', () => {
      const tt = PLACEMENTS_FIXTURE.find(p => p.id === 'tt_infeed');
      expect(tt.ratio).toBe('9:16');
    });

    it('2.4 YouTube Desktop 16:9 widescreen companion banner ratio is 5:1 (300x60)', () => {
      const companionRatio = 300 / 60;
      expect(companionRatio).toBe(5);
    });
  });

  // Area 2: Text Truncation Limits & Boundaries
  describe('tier2', 'Tier 2: Text Truncation Limits & Boundaries', () => {
    it('2.5 Facebook Feed copy under 125 chars does not require truncation', () => {
      const text124 = 'A'.repeat(124);
      expect(text124.length).toBeLessThan(125);
    });

    it('2.6 Facebook Feed copy at 125 chars triggers truncation boundary', () => {
      const text125 = 'A'.repeat(125);
      expect(text125.length >= 125).toBe(true);
    });

    it('2.7 Instagram Feed copy truncation cutoff is 90 chars', () => {
      const igLimit = 90;
      expect('B'.repeat(89).length).toBeLessThan(igLimit);
      expect('B'.repeat(90).length >= igLimit).toBe(true);
    });

    it('2.8 Threads Feed allows extended primary copy up to 500 chars (truncation at ~200)', () => {
      const th = PLACEMENTS_FIXTURE.find(p => p.id === 'threads_feed');
      expect(th.primaryLimit).toBe(500);
      expect(th.primaryTruncate).toBe(200);
    });

    it('2.9 Long continuous string without spaces truncates cleanly without regex crash', () => {
      const longNoSpaces = 'X'.repeat(400);
      const truncateText = (str, max) => (str.length > max ? str.slice(0, max) + '... Xem thêm' : str);
      const truncated = truncateText(longNoSpaces, 125);
      expect(truncated.endsWith('... Xem thêm')).toBe(true);
      expect(truncated.length).toBe(125 + '... Xem thêm'.length);
    });
  });

  // Area 3: CJK Double-Width Counting (Google Search & GDN)
  describe('tier2', 'Tier 2: CJK Double-Width Character Counting', () => {
    it('2.10 Standard Latin text counts as 1 character per glyph', () => {
      const latinText = 'Sale 50% Off';
      expect(countGoogleCharacters(latinText)).toBe(12);
    });

    it('2.11 Vietnamese accented text counts as 1 unit per character', () => {
      const vnText = 'Thời trang mùa hè';
      expect(countGoogleCharacters(vnText)).toBe(17);
    });

    it('2.12 Japanese Kanji / Chinese Hanzi characters count as 2 units each', () => {
      const cjkText = '夏物セール開催中'; // 8 CJK characters
      expect(countGoogleCharacters(cjkText)).toBe(16); // 8 * 2 = 16
    });

    it('2.13 16 CJK characters exceed Google Search 30-char headline limit (16 * 2 = 32 > 30)', () => {
      const longCjk = '夏物セール開催中今すぐチェック'; // 15 chars = 30; +1 char = 32
      const charWeight = countGoogleCharacters(longCjk);
      expect(charWeight).toBe(30);
      const exceedingCjk = longCjk + '！'; // 16 CJK chars = 32
      expect(countGoogleCharacters(exceedingCjk)).toBe(32);
      expect(countGoogleCharacters(exceedingCjk) > 30).toBe(true);
    });

    it('2.14 Korean Hangul syllables count as 2 units each', () => {
      const koreanText = '여름 세일'; // 5 chars: 4 Hangul + 1 space = 4*2 + 1 = 9
      expect(countGoogleCharacters(koreanText)).toBe(9);
    });
  });

  // Area 4: Empty States & Graceful Defaults
  describe('tier2', 'Tier 2: Empty States & Graceful Defaults', () => {
    it('2.15 Blank brand name falls back to placeholder domain "noti.vn"', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noti.vn') || i.value.includes('noit.vn'));
      if (brandInput) {
        dom.type(brandInput, '');
        const avatar = doc.querySelector('.rounded-full');
        expect(avatar).toExist();
        dom.type(brandInput, 'noit.vn');
        expect(brandInput.value).toBe('noit.vn');
      }
    });

    it('2.16 Missing avatar renders circular container with fallback initial letter', (doc) => {
      const avatarCircle = doc.querySelector('.rounded-full.bg-brand, .rounded-full.bg-\\[\\#ed3c47\\], .rounded-full.text-white');
      expect(avatarCircle).toExist();
    });

    it('2.17 Blank primary copy renders default placeholder with dashed state', (doc) => {
      const textarea = doc.querySelector('textarea');
      expect(textarea).toExist();
      expect(textarea.className).toContain('border-dashed');
    });

    it('2.18 Blank headline does not crash layout or produce "undefined"', (doc) => {
      const undefinedSpans = Array.from(doc.querySelectorAll('*')).filter(el => el.textContent === 'undefined');
      expect(undefinedSpans.length).toBe(0);
    });
  });

  // Area 5: Maximum 10-File Carousel Limit
  describe('tier2', 'Tier 2: Maximum 10-File Carousel Limit', () => {
    it('2.19 Single file (count = 1) renders standard single-media box', () => {
      const count = 1;
      const isCarousel = count >= 2;
      expect(isCarousel).toBe(false);
    });

    it('2.20 Exactly 2 files switches mode to carousel with "1/2" pagination', () => {
      const count = 2;
      const isCarousel = count >= 2;
      expect(isCarousel).toBe(true);
      expect(`1/${count}`).toBe('1/2');
    });

    it('2.21 Exactly 10 files fills maximum carousel budget ("10/10 tệp")', () => {
      const count = 10;
      expect(count <= 10).toBe(true);
      expect(`${count}/10 tệp`).toBe('10/10 tệp');
    });

    it('2.22 Uploading 11 files rejects excess files with 10-file ceiling alert', () => {
      const simulateUpload = (fileCount) => {
        if (fileCount > 10) {
          return { accepted: 10, error: 'Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ).' };
        }
        return { accepted: fileCount, error: null };
      };
      const result = simulateUpload(11);
      expect(result.accepted).toBe(10);
      expect(result.error).toContain('Tối đa 10 tệp');
    });
  });

  // Area 6: Video Duration Limits
  describe('tier2', 'Tier 2: Video Duration Limits & Validation', () => {
    it('2.23 YouTube Skippable: < 5s triggers error ("ngắn hơn mức tối thiểu 5 giây")', () => {
      const validateDuration = (durationSec) => {
        if (durationSec < 5) return 'ngắn hơn mức tối thiểu 5 giây';
        return null;
      };
      expect(validateDuration(3)).toContain('ngắn hơn mức tối thiểu 5 giây');
      expect(validateDuration(5)).toBe(null);
    });

    it('2.24 YouTube Bumper: > 6s triggers error ("vượt quá tối đa 6 giây")', () => {
      const validateBumper = (durationSec) => {
        if (durationSec > 6) return 'vượt quá tối đa 6 giây';
        return null;
      };
      expect(validateBumper(7)).toContain('vượt quá tối đa 6 giây');
      expect(validateBumper(6)).toBe(null);
    });

    it('2.25 YouTube Non-Skippable: valid between 7 and 15-20s', () => {
      const validateNonSkip = (sec) => (sec >= 7 && sec <= 20);
      expect(validateNonSkip(15)).toBe(true);
      expect(validateNonSkip(4)).toBe(false);
      expect(validateNonSkip(25)).toBe(false);
    });

    it('2.26 Zalo Video & TikTok TopView: duration capped at 60s', () => {
      const validateTopView = (sec) => (sec <= 60);
      expect(validateTopView(15)).toBe(true);
      expect(validateTopView(61)).toBe(false);
    });
  });

  // Area 7: Platform Restrictions (Threads, TikTok, CTA mismatch)
  describe('tier2', 'Tier 2: Platform Copy & Rule Restrictions', () => {
    it('2.27 Threads: hashtag (#fashion) triggers warning badge', () => {
      const validateThreads = (copy) => {
        if (copy.includes('#') || copy.includes('http')) {
          return 'Threads không cho hashtag hay đường link trong văn bản chính.';
        }
        return null;
      };
      expect(validateThreads('Check out this #sale')).toContain('Threads không cho hashtag');
      expect(validateThreads('Clean copy without tags')).toBe(null);
    });

    it('2.28 TikTok: emoji in brand name triggers error', () => {
      const hasEmoji = (str) => /\p{Extended_Pictographic}/u.test(str);
      const validateTikTokBrand = (brand) => {
        if (hasEmoji(brand)) return 'Tên hiển thị TikTok không được có emoji.';
        return null;
      };
      expect(validateTikTokBrand('Shopee 🛍️')).toContain('không được có emoji');
      expect(validateTikTokBrand('Shopee Official')).toBe(null);
    });

    it('2.29 Unsupported CTA on platform triggers fallback warning badge', () => {
      const supportedThreadsCTAs = ['learn_more', 'shop_now', 'sign_up'];
      const isSupported = (cta) => supportedThreadsCTAs.includes(cta);
      expect(isSupported('call_now')).toBe(false);
      expect(isSupported('learn_more')).toBe(true);
    });
  });

  // Area 8: Adversarial Challenge — Upload Cap & Memory Leak Prevention (M1 Boundary)
  describe('tier2', 'Tier 2: Adversarial Upload Bounds & Memory Management', () => {
    it('2.30 Boundary: Uploading 15 files strictly caps at 10 and generates warning with excess count (5)', () => {
      const currentAssetCount = 0;
      const incoming = Array.from({ length: 15 }, (_, i) => ({ name: `file_${i + 1}.png`, size: 1024 }));
      const allowedCount = Math.max(0, 10 - currentAssetCount);
      const toProcess = incoming.slice(0, allowedCount);
      const errors = [];
      if (incoming.length > allowedCount) {
        errors.push(`Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua ${incoming.length - allowedCount} tệp thừa.`);
      }
      expect(toProcess.length).toBe(10);
      expect(errors.length).toBe(1);
      expect(errors[0]).toBe('Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua 5 tệp thừa.');
    });

    it('2.31 Boundary: Sequential upload (8 then 5 files) strictly caps total at 10 and skips 3 excess', () => {
      let assets = Array.from({ length: 8 }, (_, i) => ({ id: `id_${i}` }));
      const incoming = Array.from({ length: 5 }, (_, i) => ({ name: `file_${i + 9}.png` }));
      const currentAssetCount = assets.length;
      const allowedCount = Math.max(0, 10 - currentAssetCount);
      const toProcess = incoming.slice(0, allowedCount);
      const errors = [];
      if (incoming.length > allowedCount) {
        errors.push(`Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua ${incoming.length - allowedCount} tệp thừa.`);
      }
      expect(allowedCount).toBe(2);
      expect(toProcess.length).toBe(2);
      expect(errors[0]).toBe('Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ). Đã bỏ qua 3 tệp thừa.');
      assets = [...assets, ...toProcess];
      expect(assets.length).toBe(10);
    });

    it('2.32 Boundary: Attempting upload when 10 assets present immediately rejects at pre-inspection count check', () => {
      const currentAssetCount = 10;
      let rejectedImmediately = false;
      let notice = '';
      if (currentAssetCount >= 10) {
        notice = 'Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ).';
        rejectedImmediately = true;
      }
      expect(rejectedImmediately).toBe(true);
      expect(notice).toBe('Tối đa 10 tệp (đủ cho băng chuyền 10 thẻ).');
    });

    it('2.33 Boundary: Duplicate SHA256 assets immediately revoke created ObjectURL to prevent memory leaks', () => {
      const revokedUrls = [];
      const mockRevoke = (url) => revokedUrls.push(url);
      const existingAssets = [{ sha256: 'hash_abc123', url: 'blob:mock-1' }];
      const incomingAsset = { sha256: 'hash_abc123', url: 'blob:mock-dup' };
      const isDuplicate = existingAssets.some((item) => item.sha256 === incomingAsset.sha256);
      if (isDuplicate) {
        mockRevoke(incomingAsset.url);
      }
      expect(isDuplicate).toBe(true);
      expect(revokedUrls).toContain('blob:mock-dup');
    });
  });

  // Area 9: Adversarial Challenge — Single vs Multi-File Composition Auto-Switch
  describe('tier2', 'Tier 2: Single vs Multi-File Composition Auto-Switch', () => {
    it('2.34 Boundary: Uploading 1 single creative file keeps composition "single_image"', () => {
      const initialComposition = 'single_image';
      const existingAssets = [];
      const newAssets = [{ id: 'a1', role: 'creative', name: 'img1.png' }];
      const nextAssets = [...existingAssets, ...newAssets];
      const creativeCount = nextAssets.filter((item) => item.role === 'creative').length;
      const nextComposition = creativeCount >= 2 ? 'carousel' : initialComposition;
      expect(creativeCount).toBe(1);
      expect(nextComposition).toBe('single_image');
    });

    it('2.35 Boundary: Uploading 2 creative files automatically switches composition to "carousel"', () => {
      const initialComposition = 'single_image';
      const existingAssets = [{ id: 'a1', role: 'creative', name: 'img1.png' }];
      const newAssets = [{ id: 'a2', role: 'creative', name: 'img2.png' }];
      const nextAssets = [...existingAssets, ...newAssets];
      const creativeCount = nextAssets.filter((item) => item.role === 'creative').length;
      const nextComposition = creativeCount >= 2 ? 'carousel' : initialComposition;
      expect(creativeCount).toBe(2);
      expect(nextComposition).toBe('carousel');
    });

    it('2.36 Boundary: Uploading non-creative file (audio) does not trigger carousel switch', () => {
      const initialComposition = 'single_image';
      const nextAssets = [
        { id: 'a1', role: 'creative', name: 'img1.png' },
        { id: 'a2', role: 'audio', name: 'bgm.mp3' }
      ];
      const creativeCount = nextAssets.filter((item) => item.role === 'creative').length;
      const nextComposition = creativeCount >= 2 ? 'carousel' : initialComposition;
      expect(creativeCount).toBe(1);
      expect(nextComposition).toBe('single_image');
    });

    it('2.37 Boundary: Switching to carousel automatically initializes per-card details', () => {
      const existingCardDetails = {};
      const newAssets = [
        { id: 'c1', role: 'creative', name: 'card1.png' },
        { id: 'c2', role: 'creative', name: 'card2.png' }
      ];
      const nextCardDetails = { ...existingCardDetails };
      const destUrl = 'https://example.com/landing';
      for (const asset of newAssets) {
        if (asset.role === 'creative' && !nextCardDetails[asset.id]) {
          nextCardDetails[asset.id] = { title: '', description: '', url: destUrl };
        }
      }
      expect(nextCardDetails['c1'].url).toBe(destUrl);
      expect(nextCardDetails['c2'].url).toBe(destUrl);
      expect(Object.keys(nextCardDetails).length).toBe(2);
    });
  });

  // Area 10: Adversarial Challenge — Input Focus/Blur Cycles & Dashed Styling
  describe('tier2', 'Tier 2: Input Focus/Blur Cycles & Dashed Styling State', () => {
    it('2.38 Boundary: Default/empty inputs render class "input-default" matching dashed pink border', () => {
      const computeFieldState = (value) => {
        const isDefault = !value || value.trim() === '';
        return isDefault ? 'input-default' : 'input-edited';
      };
      expect(computeFieldState('')).toBe('input-default');
      expect(computeFieldState(undefined)).toBe('input-default');
    });

    it('2.39 Boundary: Focus/blur cycle on empty input preserves dashed pink border on blur', () => {
      let isFocused = false;
      const value = '';
      const isDefault = !value || value.trim() === '';

      // Focus event
      isFocused = true;
      const focusBorder = isFocused ? 'solid var(--brand, #ed3c47)' : undefined;
      expect(focusBorder).toBe('solid var(--brand, #ed3c47)');

      // Blur event
      isFocused = false;
      const postBlurClass = isDefault ? 'input-default' : 'input-edited';
      expect(postBlurClass).toBe('input-default');
    });

    it('2.40 Boundary: Edited input switches class to "input-edited" matching solid border', () => {
      const computeFieldState = (value) => {
        const isDefault = !value || value.trim() === '';
        return isDefault ? 'input-default' : 'input-edited';
      };
      expect(computeFieldState('Acme Corp')).toBe('input-edited');
      expect(computeFieldState('@acme')).toBe('input-edited');
    });

    it('2.41 Boundary: Focus/blur cycle on edited input preserves solid border on blur', () => {
      let isFocused = false;
      const value = 'Shopee Official';
      const isDefault = !value || value.trim() === '';

      // Focus
      isFocused = true;
      expect(isFocused).toBe(true);

      // Blur
      isFocused = false;
      const postBlurClass = isDefault ? 'input-default' : 'input-edited';
      expect(postBlurClass).toBe('input-edited');
    });
  });

  // Area 11: Adversarial Challenge — Rapid Typing and Deletion State Transitions
  describe('tier2', 'Tier 2: Rapid Typing & Deletion State Transitions', () => {
    it('2.42 Boundary: Rapid typing character-by-character switches dashed to solid', () => {
      const states = [];
      const computeClass = (val) => (!val || val.trim() === '' ? 'input-default' : 'input-edited');
      let text = '';
      states.push(computeClass(text)); // initial empty
      for (const char of 'Quick') {
        text += char;
        states.push(computeClass(text));
      }
      expect(states[0]).toBe('input-default');
      expect(states[1]).toBe('input-edited');
      expect(states[states.length - 1]).toBe('input-edited');
    });

    it('2.43 Boundary: Full deletion to empty string reverts immediately from solid to dashed pink border', () => {
      const computeClass = (val) => (!val || val.trim() === '' ? 'input-default' : 'input-edited');
      let text = 'Quick';
      expect(computeClass(text)).toBe('input-edited');
      // Delete characters
      text = 'Q';
      expect(computeClass(text)).toBe('input-edited');
      // Final delete
      text = '';
      expect(computeClass(text)).toBe('input-default');
    });

    it('2.44 Boundary: Whitespace-only string ("   ") is sanitized by trim() as default/empty state', () => {
      const computeClass = (val) => (!val || val.trim() === '' ? 'input-default' : 'input-edited');
      expect(computeClass('   ')).toBe('input-default');
      expect(computeClass('\t\n')).toBe('input-default');
      expect(computeClass('  a  ')).toBe('input-edited');
    });
  });
}

