import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

export const NO_PERMISSION_MESSAGE = '无权限执行此操作'
export const TOAST_DURATION_MS = 3000

interface ToastState {
  items: ToastItem[]
  push: (kind: ToastKind, message: string) => string
  dismiss: (id: string) => void
  clear: () => void
}

let seq = 0

export const useToastStore = create<ToastState>((set) => ({
  items: [],

  push: (kind, message) => {
    seq += 1
    const id = `toast-${seq}`
    set((state) => ({
      items: [...state.items, { id, kind, message }],
    }))
    return id
  },

  dismiss: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }))
  },

  clear: () => set({ items: [] }),
}))

export function toastSuccess(message: string): string {
  return useToastStore.getState().push('success', message)
}

export function toastError(message: string): string {
  return useToastStore.getState().push('error', message)
}

export function toastInfo(message: string): string {
  return useToastStore.getState().push('info', message)
}

export function toastNoPermission(): string {
  return toastInfo(NO_PERMISSION_MESSAGE)
}
