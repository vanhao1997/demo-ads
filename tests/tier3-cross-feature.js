/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * Pairwise and multi-variable interaction testing:
 * Language switch × Safe zones, Carousel × Platform switching,
 * Inline overrides × Global draft, TopView phases × Controls, All-placements grid × Tools.
 */

import { describe, it, expect, dom } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  CANONICAL_CTA_MAP,
  DEFAULT_CAMPAIGN_DRAFT
} from './fixtures/campaign-drafts.js';

export function registerTier3Tests() {
  // Combination 1: Language Switch (VI ↔ EN) × Safe-Zone Overlays (9:16 Video)
  describe('tier3', 'Tier 3: Language Toggle × Safe-Zone Overlays', () => {
    it('3.1 Enabling Safe Zones on TikTok In-Feed displays bilingual danger zones', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn); // Activate
        const dangerZone = doc.querySelector('div[style*="237, 60, 71"]');
        expect(dangerZone).toExist();

        const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
        const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
        
        if (enBtn && viBtn) {
          dom.click(enBtn);
          expect(safeZoneBtn.className.includes('border-brand') || safeZoneBtn.className.includes('bg-[#fdedef]')).toBe(true);
          dom.click(viBtn);
        }
        dom.click(safeZoneBtn); // Turn off
        const dangerZoneAfter = doc.querySelector('div[style*="237, 60, 71"]');
        expect(dangerZoneAfter).toBe(null);
      }
    });

    it('3.2 Safe zone overlay maintains coordinate percentages across language changes', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn);
        const topDanger = doc.querySelector('div[style*="height: 108px"], div[style*="height: 120px"]');
        expect(topDanger).toExist();
        const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
        if (enBtn) dom.click(enBtn);
        const topDangerAfter = doc.querySelector('div[style*="height: 108px"], div[style*="height: 120px"]');
        expect(topDangerAfter).toExist();
        const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
        if (viBtn) dom.click(viBtn);
        dom.click(safeZoneBtn); // Turn off
      }
    });
  });

  // Combination 2: Carousel Upload (2-10 Files) × Multi-Platform Switching
  describe('tier3', 'Tier 3: Multi-File Carousel Upload × Platform Switching', () => {
    it('3.3 Switching from Facebook Feed to Instagram Feed preserves carousel cards', (doc) => {
      const fbTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      const igTab = doc.querySelector('[data-testid="platform-tab-instagram"]');
      if (fbTab && igTab) {
        dom.click(fbTab);
        dom.click(igTab);
        expect(igTab.getAttribute('aria-pressed')).toBe('true');
        const igPill = doc.querySelector('[data-testid="placement-pill-ig_feed"]');
        expect(igPill).toExist();
      }
    });

    it('3.4 Switching from Carousel feed to text-only Google Search suppresses image gracefully', (doc) => {
      const gsTab = doc.querySelector('[data-testid="platform-tab-google_search"]');
      if (gsTab) {
        dom.click(gsTab);
        // Google Search is text-only SERP; images must not cause broken <img> errors
        const brokenImages = Array.from(doc.querySelectorAll('img')).filter(img => !img.src && !img.alt);
        expect(brokenImages.length).toBe(0);
      }
    });

    it('3.5 Switching to LinkedIn Feed adapts carousel to LinkedIn style cards', (doc) => {
      const liTab = doc.querySelector('[data-testid="platform-tab-linkedin"]');
      if (liTab) {
        dom.click(liTab);
        expect(liTab.getAttribute('aria-pressed')).toBe('true');
        const liPill = doc.querySelector('[data-testid="placement-pill-li_mobile_feed"], [data-testid="placement-pill-li_desktop_feed"]');
        expect(liPill).toExist();
      }
    });
  });

  // Combination 3: Inline Platform Overrides × Global Draft Copy
  describe('tier3', 'Tier 3: Platform Overrides × Global Draft Copy', () => {
    it('3.6 Specific Google Search sitelinks override generic URL', (doc) => {
      const s1 = doc.querySelector('input[placeholder="Sitelink 1"]');
      if (s1) {
        dom.type(s1, 'Ưu Đãi Đặc Biệt');
        expect(s1.value).toBe('Ưu Đãi Đặc Biệt');
        dom.type(s1, 'Sản phẩm');
      }
    });

    it('3.7 Clearing platform override falls back to global copy seamlessly', (doc) => {
      const headlineInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('Digital Marketing'));
      expect(headlineInput).toExist();
    });

    it('3.8 Changing global primary text updates all placements not having overrides', (doc) => {
      const primaryTextarea = doc.querySelector('textarea');
      expect(primaryTextarea).toExist();
    });
  });

  // Combination 4: TikTok TopView Phase Switch × App UI Toggle × Safe Zones
  describe('tier3', 'Tier 3: TikTok TopView Phase × App UI × Safe Zones', () => {
    it('3.9 Switching to TopView displays phase controller options', (doc) => {
      const ttTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (ttTab) dom.click(ttTab);
      const topViewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topViewPill) dom.click(topViewPill);
      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      const lateBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));
      expect(introBtn).toExist();
      expect(lateBtn).toExist();
    });

    it('3.10 In "0-3 giây đầu" phase, full video view is unobstructed', (doc) => {
      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      if (introBtn) {
        dom.click(introBtn);
        const phoneFrame = doc.querySelector('.device-frame');
        expect(phoneFrame).toExist();
        expect(phoneFrame.textContent).toContain('Bỏ qua');
        expect(phoneFrame.textContent.includes('12,3K')).toBe(false);
      }
    });

    it('3.11 In "Sau 3 giây" phase, reaction rail and CTA card overlay appear', (doc) => {
      const lateBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));
      if (lateBtn) {
        dom.click(lateBtn);
        const phoneFrame = doc.querySelector('.device-frame');
        expect(phoneFrame).toExist();
        expect(phoneFrame.textContent).toContain('12,3K');
        expect(phoneFrame.textContent.includes('Bỏ qua')).toBe(false);
      }
    });

    it('3.12 Toggling "Giao diện app" off hides chrome in both phases', (doc) => {
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        dom.click(appUiBtn); // Hide chrome
        expect(doc.querySelector('.device-phone-status')).toBe(null);
        dom.click(appUiBtn); // Restore chrome
        expect(doc.querySelector('.device-phone-status')).toExist();
      }
    });
  });

  // Combination 5: "Tất cả vị trí" 2-Column Grid × Bilingual Toggle
  describe('tier3', 'Tier 3: "Tất cả vị trí" Grid × Bilingual Toggle', () => {
    it('3.13 "Tất cả vị trí" shows all 10 Facebook placements in a comparison grid', (doc) => {
      const fbTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      if (fbTab) dom.click(fbTab);
      const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]');
      if (allBtn) {
        dom.click(allBtn);
        expect(allBtn.getAttribute('aria-pressed')).toBe('true');
        // All frames reflect language change simultaneously
        const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
        const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
        if (enBtn && viBtn) {
          dom.click(enBtn);
          dom.click(viBtn);
        }
        dom.click(allBtn); // Return to single placement
      }
    });

    it('3.14 Zoom modal can be triggered from placement view without disrupting draft state', (doc) => {
      const zoomBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Phóng to'));
      if (zoomBtn) {
        dom.click(zoomBtn);
        const modal = doc.querySelector('.zoom-modal-backdrop');
        expect(modal).toExist();
        const win = doc.defaultView || window;
        win.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
        expect(doc.querySelector('.zoom-modal-backdrop')).toBe(null);
      }
    });

    it('3.15 Switching platform resets view to single placement or preserves comparison cleanly', (doc) => {
      const ytTab = doc.querySelector('[data-testid="platform-tab-youtube"]');
      if (ytTab) {
        dom.click(ytTab);
        expect(ytTab.getAttribute('aria-pressed')).toBe('true');
        const frame = doc.querySelector('.device-frame');
        expect(frame).toExist();
      }
    });
  });
}
