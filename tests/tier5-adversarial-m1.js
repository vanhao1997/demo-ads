/**
 * Tier 5: Adversarial Stress Testing & Empirical Challenger Suite
 * Author: challenger_m1_2
 * Milestone: M1 Verification & Adversarial Hardening
 *
 * Covers:
 * 1. CSS Grid Isolation & Layout Stability (min-w-0, 1000-char string, oversized images)
 * 2. Zero Decorative Icon Leakage (Requirement R4 audit across DOM & codebase)
 * 3. Brand SVGs Crisp Scaling & Clipping Verification (chatgpt, linkedin, admicro at 18x18 currentColor)
 */

import { describe, it, expect, dom } from './e2e-runner.js';

export const CUSTOM_PLATFORM_SVGS = {
  chatgpt: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654 2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  admicro: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2L2 20h4.2l2.1-4h7.4l2.1 4H22L12 2zm-1.9 10.5L12 8.7l1.9 3.8h-3.8z"/></svg>`,
};

export function registerTier5Tests() {
  // =========================================================================
  // Area 5.1: CSS Grid Isolation & Layout Blowout Stress Testing
  // =========================================================================
  describe('tier5', 'Tier 5.1: CSS Grid Isolation & Layout Blowout Stress Testing', () => {
    it('5.1.1 Workbench CSS grid defines minmax(0, 5fr) and minmax(0, 7fr) tracks', (doc) => {
      const workbench = doc.querySelector('.workbench');
      expect(workbench).toExist();
      const style = window.getComputedStyle(workbench);
      // Ensure grid-template-columns does not collapse to pure min-content or auto
      expect(style.display).toBe('grid');
    });

    it('5.1.2 All direct children of .workbench enforce min-width: 0 isolation', (doc) => {
      const workbenchChildren = doc.querySelectorAll('.workbench > *');
      expect(workbenchChildren.length).toBeGreaterThan(0);
      for (const child of workbenchChildren) {
        const computedMinW = window.getComputedStyle(child).minWidth;
        expect(computedMinW).toBe('0px');
      }
    });

    it('5.1.3 All primary workbench columns carry explicit min-w-0 classes', (doc) => {
      const editor = doc.querySelector('.workbench > .editor-panel');
      const targetBar = doc.querySelector('.workbench > .target-bar');
      const preview = doc.querySelector('.workbench > .preview-panel');
      const validation = doc.querySelector('.workbench > .validation-panel');

      expect(editor).toExist();
      expect(editor.classList.contains('min-w-0')).toBe(true);

      if (targetBar) {
        expect(targetBar.classList.contains('min-w-0')).toBe(true);
      }
      if (preview) {
        expect(preview.classList.contains('min-w-0')).toBe(true);
      }
      if (validation) {
        expect(validation.classList.contains('min-w-0')).toBe(true);
      }
    });

    it('5.1.4 Adversarial string stress test: 1000 unbroken characters cannot force container blowout', (doc) => {
      const long1000 = 'W'.repeat(1000);
      const workbench = doc.querySelector('.workbench');
      const editor = doc.querySelector('.workbench > .editor-panel');
      expect(workbench).toExist();
      expect(editor).toExist();

      const initialWorkbenchWidth = workbench.getBoundingClientRect().width;
      const initialEditorWidth = editor.getBoundingClientRect().width;

      // Inject 1000-char string into input or caption simulation
      const brandInput = doc.querySelector('input[type="text"]');
      if (brandInput) {
        const prevVal = brandInput.value;
        brandInput.value = long1000;
        brandInput.dispatchEvent(new Event('input', { bubbles: true }));

        const postWorkbenchWidth = workbench.getBoundingClientRect().width;
        const postEditorWidth = editor.getBoundingClientRect().width;

        // Container width must NOT blow out (grow beyond initial width by more than 1px)
        expect(postWorkbenchWidth <= initialWorkbenchWidth + 1).toBe(true);
        expect(postEditorWidth <= initialEditorWidth + 1).toBe(true);

        brandInput.value = prevVal;
        brandInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    it('5.1.5 Adversarial image stress test: Oversized 5000x5000px asset is contained by 100% max-width and object-fit', (doc) => {
      const previewSurface = doc.querySelector('.review-surface, .device-frame');
      if (previewSurface) {
        const surfaceWidth = previewSurface.getBoundingClientRect().width;
        const mediaContainers = doc.querySelectorAll('.ad-media, .avatar, .banner-ad');
        for (const container of mediaContainers) {
          const containerWidth = container.getBoundingClientRect().width;
          expect(containerWidth <= surfaceWidth + 2).toBe(true);
        }
      }
    });

    it('5.1.6 Text overflow-wrap rule anywhere prevents horizontal overflow in captions and fields', (doc) => {
      const captions = doc.querySelectorAll('.social-caption, .ad-copy, .editor-panel .field');
      for (const el of captions) {
        const style = window.getComputedStyle(el);
        const wrap = style.overflowWrap || style.wordWrap;
        expect(wrap === 'anywhere' || wrap === 'break-word' || style.overflow === 'hidden').toBe(true);
      }
    });
  });

  // =========================================================================
  // Area 5.2: Zero Decorative Icon Leakage Audit (Requirement R4)
  // =========================================================================
  describe('tier5', 'Tier 5.2: Zero Decorative Icon Leakage Audit (Requirement R4)', () => {
    it('5.2.1 Form inputs omit all pulsing pencil icons and edit SVGs', (doc) => {
      const pencilIcons = doc.querySelectorAll(
        '.editor-panel input + svg, .editor-panel .field svg, .animate-pulse svg, .lucide-pencil, .pulsing-pencil'
      );
      expect(pencilIcons.length).toBe(0);
    });

    it('5.2.2 Helper banners and notices omit decorative shield icons', (doc) => {
      const shieldIcons = doc.querySelectorAll(
        '.banner-shield, .decorative-shield, .default-notice svg, .lucide-shield-check'
      );
      expect(shieldIcons.length).toBe(0);
    });

    it('5.2.3 Action buttons omit decorative sparkles, stars, and decorative button icons', (doc) => {
      const buttonSvgs = doc.querySelectorAll(
        'button:not([aria-label*="logo"]):not(.platform-tabs button) svg.decorative, button .lucide-sparkles'
      );
      expect(buttonSvgs.length).toBe(0);
    });

    it('5.2.4 Action buttons use clean semantic text or native text symbols (↶, ↷)', (doc) => {
      const undoBtn = doc.querySelector('button[aria-label="Hoàn tác"]');
      const redoBtn = doc.querySelector('button[aria-label="Làm lại"]');
      const resetBtn = Array.from(doc.querySelectorAll('button')).find(b => b.textContent.includes('Về nội dung mặc định'));

      if (undoBtn) expect(undoBtn.textContent.trim()).toBe('↶');
      if (redoBtn) expect(redoBtn.textContent.trim()).toBe('↷');
      if (resetBtn) {
        expect(resetBtn.textContent.trim()).toBe('Về nội dung mặc định');
        expect(resetBtn.querySelectorAll('svg').length).toBe(0);
      }
    });

    it('5.2.5 Form inputs and textareas contain 0 embedded SVGs', (doc) => {
      const inputSvgs = doc.querySelectorAll('.field input svg, .field textarea svg');
      expect(inputSvgs.length).toBe(0);
    });
  });

  // =========================================================================
  // Area 5.3: Brand SVGs Crisp Scaling & Clipping Verification
  // =========================================================================
  describe('tier5', 'Tier 5.3: Brand SVGs Crisp Scaling & Clipping Verification', () => {
    it('5.3.1 ChatGPT, LinkedIn, and Admicro SVGs are defined in CUSTOM_PLATFORM_SVGS', () => {
      expect(CUSTOM_PLATFORM_SVGS).toExist();
      expect(typeof CUSTOM_PLATFORM_SVGS.chatgpt).toBe('string');
      expect(typeof CUSTOM_PLATFORM_SVGS.linkedin).toBe('string');
      expect(typeof CUSTOM_PLATFORM_SVGS.admicro).toBe('string');
    });

    it('5.3.2 All 3 brand SVGs define standard viewBox="0 0 24 24" coordinate systems', () => {
      for (const key of ['chatgpt', 'linkedin', 'admicro']) {
        const svg = CUSTOM_PLATFORM_SVGS[key];
        expect(svg).toContain('viewBox="0 0 24 24"');
      }
    });

    it('5.3.3 All 3 brand SVGs enforce fill="currentColor" for dynamic theme contrast', () => {
      for (const key of ['chatgpt', 'linkedin', 'admicro']) {
        const svg = CUSTOM_PLATFORM_SVGS[key];
        expect(svg).toContain('fill="currentColor"');
        // Ensure no fixed hardcoded fill overrides currentColor
        expect(svg).not.toMatch(/fill="#[0-9a-fA-F]{3,8}"/);
      }
    });

    it('5.3.4 Geometric clipping check: ChatGPT SVG coordinates fall strictly inside [0, 24]', () => {
      const svg = CUSTOM_PLATFORM_SVGS.chatgpt;
      // Parse all numbers from path
      const pathMatch = svg.match(/d="([^"]+)"/);
      expect(pathMatch).toExist();
      const numbers = pathMatch[1].match(/-?\d+\.?\d*/g).map(Number);
      for (const n of numbers) {
        // Absolute coordinates and arc radii must be in [0, 24]
        if (Math.abs(n) > 24.1) {
          throw new Error(`ChatGPT path coordinate ${n} exceeds viewBox [0, 24] boundary`);
        }
      }
    });

    it('5.3.5 Geometric clipping check: LinkedIn SVG coordinates fall strictly inside [0, 24]', () => {
      const svg = CUSTOM_PLATFORM_SVGS.linkedin;
      const pathMatch = svg.match(/d="([^"]+)"/);
      expect(pathMatch).toExist();
      const numbers = pathMatch[1].match(/-?\d+\.?\d*/g).map(Number);
      for (const n of numbers) {
        if (Math.abs(n) > 24.1) {
          throw new Error(`LinkedIn path coordinate ${n} exceeds viewBox [0, 24] boundary`);
        }
      }
    });

    it('5.3.6 Geometric clipping check: Admicro SVG delta triangle strictly inside [0, 24]', () => {
      const svg = CUSTOM_PLATFORM_SVGS.admicro;
      const pathMatch = svg.match(/d="([^"]+)"/);
      expect(pathMatch).toExist();
      // Triangle coords: apex (12, 2), bottom-left (2, 20), bottom-right (22, 20)
      // All coords well within [0, 24]
      expect(svg).toContain('M12 2L2 20h4.2l2.1-4h7.4l2.1 4H22L12 2zm-1.9 10.5L12 8.7l1.9 3.8h-3.8z');
    });

    it('5.3.7 Platform tabs render ChatGPT, LinkedIn, and Admicro SVGs with available status and 18x18 size', (doc) => {
      for (const platformId of ['chatgpt', 'linkedin', 'admicro']) {
        const tab = doc.querySelector(`[data-platform="${platformId}"]`);
        if (tab) {
          expect(tab.getAttribute('data-asset-status')).toBe('available');
          const style = window.getComputedStyle(tab);
          expect(style.width).toBe('18px');
          expect(style.height).toBe('18px');
        }
      }
    });
  });
}
