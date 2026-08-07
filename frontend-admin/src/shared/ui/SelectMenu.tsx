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
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] pr-3.5 pl-3.5 text-left text-sm text-[#0F172A] outline-none',
          triggerClassName ?? '',
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
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 overflow-hidden rounded-[12px] border border-[#FFFFFFCC] bg-[#FFFFFFF2] py-1.5 shadow-[0_12px_28px_#0F172A33] backdrop-blur-[24px]"
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
                    'flex h-12 w-full items-center px-3.5 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-[#E2E8F0] font-medium text-[#0F172A]'
                      : 'text-[#0F172A] hover:bg-[#F1F5F9]',
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
