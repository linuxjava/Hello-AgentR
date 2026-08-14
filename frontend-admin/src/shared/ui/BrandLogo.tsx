/** 产品标：登录卡与壳层侧栏共用，避免两处渐变/字标漂移。 */
export function BrandLogo() {
  return (
    <div
      className="login-logo flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-[0_4px_12px_#7C3AED66] font-[family-name:var(--font-display)]"
      aria-hidden
    >
      HA
    </div>
  )
}
