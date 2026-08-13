import { CircleAlert, Trash2, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'
import type { AdminUserView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { usersApi } from '@/shared/api/users'
import { ModalLayer } from '@/shared/ui/ModalLayer'
import { toastSuccess } from '@/shared/ui/toast-store'

export interface DeleteAccountModalProps {
  open: boolean
  user: AdminUserView | null
  onClose: () => void
  onDeleted: () => void
}

export function DeleteAccountModal({
  open,
  user,
  onClose,
  onDeleted,
}: DeleteAccountModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!open || !user) {
    return null
  }

  const close = () => {
    setBusinessError(null)
    onClose()
  }

  const onConfirm = async () => {
    setSubmitting(true)
    setBusinessError(null)
    try {
      await usersApi.remove(user.id)
      toastSuccess('删除成功')
      close()
      onDeleted()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '删除失败，请稍后重试'
      setBusinessError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalLayer>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭遮罩"
        className="absolute inset-0 bg-[#0F172A66] backdrop-blur-[8px]"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal
        aria-labelledby="delete-account-title"
        className="relative z-10 flex w-full max-w-[460px] flex-col gap-5 rounded-[20px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] p-7 shadow-[0_16px_40px_#0F172A40] backdrop-blur-[48px]"
      >
        <header className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#0F172A14]">
            <TriangleAlert size={20} className="text-[#334155]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="delete-account-title"
              className="text-lg font-bold text-[#0F172A] font-[family-name:var(--font-display)]"
            >
              删除账号
            </h2>
            <p className="text-[13px] text-[#64748B]">此操作不可恢复</p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FFFFFF66] bg-[#FFFFFF59]"
          >
            <X size={16} className="text-[#334155]" />
          </button>
        </header>

        {businessError ? (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-[10px] border border-[#DC26264D] bg-[#DC262626] px-3.5 py-3 text-[13px] font-medium text-[#DC2626]"
          >
            <CircleAlert size={16} aria-hidden />
            <span>{businessError}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-[14px] border border-[#FFFFFF66] bg-[#FFFFFF59] p-4">
          <p className="text-sm font-semibold text-[#0F172A]">
            确定删除账号「{user.username}」吗？
          </p>
          <p className="text-[13px] text-[#334155]">
            将执行删除，账号及其关联登录态会立即失效，且无法恢复。
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="h-10 rounded-full border border-[#FFFFFFCC] bg-[#FFFFFF59] px-5 text-sm font-medium text-[#0F172A]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onConfirm()}
            className="flex h-10 items-center gap-2 rounded-full bg-[#0F172A] px-[18px] text-sm font-semibold text-white disabled:opacity-60"
          >
            <Trash2 size={14} aria-hidden />
            {submitting ? '删除中…' : '确认删除'}
          </button>
        </div>
      </section>
    </div>
    </ModalLayer>
  )
}
