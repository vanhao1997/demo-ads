import { describe, expect, it } from 'vitest'
import { historyReducer } from './useHistory'
import { sniffType } from '../media/inspect'

describe('draft history', () => {
  it('discards redo after branching and never loses the previous state', () => {
    let state = { past: [] as number[], present: 1, future: [] as number[] }
    state = historyReducer(state, { type: 'set', value: 2 })
    state = historyReducer(state, { type: 'undo' })
    expect(state.present).toBe(1)
    state = historyReducer(state, { type: 'set', value: 3 })
    expect(historyReducer(state, { type: 'redo' }).present).toBe(3)
    expect(historyReducer(state, { type: 'undo' }).present).toBe(1)
  })
  it('resets history when importing a new draft', () => {
    expect(
      historyReducer({ past: [1], present: 2, future: [3] }, { type: 'reset', value: 4 }),
    ).toEqual({ past: [], present: 4, future: [] })
  })
})

describe('file signature checks', () => {
  it('rejects HTML/SVG even when the filename claims to be an image', () => {
    expect(sniffType(new TextEncoder().encode('<svg onload=evil>'))).toBeNull()
    expect(sniffType(new TextEncoder().encode('<html><script>'))).toBeNull()
  })
  it('recognizes MP4 container without claiming H.264 codec', () => {
    expect(
      sniffType(new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109])),
    ).toEqual({ kind: 'video', mime: 'video/mp4' })
  })
})
