import { Home, Users } from 'lucide-react'
import { NavLink } from 'react-router'

const navItems = [
  { to: '/', label: '首页', icon: Home, end: true },
  { to: '/users', label: '账号管理', icon: Users, end: false },
] as const

export function ShellSidebar() {
  return (
    <aside className="glass-panel flex w-[248px] shrink-0 flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#2563EB] text-base font-bold text-white font-[family-name:var(--font-display)]">
          H
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-[15px] font-bold text-[#0F172A] font-[family-name:var(--font-display)]">
            Hello-AgentR
          </p>
          <p className="text-[11px] text-[#64748B]">管理控制台</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5" aria-label="主导航">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex h-[38px] items-center gap-2.5 rounded-[10px] px-2.5 text-sm transition',
                  isActive
                    ? 'bg-[#2563EB] font-semibold text-white'
                    : 'font-medium text-[#0F172A] hover:bg-white/40',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={isActive ? 'text-white' : 'text-[#334155]'}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
