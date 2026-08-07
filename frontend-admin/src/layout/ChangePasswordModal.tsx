import type { InputHTMLAttributes } from 'react'
import { CircleAlert, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import { passwordSchema } from '@/shared/lib/validation'
import { toastSuccess } from '@/shared/ui/toast-store'

const schema = z
  .object({
    oldPassword: z.string().min(1, '请输入当前密码'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, '请再次输入新密码'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const navigate = useNavigate()
  const clearSession = useSessionStore((s) => s.clearSession)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  })

  if (!open) {
    return null
  }

  const close = () => {
    setBusinessError(null)
    reset()
    onClose()
  }

  const onSubmit = handleSubmit(async (raw) => {
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          field === 'oldPassword' ||
          field === 'newPassword' ||
          field === 'confirmPassword'
        ) {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    try {
      await authApi.changePassword({
        oldPassword: parsed.data.oldPassword,
        newPassword: parsed.data.newPassword,
      })
      clearSession()
      toastSuccess('密码已修改，请重新登录')
      close()
      void navigate('/login', { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : '修改密码失败，请稍后重试'
      setBusinessError(message)
    }
  })

  return (
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
        aria-labelledby="change-password-title"
        className="relative z-10 flex w-full max-w-[500px] flex-col gap-5 rounded-[20px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] p-7 shadow-[0_16px_40px_#0F172A40] backdrop-blur-[48px]"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2
              id="change-password-title"
              className="text-xl font-bold text-[#0F172A] font-[family-name:var(--font-display)]"
            >
              修改密码
            </h2>
            <p className="text-[13px] text-[#64748B]">成功后需重新登录</p>
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

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Field
            id="oldPassword"
            label="当前密码"
            type="password"
            placeholder="请输入当前密码"
            error={errors.oldPassword?.message}
            {...register('oldPassword')}
          />
          <Field
            id="newPassword"
            label="新密码"
            type="password"
            placeholder="8–64 位，须含字母与数字"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Field
            id="confirmPassword"
            label="确认新密码"
            type="password"
            placeholder="再次输入新密码"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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
              {isSubmitting ? '提交中…' : '确认修改'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

function Field({ id, label, error, ...inputProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <input
        id={id}
        className="h-11 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
        {...inputProps}
      />
      {error ? <span className="text-xs text-[#DC2626]">{error}</span> : null}
    </div>
  )
}
