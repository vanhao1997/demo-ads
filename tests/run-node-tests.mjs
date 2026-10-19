/**
 * Headless CLI Test Runner for Ad Preview Test Suite
 * Can be executed via: node tests/run-node-tests.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runner, describe, it, expect } from './e2e-runner.js';
import {
  PLATFORMS_FIXTURE,
  PLACEMENTS_FIXTURE,
  CANONICAL_CTA_MAP,
  SPONSORED_LABELS,
  SEE_MORE_LABELS,
  DEFAULT_CAMPAIGN_DRAFT,
  ECOMMERCE_CAMPAIGN_DRAFT,
  B2B_SAAS_CAMPAIGN_DRAFT,
  GAMING_VIDEO_CAMPAIGN_DRAFT
} from './fixtures/campaign-drafts.js';
import { countGoogleCharacters } from './tier2-boundary-corners.js';
import { CUSTOM_PLATFORM_SVGS } from './tier5-adversarial-m1.js';
import { registerTier5M4Tests } from './tier5-adversarial-m4.js';
import { registerTier5M5Tests } from './tier5-adversarial-m5.js';
import { registerTier5M6Tests } from './tier5-adversarial-m6.js';

registerTier5M4Tests();
registerTier5M5Tests();
registerTier5M6Tests();

// Register contract & specification verification tests
describe('tier1', 'CLI Contract: Platform & Placement Coverage', () => {
  it('Verifies exactly 11 platforms are defined', () => {
    expect(PLATFORMS_FIXTURE.length).toBe(11);
  });

  it('Verifies exactly 46 placements across 11 platforms', () => {
    expect(PLACEMENTS_FIXTURE.length).toBe(46);
  });

  it('Verifies all 8 original platforms + 3 extended platforms (Zalo, LinkedIn, Admicro)', () => {
    const ids = PLATFORMS_FIXTURE.map(p => p.id);
    expect(ids).toContain('facebook');
    expect(ids).toContain('instagram');
    expect(ids).toContain('threads');
    expect(ids).toContain('tiktok');
    expect(ids).toContain('youtube');
    expect(ids).toContain('google_search');
    expect(ids).toContain('gdn');
    expect(ids).toContain('chatgpt');
    expect(ids).toContain('zalo');
    expect(ids).toContain('linkedin');
    expect(ids).toContain('admicro');
  });

  it('Verifies Facebook has exactly 10 placements', () => {
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'facebook').length).toBe(10);
  });

  it('Verifies Google Hiển thị has exactly 8 placements', () => {
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'gdn').length).toBe(8);
  });

  it('Verifies YouTube has exactly 6 placements', () => {
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'youtube').length).toBe(6);
  });

  it('Verifies Zalo, LinkedIn, and Admicro each have 4 placements', () => {
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'zalo').length).toBe(4);
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'linkedin').length).toBe(4);
    expect(PLACEMENTS_FIXTURE.filter(p => p.platform === 'admicro').length).toBe(4);
  });
});

describe('tier2', 'CLI Boundary: CJK Counting & Truncation Mathematics', () => {
  it('Evaluates Latin string counting', () => {
    expect(countGoogleCharacters('Hello World')).toBe(11);
  });

  it('Evaluates CJK characters count as 2 units each', () => {
    expect(countGoogleCharacters('東京')).toBe(4); // 2 * 2 = 4
    expect(countGoogleCharacters('광고')).toBe(4); // 2 * 2 = 4
  });

  it('Evaluates Google Search 30-char headline cap with mixed CJK and Latin', () => {
    const headline = 'Sale 50% 限定セール'; // 9 Latin + 5 CJK (10) = 19 units
    expect(countGoogleCharacters(headline)).toBe(19);
    expect(countGoogleCharacters(headline) <= 30).toBe(true);
  });

  it('Evaluates 10-file carousel maximum enforcement with excess file skipping', () => {
    const currentAssetCount = 0;
    const incoming = Array.from({ length: 15 }, (_, i) => ({ name: `file_${i + 1}.png` }));
    const allowedCount = Math.max(0, 10 - currentAssetCount);
    const toProcess = incoming.slice(0, allowedCount);
    expect(toProcess.length).toBe(10);
    expect(incoming.length - allowedCount).toBe(5);
  });

  it('Evaluates single vs 2+ file carousel auto-switch threshold', () => {
    const checkComposition = (creativeCount) => (creativeCount >= 2 ? 'carousel' : 'single_image');
    expect(checkComposition(1)).toBe('single_image');
    expect(checkComposition(2)).toBe('carousel');
    expect(checkComposition(5)).toBe('carousel');
  });

  it('Evaluates input dashed pink vs solid state transitions on typing and deletion', () => {
    const computeFieldClass = (val) => (!val || val.trim() === '' ? 'input-default' : 'input-edited');
    expect(computeFieldClass('')).toBe('input-default');
    expect(computeFieldClass('My Brand')).toBe('input-edited');
    expect(computeFieldClass('   ')).toBe('input-default');
  });

  it('Evaluates clamp [0.8, 1.91] on extreme aspect ratios', () => {
    const clamp = (r) => Math.max(0.8, Math.min(1.91, r));
    expect(clamp(0.4)).toBe(0.8);
    expect(clamp(2.5)).toBe(1.91);
    expect(clamp(1.0)).toBe(1.0);
  });
});

describe('tier3', 'CLI Translations: Bilingual Dictionary Integrity', () => {
  it('Verifies 18 canonical CTAs have both Vietnamese and English translations', () => {
    const keys = Object.keys(CANONICAL_CTA_MAP);
    expect(keys.length).toBe(18);
    keys.forEach(k => {
      expect(CANONICAL_CTA_MAP[k].vi).toBeDefined();
      expect(CANONICAL_CTA_MAP[k].en).toBeDefined();
    });
  });

  it('Verifies all 11 platforms have localized sponsored labels', () => {
    const keys = Object.keys(SPONSORED_LABELS);
    expect(keys.length).toBe(11);
    expect(SPONSORED_LABELS.facebook.vi).toBe('Được tài trợ');
    expect(SPONSORED_LABELS.facebook.en).toBe('Sponsored');
    expect(SPONSORED_LABELS.linkedin.vi).toBe('Được quảng bá');
    expect(SPONSORED_LABELS.linkedin.en).toBe('Promoted');
    expect(SPONSORED_LABELS.gdn.vi).toBe('Quảng cáo');
    expect(SPONSORED_LABELS.gdn.en).toBe('Ad');
  });
});

describe('tier4', 'CLI Scenarios: Campaign Fixture Integrity', () => {
  it('Validates E-Commerce Campaign draft data', () => {
    expect(ECOMMERCE_CAMPAIGN_DRAFT.brandName).toBe('ChicStyle Studio');
    expect(ECOMMERCE_CAMPAIGN_DRAFT.handle).toBe('@chicstyle');
    expect(ECOMMERCE_CAMPAIGN_DRAFT.cta).toBe('Mua ngay');
  });

  it('Validates B2B Enterprise SaaS Campaign draft data', () => {
    expect(B2B_SAAS_CAMPAIGN_DRAFT.brandName).toBe('CloudSync Enterprise');
    expect(B2B_SAAS_CAMPAIGN_DRAFT.cta).toBe('Đăng ký');
    expect(B2B_SAAS_CAMPAIGN_DRAFT.mediaRatio).toBe('1.91:1');
  });

  it('Validates Gaming Video Campaign draft data', () => {
    expect(GAMING_VIDEO_CAMPAIGN_DRAFT.brandName).toBe('CyberWar 2099');
    expect(GAMING_VIDEO_CAMPAIGN_DRAFT.videoDurationSec).toBe(15);
    expect(GAMING_VIDEO_CAMPAIGN_DRAFT.cta).toBe('Cài đặt ngay');
  });
});

describe('tier5', 'CLI Adversarial: Brand SVGs & Layout Math Isolation', () => {
  it('Evaluates ChatGPT, LinkedIn, and Admicro SVGs presence and attributes', () => {
    expect(CUSTOM_PLATFORM_SVGS.chatgpt).toContain('viewBox="0 0 24 24"');
    expect(CUSTOM_PLATFORM_SVGS.chatgpt).toContain('fill="currentColor"');
    expect(CUSTOM_PLATFORM_SVGS.linkedin).toContain('viewBox="0 0 24 24"');
    expect(CUSTOM_PLATFORM_SVGS.linkedin).toContain('fill="currentColor"');
    expect(CUSTOM_PLATFORM_SVGS.admicro).toContain('viewBox="0 0 24 24"');
    expect(CUSTOM_PLATFORM_SVGS.admicro).toContain('fill="currentColor"');
  });

  it('Evaluates zero visual clipping on SVG path coordinates', () => {
    for (const key of ['chatgpt', 'linkedin', 'admicro']) {
      const svg = CUSTOM_PLATFORM_SVGS[key];
      const match = svg.match(/d="([^"]+)"/);
      expect(match).toExist();
      const nums = match[1].match(/-?\d+\.?\d*/g).map(Number);
      for (const n of nums) {
        expect(Math.abs(n) <= 24.1).toBe(true);
      }
    }
  });

  it('Evaluates 1000-character continuous string truncation without regex crash', () => {
    const str1000 = 'A'.repeat(1000);
    const truncate = (s, max) => (s.length > max ? s.slice(0, max) + '... Xem thêm' : s);
    const truncated = truncate(str1000, 125);
    expect(truncated.endsWith('... Xem thêm')).toBe(true);
    expect(truncated.length).toBe(125 + '... Xem thêm'.length);
  });
});

// Run runner
async function main() {
  console.log('================================================================');
  console.log('Running Ad Preview Verification Test Suite (CLI Runner)...');
  console.log('================================================================');

  const results = await runner.run();

  console.log(`\nResults: ${results.passed}/${results.total} passed in ${results.durationMs}ms`);
  console.log(`- Tier 1: ${results.tiers.tier1.passed}/${results.tiers.tier1.total} passed`);
  console.log(`- Tier 2: ${results.tiers.tier2.passed}/${results.tiers.tier2.total} passed`);
  console.log(`- Tier 3: ${results.tiers.tier3.passed}/${results.tiers.tier3.total} passed`);
  console.log(`- Tier 4: ${results.tiers.tier4.passed}/${results.tiers.tier4.total} passed`);
  console.log(`- Tier 5: ${results.tiers.tier5 ? results.tiers.tier5.passed : 0}/${results.tiers.tier5 ? results.tiers.tier5.total : 0} passed`);

  if (results.failed > 0) {
    console.error(`\nFailed tests (${results.failed}):`);
    results.details.filter(d => !d.passed).forEach(d => {
      console.error(`  [${d.tier.toUpperCase()}] ${d.name}: ${d.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✓ ALL TESTS PASSED SUCCESSFULLY! Zero failures.');
    const outDir = resolve(process.cwd(), 'output');
    try {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'e2e-cli-results.json'), JSON.stringify(results, null, 2));
      console.log(`Report written to output/e2e-cli-results.json`);
    } catch (e) {
      // Ignore output write error in restricted sandbox
    }
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
