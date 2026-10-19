import { describe, expect, it } from 'vitest'
import { initialDraft, resolvedRenderSettings, sanitizeRenderSettings } from './editorModel'

describe('editor render settings', () => {
  it('defaults missing per-target render settings', () => {
    expect(resolvedRenderSettings(initialDraft, 'facebook.feed')).toEqual({
      fit: 'cover',
      safeZone: true,
      focalX: 50,
      focalY: 50,
    })
  })

  it('keeps render settings independent per target and clamps focal points', () => {
    const draft = {
      ...initialDraft,
      renderSettings: {
        'facebook.feed': { fit: 'contain' as const, safeZone: false, focalX: -20, focalY: 130 },
        'instagram.feed': { fit: 'cover' as const, safeZone: true, focalX: 15, focalY: 80 },
      },
    }

    expect(resolvedRenderSettings(draft, 'facebook.feed')).toEqual({
      fit: 'contain',
      safeZone: false,
      focalX: 0,
      focalY: 100,
    })
    expect(resolvedRenderSettings(draft, 'instagram.feed').focalX).toBe(15)
  })

  it('rejects malformed render settings for import sanitizers', () => {
    expect(sanitizeRenderSettings({ fit: 'stretch' })).toBeUndefined()
    expect(sanitizeRenderSettings({ fit: 'cover', extra: true })).toBeUndefined()
    expect(sanitizeRenderSettings({ safeZone: 'true' })).toBeUndefined()
  })
})
