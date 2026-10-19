import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DeviceMockup } from './DeviceMockup'
import { DEVICE_MOCKUPS, deviceMockupFor, captureDeviceMockup } from './deviceMockupModel'

describe('deviceMockupModel', () => {
  it('defines desktop Chrome frame (pc-1920) with exact proportional dimensions', () => {
    const pcSpec = DEVICE_MOCKUPS['pc-1920']
    expect(pcSpec).toBeDefined()
    expect(pcSpec.kind).toBe('desktop')
    expect(pcSpec.label).toBe('Máy tính 1920 x 1080 (Chrome)')
    expect(pcSpec.viewport).toEqual({ width: 1920, height: 945 })
    expect(pcSpec.frame).toEqual({ width: 1920, height: 1032 })
    // Chrome header height: 1032 - 945 = 87px (41px tab bar + 46px address bar)
    expect(pcSpec.frame.height - pcSpec.viewport.height).toBe(87)
  })

  it('defines mobile iPhone 15/16 frame with exact proportional dimensions', () => {
    const iphoneSpec = DEVICE_MOCKUPS['iphone-15-16']
    expect(iphoneSpec).toBeDefined()
    expect(iphoneSpec.kind).toBe('phone')
    expect(iphoneSpec.label).toBe('iPhone 15 / 16 (6,1 inch)')
    expect(iphoneSpec.viewport).toEqual({ width: 393, height: 852 })
    expect(iphoneSpec.frame).toEqual({ width: 411, height: 870 })
  })

  it('routes device mockup for different device classes and modes correctly', () => {
    expect(deviceMockupFor({ device: 'desktop' }, 'target').id).toBe('pc-1920')
    expect(deviceMockupFor({ device: 'web' }, 'target').id).toBe('pc-1920')
    expect(deviceMockupFor({ device: 'Desktop' }, 'target').id).toBe('pc-1920')
    expect(deviceMockupFor({ device: 'Web' }, 'target').id).toBe('pc-1920')

    expect(deviceMockupFor({ device: 'mobile' }, 'target').id).toBe('iphone-15-16')
    expect(deviceMockupFor({ device: 'mobile_app' }, 'target').id).toBe('iphone-15-16')
    expect(deviceMockupFor({ device: 'Mobile' }, 'target').id).toBe('iphone-15-16')

    // Explicit override mode takes precedence
    expect(deviceMockupFor({ device: 'mobile' }, 'pc').id).toBe('pc-1920')
    expect(deviceMockupFor({ device: 'desktop' }, 'mobile').id).toBe('iphone-15-16')
  })

  it('captures device mockup context from DOM viewport element', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div data-device-viewport="pc-1920">
        <div data-device-scroll style="height: 500px; overflow-y: scroll;"></div>
      </div>
    `
    const captured = captureDeviceMockup(div)
    expect(captured).toBeDefined()
    expect(captured?.id).toBe('pc-1920')
    expect(captured?.viewport).toEqual({ width: 1920, height: 945 })
  })

  it('renders desktop Chrome frame with toolbar, address bar, and 1920 viewport width', () => {
    const pcSpec = DEVICE_MOCKUPS['pc-1920']
    const html = renderToStaticMarkup(
      createElement(
        DeviceMockup,
        { spec: pcSpec, contentWidth: 1920, browserTitle: 'Test Chrome' },
        createElement('div', { 'data-child': true }, 'Child content'),
      ),
    )
    expect(html).toContain('device-mockup desktop')
    expect(html).toContain('data-device-frame="pc-1920"')
    expect(html).toContain('--device-screen-width:1920px')
    expect(html).toContain('--device-screen-height:945px')
    expect(html).toContain('device-browser-chrome')
    expect(html).toContain('device-chrome-tabbar')
    expect(html).toContain('device-chrome-toolbar')
    expect(html).toContain('device-address-bar')
    expect(html).toContain('Test Chrome')
    expect(html).toContain('Child content')
  })

  it('renders iPhone 15/16 frame with dynamic island, status bar, and home indicator', () => {
    const iphoneSpec = DEVICE_MOCKUPS['iphone-15-16']
    const html = renderToStaticMarkup(
      createElement(
        DeviceMockup,
        { spec: iphoneSpec, contentWidth: 393 },
        createElement('div', { 'data-child': true }, 'Mobile content'),
      ),
    )
    expect(html).toContain('device-mockup phone')
    expect(html).toContain('data-device-frame="iphone-15-16"')
    expect(html).toContain('--device-screen-width:393px')
    expect(html).toContain('--device-screen-height:852px')
    expect(html).toContain('device-phone-status')
    expect(html).toContain('device-dynamic-island')
    expect(html).toContain('device-home-indicator')
    expect(html).toContain('Mobile content')
  })
})
