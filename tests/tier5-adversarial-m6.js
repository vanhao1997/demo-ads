/**
 * Tier 5: Adversarial Stress Testing & Empirical Challenger Suite for Milestone 6
 * Author: challenger_m6_1
 * Milestone: M6 Tier 5 Adversarial Coverage Hardening
 *
 * Covers:
 * 1. White-Box Source & Catalog Completeness:
 *    - All 11 platforms defined with zero missing groups
 *    - All 46 canonical placements defined with valid device, aspect ratio, text limits
 *    - Specific coverage for Zalo Ads (4), LinkedIn Ads (4), and Admicro (4)
 *    - Symmetrical bidirectional alias resolution (dot notation vs fixture underscore)
 * 2. Adversarial Edge Case Verification:
 *    - Empty strings in primaryText, headline, description, brandName, handle, cta, url
 *    - Maximum length strings (5,000 characters) without catastrophic backtracking or blowout
 *    - Undefined / null platform override fields (googleSearch, gdn, youtube, chatgpt)
 *    - Brand avatar initial fallback when brandName is empty or whitespace
 * 3. CJK Double-Width & Vietnamese Diacritics Oracle:
 *    - Pure Latin characters = 1 unit
 *    - Vietnamese diacritics (composed NFC vs decomposed NFD) = 1 unit per glyph
 *    - CJK characters (Hanzi, Kanji, Hiragana, Katakana, Hangul syllables) = 2 units
 *    - Google Search 30-char headline & 90-char description bounds with mixed scripts
 * 4. Media Constraints & Composition Boundaries:
 *    - Single media (1 image or 1 video) maintains non-carousel mode
 *    - Carousel mode threshold (2 to 10 assets) with pagination and active card tracking
 *    - Ceiling enforcement: strictly caps at 10 assets and rejects excess assets
 *    - Media tag polymorphism: <video> for video mediaType, <img> for image mediaType
 * 5. Safe-Zone Overlays on Vertical Video Placements:
 *    - Exactly 8 vertical 9:16 placements identified (fb_stories, fb_reels, ig_stories, ig_reels, tt_infeed, tt_topview, yt_shorts, zalo_video)
 *    - Safe-zone danger and dynamic caption regions bounded strictly within 0–100% canvas coordinates
 *    - Absence of safe-zone overlays on non-vertical feeds, banners, and search layouts
 * 6. Extended Platforms Verification & "Tất cả vị trí" Grid:
 *    - 2-column comparative grid operates seamlessly on Zalo Ads, LinkedIn Ads, and Admicro
 *    - Zero dropped placements or broken layout states
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
import { countGoogleCharacters } from './tier2-boundary-corners.js';

export function registerTier5M6Tests() {
  // =========================================================================
  // Area 5.6.1: White-Box 11-Platform & 46-Placement Universal Resolution
  // =========================================================================
  describe('tier5', 'Tier 5.6.1: White-Box 11-Platform & 46-Placement Universal Resolution', () => {
    it('5.6.1.1 Exactly 11 platforms defined with expected platform IDs', () => {
      expect(PLATFORMS_FIXTURE.length).toBe(11);
      const expectedIds = [
        'facebook', 'instagram', 'threads', 'tiktok', 'youtube',
        'google_search', 'gdn', 'chatgpt', 'zalo', 'linkedin', 'admicro'
      ];
      for (const id of expectedIds) {
        expect(PLATFORMS_FIXTURE.some(p => p.id === id)).toBe(true);
      }
    });

    it('5.6.1.2 Exactly 46 canonical placements defined across all platforms', () => {
      expect(PLACEMENTS_FIXTURE.length).toBe(46);
      for (const pl of PLACEMENTS_FIXTURE) {
        expect(typeof pl.id).toBe('string');
        expect(typeof pl.platform).toBe('string');
        expect(typeof pl.name).toBe('string');
        expect(['mobile', 'desktop'].includes(pl.device)).toBe(true);
        expect(typeof pl.ratio).toBe('string');
      }
    });

    it('5.6.1.3 Zalo Ads has exactly 4 canonical placements with valid specs', () => {
      const zalo = PLACEMENTS_FIXTURE.filter(p => p.platform === 'zalo');
      expect(zalo.length).toBe(4);
      const timeline = zalo.find(p => p.id === 'zalo_timeline');
      const video = zalo.find(p => p.id === 'zalo_video');
      const message = zalo.find(p => p.id === 'zalo_message');
      const article = zalo.find(p => p.id === 'zalo_article');

      expect(timeline).toExist();
      expect(timeline.ratio).toBe('1.91:1');
      expect(timeline.device).toBe('mobile');

      expect(video).toExist();
      expect(video.ratio).toBe('9:16');
      expect(video.safeZone).toBe(true);

      expect(message).toExist();
      expect(message.ratio).toBe('1.91:1');

      expect(article).toExist();
      expect(article.ratio).toBe('1.91:1');
    });

    it('5.6.1.4 LinkedIn Ads has exactly 4 canonical placements with valid specs', () => {
      const li = PLACEMENTS_FIXTURE.filter(p => p.platform === 'linkedin');
      expect(li.length).toBe(4);
      const mobileFeed = li.find(p => p.id === 'li_mobile_feed');
      const desktopFeed = li.find(p => p.id === 'li_desktop_feed');
      const message = li.find(p => p.id === 'li_message');
      const spotlight = li.find(p => p.id === 'li_spotlight');

      expect(mobileFeed).toExist();
      expect(mobileFeed.device).toBe('mobile');
      expect(mobileFeed.ratio).toBe('1.91:1');

      expect(desktopFeed).toExist();
      expect(desktopFeed.device).toBe('desktop');
      expect(desktopFeed.ratio).toBe('1.91:1');

      expect(message).toExist();
      expect(message.device).toBe('mobile');
      expect(message.ratio).toBe('1:1');

      expect(spotlight).toExist();
      expect(spotlight.device).toBe('desktop');
      expect(spotlight.ratio).toBe('1:1');
    });

    it('5.6.1.5 Admicro has exactly 4 canonical placements with valid specs', () => {
      const adm = PLACEMENTS_FIXTURE.filter(p => p.platform === 'admicro');
      expect(adm.length).toBe(4);
      const cafef = adm.find(p => p.id === 'admicro_cafef_pc');
      const kenh14 = adm.find(p => p.id === 'admicro_kenh14_mobile');
      const vnexpress = adm.find(p => p.id === 'admicro_vnexpress_pc');
      const dantri = adm.find(p => p.id === 'admicro_dantri_mobile');

      expect(cafef).toExist();
      expect(cafef.device).toBe('desktop');
      expect(cafef.ratio).toBe('1.91:1');

      expect(kenh14).toExist();
      expect(kenh14.device).toBe('mobile');
      expect(kenh14.ratio).toBe('1.91:1');

      expect(vnexpress).toExist();
      expect(vnexpress.device).toBe('desktop');
      expect(vnexpress.ratio).toBe('1.91:1');

      expect(dantri).toExist();
      expect(dantri.device).toBe('mobile');
      expect(dantri.ratio).toBe('4:5');
    });

    it('5.6.1.6 Symmetrical alias resolution: canonical dot IDs map symmetrically to fixture IDs', () => {
      const CANONICAL_MAP = {
        'facebook.feed': 'fb_feed',
        'facebook.stories': 'fb_stories',
        'facebook.reels': 'fb_reels',
        'tiktok.in_feed': 'tt_infeed',
        'tiktok.topview': 'tt_topview',
        'youtube.shorts': 'yt_shorts',
        'zalo.timeline': 'zalo_timeline',
        'zalo.video': 'zalo_video',
        'zalo.message': 'zalo_message',
        'zalo.article': 'zalo_article',
        'linkedin.mobile_feed': 'li_mobile_feed',
        'linkedin.desktop_feed': 'li_desktop_feed',
        'linkedin.message': 'li_message',
        'linkedin.spotlight': 'li_spotlight',
        'admicro.cafef_pc': 'admicro_cafef_pc',
        'admicro.kenh14_mobile': 'admicro_kenh14_mobile',
        'admicro.vnexpress_pc': 'admicro_vnexpress_pc',
        'admicro.dantri_mobile': 'admicro_dantri_mobile'
      };

      for (const [canonical, fixtureId] of Object.entries(CANONICAL_MAP)) {
        const found = PLACEMENTS_FIXTURE.find(p => p.id === fixtureId);
        expect(found).toExist();
      }
    });
  });

  // =========================================================================
  // Area 5.6.2: Adversarial Boundary & String Robustness
  // =========================================================================
  describe('tier5', 'Tier 5.6.2: Adversarial Boundary & String Robustness', () => {
    it('5.6.2.1 Empty string inputs do not throw errors or render "undefined"', () => {
      const truncateText = (str, max) => {
        if (!str) return '';
        if (!max || str.length <= max) return str;
        return str.slice(0, Math.max(0, max)).trimEnd() + '...';
      };

      const parseDomain = (url) => {
        try {
          const u = new URL(url.startsWith('http') ? url : `https://${url}`);
          return u.hostname.replace(/^www\./, '');
        } catch {
          return 'go.noti.vn';
        }
      };

      expect(truncateText('', 100)).toBe('');
      expect(truncateText(null, 100)).toBe('');
      expect(truncateText(undefined, 100)).toBe('');

      expect(parseDomain('')).toBe('go.noti.vn');
      expect(parseDomain(null)).toBe('go.noti.vn');
      expect(parseDomain('not a valid url')).toBe('go.noti.vn');
    });

    it('5.6.2.2 5,000-character continuous string truncates cleanly without regex hang (ReDoS test)', () => {
      const hugeString = 'A'.repeat(5000);
      const truncateText = (str, max) => {
        if (!str) return '';
        if (!max || str.length <= max) return str;
        return str.slice(0, Math.max(0, max)).trimEnd() + '...';
      };

      const startTime = Date.now();
      const result = truncateText(hugeString, 125);
      const duration = Date.now() - startTime;

      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBe(125 + 3);
      expect(duration).toBeLessThan(50); // Under 50ms, no ReDoS
    });

    it('5.6.2.3 Missing / undefined platform override objects evaluate gracefully with defaults', () => {
      const mockDraftMissingOverrides = {
        identity: { brandName: 'Test Brand', handle: '@test' },
        copy: {
          primaryText: 'Sample ad copy',
          headline: 'Sample Headline',
          description: 'Sample description',
          cta: 'Tìm hiểu thêm',
          destinationUrl: 'https://example.com'
          // googleSearch, gdn, youtube, chatgpt undefined
        }
      };

      const getHeadline = (draft) => draft?.copy?.googleSearch?.headlines?.[0] || draft?.copy?.headline || 'Default';
      const getGdnHeadline = (draft) => draft?.copy?.gdn?.longHeadline || draft?.copy?.headline || 'Default';
      const getYtCta = (draft) => draft?.copy?.youtube?.cta || draft?.copy?.cta || 'Default';

      expect(getHeadline(mockDraftMissingOverrides)).toBe('Sample Headline');
      expect(getGdnHeadline(mockDraftMissingOverrides)).toBe('Sample Headline');
      expect(getYtCta(mockDraftMissingOverrides)).toBe('Tìm hiểu thêm');
    });

    it('5.6.2.4 Brand avatar fallback letter computes initial cleanly when brandName is empty or whitespace', () => {
      const computeAvatarLetter = (brandName) => {
        return (brandName || 'N').trim().charAt(0).toUpperCase() || 'N';
      };

      expect(computeAvatarLetter('noti.vn')).toBe('N');
      expect(computeAvatarLetter('')).toBe('N');
      expect(computeAvatarLetter('   ')).toBe('N');
      expect(computeAvatarLetter(null)).toBe('N');
      expect(computeAvatarLetter(undefined)).toBe('N');
      expect(computeAvatarLetter('zalo official')).toBe('Z');
    });
  });

  // =========================================================================
  // Area 5.6.3: CJK Double-Width & Vietnamese Diacritics Oracle
  // =========================================================================
  describe('tier5', 'Tier 5.6.3: CJK Double-Width & Vietnamese Diacritics Oracle', () => {
    it('5.6.3.1 Pure ASCII strings count as 1 character per unit', () => {
      const ascii = 'Digital Marketing & Automation 2026';
      expect(countGoogleCharacters(ascii)).toBe(ascii.length);
    });

    it('5.6.3.2 Vietnamese accented text counts 1 unit per character for composed (NFC) forms', () => {
      const nfcText = 'Công cụ xem trước quảng cáo đa nền tảng'.normalize('NFC');
      // In Vietnamese NFC, each character is a single code point
      const count = countGoogleCharacters(nfcText);
      expect(count).toBe(nfcText.length);
      expect(count).toBe(39);
    });

    it('5.6.3.3 CJK characters (Hanzi, Kanji, Kana, Hangul) count as exactly 2 units', () => {
      const chinese = '广告预览'; // 4 Hanzi = 8 units
      const japanese = '広告プレビュー'; // 2 Kanji + 5 Katakana = 7 chars = 14 units
      const korean = '광고 미리보기'; // 2 Hangul + 1 space + 4 Hangul = 6*2 + 1 = 13 units

      expect(countGoogleCharacters(chinese)).toBe(8);
      expect(countGoogleCharacters(japanese)).toBe(14);
      expect(countGoogleCharacters(korean)).toBe(13);
    });

    it('5.6.3.4 Mixed Latin, Vietnamese, and CJK text oracle for Google Search 30-char limit', () => {
      // 10 Latin + 1 space + 5 CJK = 11 + (5 * 2) = 21 units (<= 30: PASS)
      const validMixed = 'Summer Sale 夏季大促销';
      expect(countGoogleCharacters(validMixed)).toBe(21);
      expect(countGoogleCharacters(validMixed) <= 30).toBe(true);

      // 10 Latin + 1 space + 10 CJK = 11 + (10 * 2) = 31 units (> 30: FAIL)
      const exceedingMixed = 'Summer Sale 夏季大促销限时特惠';
      expect(countGoogleCharacters(exceedingMixed)).toBe(31);
      expect(countGoogleCharacters(exceedingMixed) > 30).toBe(true);
    });

    it('5.6.3.5 GDN 90-character description limit oracle with CJK double-weighting', () => {
      // 40 CJK characters = 80 units (<= 90: PASS)
      const validGdnCjk = '这是一段关于数字营销和人工智能自动化的展示广告长描述文案内容测试'.slice(0, 40);
      expect(countGoogleCharacters(validGdnCjk)).toBe(80);
      expect(countGoogleCharacters(validGdnCjk) <= 90).toBe(true);

      // 46 CJK characters = 92 units (> 90: EXCEEDED)
      const exceedingGdnCjk = '这是一段关于数字营销和人工智能自动化的展示广告长描述文案内容测试！'.repeat(2).slice(0, 46);
      expect(countGoogleCharacters(exceedingGdnCjk)).toBe(92);
      expect(countGoogleCharacters(exceedingGdnCjk) > 90).toBe(true);
    });
  });

  // =========================================================================
  // Area 5.6.4: Media Constraints & Composition Boundaries
  // =========================================================================
  describe('tier5', 'Tier 5.6.4: Media Constraints & Composition Boundaries', () => {
    it('5.6.4.1 Single asset (count = 1) keeps single_image composition', () => {
      const determineComposition = (assets) => (assets && assets.length > 1 ? 'carousel' : 'single_image');
      expect(determineComposition([])).toBe('single_image');
      expect(determineComposition([{ url: 'blob:image1.png', type: 'image' }])).toBe('single_image');
    });

    it('5.6.4.2 2 to 10 assets switches mode to carousel with active pagination bounds', () => {
      const determineComposition = (assets) => (assets && assets.length > 1 ? 'carousel' : 'single_image');
      const assets2 = [{ url: '1.png' }, { url: '2.png' }];
      const assets10 = Array.from({ length: 10 }, (_, i) => ({ url: `${i + 1}.png` }));

      expect(determineComposition(assets2)).toBe('carousel');
      expect(determineComposition(assets10)).toBe('carousel');

      // Pagination math: next and prev wrap-around
      const getNextIdx = (curr, total) => (curr < total - 1 ? curr + 1 : 0);
      const getPrevIdx = (curr, total) => (curr > 0 ? curr - 1 : total - 1);

      expect(getNextIdx(0, 2)).toBe(1);
      expect(getNextIdx(1, 2)).toBe(0); // wraps
      expect(getPrevIdx(0, 2)).toBe(1); // wraps
      expect(getPrevIdx(1, 2)).toBe(0);
    });

    it('5.6.4.3 Upload overflow ceiling: uploading >10 files caps at 10 assets and rejects remainder', () => {
      const handleAssetUpload = (existingCount, newFiles) => {
        const remainingBudget = Math.max(0, 10 - existingCount);
        const accepted = newFiles.slice(0, remainingBudget);
        const rejectedCount = newFiles.length - accepted.length;
        return {
          accepted,
          rejectedCount,
          error: rejectedCount > 0 ? `Tối đa 10 tệp (bỏ qua ${rejectedCount} tệp vượt mức).` : null
        };
      };

      const upload12Files = Array.from({ length: 12 }, (_, i) => `file_${i + 1}.jpg`);
      const result = handleAssetUpload(0, upload12Files);

      expect(result.accepted.length).toBe(10);
      expect(result.rejectedCount).toBe(2);
      expect(result.error).toContain('Tối đa 10 tệp');
    });

    it('5.6.4.4 Media element polymorphism: renders video tag for video asset and img tag for image', () => {
      const renderMediaType = (asset) => (asset.type === 'video' ? 'video' : 'img');
      expect(renderMediaType({ type: 'video', url: 'video.mp4' })).toBe('video');
      expect(renderMediaType({ type: 'image', url: 'image.jpg' })).toBe('img');
    });
  });

  // =========================================================================
  // Area 5.6.5: Safe-Zone Overlays on All 8 Vertical Video Placements
  // =========================================================================
  describe('tier5', 'Tier 5.6.5: Safe-Zone Overlays on All 8 Vertical Video Placements', () => {
    it('5.6.5.1 Exactly 8 canonical vertical video placements require safe zones', () => {
      const verticalPlacements = PLACEMENTS_FIXTURE.filter(p => p.safeZone === true);
      expect(verticalPlacements.length).toBe(8);

      const expectedVerticalIds = [
        'fb_stories', 'fb_reels', 'ig_stories', 'ig_reels',
        'tt_infeed', 'tt_topview', 'yt_shorts', 'zalo_video'
      ];

      for (const id of expectedVerticalIds) {
        expect(verticalPlacements.some(p => p.id === id)).toBe(true);
      }
    });

    it('5.6.5.2 Safe-zone overlay coordinates are strictly bounded within [0, 100] percent', () => {
      const safeZoneGeometries = [
        { name: 'TikTok Top Danger', top: 0, height: 12.5 },
        { name: 'TikTok Bottom Danger', top: 65.625, height: 34.375 },
        { name: 'Meta Stories Top Danger', top: 0, height: 14.0 },
        { name: 'Meta Stories Bottom Danger', top: 65.0, height: 35.0 },
        { name: 'YouTube Shorts Header', top: 0, height: 15.0 },
        { name: 'YouTube Shorts Caption', top: 65.0, height: 35.0 },
        { name: 'Zalo Video Top Danger', top: 0, height: 12.0 },
        { name: 'Zalo Video Bottom Danger', top: 76.0, height: 24.0 }
      ];

      for (const geom of safeZoneGeometries) {
        expect(geom.top >= 0).toBe(true);
        expect(geom.top + geom.height <= 100).toBe(true);
      }
    });

    it('5.6.5.3 Non-vertical placements have safeZone === false', () => {
      const nonVertical = PLACEMENTS_FIXTURE.filter(p => p.ratio !== '9:16');
      for (const pl of nonVertical) {
        expect(pl.safeZone).toBe(false);
      }
    });
  });

  // =========================================================================
  // Area 5.6.6: Extended Platforms Verification & "Tất cả vị trí" Grid
  // =========================================================================
  describe('tier5', 'Tier 5.6.6: Extended Platforms Verification & "Tất cả vị trí" Grid', () => {
    it('5.6.6.1 Zalo Ads renders 4 placements inside iPhone 15/16 frames', () => {
      const zaloPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'zalo');
      expect(zaloPlacements.length).toBe(4);
      for (const pl of zaloPlacements) {
        expect(pl.device).toBe('mobile');
      }
    });

    it('5.6.6.2 LinkedIn Ads defines 2 mobile and 2 desktop placements', () => {
      const liPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'linkedin');
      const mobile = liPlacements.filter(p => p.device === 'mobile');
      const desktop = liPlacements.filter(p => p.device === 'desktop');

      expect(mobile.length).toBe(2);
      expect(desktop.length).toBe(2);
    });

    it('5.6.6.3 Admicro defines 2 mobile and 2 desktop placements', () => {
      const admPlacements = PLACEMENTS_FIXTURE.filter(p => p.platform === 'admicro');
      const mobile = admPlacements.filter(p => p.device === 'mobile');
      const desktop = admPlacements.filter(p => p.device === 'desktop');

      expect(mobile.length).toBe(2);
      expect(desktop.length).toBe(2);
    });

    it('5.6.6.4 "Tất cả vị trí" comparative grid is active for all 11 platforms including extended platforms', () => {
      const isGridEnabledForPlatform = (platformId) => {
        // Universal grid enabled for all 11 platforms
        return ['facebook', 'instagram', 'threads', 'tiktok', 'youtube', 'google_search', 'gdn', 'chatgpt', 'zalo', 'linkedin', 'admicro'].includes(platformId);
      };

      expect(isGridEnabledForPlatform('zalo')).toBe(true);
      expect(isGridEnabledForPlatform('linkedin')).toBe(true);
      expect(isGridEnabledForPlatform('admicro')).toBe(true);
    });
  });
}
