import { Check, CircleAlert, Info } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import {
  TOAST_DURATION_MS,
  useToastStore,
  type ToastItem,
  type ToastKind,
} from '@/shared/ui/toast-store'

const ICON_WRAP: Record<ToastKind, string> = {
  // Pencil G-01「无权限」：琥珀圆底 + 白 info
  info: 'bg-[#D97706]',
  success: 'bg-[#059669]',
  error: 'bg-[#DC2626]',
}

function ToastIcon({ kind }: { kind: ToastKind }): ReactNode {
  if (kind === 'success') {
    return <Check size={12} strokeWidth={2.5} className="text-white" aria-hidden />
  }
  if (kind === 'error') {
    return <CircleAlert size={12} strokeWidth={2.5} className="text-white" aria-hidden />
  }
  return <Info size={12} strokeWidth={2.5} className="text-white" aria-hidden />
}

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dismiss(item.id)
    }, TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [dismiss, item.id])

  const role = item.kind === 'error' ? 'alert' : 'status'

  return (
    <div
      role={role}
      className="pointer-events-auto flex items-center gap-2.5 rounded-[14px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] px-4 py-3 text-[13px] font-medium text-[#0F172A] shadow-[0_8px_24px_#0F172A33] backdrop-blur-[40px]"
    >
      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${ICON_WRAP[item.kind]}`}
      >
        <ToastIcon kind={item.kind} />
      </span>
      <span>{item.message}</span>
    </div>
  )
}

export function ToastHost() {
  const items = useToastStore((s) => s.items)

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed top-7 left-1/2 z-[1000] flex -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  )
}
