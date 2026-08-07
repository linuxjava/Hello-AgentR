import { ChevronDown, ChevronRight, KeyRound, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { authApi } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import { avatarLetter, roleLabel } from '@/shared/lib/display'
import { toastError } from '@/shared/ui/toast-store'

export interface ShellTopbarProps {
  breadcrumb: Array<{ label: string; to?: string }>
  onChangePassword: () => void
}

export function ShellTopbar({ breadcrumb, onChangePassword }: ShellTopbarProps) {
  const navigate = useNavigate()
  const profile = useSessionStore((s) => s.profile)
  const clearSession = useSessionStore((s) => s.clearSession)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const onDocClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const onLogout = async () => {
    setOpen(false)
    try {
      await authApi.logout()
    } catch (error) {
      if (!(error instanceof ApiError && error.code === 'A000001')) {
        // still clear local session for UX
      }
    }
    clearSession()
    void navigate('/login', { replace: true })
  }

  if (!profile) {
    return null
  }

  return (
    <header className="glass-panel relative z-20 flex h-16 shrink-0 items-center justify-between px-6">
      <nav aria-label="面包屑" className="flex items-center gap-2">
        {breadcrumb.map((crumb, index) => {
          const isLast = index === breadcrumb.length - 1
          return (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <ChevronRight size={14} className="text-[#64748B]" aria-hidden />
              ) : null}
              {isLast || !crumb.to ? (
                <span
                  className={
                    isLast
                      ? 'text-lg font-bold text-[#0F172A] font-[family-name:var(--font-display)]'
                      : 'text-[13px] font-medium text-[#64748B]'
                  }
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="text-[13px] font-medium text-[#64748B] hover:text-[#0F172A]"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full border border-white/40 bg-[#FFFFFF59] px-3 py-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
            {avatarLetter(profile.username)}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[13px] font-semibold text-[#0F172A]">{profile.username}</span>
            <span className="text-[11px] text-[#64748B]">{roleLabel(profile.role)}</span>
          </span>
          <ChevronDown size={14} className="text-[#64748B]" aria-hidden />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute top-[calc(100%+8px)] right-0 z-30 w-[188px] rounded-[14px] border border-[#FFFFFFCC] bg-[#FFFFFFD9] p-2 shadow-[0_10px_28px_#0F172A33] backdrop-blur-[40px]"
          >
            <button
              type="button"
              role="menuitem"
              className="flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] text-[#0F172A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
              onClick={() => {
                setOpen(false)
                onChangePassword()
              }}
            >
              <KeyRound size={14} className="text-[#334155]" aria-hidden />
              修改密码
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] text-[#0F172A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1]"
              onClick={() => {
                void onLogout().catch((error: unknown) => {
                  const message =
                    error instanceof ApiError ? error.message : '登出失败，请稍后重试'
                  toastError(message)
                })
              }}
            >
              <LogOut size={14} className="text-[#334155]" aria-hidden />
              登出
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
