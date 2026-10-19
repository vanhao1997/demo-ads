import { occlusionRegions, type PreviewLocale } from './previewPresentation'
import './occlusion.css'

export function OcclusionOverlay({
  profileId,
  captionMask,
  locale,
}: {
  profileId: string
  captionMask: boolean
  locale: PreviewLocale
}) {
  const regions = occlusionRegions(profileId, captionMask)
  if (!regions.length) return null
  return (
    <div
      className="occlusion-overlay"
      data-occlusion-confidence="estimated"
      aria-label={locale === 'vi' ? 'Vùng che ước lượng' : 'Estimated occlusion'}
    >
      {regions.map((r) => (
        <div
          key={r.id}
          className={`occlusion-region occlusion-${r.kind}`}
          data-occlusion-region={r.id}
          style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}
        >
          {r.id === 'header' && <span>{locale === 'vi' ? 'Thanh ứng dụng' : 'App header'}</span>}
          {r.id === 'caption-cta' && (
            <span>{locale === 'vi' ? 'Chú thích / CTA' : 'Caption / CTA'}</span>
          )}
          {r.id === 'actions' && (
            <span>{locale === 'vi' ? 'Cột tương tác' : 'Actions rail'}</span>
          )}
          {r.kind === 'caption' && <span>{locale === 'vi' ? 'Caption dài' : 'Long caption'}</span>}
        </div>
      ))}
      <span className="occlusion-estimate">
        {locale === 'vi' ? 'Vùng che ước lượng' : 'Estimated occlusion'}
      </span>
    </div>
  )
}
