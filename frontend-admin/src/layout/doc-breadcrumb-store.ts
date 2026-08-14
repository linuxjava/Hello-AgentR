import { create } from 'zustand'

/**
 * 文档列表页把当前库 Name（或「知识库不存在」）写入此处，
 * 供 Shell 面包屑第三段读取——避免 AdminShell 再拉一遍详情。
 */
interface DocBreadcrumbState {
  kbLabel: string | null
  setKbLabel: (label: string | null) => void
}

export const useDocBreadcrumbStore = create<DocBreadcrumbState>((set) => ({
  kbLabel: null,
  setKbLabel: (kbLabel) => set({ kbLabel }),
}))
