import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'

type SurfaceScaleStyle = CSSProperties & {
  '--surface-width': string
}

type DeviceFrameStyle = CSSProperties & {
  '--device-screen-width': string
  '--device-screen-height': string
}

export type PreviewDeviceId = 'pc' | 'iphone'

export type PreviewDeviceFrame = {
  id: PreviewDeviceId
  label: string
  detail: string
  viewport: { width: number; height: number }
  chrome: { x: number; top: number; bottom: number }
}

export const PREVIEW_DEVICE_FRAMES = {
  pc: {
    id: 'pc',
    label: 'PC',
    detail: '1920 x 1080 (Chrome)',
    viewport: { width: 1920, height: 945 },
    chrome: { x: 0, top: 87, bottom: 0 },
  },
  iphone: {
    id: 'iphone',
    label: 'iPhone 15/16',
    detail: '6.1" · 393 x 852 pt',
    viewport: { width: 393, height: 852 },
    chrome: { x: 9, top: 54, bottom: 34 },
  },
} as const satisfies Record<PreviewDeviceId, PreviewDeviceFrame>

export function PreviewSurface({
  children,
  width = 360,
  height,
  maxHeight,
  deviceFrame,
  surfaceRef,
}: {
  children: ReactNode
  width?: number
  height?: number
  maxHeight?: number
  deviceFrame?: PreviewDeviceFrame
  surfaceRef?: RefObject<HTMLDivElement | null>
}) {
  const container = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 1, height: 0 })
  const surfaceWidth = Math.max(1, Math.round(width))
  const surfaceMinHeight = Math.max(0, Math.round(height ?? 0))
  const frameWidth = deviceFrame ? surfaceWidth + deviceFrame.chrome.x * 2 : surfaceWidth

  useLayoutEffect(() => {
    const measure = () => {
      if (!container.current || !content.current) return
      const naturalHeight = content.current.offsetHeight
      const scale = Math.min(
        1,
        Math.max(0, container.current.clientWidth / frameWidth),
        maxHeight && naturalHeight ? maxHeight / naturalHeight : 1,
      )
      const height = Math.ceil(content.current.offsetHeight * scale)
      setSize((current) =>
        current.scale === scale && current.height === height ? current : { scale, height },
      )
    }
    const observer = new ResizeObserver(measure)
    if (container.current) observer.observe(container.current)
    if (content.current) observer.observe(content.current)
    measure()
    return () => observer.disconnect()
  }, [frameWidth, maxHeight])

  const scaleStyle: SurfaceScaleStyle = {
    '--surface-width': `${frameWidth}px`,
    width: frameWidth,
    marginLeft: -frameWidth / 2,
    transform: `scale(${size.scale})`,
  }

  const reviewSurface = (
    <div
      ref={surfaceRef}
      className="review-surface"
      style={{ width: surfaceWidth, minHeight: surfaceMinHeight || undefined }}
    >
      {children}
    </div>
  )

  const framedSurface = deviceFrame ? (
    <div
      className={`device-frame device-frame-${deviceFrame.id}`}
      data-device-frame={deviceFrame.id}
      aria-label={`${deviceFrame.label} preview frame ${deviceFrame.detail}`}
      style={
        {
          '--device-screen-width': `${surfaceWidth}px`,
          '--device-screen-height': `${surfaceMinHeight}px`,
          width: frameWidth,
          minHeight: surfaceMinHeight
            ? surfaceMinHeight + deviceFrame.chrome.top + deviceFrame.chrome.bottom
            : undefined,
        } as DeviceFrameStyle
      }
    >
      {deviceFrame.id === 'pc' && (
        <div className="device-browser-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
      )}
      {deviceFrame.id === 'iphone' && <span className="device-notch" aria-hidden="true" />}
      <div className="device-screen">{reviewSurface}</div>
      {deviceFrame.id === 'iphone' && <span className="device-home-indicator" aria-hidden="true" />}
    </div>
  ) : (
    reviewSurface
  )

  return (
    <div
      ref={container}
      className="preview-surface-container"
      data-surface-scale={size.scale}
      style={{ height: size.height || undefined }}
    >
      <div className="preview-surface-scale" style={scaleStyle}>
        <div ref={content}>{framedSurface}</div>
      </div>
    </div>
  )
}
