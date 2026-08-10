import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import { sessionStorageKeys } from '@/shared/auth/storage'
import { LoginPage } from './LoginPage'

const loginMock = vi.fn()

vi.mock('@/shared/api/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => loginMock(...args),
  },
}))

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>HOME_OK</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    localStorage.clear()
    useSessionStore.setState({ token: null, profile: null })
  })

  it('matches Pencil login card structure and copy', () => {
    renderLogin()
    expect(screen.getByText('Hello-AgentR')).toBeInTheDocument()
    expect(screen.getByText('HA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByText('使用运营账号进入管理后台')).toBeInTheDocument()
    expect(screen.getByLabelText('用户名')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByLabelText('记住我')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '显示密码' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLogin()

    const password = screen.getByLabelText('密码')
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: '显示密码' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: '隐藏密码' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '隐藏密码' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('shows field errors when required values are empty', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('请输入用户名')).toBeInTheDocument()
    expect(screen.getByText('请输入密码')).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('logs in successfully and navigates home', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue({
      token: 'tok-1',
      profile: {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        bootstrap: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    })

    renderLogin()
    await user.type(screen.getByLabelText('用户名'), 'admin')
    await user.type(screen.getByLabelText('密码'), 'secret')
    await user.click(screen.getByLabelText('记住我'))
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(screen.getByText('HOME_OK')).toBeInTheDocument()
    })
    expect(localStorage.getItem(sessionStorageKeys.TOKEN_KEY)).toBe('tok-1')
    expect(localStorage.getItem(sessionStorageKeys.REMEMBERED_USERNAME_KEY)).toBe(
      'admin',
    )
  })

  it('shows business error banner when login fails', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValue(new ApiError('A000001', '用户名或密码错误'))

    renderLogin()
    await user.type(screen.getByLabelText('用户名'), 'admin')
    await user.type(screen.getByLabelText('密码'), 'bad')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('用户名或密码错误')
  })
})
