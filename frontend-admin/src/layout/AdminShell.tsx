import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ChangePasswordModal } from '@/layout/ChangePasswordModal'
import { useDocBreadcrumbStore } from '@/layout/doc-breadcrumb-store'
import { ShellSidebar } from '@/layout/ShellSidebar'
import { ShellTopbar } from '@/layout/ShellTopbar'

function breadcrumbForPath(pathname: string, docKbLabel: string | null) {
  if (pathname.startsWith('/users')) {
    return [
      { label: '首页', to: '/' },
      { label: '账号管理' },
    ]
  }
  // 文档列表：第三段为库 Name 或「知识库不存在」（由 DocumentsPage 写入 store）。
  const docsMatch = pathname.match(/^\/knowledge-bases\/[^/]+\/documents\/?$/)
  if (docsMatch) {
    return [
      { label: '首页', to: '/' },
      { label: '知识库管理', to: '/knowledge-bases' },
      { label: docKbLabel ?? '…' },
    ]
  }
  if (pathname.startsWith('/knowledge-bases')) {
    return [
      { label: '首页', to: '/' },
      { label: '知识库管理' },
    ]
  }
  return [{ label: '首页' }]
}

export function AdminShell() {
  const location = useLocation()
  const docKbLabel = useDocBreadcrumbStore((s) => s.kbLabel)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  return (
    <div className="shell-page relative min-h-screen overflow-hidden font-[family-name:var(--font-body)]">
      <div className="login-orb login-orb-violet" aria-hidden />
      <div className="login-orb login-orb-cyan" aria-hidden />
      <div className="login-orb login-orb-pink" aria-hidden />
      <div className="login-orb login-orb-blue" aria-hidden />
      <div className="login-frost" aria-hidden />

      <div className="relative z-10 flex h-screen gap-4 p-6">
        <ShellSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ShellTopbar
            breadcrumb={breadcrumbForPath(location.pathname, docKbLabel)}
            onChangePassword={() => setChangePasswordOpen(true)}
          />
          <main className="glass-panel min-h-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  )
}
