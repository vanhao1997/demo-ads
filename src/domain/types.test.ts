import { describe, expect, it } from 'vitest'
import { DEFAULT_CREATIVE } from '../catalog'

describe('creative contract', () => {
  it('keeps composition independent from product selection', () => {
    expect(DEFAULT_CREATIVE.composition.kind).toBe('single_image')
    expect(DEFAULT_CREATIVE.composition.assetIds).toHaveLength(0)
    expect(DEFAULT_CREATIVE.assets).toHaveLength(0)
  })
})
