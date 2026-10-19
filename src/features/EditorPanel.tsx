import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export function EditorPanel({
  children,
  expanded,
  onExpandedChange,
  className,
}: {
  children: ReactNode
  expanded: boolean
  onExpandedChange: (value: boolean) => void
  className?: string
}) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <details
      className={`editor-panel min-w-0 ${className ?? ''}`}
      open={!mobile || expanded}
      onToggle={(event) => {
        if (mobile) onExpandedChange(event.currentTarget.open)
      }}
    >
      <summary className="editor-disclosure">
        Chỉnh nội dung creative
      </summary>
      <div className="editor-panel-body">{children}</div>
    </details>
  )
}
