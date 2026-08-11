import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectMenuProps {
  id?: string
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
  triggerClassName?: string
  disabled?: boolean
  'aria-label'?: string
}

export function SelectMenu({
  id,
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  disabled = false,
  'aria-label': ariaLabel,
}: SelectMenuProps) {
  const autoId = useId()
  const triggerId = id ?? autoId
  const listboxId = `${triggerId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value) ?? options[0]

  useEffect(() => {
    if (!open) {
      return
    }
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={['relative flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      {label ? (
        <label htmlFor={triggerId} className="text-[13px] font-medium text-[#334155]">
          {label}
        </label>
      ) : null}
      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return
          }
          setOpen((v) => !v)
        }}
        className={[
          'flex w-full items-center justify-between gap-2 rounded-[10px] border border-[#FFFFFF66] text-left text-sm text-[#0F172A] outline-none',
          triggerClassName ?? 'h-11 bg-[#FFFFFF59] px-3.5',
          disabled ? 'cursor-not-allowed opacity-70' : '',
        ].join(' ')}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ''}</span>
        <ChevronDown
          size={16}
          className={['shrink-0 text-[#64748B] transition', open ? 'rotate-180' : ''].join(' ')}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 overflow-hidden rounded-lg bg-[#FFFFFF] py-1 shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'flex h-10 w-full items-center px-3.5 text-left text-sm transition-colors',
                    // Match Ant Design Pagination size-changer Select tokens:
                    // optionSelectedBg=#E6F4FF, optionActiveBg=rgba(0,0,0,0.04)
                    isSelected
                      ? 'bg-[#E6F4FF] font-semibold text-[rgba(0,0,0,0.88)]'
                      : 'text-[rgba(0,0,0,0.88)] hover:bg-[rgba(0,0,0,0.04)]',
                  ].join(' ')}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
