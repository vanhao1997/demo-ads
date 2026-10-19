import { useState, type CSSProperties } from 'react'
import {
  ADMICRO_ENTRIES,
  ADMICRO_PACKAGES,
  ADMICRO_PUBLISHERS,
  ADMICRO_SLOTS,
  ADMICRO_SNAPSHOT,
  resolveAdmicroEntry,
  resolveAdmicroSlots,
} from '../catalog'
import type { SlotSpec } from '../domain'
import { resolvedCopy, type EditorDraft } from './editorModel'
import {
  publisherBinding,
  publisherDraftForTarget,
  publisherTarget,
  updatePublisherBinding,
} from './publisherModel'
import type { PublisherDraft } from './publisherModel'
import {
  publisherNewsContext,
  publisherSlotLayout,
  type PublisherPlacement,
  type PublisherSlotLayout,
} from './publisherLayoutModel'
import type { UiCheck } from './uiTypes'
import './publisher.css'

const slotSourceCheck = (slot: SlotSpec): UiCheck => {
  const entry = resolveAdmicroEntry(slot.catalogEntryId)
  return {
    id: `admicro.source.${slot.id}`,
    field: `publisher.bindings.${slot.id}`,
    status: 'unknown',
    message: `${slot.label}: nguồn snapshot Admicro, chưa xác minh thông số hiện hành.`,
    actual: `Sheet ${ADMICRO_SNAPSHOT.sheetName} / dòng ${entry?.rawRowNumber ?? '?'} / ${entry?.dimensionsText ?? 'Chưa có kích thước'}`,
    expected: 'Đối chiếu publisher; ngày nguồn 2026 / 2025 / 2022 xung đột.',
    sourceRefs: ['E17'],
    evidence: slot.evidence,
    notes: entry?.conflictNotes.join(' '),
  }
}

export function PublisherPicker({
  selection,
  onSelect,
}: {
  selection: PublisherDraft
  onSelect: (targetId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [device, setDevice] = useState('')
  const [kind, setKind] = useState('')
  const options = [
    ...ADMICRO_PACKAGES.filter((item) => item.publisherId === selection.publisherId).map(
      (item) => ({
        id: item.id,
        label: `Gói · ${item.label}`,
        device: resolveAdmicroSlots({ packageId: item.id })[0]?.device,
        kind: 'package',
        dimensions: resolveAdmicroSlots({ packageId: item.id })
          .map((slot) => `${slot.width ?? '?'}x${slot.height ?? '?'}`)
          .join(' '),
      }),
    ),
    ...ADMICRO_SLOTS.filter(
      (slot) =>
        slot.publisherId === selection.publisherId &&
        ADMICRO_ENTRIES.some((entry) => entry.id === slot.catalogEntryId && !entry.packageId),
    ).map((slot) => ({
      id: slot.id,
      label: `${slot.label} · ${slot.width ?? '?'}x${slot.height ?? '?'} · ${slot.device}`,
      device: slot.device,
      kind: 'slot',
      dimensions: `${slot.width ?? '?'}x${slot.height ?? '?'}`,
    })),
  ].filter(
    (item) =>
      (!device || item.device === device || item.device === 'all') &&
      (!kind || item.kind === kind) &&
      `${item.label} ${item.dimensions}`.toLowerCase().includes(query.toLowerCase()),
  )
  const selected = options.some((item) => item.id === publisherTarget(selection))
  const selectPublisher = (publisherId: string) => {
    const next =
      ADMICRO_PACKAGES.find((item) => item.publisherId === publisherId) ??
      ADMICRO_SLOTS.find((item) => item.publisherId === publisherId)
    if (next) onSelect(next.id)
  }

  return (
    <section className="publisher-picker" aria-label="Chọn publisher và slot Admicro">
      <div className="publisher-quick-pills" aria-label="Chọn nhanh báo điện tử Admicro">
        {ADMICRO_PUBLISHERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === selection.publisherId ? 'active' : ''}
            onClick={() => selectPublisher(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label>
        Publisher
        <select
          aria-label="Publisher Admicro"
          value={selection.publisherId}
          onChange={(event) => selectPublisher(event.target.value)}
        >
          {ADMICRO_PUBLISHERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tìm slot / kích thước
        <input
          aria-label="Tìm slot Admicro"
          placeholder="Billboard, 300x600..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label>
        Thiết bị
        <select
          aria-label="Thiết bị Admicro"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
        </select>
      </label>
      <label>
        Loại
        <select
          aria-label="Loại target Admicro"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
        >
          <option value="">Slot và package</option>
          <option value="slot">Slot</option>
          <option value="package">Package</option>
        </select>
      </label>
      <label className="publisher-target-select">
        Slot / package
        <select
          aria-label="Slot hoặc package Admicro"
          value={selected ? publisherTarget(selection) : ''}
          onChange={(event) => {
            if (event.target.value) onSelect(event.target.value)
          }}
        >
          {!selected && <option value="">Chọn trong {options.length} kết quả</option>}
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <small>
        {options.length} kết quả · snapshot {ADMICRO_SNAPSHOT.snapshotDate} · chưa xác minh
        inventory hiện hành
      </small>
    </section>
  )
}

export function PublisherBindings({
  draft,
  onChange,
  onUpload,
  onSource,
}: {
  draft: EditorDraft
  onChange: (publisher: PublisherDraft) => void
  onUpload: () => void
  onSource: (check: UiCheck, trigger: HTMLElement) => void
}) {
  const selection = draft.publisher
  if (!selection) return null
  const slots = resolveAdmicroSlots(selection)
  const assets = draft.assets.filter((asset) => asset.role === 'creative' && asset.kind !== 'audio')
  return (
    <section className="publisher-bindings" aria-label="Gán asset từng slot">
      <div className="publisher-binding-heading">
        <h3>
          Asset theo slot <span>{slots.length} slot</span>
        </h3>
        <button className="text-button" onClick={onUpload}>
          + Thêm media local
        </button>
      </div>
      <p>Mỗi slot giữ asset, crop và focal point riêng. Trang báo và vị trí là mô phỏng.</p>
      {slots.map((slot) => {
        const binding = publisherBinding(selection, slot.id)
        const entry = resolveAdmicroEntry(slot.catalogEntryId)
        const layout = publisherSlotLayout(slot)
        const update = (change: Parameters<typeof updatePublisherBinding>[2]) =>
          onChange(updatePublisherBinding(selection, slot.id, change))
        return (
          <div className="publisher-binding" key={slot.id}>
            <h4>{slot.label}</h4>
            <small>
              {slot.width ?? '?'} × {slot.height ?? '?'} · {slot.device} · nguồn xung đột
            </small>
            <small>
              {layout.placementLabel} ·{' '}
              {layout.basis === 'format_reference'
                ? 'Theo mô tả format; trang ước lượng'
                : 'Ước lượng / chưa đối chiếu demo'}
            </small>
            <label htmlFor={`binding-${slot.id}`}>Asset cho {slot.label}</label>
            <select
              id={`binding-${slot.id}`}
              value={binding?.assetId ?? ''}
              onChange={(event) => update({ assetId: event.target.value || undefined })}
            >
              <option value="">Chưa gán asset</option>
              {binding?.assetId && !assets.some((item) => item.id === binding.assetId) && (
                <option value={binding.assetId}>Asset thiếu sau import — chọn lại</option>
              )}
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} · {asset.kind} · {asset.width}x{asset.height}
                </option>
              ))}
            </select>
            <label>
              Crop
              <select
                aria-label={`Crop ${slot.id}`}
                value={binding?.fit ?? 'contain'}
                onChange={(event) => update({ fit: event.target.value as 'contain' | 'cover' })}
              >
                <option value="contain">Giữ toàn bộ media</option>
                <option value="cover">Lấp đầy khung</option>
              </select>
            </label>
            {(['x', 'y'] as const).map((axis) => (
              <label key={axis}>
                {axis === 'x' ? 'Focal ngang' : 'Focal dọc'} ·{' '}
                {Math.round((binding?.focalPoint?.[axis] ?? 0.5) * 100)}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  aria-label={`Focal ${axis} ${slot.id}`}
                  disabled={binding?.fit !== 'cover'}
                  value={(binding?.focalPoint?.[axis] ?? 0.5) * 100}
                  onChange={(event) =>
                    update({
                      focalPoint: {
                        x: binding?.focalPoint?.x ?? 0.5,
                        y: binding?.focalPoint?.y ?? 0.5,
                        [axis]: Number(event.target.value) / 100,
                      },
                    })
                  }
                />
              </label>
            ))}
            <button
              className="text-button"
              onClick={(event) => onSource(slotSourceCheck(slot), event.currentTarget)}
            >
              Nguồn slot ↗
            </button>
            <details>
              <summary>Dòng nguồn {entry?.rawRowNumber}</summary>
              <p>{entry?.dimensionsText ?? 'Kích thước chưa có trong nguồn'}</p>
              <p>{layout.explanation}</p>
              <p>{entry?.conflictNotes.join(' ')}</p>
              <small>
                Sheet {ADMICRO_SNAPSHOT.sheetName} · {ADMICRO_SNAPSHOT.snapshotId}
              </small>
              {entry?.demoUrl && (
                <a href={entry.demoUrl} target="_blank" rel="noreferrer">
                  Demo từ nguồn ↗
                </a>
              )}
              {layout.referenceUrl && (
                <a href={layout.referenceUrl} target="_blank" rel="noreferrer">
                  Mô tả format Admicro ↗
                </a>
              )}
            </details>
          </div>
        )
      })}
    </section>
  )
}

function PublisherSlot({
  draft,
  selection,
  layout,
  fallbackCreative = false,
}: {
  draft: EditorDraft
  selection: PublisherDraft
  layout: PublisherSlotLayout
  fallbackCreative?: boolean
}) {
  const { slot } = layout
  const binding = publisherBinding(selection, slot.id)
  const boundAsset = draft.assets.find((item) => item.id === binding?.assetId)
  const fallbackAsset = fallbackCreative
    ? draft.assets.find((item) => item.role === 'creative' && item.kind !== 'audio')
    : undefined
  const asset = boundAsset ?? fallbackAsset
  const source = resolveAdmicroEntry(slot.catalogEntryId)
  const fit = binding?.fit ?? 'cover'
  const ratio =
    slot.width && slot.height
      ? slot.width / slot.height
      : slot.ratio
        ? slot.ratio.w / slot.ratio.h
        : 4
  const style = {
    objectFit: binding?.fit ?? 'contain',
    objectPosition: `${(binding?.focalPoint?.x ?? 0.5) * 100}% ${(binding?.focalPoint?.y ?? 0.5) * 100}%`,
  }
  const copy = resolvedCopy(draft, slot.id)
  const brandName = copy.brandName || 'P2P Digital'
  const headline = copy.headline || 'Giải pháp Tăng trưởng & Tự động hóa Tiếp thị'
  const cta = copy.cta || 'Tìm hiểu thêm'

  return (
    <section
      className={`publisher-slot publisher-slot-${layout.placement}`}
      data-slot-id={slot.id}
      data-slot-placement={layout.placement}
      data-placement-basis={layout.basis}
      aria-label={`Preview slot ${slot.label}`}
    >
      <div className="publisher-slot-label">
        <span>Quảng cáo Admicro</span>
        <strong>{slot.label}</strong>
        <span>
          {slot.width ?? '?'}×{slot.height ?? '?'}
        </span>
      </div>
      <div className="publisher-slot-canvas" style={{ aspectRatio: ratio }}>
        {asset?.kind === 'image' ? (
          <img
            src={asset.url}
            alt={`${slot.label}: ${asset.name}`}
            style={boundAsset ? style : { objectFit: fit }}
          />
        ) : asset?.kind === 'video' ? (
          <video
            src={asset.url}
            controls
            muted
            preload="metadata"
            style={boundAsset ? style : { objectFit: fit }}
            aria-label={`Video ${slot.label}`}
          />
        ) : (
          <div className="publisher-slot-empty">
            <div className="publisher-smart-banner">
              <small className="publisher-smart-brand">
                {brandName} · {slot.width ?? '?'}×{slot.height ?? '?'}
              </small>
              <strong>{headline}</strong>
              <span className="publisher-smart-cta">{cta}</span>
            </div>
            <span className="publisher-slot-status">
              {binding?.assetId ? 'Asset thiếu — chọn lại media' : 'Chưa gán asset'}
            </span>
          </div>
        )}
      </div>
      <small>
        Dòng {source?.rawRowNumber ?? '?'} · {layout.placementLabel} ·{' '}
        {slot.evidence === 'unknown' ? 'Kích thước chưa xác minh' : 'Nguồn xung đột'}
      </small>
    </section>
  )
}

function PublisherStoryIllustration({
  scene,
  compact = false,
}: {
  scene: ReturnType<typeof publisherNewsContext>['scene']
  compact?: boolean
}) {
  return (
    <div
      className={`publisher-story-image publisher-scene-${scene} ${compact ? 'publisher-scene-compact' : ''}`}
      role="img"
      aria-label="Minh họa biên tập demo, không phải ảnh bài báo thật"
    >
      <div className="publisher-scene-sun" />
      <div className="publisher-scene-ground" />
      <span className="publisher-scene-form scene-form-one" />
      <span className="publisher-scene-form scene-form-two" />
      <span className="publisher-scene-form scene-form-three" />
      <span className="publisher-scene-form scene-form-four" />
      <span className="publisher-scene-form scene-form-five" />
      <small>MINH HỌA DEMO</small>
    </div>
  )
}

function PublisherLayoutReference({ layouts }: { layouts: PublisherSlotLayout[] }) {
  return (
    <details className="publisher-layout-reference">
      <summary>Đối chiếu vị trí và demo Admicro</summary>
      <p>
        Trang báo, wordmark và nội dung là minh họa. Mô tả format giúp chọn vùng hiển thị; chưa đối
        chiếu chính xác giao diện demo của từng publisher. Kích thước trong snapshot được giữ
        nguyên.
      </p>
      {layouts.map((layout) => {
        const entry = resolveAdmicroEntry(layout.slot.catalogEntryId)
        return (
          <div key={layout.slot.id}>
            <strong>
              {layout.slot.label} · {layout.placementLabel}
            </strong>
            <span>
              {layout.basis === 'format_reference'
                ? 'Theo mô tả format; bố cục trang ước lượng'
                : 'Ước lượng / chưa đối chiếu demo'}
            </span>
            <p>{layout.explanation}</p>
            <small>
              Dòng {entry?.rawRowNumber ?? '?'} · {entry?.dimensionsText ?? 'Chưa có kích thước'} ·
              ngày nguồn xung đột
            </small>
            <div className="publisher-reference-links">
              {entry?.demoUrl ? (
                <a href={entry.demoUrl} target="_blank" rel="noreferrer">
                  Demo của slot ↗
                </a>
              ) : (
                <span>Chưa có link demo trong snapshot</span>
              )}
              {layout.referenceUrl && (
                <a href={layout.referenceUrl} target="_blank" rel="noreferrer">
                  Tài liệu format ↗
                </a>
              )}
            </div>
          </div>
        )
      })}
    </details>
  )
}

export function PublisherPreview({
  draft,
  targetId,
  fallbackCreative = false,
}: {
  draft: EditorDraft
  targetId: string
  fallbackCreative?: boolean
}) {
  const selection = publisherDraftForTarget(draft, targetId)
  if (!selection) return <p>Target Admicro không có trong snapshot.</p>
  const publisher = ADMICRO_PUBLISHERS.find((item) => item.id === selection.publisherId)!
  const slots = resolveAdmicroSlots(selection)
  const context = publisherNewsContext(publisher.id, publisher.label)
  const layouts = slots.map(publisherSlotLayout)
  const mobile = slots.every((slot) => slot.device === 'mobile')
  const hasBackground = layouts.some((layout) => layout.placement === 'page_background')
  const hasLeftRail = layouts.some((layout) => layout.placement === 'left_rail')
  const render = (placement: PublisherPlacement) =>
    layouts
      .filter((layout) => layout.placement === placement)
      .map((layout) => (
        <PublisherSlot
          key={layout.slot.id}
          draft={draft}
          selection={selection}
          layout={layout}
          fallbackCreative={fallbackCreative}
        />
      ))
  const style = {
    '--publisher-accent': context.accent,
    '--publisher-ink': context.ink,
  } as CSSProperties
  return (
    <div
      className={`publisher-preview ${mobile ? 'publisher-mobile' : ''}`}
      style={style}
      data-renderer="publisher"
      data-publisher={publisher.id}
    >
      <div className="publisher-demo-note">
        ADMICRO CPD / ADMATIC NETWORK · {publisher.label.toUpperCase()} · VỊ TRÍ THEO NGUỒN
      </div>
      <div className={`publisher-page-scene ${hasBackground ? 'publisher-has-background' : ''}`}>
        {hasBackground && (
          <div className="publisher-background-layer" aria-label="Creative nền trang">
            {render('page_background')}
          </div>
        )}
        <div className="publisher-paper">
          <div className="publisher-utility-bar">
            <span>Hệ thống báo điện tử Admicro</span>
            <span>Tin mới · Đọc nhiều</span>
          </div>
          {render('page_top')}
          <header className="publisher-masthead">
            <strong className={`publisher-wordmark publisher-wordmark-${publisher.id}`}>
              {publisher.id === 'vtv' ? (
                <>
                  <span>V</span>
                  <span>T</span>
                  <span>V</span>
                </>
              ) : (
                context.wordmark
              )}
            </strong>
            <span>Thông tin mỗi ngày, góc nhìn mới</span>
          </header>
          <nav className="publisher-demo-nav" aria-label="Chuyên mục demo">
            {context.navigation.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </nav>
          {render('after_navigation')}
          <div className={`publisher-news-layout ${hasLeftRail ? 'publisher-has-left-rail' : ''}`}>
            {hasLeftRail && (
              <aside className="publisher-left-rail" aria-label="Quảng cáo lề trang">
                {render('left_rail')}
              </aside>
            )}
            <article className="publisher-demo-article">
              <div className="publisher-breadcrumb">
                Trang chủ <span>/</span> {context.section}
              </div>
              <h2>{context.headline}</h2>
              <p className="publisher-story-lead">{context.lead}</p>
              <div className="publisher-story-meta">
                <span>Ban biên tập · Nội dung demo</span>
                <span>08:30</span>
              </div>
              <PublisherStoryIllustration scene={context.scene} />
              <p className="publisher-story-caption">
                Minh họa ngữ cảnh đọc tin. Nội dung không phải bài báo của publisher.
              </p>
              <p>
                Những thay đổi trong cách làm việc và sinh hoạt đang mở ra nhiều cơ hội mới. Từ một
                góc phố, một không gian sống đến sản phẩm quen thuộc, mỗi ý tưởng đều bắt đầu từ
                việc hiểu điều người dùng cần.
              </p>
              {render('in_article')}
              {layouts
                .filter((layout) => layout.placement === 'in_video')
                .map((layout) => (
                  <div className="publisher-video-context" key={layout.slot.id}>
                    <div className="publisher-video-heading">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Video: Một ngày, nhiều góc nhìn
                      </span>
                    </div>
                    <PublisherSlot
                      draft={draft}
                      selection={selection}
                      layout={layout}
                      fallbackCreative={fallbackCreative}
                    />
                    <div className="publisher-video-controls" aria-hidden="true">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        0:15 / 2:40
                      </span>
                      <div />
                    </div>
                    <small>Quảng cáo trong video · thời điểm ngắt minh họa</small>
                  </div>
                ))}
              <p>
                Sự kết nối giữa công nghệ và cuộc sống giúp những trải nghiệm trở nên thuận tiện
                hơn. Nhiều nhóm cộng đồng đang chia sẻ kinh nghiệm, cùng thử nghiệm và xây dựng giải
                pháp cho những nhu cầu hàng ngày.
              </p>
              <blockquote>
                Ý tưởng tốt bắt đầu từ những quan sát gần gũi trong cuộc sống.
              </blockquote>
              {render('article_foot')}
              <div className="publisher-story-tags">
                <span>Chủ đề:</span>
                <span>Cuộc sống</span>
                <span>Đổi mới</span>
              </div>
              <div className="publisher-story-list">
                <h3>Tin liên quan</h3>
                {context.related.map((headline, index) => (
                  <div key={headline}>
                    <PublisherStoryIllustration scene={context.scene} compact />
                    <p>{headline}</p>
                    <small>{index + 2} giờ trước</small>
                  </div>
                ))}
              </div>
            </article>
            <aside className="publisher-right-column" aria-label="Cột tin và quảng cáo">
              <div className="publisher-demo-sidebar">
                <h3>ĐỌC NHIỀU</h3>
                {context.related.map((headline, index) => (
                  <p key={headline}>
                    <span>{index + 1}</span>
                    {headline}
                  </p>
                ))}
              </div>
              {render('right_column')}
              <div className="publisher-sidebar-story">
                <PublisherStoryIllustration scene={context.scene} compact />
                <strong>Một góc nhìn mới cho những câu chuyện hàng ngày</strong>
                <small>Nội dung demo · 3 giờ trước</small>
              </div>
            </aside>
          </div>
          {layouts.some((layout) => layout.placement === 'unresolved') && (
            <div className="publisher-unresolved-slots">
              <h3>Slot chưa xác định bố cục</h3>
              <p>Giữ thành phần của nguồn; cần đối chiếu demo trước khi sắp vị trí.</p>
              {render('unresolved')}
            </div>
          )}
          {render('page_foot')}
          <footer className="publisher-demo-footer">
            <strong>{context.wordmark}</strong>
            <span>Nội dung và wordmark minh họa · {slots.length} slot trong target</span>
            <span>
              {ADMICRO_SNAPSHOT.snapshotId} · ngày nguồn xung đột · chưa xác nhận inventory, giá
              hoặc spec hiện hành
            </span>
            <PublisherLayoutReference layouts={layouts} />
          </footer>
        </div>
      </div>
    </div>
  )
}
