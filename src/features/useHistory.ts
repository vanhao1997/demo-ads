import { useCallback, useReducer } from 'react'

export type History<T> = { past: T[]; present: T; future: T[] }
type Action<T> =
  { type: 'set'; value: T } | { type: 'undo' } | { type: 'redo' } | { type: 'reset'; value: T }

export function historyReducer<T>(state: History<T>, action: Action<T>): History<T> {
  if (action.type === 'reset') return { past: [], present: action.value, future: [] }
  if (action.type === 'set') {
    if (action.value === state.present) return state
    return { past: [...state.past.slice(-59), state.present], present: action.value, future: [] }
  }
  if (action.type === 'undo' && state.past.length) {
    return {
      past: state.past.slice(0, -1),
      present: state.past.at(-1)!,
      future: [state.present, ...state.future],
    }
  }
  if (action.type === 'redo' && state.future.length) {
    return {
      past: [...state.past, state.present],
      present: state.future[0],
      future: state.future.slice(1),
    }
  }
  return state
}

export function useHistory<T>(initial: T) {
  const [history, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initial,
    future: [],
  })
  const set = useCallback((value: T) => dispatch({ type: 'set', value }), [])
  return {
    value: history.present,
    set,
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    reset: (value: T) => dispatch({ type: 'reset', value }),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
