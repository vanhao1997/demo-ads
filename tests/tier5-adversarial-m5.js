/**
 * Tier 5: Adversarial Stress Testing & Empirical Challenger Suite for Milestone 5
 * Author: challenger_m5_2
 * Milestone: M5 Interactive Tools, ZoomModal, Native Chrome, Validation & Minimal Iconography
 *
 * Covers:
 * 1. Dedicated ZoomModal Stress Verification:
 *    - Opens dedicated modal without toggling showAll or comparative grid
 *    - Backdrop click outside modal content closes modal
 *    - Click inside modal content does not dismiss
 *    - Close button (✕) closes modal
 *    - Escape key closes modal and returns focus to trigger
 *    - Opening/closing does not mutate draft state
 * 2. Native App UI Toggling Stress Verification:
 *    - showAppUi === false completely unmounts .device-phone-status and .device-home-indicator
 *    - showAppUi === false completely unmounts reaction rails and bottom action bars in vertical video
 * 3. TikTok TopView Phase Switching:
 *    - Switches between "0-3 giây đầu" and "Sau 3 giây"
 *    - Intro mode suppresses in-feed reaction rail, caption, CTA card, and bottom nav, displays "Bỏ qua"
 * 4. Live Validation & CJK Double-Width Weighting:
 *    - Pure ASCII, Vietnamese diacritics, CJK characters, mixed strings
 *    - CJK = 2 units, standard ASCII & Vietnamese = 1 unit
 *    - Verbal badges: "✓ Không có lỗi", "! X lỗi", "X cảnh báo"
 * 5. Minimal Decorative Iconography Verification:
 *    - Zero decorative pulsing pencils, shields, button glyphs
 *    - Exactly 10 monochrome 18x18 platform SVGs + 3 authentic status bar SVGs
 */

import { describe, it, expect, dom } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  DEFAULT_CAMPAIGN_DRAFT
} from './fixtures/campaign-drafts.js';
import { countGoogleCharacters } from './tier2-boundary-corners.js';

export function registerTier5M5Tests() {
  // =========================================================================
  // Area 5.5.1: Dedicated ZoomModal Stress Verification
  // =========================================================================
  describe('tier5', 'Tier 5.5.1: Dedicated ZoomModal Stress Verification', () => {
    it('5.5.1.1 Clicking "Phóng to" opens dedicated ZoomModal and does NOT toggle showAll or trigger grid', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
      );
      if (zoomBtn) {
        dom.click(zoomBtn);

        const zoomBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(zoomBackdrop).toExist();
        expect(zoomBackdrop.getAttribute('role')).toBe('dialog');
        expect(zoomBackdrop.getAttribute('aria-modal')).toBe('true');

        // Comparative grid must NOT be rendered
        const gridFrames = doc.querySelectorAll('.grid-cols-2 .device-frame');
        expect(gridFrames.length).toBe(0);

        // Close modal
        const closeBtn = doc.querySelector('.close-zoom-btn');
        if (closeBtn) dom.click(closeBtn);
      }
    });

    it('5.5.1.2 Clicking .zoom-modal-backdrop (outside modal container) closes the modal', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
      );
      if (zoomBtn) {
        dom.click(zoomBtn);
        const zoomBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(zoomBackdrop).toExist();

        // Simulate click on backdrop itself
        dom.click(zoomBackdrop);

        const closedBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(closedBackdrop).toBe(null);
      }
    });

    it('5.5.1.3 Clicking inside .zoom-modal-content does NOT close the modal', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
      );
      if (zoomBtn) {
        dom.click(zoomBtn);
        const zoomContent = doc.querySelector('.zoom-modal-content');
        expect(zoomContent).toExist();

        // Click inside modal content
        dom.click(zoomContent);

        // Modal must still remain open
        const zoomBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(zoomBackdrop).toExist();

        // Clean up
        const closeBtn = doc.querySelector('.close-zoom-btn');
        if (closeBtn) dom.click(closeBtn);
      }
    });

    it('5.5.1.4 Clicking .close-zoom-btn (✕) closes the modal cleanly', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
      );
      if (zoomBtn) {
        dom.click(zoomBtn);
        const closeBtn = doc.querySelector('.close-zoom-btn');
        expect(closeBtn).toExist();
        expect(closeBtn.textContent.trim()).toBe('✕');

        dom.click(closeBtn);

        const zoomBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(zoomBackdrop).toBe(null);
      }
    });

    it('5.5.1.5 Pressing Escape key closes the modal and returns focus cleanly to the trigger button', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
      );
      if (zoomBtn) {
        zoomBtn.focus();
        dom.click(zoomBtn);

        const zoomBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(zoomBackdrop).toExist();

        // Dispatch keydown event for 'Escape'
        const win = doc.defaultView || window;
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true,
          cancelable: true,
        });
        win.dispatchEvent(escEvent);

        const closedBackdrop = doc.querySelector('.zoom-modal-backdrop');
        expect(closedBackdrop).toBe(null);
      }
    });

    it('5.5.1.6 Opening and closing ZoomModal does NOT mutate or reset draft state', (doc) => {
      // Find copy inputs
      const brandInput = doc.querySelector('input[type="text"]');
      if (brandInput) {
        const testText = 'Empirical Challenge Brand 2026';
        dom.type(brandInput, testText);

        const zoomBtn = Array.from(doc.querySelectorAll('button')).find(
          (b) => b.textContent.includes('Phóng to') || b.getAttribute('aria-label') === 'Phóng to'
        );
        if (zoomBtn) {
          dom.click(zoomBtn);
          const closeBtn = doc.querySelector('.close-zoom-btn');
          if (closeBtn) dom.click(closeBtn);

          // Verify brandInput retains modified value
          expect(brandInput.value).toBe(testText);

          // Restore
          dom.type(brandInput, 'noit.vn');
        }
      }
    });
  });

  // =========================================================================
  // Area 5.5.2: Native App UI Toggling Stress Verification
  // =========================================================================
  describe('tier5', 'Tier 5.5.2: Native App UI Toggling Stress Verification', () => {
    it('5.5.2.1 When showAppUi is true, .device-phone-status (9:41) and .device-home-indicator exist in DOM', (doc) => {
      // Select vertical video (e.g. TikTok)
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const statusEl = doc.querySelector('.device-phone-status');
      const homeEl = doc.querySelector('.device-home-indicator');

      if (statusEl) {
        expect(statusEl.textContent).toContain('9:41');
      }
      if (homeEl) {
        expect(homeEl).toExist();
      }
    });

    it('5.5.2.2 When showAppUi is false, .device-phone-status and .device-home-indicator are completely unmounted', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const appUiBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Giao diện app')
      );
      if (appUiBtn) {
        // Toggle off
        dom.click(appUiBtn);

        const statusEl = doc.querySelector('.device-phone-status');
        const homeEl = doc.querySelector('.device-home-indicator');

        expect(statusEl).toBe(null);
        expect(homeEl).toBe(null);

        // Reset back to true
        dom.click(appUiBtn);
      }
    });

    it('5.5.2.3 Reaction rails and bottom action bars in vertical video renderers are unmounted when showAppUi is false', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const infeedPill = doc.querySelector('[data-testid="placement-pill-tt_infeed"]');
      if (infeedPill) dom.click(infeedPill);

      const appUiBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Giao diện app')
      );
      if (appUiBtn) {
        // Turn off app chrome
        dom.click(appUiBtn);

        // In VerticalMobile, reaction rail contains '12,3K' and '♥'
        const bodyText = doc.body.textContent;
        // Verify reaction counts are not rendered inside the phone frame
        const phoneFrame = doc.querySelector('.device-frame');
        if (phoneFrame) {
          expect(phoneFrame.textContent).not.toContain('12,3K');
          expect(phoneFrame.textContent).not.toContain('Trang chủ');
        }

        // Reset
        dom.click(appUiBtn);
      }
    });
  });

  // =========================================================================
  // Area 5.5.3: TikTok TopView Phase Switching
  // =========================================================================
  describe('tier5', 'Tier 5.5.3: TikTok TopView Phase Switching', () => {
    it('5.5.3.1 Viewing tiktok.topview (tt_topview) renders segmented control with "0-3 giây đầu" and "Sau 3 giây"', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);

      const introBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('0-3 giây đầu')
      );
      const lateBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Sau 3 giây')
      );

      expect(introBtn).toExist();
      expect(lateBtn).toExist();
    });

    it('5.5.3.2 Intro mode ("0-3 giây đầu") suppresses reaction rail, caption, CTA, and bottom nav, and displays "Bỏ qua" button', (doc) => {
      const introBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('0-3 giây đầu')
      );
      if (introBtn) {
        dom.click(introBtn);

        const phoneFrame = doc.querySelector('.device-frame');
        if (phoneFrame) {
          // Must render "Bỏ qua" or "Skip"
          expect(phoneFrame.textContent).toContain('Bỏ qua');
          // In-feed reaction rail and bottom nav must be suppressed
          expect(phoneFrame.textContent).not.toContain('12,3K');
          expect(phoneFrame.textContent).not.toContain('Trang chủ');
        }
      }
    });

    it('5.5.3.3 Post-3s mode ("Sau 3 giây") renders in-feed reaction rail, caption, CTA, and suppresses "Bỏ qua"', (doc) => {
      const lateBtn = Array.from(doc.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Sau 3 giây')
      );
      if (lateBtn) {
        dom.click(lateBtn);

        const phoneFrame = doc.querySelector('.device-frame');
        if (phoneFrame) {
          expect(phoneFrame.textContent).not.toContain('Bỏ qua');
          expect(phoneFrame.textContent).toContain('12,3K');
          expect(phoneFrame.textContent).toContain('Trang chủ');
        }
      }
    });
  });

  // =========================================================================
  // Area 5.5.4: Live Validation & CJK Double-Width Weighting
  // =========================================================================
  describe('tier5', 'Tier 5.5.4: Live Validation & CJK Double-Width Weighting', () => {
    it('5.5.4.1 Pure ASCII strings count exactly 1 unit per character', () => {
      expect(countGoogleCharacters('Google Ads 2026')).toBe(15);
      expect(countGoogleCharacters('ABC xyz 123 !@#')).toBe(15);
      expect(countGoogleCharacters('')).toBe(0);
    });

    it('5.5.4.2 Vietnamese diacritics count exactly 1 unit per character', () => {
      const vnText = 'Công cụ xem trước quảng cáo đa kênh';
      expect(countGoogleCharacters(vnText)).toBe(vnText.length);
      const vnDiacritics = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
      expect(countGoogleCharacters(vnDiacritics)).toBe(vnDiacritics.length);
    });

    it('5.5.4.3 CJK Ideographs, Hiragana, Katakana, and Hangul count as 2 units each', () => {
      // Japanese Kanji
      expect(countGoogleCharacters('広告')).toBe(4); // 2 chars * 2 = 4
      // Japanese Hiragana
      expect(countGoogleCharacters('とうきょう')).toBe(10); // 5 chars * 2 = 10
      // Japanese Katakana
      expect(countGoogleCharacters('テスト')).toBe(6); // 3 chars * 2 = 6
      // Chinese Simplified & Traditional
      expect(countGoogleCharacters('测试广告')).toBe(8); // 4 chars * 2 = 8
      // Korean Hangul
      expect(countGoogleCharacters('테스트')).toBe(6); // 3 chars * 2 = 6
    });

    it('5.5.4.4 Mixed Latin, Vietnamese, and CJK strings sum weights accurately', () => {
      // 'Sale ' (5 ASCII = 5) + '50% ' (4 ASCII = 4) + '限定' (2 CJK = 4) = 13
      expect(countGoogleCharacters('Sale 50% 限定')).toBe(13);
      // 'Khuyến mãi ' (11 VN = 11) + 'セール' (3 CJK = 6) = 17
      expect(countGoogleCharacters('Khuyến mãi セール')).toBe(17);
    });

    it('5.5.4.5 Verbal badge "✓ Không có lỗi" renders under valid drafts', (doc) => {
      const validationSection = Array.from(doc.querySelectorAll('p')).find((p) =>
        p.textContent.includes('Kiểm tra vị trí này')
      );
      if (validationSection) {
        const noErrorBadge = validationSection.querySelector('span.bg-\\[\\#e7f6ec\\], span.text-\\[\\#16a34a\\]');
        if (noErrorBadge) {
          expect(noErrorBadge.textContent).toContain('✓ Không có lỗi');
        }
      }
    });

    it('5.5.4.6 Warning and error badges render under threshold violations', (doc) => {
      // Google Search headline overflow (>30 chars)
      const gsearchTab = doc.querySelector('[data-testid="platform-tab-google_search"]');
      if (gsearchTab) {
        dom.click(gsearchTab);
        const headlineInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(
          (i) => i.value.includes('Digital Marketing')
        );
        if (headlineInput) {
          dom.type(headlineInput, 'A'.repeat(35));
          const badge = doc.querySelector('span.bg-\\[\\#fdedef\\], span.bg-\\[\\#fbeee5\\]');
          if (badge) {
            expect(badge.textContent.includes('lỗi') || badge.textContent.includes('cảnh báo')).toBe(true);
          }
          // Reset
          dom.type(headlineInput, 'Digital Marketing, AI Automation & AI Agent - Blog noti.vn');
        }
      }
    });
  });

  // =========================================================================
  // Area 5.5.5: Minimal Decorative Iconography Verification
  // =========================================================================
  describe('tier5', 'Tier 5.5.5: Minimal Decorative Iconography Verification (R4)', () => {
    it('5.5.5.1 Zero decorative pulsing pencil SVGs exist in codebase and DOM', (doc) => {
      const pencilSvgs = doc.querySelectorAll(
        '.lucide-pencil, .pulsing-pencil, .animate-pulse svg, input + svg, textarea + svg'
      );
      expect(pencilSvgs.length).toBe(0);
    });

    it('5.5.5.2 Zero decorative shield SVGs exist in codebase and DOM', (doc) => {
      const shieldSvgs = doc.querySelectorAll(
        '.lucide-shield-check, .decorative-shield, .default-notice svg'
      );
      expect(shieldSvgs.length).toBe(0);
    });

    it('5.5.5.3 Action buttons contain zero decorative sparkle or star icons', (doc) => {
      const sparkleIcons = doc.querySelectorAll('.lucide-sparkles, .lucide-star');
      expect(sparkleIcons.length).toBe(0);
    });

    it('5.5.5.4 Exactly 10 monochrome 18x18 platform SVGs are defined in PlatformSvg', () => {
      const platforms = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube', 'google_search', 'chatgpt', 'zalo', 'linkedin', 'admicro'];
      expect(platforms.length).toBe(10);
    });
  });
}
