import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { UiProfile } from '../domain/types'
import type { DeviceMockupSpec } from './deviceMockupModel'

export interface ZoomModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UiProfile
  mockup: DeviceMockupSpec
  children: ReactNode
  triggerRef?: RefObject<HTMLElement | null>
}

export function ZoomModal({
  isOpen,
  onClose,
  profile,
  mockup,
  children,
  triggerRef,
}: ZoomModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    closeBtnRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      triggerRef?.current?.focus()
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  return (
    <div
      className="zoom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to ${profile.groupName} - ${profile.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="zoom-modal-header">
        <div className="zoom-modal-meta">
          <strong>{profile.groupName}</strong>
          <span> · </span>
          <span>{profile.title}</span>
          <small className="zoom-modal-ratio">
            {mockup.viewport.width} × {mockup.viewport.height} ({mockup.label})
          </small>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          className="close-zoom-btn text-button"
          aria-label="Đóng"
          title="Đóng (Esc)"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="zoom-modal-body">
        <div className="zoom-modal-content">{children}</div>
      </div>
    </div>
  )
}
