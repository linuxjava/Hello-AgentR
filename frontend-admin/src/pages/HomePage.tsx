import { LayoutDashboard } from 'lucide-react'

export function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] bg-[#CFFAFE]">
        <LayoutDashboard size={32} className="text-[#2563EB]" aria-hidden />
      </div>
      <h1 className="text-[22px] font-bold text-[#0F172A] font-[family-name:var(--font-display)]">
        首页占位
      </h1>
      <p className="max-w-md text-sm text-[#64748B]">
        本阶段无业务内容。后续业务模块将挂载于此。
      </p>
    </div>
  )
}
