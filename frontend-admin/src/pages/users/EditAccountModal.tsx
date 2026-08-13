import { CircleAlert, KeyRound, User, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AdminRole, AdminUserView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { usersApi } from '@/shared/api/users'
import { passwordSchema } from '@/shared/lib/validation'
import { ModalLayer } from '@/shared/ui/ModalLayer'
import { SelectMenu } from '@/shared/ui/SelectMenu'
import { toastSuccess } from '@/shared/ui/toast-store'

const schema = z
  .object({
    role: z.enum(['ADMIN', 'STAFF']),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.newPassword) {
      return
    }
    const parsed = passwordSchema.safeParse(value.newPassword)
    if (!parsed.success) {
      ctx.addIssue({
        code: 'custom',
        message: parsed.error.issues[0]?.message ?? '密码不符合规则',
        path: ['newPassword'],
      })
    }
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: '两次输入的新密码不一致',
        path: ['confirmPassword'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export interface EditAccountModalProps {
  open: boolean
  user: AdminUserView | null
  onClose: () => void
  onSaved: () => void
}

export function EditAccountModal({ open, user, onClose, onSaved }: EditAccountModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      role: user?.role ?? 'STAFF',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const roleValue = watch('role')

  if (!open || !user) {
    return null
  }

  const close = () => {
    setBusinessError(null)
    onClose()
  }

  const onSubmit = handleSubmit(async (raw) => {
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'role' || field === 'newPassword' || field === 'confirmPassword') {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    try {
      if (parsed.data.role !== user.role) {
        await usersApi.updateRole(user.id, { role: parsed.data.role })
      }
      if (parsed.data.newPassword) {
        await usersApi.updatePassword(user.id, { newPassword: parsed.data.newPassword })
      }
      toastSuccess('保存成功')
      close()
      onSaved()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '保存失败，请稍后重试'
      setBusinessError(message)
    }
  })

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
        aria-labelledby="edit-account-title"
        className="relative z-10 flex w-full max-w-[500px] flex-col gap-5 rounded-[20px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] p-7 shadow-[0_16px_40px_#0F172A40] backdrop-blur-[48px]"
      >
        <header className="flex items-center justify-between">
          <h2
            id="edit-account-title"
            className="text-xl font-bold text-[#0F172A] font-[family-name:var(--font-display)]"
          >
            编辑账号
          </h2>
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

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#334155]">用户名</label>
            <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-[#CBD5E1] bg-[#FFFFFF4D] px-3.5">
              <User size={16} className="text-[#94A3B8]" aria-hidden />
              <span className="text-sm text-[#334155]">{user.username}</span>
            </div>
            <p className="text-xs text-[#64748B]">用户名创建后不可修改</p>
          </div>

          <SelectMenu
            id="edit-role"
            label="角色"
            value={roleValue}
            onChange={(next) => setValue('role', next as AdminRole, { shouldDirty: true })}
            options={[
              { value: 'STAFF', label: '运营人员' },
              { value: 'ADMIN', label: '管理员' },
            ]}
          />

          <div className="h-px w-full bg-[#CBD5E1]" />

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-new-password" className="text-[13px] font-medium text-[#334155]">
              新密码（可选）
            </label>
            <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
              <KeyRound size={16} className="text-[#64748B]" aria-hidden />
              <input
                id="edit-new-password"
                type="password"
                placeholder="留空则不修改密码"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
                {...register('newPassword')}
              />
            </div>
            {errors.newPassword ? (
              <span className="text-xs text-[#DC2626]">{errors.newPassword.message}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-confirm-password"
              className="text-[13px] font-medium text-[#334155]"
            >
              确认新密码
            </label>
            <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
              <KeyRound size={16} className="text-[#64748B]" aria-hidden />
              <input
                id="edit-confirm-password"
                type="password"
                placeholder="若填写新密码，请再次输入确认"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword ? (
              <span className="text-xs text-[#DC2626]">{errors.confirmPassword.message}</span>
            ) : null}
          </div>

          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-full border border-[#FFFFFFCC] bg-[#FFFFFF59] px-5 text-sm font-medium text-[#0F172A]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66] disabled:opacity-60"
            >
              {isSubmitting ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </section>
    </div>
    </ModalLayer>
  )
}
