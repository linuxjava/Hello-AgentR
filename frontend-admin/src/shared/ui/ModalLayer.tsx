import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * 挂到 document.body，避免壳层 glass-panel 的 backdrop-filter
 * 把 position:fixed 限制在表格容器内（遮罩只盖住内容区）。
 */
export function ModalLayer({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
