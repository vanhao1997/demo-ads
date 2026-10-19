export type BrandAsset = {
  id: `brand.${string}`
  label: string
  file: string
  sourceRefIds: string[]
  sourceUrl: string
  licenseNote: string
  trademarkStatus: 'review_required' | 'approved_for_internal' | 'restricted'
  variants: 'monochrome' | 'color' | 'inverse'
  viewBox: string
  sha256: string
  altText: string
  checkedAt: string
}

const SIMPLE_ICONS_VERSION = '15.15.0'
const SIMPLE_ICONS_LICENSE_NOTE =
  'Simple Icons SVG from pinned npm package simple-icons@15.15.0, CC0-1.0 icon license. Platform trademarks still require internal review; E18 is inventory reference only, not asset approval.'

const simpleIconUrl = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@${SIMPLE_ICONS_VERSION}/icons/${slug}.svg`

export const BRAND_ASSETS = [
  {
    id: 'brand.facebook',
    label: 'Facebook',
    file: 'facebook.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('facebook'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: '3db0e4212c33c9814d6f142d970b184a62d01ddaf6e022fe7155adfc28d0958c',
    altText: 'Facebook logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.instagram',
    label: 'Instagram',
    file: 'instagram.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('instagram'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: '0c0278d337cc5c00b0f4dd0692f968df10d560f07459e3747dd25f706c2487ba',
    altText: 'Instagram logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.threads',
    label: 'Threads',
    file: 'threads.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('threads'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: '8c856088aa1f0893f8138defe58f4311a1b7d0072b1fc68e35c65371d194e534',
    altText: 'Threads logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.tiktok',
    label: 'TikTok',
    file: 'tiktok.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('tiktok'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: '196bcf4e6be296e0c962db51006b53d9fa42a9eacc09d759b081143f64184baf',
    altText: 'TikTok logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.youtube',
    label: 'YouTube',
    file: 'youtube.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('youtube'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: '657a3e6914e78bedd62e2f80a19dbd872652f1945f9f2337bdcb6c5bfd0ae6e2',
    altText: 'YouTube logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.google',
    label: 'Google',
    file: 'google.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('google'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: 'c397d8fcbbf6645c76d24c1364db780bbbf9a56fefd483eb687a88ba1de85edf',
    altText: 'Google logo',
    checkedAt: '2026-10-13',
  },
  {
    id: 'brand.zalo',
    label: 'Zalo',
    file: 'zalo.svg',
    sourceRefIds: ['E18'],
    sourceUrl: simpleIconUrl('zalo'),
    licenseNote: SIMPLE_ICONS_LICENSE_NOTE,
    trademarkStatus: 'review_required',
    variants: 'monochrome',
    viewBox: '0 0 24 24',
    sha256: 'b1a098181dd96e7498b8b9e6bbf8e7b6de3158b716c804f4408a1bc417d026d6',
    altText: 'Zalo logo',
    checkedAt: '2026-10-13',
  },
] as const satisfies readonly BrandAsset[]

export type BrandAssetId = (typeof BRAND_ASSETS)[number]['id']
export const BRAND_ASSET_BY_ID = Object.fromEntries(
  BRAND_ASSETS.map((asset) => [asset.id, asset]),
) as Record<BrandAssetId, (typeof BRAND_ASSETS)[number]>
