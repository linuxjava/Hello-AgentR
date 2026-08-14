import { CircleAlert, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/types'
import {
  getRememberedUsername,
  persistRememberUsername,
} from '@/shared/auth/remember-username'
import { useSessionStore } from '@/shared/auth/session-store'
import { BrandLogo } from '@/shared/ui/BrandLogo'

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

/** Bootstrap 初始账号，仅作表单预填方便本地联调；提交仍走登录接口。 */
const DEFAULT_LOGIN_USERNAME = 'admin'
const DEFAULT_LOGIN_PASSWORD = 'admin@123456'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: getRememberedUsername() || DEFAULT_LOGIN_USERNAME,
      password: DEFAULT_LOGIN_PASSWORD,
      remember: Boolean(getRememberedUsername()),
    },
  })

  const onSubmit = handleSubmit(async (raw) => {
    if (isSubmitting) {
      return
    }

    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'username' || field === 'password') {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    try {
      const result = await authApi.login({
        username: parsed.data.username,
        password: parsed.data.password,
      })
      setSession(result.token, result.profile)
      persistRememberUsername(parsed.data.remember, parsed.data.username)
      void navigate('/', { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : '登录失败，请稍后重试'
      setBusinessError(message)
    }
  })

  const passwordBox = register('password')

  return (
    <main className="login-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 font-[family-name:var(--font-body)]">
      <div className="login-orb login-orb-violet" aria-hidden />
      <div className="login-orb login-orb-cyan" aria-hidden />
      <div className="login-orb login-orb-pink" aria-hidden />
      <div className="login-orb login-orb-blue" aria-hidden />
      <div className="login-frost" aria-hidden />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-7">
        <section className="login-card flex w-full flex-col gap-5 rounded-[20px] border border-[#FFFFFFCC] bg-[#FFFFFF7A] p-8 shadow-[0_8px_32px_#0F172A2E] backdrop-blur-[48px]">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 pb-1">
              <BrandLogo />
              <p className="text-xl font-bold tracking-tight text-[#0F172A] font-[family-name:var(--font-display)]">
                Hello-AgentR
              </p>
            </div>
          </div>

          <header className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] font-[family-name:var(--font-display)]">
              登录
            </h1>
            <p className="text-[13px] text-[#64748B]">使用运营账号进入管理后台</p>
          </header>

          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <div className="flex flex-col gap-4">
              {businessError ? (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 rounded-[10px] border border-[#DC26264D] bg-[#DC262626] px-3.5 py-3 text-[13px] font-medium text-[#DC2626]"
                >
                  <CircleAlert size={16} className="shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">{businessError}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <label htmlFor="login-username" className="text-[13px] font-medium text-[#334155]">
                  用户名
                </label>
                <div className="admin-input flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
                  <User size={16} className="shrink-0 text-[#64748B]" aria-hidden />
                  <input
                    id="login-username"
                    {...register('username')}
                    autoComplete="username"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
                    placeholder="请输入用户名"
                  />
                </div>
                {errors.username ? (
                  <span className="text-xs text-[#DC2626]">{errors.username.message}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="login-password" className="text-[13px] font-medium text-[#334155]">
                  密码
                </label>
                <div
                  className={
                    businessError
                      ? 'admin-input admin-input-error flex h-11 items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#DC2626] bg-[#FFFFFFD9] px-3.5'
                      : 'admin-input flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5'
                  }
                >
                  <Lock size={16} className="shrink-0 text-[#64748B]" aria-hidden />
                  <input
                    id="login-password"
                    {...passwordBox}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex shrink-0 items-center justify-center text-[#64748B] transition hover:text-[#334155]"
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden />
                    ) : (
                      <Eye size={16} aria-hidden />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <span className="text-xs text-[#DC2626]">{errors.password.message}</span>
                ) : null}
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-[13px] text-[#334155]">
              <input
                {...register('remember')}
                type="checkbox"
                className="h-4 w-4 rounded border border-[#FFFFFF66] bg-[#FFFFFFD9] text-[#2563EB] focus:ring-[#2563EB]"
              />
              记住我
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66] transition enabled:hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? '登录中…' : '登录'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
