import type { CSSProperties, ReactNode } from 'react'
import type { DeviceMockupSpec } from './deviceMockupModel'
import './deviceMockup.css'

type DeviceMockupStyle = CSSProperties & {
  '--device-frame-width': string
  '--device-frame-height': string
  '--device-screen-width': string
  '--device-screen-height': string
  '--device-content-width': string
}

export function DeviceMockup({
  spec,
  contentWidth,
  immersive = false,
  browserTitle = 'Xem trước quảng cáo',
  browserUrl = 'preview.noti.vn',
  appChrome = true,
  children,
}: {
  spec: DeviceMockupSpec
  contentWidth: number
  immersive?: boolean
  browserTitle?: string
  browserUrl?: string
  appChrome?: boolean
  children: ReactNode
}) {
  const requestedWidth = Math.max(1, Math.min(spec.viewport.width, Math.round(contentWidth)))
  const safeContentWidth =
    spec.kind === 'phone' && requestedWidth >= 360 ? spec.viewport.width : requestedWidth
  const style: DeviceMockupStyle = {
    '--device-frame-width': `${spec.frame.width}px`,
    '--device-frame-height': `${spec.frame.height}px`,
    '--device-screen-width': `${spec.viewport.width}px`,
    '--device-screen-height': `${spec.viewport.height}px`,
    '--device-content-width': `${safeContentWidth}px`,
  }

  return (
    <div
      className={`device-mockup ${spec.kind}${immersive ? ' immersive' : ''}`}
      style={style}
      data-device-frame={spec.id}
    >
      <div className="device-body">
        <Screen spec={spec}>
          <DeviceScrollContent>{children}</DeviceScrollContent>
          {appChrome && (
            <div className="device-phone-status" aria-hidden="true">
              <span>9:41</span>
              <span className="device-dynamic-island" />
              <span className="device-phone-icons">
                <span className="device-signal-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="device-5g-label">5G</span>
                <span className="device-battery-pill">
                  <i />
                </span>
              </span>
            </div>
          )}
          {appChrome && <div className="device-home-indicator" aria-hidden="true" />}
          <div className="device-browser-chrome" aria-hidden="true">
            <div className="device-chrome-tabbar">
              <div className="device-window-controls">
                <span />
                <span />
                <span />
              </div>
              <div className="device-chrome-tab">
                <span>{browserTitle}</span>
                <small>×</small>
              </div>
              <span className="device-chrome-newtab">+</span>
            </div>
            <div className="device-chrome-toolbar">
              <div className="device-chrome-nav-arrows">
                <span>←</span>
                <span>→</span>
                <span>↻</span>
              </div>
              <div className="device-address-bar">
                <span className="device-https-badge">https://</span>
                <span>{browserUrl}</span>
              </div>
            </div>
          </div>
        </Screen>
      </div>
      <div className="device-desktop-stand" aria-hidden="true" />
      <div className="device-desktop-base" aria-hidden="true" />
    </div>
  )
}

function Screen({ spec, children }: { spec: DeviceMockupSpec; children: ReactNode }) {
  return (
    <div
      className="device-screen"
      role="group"
      data-device-viewport={spec.id}
      aria-label={`${spec.label} preview viewport`}
    >
      {children}
    </div>
  )
}

function DeviceScrollContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="device-scroll-viewport"
      data-device-scroll
      tabIndex={0}
      role="region"
      aria-label="Cuộn nội dung trong mockup"
    >
      <div className="device-scroll-content" data-device-scroll-content>
        <div className="device-ad-content">{children}</div>
      </div>
    </div>
  )
}
