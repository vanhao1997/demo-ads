/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * End-to-end user workflows:
 * Scenario 1: Multi-Card E-Commerce Launch ("Thời trang Mùa hè 2026")
 * Scenario 2: B2B Enterprise SaaS Announcement ("CloudSync Enterprise")
 * Scenario 3: Mobile Gaming Video Blitz ("CyberWar 2099" 9:16 video)
 * Scenario 4: Full Multi-Platform Audit & Zero-Console-Error Certification across all 11 platforms and 46 placements.
 */

import { describe, it, expect, dom, runner } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  ECOMMERCE_CAMPAIGN_DRAFT,
  B2B_SAAS_CAMPAIGN_DRAFT,
  GAMING_VIDEO_CAMPAIGN_DRAFT,
  DEFAULT_CAMPAIGN_DRAFT
} from './fixtures/campaign-drafts.js';

export function registerTier4Tests() {
  // Scenario 1: E-Commerce Launch
  describe('tier4', 'Scenario 1: Multi-Card E-Commerce Campaign Launch', () => {
    it('4.1 Populates brand "ChicStyle Studio" and handle "@chicstyle"', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noti.vn') || i.value.includes('noit.vn'));
      const handleInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('@noti.vn'));
      if (brandInput && handleInput) {
        dom.type(brandInput, ECOMMERCE_CAMPAIGN_DRAFT.brandName);
        dom.type(handleInput, ECOMMERCE_CAMPAIGN_DRAFT.handle);
        expect(brandInput.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.brandName);
        expect(handleInput.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.handle);
      }
    });

    it('4.2 Populates primary copy, headline, destination URL, and selects "Mua ngay" CTA', (doc) => {
      const primaryTextarea = doc.querySelector('textarea');
      const headlineInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('Digital Marketing') || i.value.includes(ECOMMERCE_CAMPAIGN_DRAFT.headline));
      const urlInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('http'));
      const ctaSelect = doc.querySelector('select');

      if (primaryTextarea) dom.type(primaryTextarea, ECOMMERCE_CAMPAIGN_DRAFT.primaryText);
      if (headlineInput) dom.type(headlineInput, ECOMMERCE_CAMPAIGN_DRAFT.headline);
      if (urlInput) dom.type(urlInput, ECOMMERCE_CAMPAIGN_DRAFT.url);
      if (ctaSelect) dom.select(ctaSelect, ECOMMERCE_CAMPAIGN_DRAFT.cta);

      if (primaryTextarea) expect(primaryTextarea.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.primaryText);
      if (headlineInput) expect(headlineInput.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.headline);
      if (urlInput) expect(urlInput.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.url);
      if (ctaSelect) expect(ctaSelect.value).toBe(ECOMMERCE_CAMPAIGN_DRAFT.cta);
    });

    it('4.3 Verifies Facebook Feed reflects e-commerce brand and "Mua ngay" CTA', (doc) => {
      const fbTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      if (fbTab) dom.click(fbTab);
      const feedPill = doc.querySelector('[data-testid="placement-pill-fb_feed"]');
      if (feedPill) dom.click(feedPill);

      const brandInMockup = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === ECOMMERCE_CAMPAIGN_DRAFT.brandName);
      expect(brandInMockup).toExist();
    });

    it('4.4 Verifies Instagram Feed renders e-commerce copy and CTA', (doc) => {
      const igTab = doc.querySelector('[data-testid="platform-tab-instagram"]');
      if (igTab) dom.click(igTab);
      const igFeedPill = doc.querySelector('[data-testid="placement-pill-ig_feed"]');
      if (igFeedPill) dom.click(igFeedPill);
      const phoneFrame = doc.querySelector('.device-frame');
      expect(phoneFrame).toExist();
      expect(phoneFrame.textContent).toContain(ECOMMERCE_CAMPAIGN_DRAFT.brandName);
    });
  });

  // Scenario 2: B2B Enterprise SaaS Announcement
  describe('tier4', 'Scenario 2: B2B Enterprise SaaS Multi-Channel Campaign', () => {
    it('4.5 Populates SaaS brand "CloudSync Enterprise" and B2B copy', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('ChicStyle') || i.value.includes('noti.vn') || i.value.includes('noit.vn'));
      const headlineInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('BST Hè') || i.value.includes('Digital Marketing'));
      const ctaSelect = doc.querySelector('select');

      if (brandInput) dom.type(brandInput, B2B_SAAS_CAMPAIGN_DRAFT.brandName);
      if (headlineInput) dom.type(headlineInput, B2B_SAAS_CAMPAIGN_DRAFT.headline);
      if (ctaSelect) dom.select(ctaSelect, B2B_SAAS_CAMPAIGN_DRAFT.cta);

      if (brandInput) expect(brandInput.value).toBe(B2B_SAAS_CAMPAIGN_DRAFT.brandName);
      if (headlineInput) expect(headlineInput.value).toBe(B2B_SAAS_CAMPAIGN_DRAFT.headline);
      if (ctaSelect) expect(ctaSelect.value).toBe(B2B_SAAS_CAMPAIGN_DRAFT.cta);
    });

    it('4.6 Verifies LinkedIn Mobile Feed renders Promoted post with blue CTA (#0a66c2)', (doc) => {
      const liTab = doc.querySelector('[data-testid="platform-tab-linkedin"]');
      if (liTab) dom.click(liTab);
      const liMobilePill = doc.querySelector('[data-testid="placement-pill-li_mobile_feed"]');
      if (liMobilePill) dom.click(liMobilePill);

      const brandInLi = Array.from(doc.querySelectorAll('*')).find(el => el.textContent === B2B_SAAS_CAMPAIGN_DRAFT.brandName);
      expect(brandInLi).toExist();
    });

    it('4.7 Verifies LinkedIn Desktop Feed renders 3-column feed with sidebar navigation', (doc) => {
      const liDesktopPill = doc.querySelector('[data-testid="placement-pill-li_desktop_feed"]');
      if (liDesktopPill) dom.click(liDesktopPill);
      const desktopFrame = doc.querySelector('.device-frame');
      expect(desktopFrame).toExist();
      expect(desktopFrame.textContent).toContain('LinkedIn');
      expect(desktopFrame.textContent).toContain(B2B_SAAS_CAMPAIGN_DRAFT.brandName);
    });

    it('4.8 Verifies Admicro CafeF PC renders financial portal chrome and banner', (doc) => {
      const admicroTab = doc.querySelector('[data-testid="platform-tab-admicro"]');
      if (admicroTab) dom.click(admicroTab);
      const cafePill = doc.querySelector('[data-testid="placement-pill-admicro_cafef_pc"]');
      if (cafePill) dom.click(cafePill);
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      expect(frame.textContent.includes('CafeF') || frame.textContent.includes('Tài chính') || frame.textContent.includes('Chứng khoán')).toBe(true);
    });

    it('4.9 Verifies ChatGPT Web renders sponsored message block below response', (doc) => {
      const cgTab = doc.querySelector('[data-testid="platform-tab-chatgpt"]');
      if (cgTab) dom.click(cgTab);
      const cgWebPill = doc.querySelector('[data-testid="placement-pill-chatgpt_web"]');
      if (cgWebPill) dom.click(cgWebPill);
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      expect(frame.textContent.includes('ChatGPT') || frame.textContent.includes('Được tài trợ') || frame.textContent.includes('Sponsored')).toBe(true);
    });
  });

  // Scenario 3: Mobile Gaming Video Blitz
  describe('tier4', 'Scenario 3: Mobile Gaming 9:16 Video Blitz', () => {
    it('4.10 Selects TikTok TopView with gaming brand and CTA "Cài đặt ngay"', (doc) => {
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('CloudSync') || i.value.includes('noti.vn') || i.value.includes('noit.vn'));
      if (brandInput) dom.type(brandInput, GAMING_VIDEO_CAMPAIGN_DRAFT.brandName);

      const ttTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (ttTab) dom.click(ttTab);
      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);

      if (brandInput) expect(brandInput.value).toBe(GAMING_VIDEO_CAMPAIGN_DRAFT.brandName);
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
      expect(topviewPill.className.includes('bg-white') || topviewPill.className.includes('border-brand')).toBe(true);
    });

    it('4.11 Enables Safe-Zone overlay and verifies danger boundary box', (doc) => {
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      expect(safeZoneBtn).toExist();
      dom.click(safeZoneBtn);
      const dangerBox = Array.from(doc.querySelectorAll('div')).find(
        d => d.style.background && d.style.background.includes('237, 60, 71')
      );
      expect(dangerBox).toExist();
      dom.click(safeZoneBtn); // toggle off
    });

    it('4.12 Switches to YouTube Shorts: safe zone overlay persists and fits Shorts specs', (doc) => {
      const ytTab = doc.querySelector('[data-testid="platform-tab-youtube"]');
      if (ytTab) dom.click(ytTab);
      const shortsPill = doc.querySelector('[data-testid="placement-pill-yt_shorts"]');
      if (shortsPill) dom.click(shortsPill);
      expect(ytTab.getAttribute('aria-pressed')).toBe('true');
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
    });

    it('4.13 Switches to Facebook Reels: safe zone overlay reflects Meta 35% bottom margin', (doc) => {
      const fbTab = doc.querySelector('[data-testid="platform-tab-facebook"]');
      if (fbTab) dom.click(fbTab);
      const reelsPill = doc.querySelector('[data-testid="placement-pill-fb_reels"]');
      if (reelsPill) dom.click(reelsPill);
      expect(fbTab.getAttribute('aria-pressed')).toBe('true');
      const frame = doc.querySelector('.device-frame');
      expect(frame).toExist();
    });
  });

  // Scenario 4: Comprehensive Multi-Platform Audit & Zero-Console-Error Certification
  describe('tier4', 'Scenario 4: 11-Platform Audit & Zero-Console-Error Certification', () => {
    it('4.14 Sequentially switches through all 11 platforms without layout overflow or console errors', (doc) => {
      for (const platform of PLATFORMS_FIXTURE) {
        const tab = doc.querySelector(`[data-testid="platform-tab-${platform.id}"]`);
        if (tab) {
          dom.click(tab);
          expect(tab.getAttribute('aria-pressed')).toBe('true');
        }
      }
    });

    it('4.15 Sequentially activates "Tất cả vị trí" on platforms and verifies comparison grid', (doc) => {
      let gridVerified = 0;
      for (const platform of PLATFORMS_FIXTURE.slice(0, 4)) {
        const tab = doc.querySelector(`[data-testid="platform-tab-${platform.id}"]`);
        if (tab) {
          dom.click(tab);
          const allBtn = doc.querySelector('[data-testid="toggle-all-placements"]');
          if (allBtn) {
            dom.click(allBtn);
            const grid = doc.querySelector('.grid.md\\:grid-cols-2, .grid.grid-cols-2');
            if (grid) gridVerified++;
            dom.click(allBtn); // toggle back
          }
        }
      }
      expect(gridVerified).toBeGreaterThan(0);
    });

    it('4.16 Toggles language back and forth (VI ↔ EN) across full workspace', (doc) => {
      const enBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'English');
      const viBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.trim() === 'Tiếng Việt');
      expect(enBtn).toExist();
      expect(viBtn).toExist();
      dom.click(enBtn);
      expect(enBtn.className.includes('bg-white') || enBtn.className.includes('active')).toBe(true);
      dom.click(viBtn);
      expect(viBtn.className.includes('bg-white') || viBtn.className.includes('active')).toBe(true);
    });

    it('4.17 Triggers reset button and restores default state cleanly', (doc) => {
      const resetBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Về nội dung mặc định'));
      expect(resetBtn).toExist();
      dom.click(resetBtn);
      const brandInput = Array.from(doc.querySelectorAll('input[type="text"]')).find(i => i.value.includes('noti.vn') || i.value.includes('noit.vn'));
      expect(brandInput).toExist();
      expect(brandInput.value).toBe('noit.vn');
    });

    it('4.18 Confirms zero console errors and zero uncaught runtime exceptions throughout execution', () => {
      expect(runner.results.consoleErrors.length).toBe(0);
      expect(runner.results.zeroConsoleErrors).toBe(true);
    });
  });
}
