import type { CSSProperties } from 'react'
import type { PlatformGroupId } from '../domain'
import facebookSvg from '../assets/brands/facebook.svg?raw'
import googleSvg from '../assets/brands/google.svg?raw'
import instagramSvg from '../assets/brands/instagram.svg?raw'
import threadsSvg from '../assets/brands/threads.svg?raw'
import tiktokSvg from '../assets/brands/tiktok.svg?raw'
import youtubeSvg from '../assets/brands/youtube.svg?raw'
import zaloSvg from '../assets/brands/zalo.svg?raw'
import { BRAND_ASSET_BY_ID } from '../assets/brands/manifest'
import type { BrandAssetId } from '../assets/brands/manifest'

type PlatformLogoAsset = {
  assetId: BrandAssetId
  svg: string
}

export type PlatformLogoProps = {
  groupId: PlatformGroupId | string
  label?: string
  size?: number
  className?: string
}

export const PLATFORM_BRAND_ASSET_IDS = {
  facebook: 'brand.facebook',
  instagram: 'brand.instagram',
  threads: 'brand.threads',
  tiktok: 'brand.tiktok',
  youtube: 'brand.youtube',
  'google-search': 'brand.google',
  'google-display': 'brand.google',
  zalo: 'brand.zalo',
} as const satisfies Partial<Record<PlatformGroupId, BrandAssetId>>

const SVG_BY_ASSET_ID: Record<BrandAssetId, string> = {
  'brand.facebook': facebookSvg,
  'brand.instagram': instagramSvg,
  'brand.threads': threadsSvg,
  'brand.tiktok': tiktokSvg,
  'brand.youtube': youtubeSvg,
  'brand.google': googleSvg,
  'brand.zalo': zaloSvg,
}

const FALLBACK_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  linkedin: 'LinkedIn',
  admicro: 'Admicro',
}

export const CUSTOM_PLATFORM_SVGS: Record<string, string> = {
  chatgpt: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654 2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  admicro: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2L2 20h4.2l2.1-4h7.4l2.1 4H22L12 2zm-1.9 10.5L12 8.7l1.9 3.8h-3.8z"/><circle cx="19" cy="5" r="2.5"/></svg>`,
}

const unsafeSvgPattern = /<script\b|\son[a-z]+\s*=|\b(?:href|xlink:href)\s*=|<image\b|<foreignObject\b/i

function sanitizeSvg(svg: string): string | undefined {
  if (unsafeSvgPattern.test(svg)) return undefined
  return svg
    .replace(/<title>.*?<\/title>/gis, '')
    .replace(/\srole="[^"]*"/i, '')
    .replace(
      '<svg ',
      '<svg aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor" ',
    )
}

export function brandAssetForPlatform(groupId: string): PlatformLogoAsset | undefined {
  const assetId = PLATFORM_BRAND_ASSET_IDS[groupId as keyof typeof PLATFORM_BRAND_ASSET_IDS]
  if (assetId) {
    return { assetId, svg: SVG_BY_ASSET_ID[assetId] }
  }
  if (CUSTOM_PLATFORM_SVGS[groupId]) {
    return {
      assetId: `brand.${groupId}` as unknown as BrandAssetId,
      svg: CUSTOM_PLATFORM_SVGS[groupId],
    }
  }
  return undefined
}

export function platformLogoLabel(groupId: string, label?: string): string {
  const asset = brandAssetForPlatform(groupId)
  if (asset && asset.assetId in BRAND_ASSET_BY_ID) return label ?? BRAND_ASSET_BY_ID[asset.assetId].label
  return label ?? FALLBACK_LABELS[groupId] ?? groupId
}

export function PlatformLogo({ groupId, label, size = 20, className }: PlatformLogoProps) {
  const asset = brandAssetForPlatform(groupId)
  const accessibleLabel = platformLogoLabel(groupId, label)
  const safeSvg = asset ? sanitizeSvg(asset.svg) : undefined
  const style = {
    '--platform-logo-size': `${size}px`,
    alignItems: 'center',
    display: 'inline-flex',
    fontSize: `${size}px`,
    height: `${size}px`,
    justifyContent: 'center',
    lineHeight: 1,
    width: `${size}px`,
  } as CSSProperties

  if (!asset || !safeSvg) {
    return (
      <span
        aria-label={accessibleLabel}
        className={['platform-logo', 'platform-logo--fallback', `platform-logo-${groupId}`, className].filter(Boolean).join(' ')}
        data-asset-status="unavailable"
        data-platform={groupId}
        role="img"
        style={style}
        title={`${accessibleLabel} asset unavailable`}
      >
        {groupId === 'linkedin' ? 'in' : accessibleLabel.slice(0, 2)}
      </span>
    )
  }

  return (
    <span
      aria-label={accessibleLabel}
      className={['platform-logo', `platform-logo-${groupId}`, className].filter(Boolean).join(' ')}
      data-asset-id={asset.assetId}
      data-asset-status="available"
      data-platform={groupId}
      role="img"
      style={style}
      dangerouslySetInnerHTML={{ __html: safeSvg }}
    />
  )
}
