import type { UiProfile } from './uiTypes'
import type { DeviceMockupContext } from '../domain'
export type { DeviceMockupContext } from '../domain'

export type MockupMode = 'target' | 'mobile' | 'pc'
export type DeviceMockupId = 'iphone-15-16' | 'pc-1920' | 'pc-1440'
export type DeviceMockupSpec = {
  id: DeviceMockupId
  kind: 'phone' | 'desktop'
  label: string
  viewport: { width: number; height: number }
  frame: { width: number; height: number }
}

export const DEVICE_MOCKUPS: Record<DeviceMockupId, DeviceMockupSpec> = {
  'iphone-15-16': {
    id: 'iphone-15-16',
    kind: 'phone',
    label: 'iPhone 15 / 16 (6,1 inch)',
    viewport: { width: 393, height: 852 },
    frame: { width: 411, height: 870 },
  },
  'pc-1920': {
    id: 'pc-1920',
    kind: 'desktop',
    label: 'Máy tính 1920 x 1080 (Chrome)',
    viewport: { width: 1920, height: 945 },
    frame: { width: 1920, height: 1032 },
  },
  'pc-1440': {
    id: 'pc-1440',
    kind: 'desktop',
    label: 'Máy tính 1920 x 1080 (Chrome)',
    viewport: { width: 1920, height: 945 },
    frame: { width: 1920, height: 1032 },
  },
}

export function deviceMockupFor(profile: Pick<UiProfile, 'device'>, mode: MockupMode) {
  const desktop =
    mode === 'pc' || (mode === 'target' && ['Desktop', 'Web', 'desktop', 'web'].includes(profile.device))
  return DEVICE_MOCKUPS[desktop ? 'pc-1920' : 'iphone-15-16']
}

export function captureDeviceMockup(element: HTMLElement | null): DeviceMockupContext | undefined {
  const viewport = element?.querySelector<HTMLElement>('[data-device-viewport]')
  const id = viewport?.dataset.deviceViewport as DeviceMockupId | undefined
  if (id !== 'iphone-15-16' && id !== 'pc-1920' && id !== 'pc-1440') return undefined
  const spec = DEVICE_MOCKUPS[id]
  const scroller = viewport?.querySelector<HTMLElement>('[data-device-scroll]')
  return { id, viewport: { ...spec.viewport }, scrollTop: Math.round(scroller?.scrollTop ?? 0) }
}
