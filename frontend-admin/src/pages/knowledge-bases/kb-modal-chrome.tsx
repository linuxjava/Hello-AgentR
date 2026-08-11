import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { CircleAlert, X } from 'lucide-react'
import { ModalLayer } from '@/shared/ui/ModalLayer'

export function ModalShell({
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

export function ErrorBanner({ message }: { message: string }) {
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

export function ModalActions({
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
  error?: string
}

export function LabeledInput({ id, label, error, ...inputProps }: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <div className="flex h-11 items-center rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
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

interface LabeledTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function LabeledTextarea({ id, label, error, ...textareaProps }: LabeledTextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <textarea
        id={id}
        className="min-h-[72px] resize-none rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
        {...textareaProps}
      />
      {error ? <span className="text-xs text-[#DC2626]">{error}</span> : null}
    </div>
  )
}
