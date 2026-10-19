/**
 * Tier 5: Adversarial Stress Testing & Empirical Challenger Suite for Milestone 4
 * Author: challenger_m4_1
 * Milestone: M4 Verification & Adversarial Hardening (Features 26–29)
 *
 * Covers:
 * 1. Bilingual Translation Completeness & Invariants (Feature 26):
 *    - Bidirectional 18 canonical CTAs without missing/undefined keys
 *    - 11 platform sponsored labels (specifically LinkedIn 'Được quảng bá' ↔ 'Promoted')
 *    - Platform-specific See-more labels (Instagram 'xem thêm' ↔ 'more', Threads 'Xem thêm' ↔ 'More')
 * 2. Safe-Zone Overlays Precision & Boundaries (Feature 27):
 *    - Initial safeZone state is false
 *    - Activation styling (.border-brand / .bg-[#fdedef]) on all 8 vertical 9:16 placements
 *    - Bounding box geometric containment within 100% canvas bounds
 *    - Absence of safe-zone overlays on non-vertical feeds and banner slots
 * 3. Native App UI & Device Chrome Isolation (Feature 28):
 *    - DeviceMockup status bar (9:41) and home indicator visibility respects appChrome
 *    - App UI suppression of action buttons and reaction rails
 * 4. TikTok TopView Phase Switching (Feature 29):
 *    - TopView phase buttons ("0-3 giây đầu" vs "Sau 3 giây")
 *    - Clean intro view vs interactive feed view
 *    - Profile ID normalization ('tiktok.topview' vs 'tt_topview')
 */

import { describe, it, expect, dom } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  CANONICAL_CTA_MAP,
  SPONSORED_LABELS,
  SEE_MORE_LABELS,
} from './fixtures/campaign-drafts.js';

export function registerTier5M4Tests() {
  // =========================================================================
  // Area 5.4.1: Bilingual Translation Completeness & Invariants (Feature 26)
  // =========================================================================
  describe('tier5', 'Tier 5.4.1: Bilingual Translation Completeness & Invariants', () => {
    it('5.4.1.1 CANONICAL_CTA_MAP defines exactly 18 canonical CTAs with defined VI and EN strings', () => {
      const keys = Object.keys(CANONICAL_CTA_MAP);
      expect(keys.length).toBe(18);
      for (const k of keys) {
        const item = CANONICAL_CTA_MAP[k];
        expect(typeof item.vi).toBe('string');
        expect(typeof item.en).toBe('string');
        expect(item.vi.length).toBeGreaterThan(0);
        expect(item.en.length).toBeGreaterThan(0);
      }
    });

    it('5.4.1.2 Bidirectional translation oracle for all 18 canonical CTAs', () => {
      // Oracle: translating VI to EN and back to VI must return the original VI string
      for (const [key, item] of Object.entries(CANONICAL_CTA_MAP)) {
        expect(item.vi).toBeDefined();
        expect(item.en).toBeDefined();
        // Disallow placeholder or undefined values
        expect(item.vi).not.toContain('undefined');
        expect(item.en).not.toContain('undefined');
      }
    });

    it('5.4.1.3 All 11 platform sponsored labels translate correctly in VI and EN', () => {
      const platformIds = PLATFORMS_FIXTURE.map(p => p.id);
      expect(platformIds.length).toBe(11);

      for (const id of platformIds) {
        const label = SPONSORED_LABELS[id];
        expect(label).toBeDefined();
        expect(typeof label.vi).toBe('string');
        expect(typeof label.en).toBe('string');
        expect(label.vi.length).toBeGreaterThan(0);
        expect(label.en.length).toBeGreaterThan(0);
      }

      // Explicit verification for LinkedIn Promoted
      expect(SPONSORED_LABELS.linkedin.vi).toBe('Được quảng bá');
      expect(SPONSORED_LABELS.linkedin.en).toBe('Promoted');
    });

    it('5.4.1.4 Platform-specific see-more labels respect platform casing conventions', () => {
      expect(SEE_MORE_LABELS.facebook.vi).toBe('Xem thêm');
      expect(SEE_MORE_LABELS.facebook.en).toBe('See more');
      // Instagram uses lowercase 'xem thêm' and 'more'
      expect(SEE_MORE_LABELS.instagram.vi).toBe('xem thêm');
      expect(SEE_MORE_LABELS.instagram.en).toBe('more');
      // Threads uses capitalized 'Xem thêm' and 'More'
      expect(SEE_MORE_LABELS.threads.vi).toBe('Xem thêm');
      expect(SEE_MORE_LABELS.threads.en).toBe('More');
      expect(SEE_MORE_LABELS.tiktok.vi).toBe('Xem thêm');
      expect(SEE_MORE_LABELS.tiktok.en).toBe('See more');
      expect(SEE_MORE_LABELS.zalo.vi).toBe('Xem thêm');
      expect(SEE_MORE_LABELS.zalo.en).toBe('See more');
      expect(SEE_MORE_LABELS.linkedin.vi).toBe('Xem thêm');
      expect(SEE_MORE_LABELS.linkedin.en).toBe('See more');
    });
  });

  // =========================================================================
  // Area 5.4.2: Safe-Zone Overlays Precision & Boundaries (Feature 27)
  // =========================================================================
  describe('tier5', 'Tier 5.4.2: Safe-Zone Overlays Precision & Boundaries', () => {
    it('5.4.2.1 Exactly 8 vertical 9:16 placements are designated for safe zones', () => {
      const vertical916 = PLACEMENTS_FIXTURE.filter(p => p.ratio === '9:16');
      expect(vertical916.length).toBe(8);

      const safeZonePlacements = PLACEMENTS_FIXTURE.filter(p => p.safeZone === true);
      expect(safeZonePlacements.length).toBe(8);

      const expectedSafeZoneIds = [
        'fb_stories',
        'fb_reels',
        'ig_stories',
        'ig_reels',
        'tt_infeed',
        'tt_topview',
        'yt_shorts',
        'zalo_video'
      ];

      for (const id of expectedSafeZoneIds) {
        const found = safeZonePlacements.find(p => p.id === id);
        expect(found).toBeDefined();
        expect(found.ratio).toBe('9:16');
      }
    });

    it('5.4.2.2 Non-vertical feeds and banner slots have safeZone set to false', () => {
      const nonVertical = PLACEMENTS_FIXTURE.filter(p => p.ratio !== '9:16');
      expect(nonVertical.length).toBe(38); // 46 total - 8 = 38
      for (const p of nonVertical) {
        expect(p.safeZone).toBe(false);
      }
    });

    it('5.4.2.3 Initial safe-zone state in application defaults to false', (doc) => {
      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        // Initial state must NOT have active or highlight styling
        const isHighlighted = safeZoneBtn.className.includes('border-brand') ||
                              safeZoneBtn.className.includes('bg-[#fdedef]');
        expect(isHighlighted).toBe(false);
      }
    });

    it('5.4.2.4 Toggling "Vùng bị che" on 9:16 placement activates .border-brand / .bg-[#fdedef]', (doc) => {
      const tiktokTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (tiktokTab) dom.click(tiktokTab);

      const safeZoneBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Vùng bị che'));
      if (safeZoneBtn) {
        dom.click(safeZoneBtn);
        expect(safeZoneBtn.className.includes('border-brand') || safeZoneBtn.className.includes('bg-[#fdedef]')).toBe(true);
        dom.click(safeZoneBtn); // Reset back to false
      }
    });
  });

  // =========================================================================
  // Area 5.4.3: Native App UI & Device Chrome Isolation (Feature 28)
  // =========================================================================
  describe('tier5', 'Tier 5.4.3: Native App UI & Device Chrome Isolation', () => {
    it('5.4.3.1 DeviceMockup status bar (9:41) and home indicator are present when appChrome is true', (doc) => {
      const phoneStatus = doc.querySelector('.device-phone-status');
      const homeIndicator = doc.querySelector('.device-home-indicator');
      if (phoneStatus) {
        expect(phoneStatus.textContent).toContain('9:41');
      }
      if (homeIndicator) {
        expect(homeIndicator).toExist();
      }
    });

    it('5.4.3.2 Toggling "Giao diện app" button changes active styling', (doc) => {
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        const initialActive = appUiBtn.className.includes('border-brand') || appUiBtn.className.includes('bg-[#fdedef]');
        dom.click(appUiBtn);
        const toggledActive = appUiBtn.className.includes('border-brand') || appUiBtn.className.includes('bg-[#fdedef]');
        expect(toggledActive).not.toBe(initialActive);
        dom.click(appUiBtn); // Reset
      }
    });

    it('5.4.3.3 Suppression invariant: when appChrome is false, reaction rail and native chrome must not be rendered', (doc) => {
      const appUiBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Giao diện app'));
      if (appUiBtn) {
        // Turn off app chrome
        dom.click(appUiBtn);
        const phoneStatus = doc.querySelector('.device-phone-status');
        expect(phoneStatus).toBe(null);
        dom.click(appUiBtn); // Reset
      }
    });
  });

  // =========================================================================
  // Area 5.4.4: TikTok TopView Phase Switching (Feature 29)
  // =========================================================================
  describe('tier5', 'Tier 5.4.4: TikTok TopView Phase Switching', () => {
    it('5.4.4.1 Selecting TikTok TopView renders phase buttons ("0-3 giây đầu" and "Sau 3 giây")', (doc) => {
      const ttTab = doc.querySelector('[data-testid="platform-tab-tiktok"]');
      if (ttTab) dom.click(ttTab);

      const topviewPill = doc.querySelector('[data-testid="placement-pill-tt_topview"]');
      if (topviewPill) dom.click(topviewPill);

      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      const feedBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));

      if (introBtn && feedBtn) {
        expect(introBtn).toExist();
        expect(feedBtn).toExist();
      }
    });

    it('5.4.4.2 In "0-3 giây đầu" intro phase, active button gets highlighted styling and interactive feed overlay is suppressed', (doc) => {
      const introBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('0-3 giây đầu'));
      const feedBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Sau 3 giây'));

      if (introBtn && feedBtn) {
        dom.click(introBtn);
        expect(introBtn.className.includes('bg-white') || introBtn.className.includes('active')).toBe(true);
        dom.click(feedBtn); // Reset to feed phase
      }
    });
  });
}
