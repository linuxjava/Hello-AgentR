import type { InputHTMLAttributes, ReactNode } from 'react'
import { CircleAlert, Lock, User, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError, type AdminRole } from '@/shared/api/types'
import { usersApi } from '@/shared/api/users'
import { passwordSchema, usernameSchema } from '@/shared/lib/validation'
import { ModalLayer } from '@/shared/ui/ModalLayer'
import { SelectMenu } from '@/shared/ui/SelectMenu'
import { toastSuccess } from '@/shared/ui/toast-store'

const schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'STAFF']),
})

type FormValues = z.infer<typeof schema>

export interface CreateAccountModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateAccountModal({ open, onClose, onCreated }: CreateAccountModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { username: '', password: '', role: 'STAFF' },
  })

  const roleValue = watch('role')

  if (!open) {
    return null
  }

  const close = () => {
    setBusinessError(null)
    reset({ username: '', password: '', role: 'STAFF' })
    onClose()
  }

  const onSubmit = handleSubmit(async (raw) => {
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'username' || field === 'password' || field === 'role') {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    try {
      await usersApi.create(parsed.data)
      toastSuccess('创建成功')
      close()
      onCreated()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '创建失败，请稍后重试'
      setBusinessError(message)
    }
  })

  return (
    <ModalShell title="创建账号" onClose={close}>
      {businessError ? <ErrorBanner message={businessError} /> : null}
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <LabeledInput
          id="create-username"
          label="用户名"
          icon={<User size={16} className="text-[#64748B]" />}
          placeholder="4–32 位字母、数字或下划线"
          error={errors.username?.message}
          {...register('username')}
        />
        <LabeledInput
          id="create-password"
          label="密码"
          type="password"
          icon={<Lock size={16} className="text-[#64748B]" />}
          placeholder="8–64 位，须含字母与数字"
          error={errors.password?.message}
          {...register('password')}
        />
        <SelectMenu
          id="create-role"
          label="角色"
          value={roleValue}
          onChange={(next) => setValue('role', next as AdminRole, { shouldDirty: true })}
          options={[
            { value: 'STAFF', label: '运营人员' },
            { value: 'ADMIN', label: '管理员' },
          ]}
        />
        <ModalActions
          cancelLabel="取消"
          submitLabel={isSubmitting ? '创建中…' : '创建'}
          disabled={isSubmitting}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <ModalLayer>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭遮罩"
        className="absolute inset-0 bg-[#0F172A66] backdrop-blur-[8px]"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal
        aria-label={title}
        className="relative z-10 flex w-full max-w-[500px] flex-col gap-5 rounded-[20px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] p-7 shadow-[0_16px_40px_#0F172A40] backdrop-blur-[48px]"
      >
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0F172A] font-[family-name:var(--font-display)]">
            {title}
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FFFFFF66] bg-[#FFFFFF59]"
          >
            <X size={16} className="text-[#334155]" />
          </button>
        </header>
        {children}
      </section>
    </div>
    </ModalLayer>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-[10px] border border-[#DC26264D] bg-[#DC262626] px-3.5 py-3 text-[13px] font-medium text-[#DC2626]"
    >
      <CircleAlert size={16} aria-hidden />
      <span>{message}</span>
    </div>
  )
}

function ModalActions({
  cancelLabel,
  submitLabel,
  disabled,
  onCancel,
}: {
  cancelLabel: string
  submitLabel: string
  disabled?: boolean
  onCancel: () => void
}) {
  return (
    <div className="mt-1 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-full border border-[#FFFFFFCC] bg-[#FFFFFF59] px-5 text-sm font-medium text-[#0F172A]"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="h-10 rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66] disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  )
}

interface LabeledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  error?: string
}

function LabeledInput({ id, label, icon, error, ...inputProps }: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <div className="admin-input flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
        {icon}
        <input
          id={id}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
          {...inputProps}
        />
      </div>
      {error ? <span className="text-xs text-[#DC2626]">{error}</span> : null}
    </div>
  )
}

export type { AdminRole }
