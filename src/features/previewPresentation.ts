export type PreviewLocale = 'vi' | 'en'
export type PreviewPresentation = {
  locale: PreviewLocale
  appChrome: boolean
  captionMask: boolean
  topViewPhase: 'intro' | 'feed'
}

export const DEFAULT_PRESENTATION: PreviewPresentation = {
  locale: 'vi',
  appChrome: true,
  captionMask: true,
  topViewPhase: 'feed',
}

export function capturePresentation(element: HTMLElement | null): Partial<PreviewPresentation> {
  const node = element?.querySelector<HTMLElement>('[data-preview-locale]')
  if (!node) return {}
  const { previewLocale, appChrome, captionMask, topviewPhase } = node.dataset
  return {
    locale: previewLocale === 'en' ? 'en' : 'vi',
    appChrome: appChrome !== 'false',
    captionMask: captionMask !== 'false',
    topViewPhase: topviewPhase === 'intro' ? 'intro' : 'feed',
  }
}

import { translateCta } from './translations'

export function presentationCta(value: string, locale: PreviewLocale) {
  return translateCta(value, locale)
}

export type OcclusionRegion = {
  id: string
  x: number
  y: number
  width: number
  height: number
  kind: 'always' | 'caption'
}

const region = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  kind: OcclusionRegion['kind'] = 'always',
): OcclusionRegion => ({ id, x, y, width, height, kind })

// Normalized reference geometry, not an official guarantee for every app/CTA.
export function occlusionRegions(profileId: string, captionMask = true): OcclusionRegion[] {
  if (profileId.startsWith('tiktok.') || profileId.startsWith('tt_')) {
    const regions = [
      region('header', 0, 0, 100, 12.5),
      region('caption-cta', 0, 65.625, 100, 34.375),
      region('left-edge', 0, 12.5, 11.111, 53.125),
      region('right-edge', 88.889, 12.5, 11.111, 53.125),
      region('actions', 72.222, 43.75, 16.667, 21.875),
    ]
    if (captionMask) regions.push(region('long-caption', 11.111, 55, 61.111, 10.625, 'caption'))
    return regions
  }
  if (profileId === 'youtube.shorts' || profileId === 'yt_shorts')
    return [
      region('header', 0, 0, 100, 15),
      region('caption-cta', 0, 65, 100, 35),
      region('left-edge', 0, 15, 4.444, 50),
      region('actions', 82.222, 15, 17.778, 50),
    ]
  if (/\.(stories|reels)$/.test(profileId) || /^(fb|ig)_(stories|reels)$/.test(profileId)) {
    const regions = [
      region('header', 0, 0, 100, 14),
      region('caption-cta', 0, 65, 100, 35),
      region('left-edge', 0, 14, 6, 51),
      region('right-edge', 94, 14, 6, 51),
    ]
    if (profileId.endsWith('.reels') || profileId.endsWith('_reels')) {
      regions.push(region('actions', 84, 42, 16, 23))
    }
    return regions
  }
  if (
    profileId === 'zalo.video.safe_zone' ||
    profileId === 'zalo.video' ||
    profileId === 'zalo_video'
  )
    return [region('header', 0, 0, 100, 12), region('caption-cta', 0, 76, 100, 24)]
  return []
}

