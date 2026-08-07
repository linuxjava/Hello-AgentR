import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useSessionStore } from '@/shared/auth/session-store'

/** For anonymous routes such as /login — redirect away when already authenticated. */
export function GuestOnly() {
  const status = useSessionStore((s) => s.status)
  const hydrate = useSessionStore((s) => s.hydrate)

  useEffect(() => {
    if (status === 'idle') {
      void hydrate()
    }
  }, [status, hydrate])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        正在校验登录状态…
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
