import { describe, expect, it } from 'vitest'
import { AD_PROFILES, PLATFORM_GROUPS, SOURCE_REGISTRY, resolveProfile } from './index'

describe('catalog coverage', () => {
  it('contains eleven platform groups and the 46 canonical profiles', () => {
    expect(PLATFORM_GROUPS).toHaveLength(11)
    expect(AD_PROFILES).toHaveLength(46)
    expect(
      AD_PROFILES.filter(
        (profile) =>
          profile.groupId !== 'zalo' &&
          profile.groupId !== 'linkedin' &&
          profile.groupId !== 'admicro' &&
          profile.sourceRefs.includes('E01'),
      ),
    ).toHaveLength(34)
    expect(resolveProfile('tiktok.in_feed')?.sourceRefs).toEqual(['E01', 'E07'])
    expect(resolveProfile('tiktok.in_feed.standard_carousel')?.sourceRefs).toEqual(['E01', 'E07'])
    expect(resolveProfile('linkedin.feed.mobile')?.sourceRefs).toEqual(['E19'])
  })

  it('standardizes exactly 12 canonical placements across Zalo, LinkedIn, and Admicro with bidirectional alias resolution', () => {
    const zaloProfiles = AD_PROFILES.filter((p) => p.groupId === 'zalo')
    const linkedinProfiles = AD_PROFILES.filter((p) => p.groupId === 'linkedin')
    const admicroProfiles = AD_PROFILES.filter((p) => p.groupId === 'admicro')

    expect(zaloProfiles).toHaveLength(4)
    expect(linkedinProfiles).toHaveLength(4)
    expect(admicroProfiles).toHaveLength(4)

    // Zalo canonical placements and labels
    expect(resolveProfile('zalo.timeline')?.placement).toBe('Nhật ký Zalo')
    expect(resolveProfile('zalo.video')?.placement).toBe('Zalo Video')
    expect(resolveProfile('zalo.message')?.placement).toBe('Tin nhắn OA')
    expect(resolveProfile('zalo.article')?.placement).toBe('Báo mới / Khám phá')

    // Zalo underscore aliases
    expect(resolveProfile('zalo_timeline')?.id).toBe('zalo.timeline')
    expect(resolveProfile('zalo_video')?.id).toBe('zalo.video')
    expect(resolveProfile('zalo_message')?.id).toBe('zalo.message')
    expect(resolveProfile('zalo_article')?.id).toBe('zalo.article')

    // LinkedIn canonical placements and labels
    expect(resolveProfile('linkedin.mobile_feed')?.placement).toBe('Bảng tin Di động')
    expect(resolveProfile('linkedin.desktop_feed')?.placement).toBe('Bảng tin Máy tính')
    expect(resolveProfile('linkedin.message')?.placement).toBe('Tin nhắn tài trợ')
    expect(resolveProfile('linkedin.spotlight')?.placement).toBe('Cột phải Spotlight')

    // LinkedIn underscore aliases
    expect(resolveProfile('li_mobile_feed')?.id).toBe('linkedin.mobile_feed')
    expect(resolveProfile('li_desktop_feed')?.id).toBe('linkedin.desktop_feed')
    expect(resolveProfile('li_message')?.id).toBe('linkedin.message')
    expect(resolveProfile('li_spotlight')?.id).toBe('linkedin.spotlight')

    // Admicro canonical placements and labels
    expect(resolveProfile('admicro.cafef_pc')?.placement).toBe('CafeF (PC)')
    expect(resolveProfile('admicro.kenh14_mobile')?.placement).toBe('Kenh14 (Mobile)')
    expect(resolveProfile('admicro.vnexpress_pc')?.placement).toBe('VnExpress (Masthead PC)')
    expect(resolveProfile('admicro.dantri_mobile')?.placement).toBe('Dân trí (In-Page Mobile)')

    // Admicro underscore aliases
    expect(resolveProfile('admicro_cafef_pc')?.id).toBe('admicro.cafef_pc')
    expect(resolveProfile('admicro_kenh14_mobile')?.id).toBe('admicro.kenh14_mobile')
    expect(resolveProfile('admicro_vnexpress_pc')?.id).toBe('admicro.vnexpress_pc')
    expect(resolveProfile('admicro_dantri_mobile')?.id).toBe('admicro.dantri_mobile')
  })

  it('standardizes exactly 34 canonical placements across 8 original platform groups with authentic Vietnamese labels', () => {
    const original8Profiles = AD_PROFILES.filter(
      (profile) =>
        profile.groupId !== 'zalo' &&
        profile.groupId !== 'linkedin' &&
        profile.groupId !== 'admicro',
    )
    expect(original8Profiles).toHaveLength(34)

    const expectedDistribution: Record<string, number> = {
      facebook: 10,
      instagram: 3,
      threads: 1,
      tiktok: 2,
      youtube: 6,
      'google-search': 2,
      'google-display': 8,
      chatgpt: 2,
    }
    for (const [groupId, count] of Object.entries(expectedDistribution)) {
      expect(
        original8Profiles.filter((p) => p.groupId === groupId),
        `Group ${groupId} count`,
      ).toHaveLength(count)
    }

    const expectedLabels: Record<string, string> = {
      'facebook.feed': 'Bảng feed',
      'facebook.video_feeds': 'Video Feeds',
      'facebook.stories': 'Stories',
      'facebook.reels': 'Reels',
      'facebook.reels_banner': 'Banner trên Reels',
      'facebook.in_stream': 'Video trong luồng',
      'facebook.marketplace': 'Marketplace',
      'facebook.search_results': 'Kết quả tìm kiếm',
      'facebook.right_column': 'Cột bên phải',
      'facebook.audience_network': 'Audience Network',
      'instagram.feed': 'Bảng feed',
      'instagram.stories': 'Stories',
      'instagram.reels': 'Reels',
      'threads.feed': 'Bảng feed',
      'tiktok.in_feed': 'In-Feed',
      'tiktok.topview': 'TopView',
      'youtube.skippable_in_stream': 'Trong luồng (bỏ qua được)',
      'youtube.non_skippable_in_stream': 'Trong luồng (không bỏ qua)',
      'youtube.bumper': 'Bumper 6 giây',
      'youtube.desktop_in_stream': 'Trong luồng (máy tính)',
      'youtube.in_feed': 'Trong nguồn cấp',
      'youtube.shorts': 'Shorts',
      'google.search.mobile': 'Di động',
      'google.search.desktop': 'Máy tính',
      'google.display.300x250': 'Hình chữ nhật 300x250',
      'google.display.336x280': 'Hình chữ nhật lớn 336x280',
      'google.display.728x90': 'Leaderboard 728x90',
      'google.display.300x600': 'Nửa trang 300x600',
      'google.display.160x600': 'Skyscraper 160x600',
      'google.display.320x100': 'Biểu ngữ di động 320x100',
      'google.display.320x50': 'Biểu ngữ di động 320x50',
      'google.display.native_in_article': 'Native trong bài viết',
      'chatgpt.chat_card.web': 'Web',
      'chatgpt.chat_card.mobile': 'Ứng dụng di động',
    }

    for (const [id, placement] of Object.entries(expectedLabels)) {
      expect(resolveProfile(id)?.placement, `Placement label for ${id}`).toBe(placement)
    }

    const tiktokInFeed = resolveProfile('tiktok.in_feed')
    expect(tiktokInFeed?.allowedCompositions).toContain('single_video')
    expect(tiktokInFeed?.allowedCompositions).toContain('carousel')
    expect(tiktokInFeed?.allowedCompositions).toContain('single_image')
  })

  it('keeps source evidence and version on every profile', () => {
    expect(Object.keys(SOURCE_REGISTRY)).toEqual(
      Array.from({ length: 19 }, (_, index) => `E${String(index + 1).padStart(2, '0')}`),
    )
    for (const source of Object.values(SOURCE_REGISTRY)) {
      expect(source).toMatchObject({
        id: expect.any(String),
        checkedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        authority: expect.any(String),
        evidence: expect.any(String),
      })
      expect(new URL(source.url).protocol).toBe('https:')
    }
    for (const profile of AD_PROFILES) {
      for (const rule of profile.rules) {
        expect(rule.sourceRefs.length, `${profile.id}/${rule.ruleId}: source missing`).toBeGreaterThan(0)
        for (const id of rule.sourceRefs) expect(SOURCE_REGISTRY[id], `${profile.id}/${rule.ruleId}: ${id}`).toBeDefined()
        expect(rule.evidence).toBeTruthy()
        expect(rule.confidence ?? profile.confidence).toBeTruthy()
      }
    }
    expect(
      AD_PROFILES.every(
        (profile) =>
          profile.specVersion &&
          profile.checkedAt &&
          profile.sources.length === profile.sourceRefs.length,
      ),
    ).toBe(true)
    expect(resolveProfile('zalo.video.safe_zone')?.evidence).toBe('conflict')
    expect(SOURCE_REGISTRY.E06.evidence).toBe('conflict')
  })

  it('keeps product and composition separate for Zalo Form and Display', () => {
    expect(resolveProfile('zalo.form')).toMatchObject({
      product: 'form',
      allowedCompositions: ['single_image'],
    })
    expect(resolveProfile('zalo.display.medium_rectangle')).toMatchObject({
      product: 'display',
      allowedCompositions: ['single_image'],
    })
  })
})
