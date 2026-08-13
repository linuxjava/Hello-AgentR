import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminShell } from '@/layout/AdminShell'
import { HomePage } from '@/pages/HomePage'
import { useSessionStore } from '@/shared/auth/session-store'

const logoutMock = vi.fn()

vi.mock('@/shared/api/auth', () => ({
  authApi: {
    logout: (...args: unknown[]) => logoutMock(...args),
    changePassword: vi.fn(),
    me: vi.fn(),
    login: vi.fn(),
  },
}))

function renderShell(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AdminShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/knowledge-bases" element={<div>KB_PAGE</div>} />
          <Route path="/users" element={<div>USERS_PAGE</div>} />
        </Route>
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminShell + HomePage', () => {
  beforeEach(() => {
    logoutMock.mockReset()
    logoutMock.mockResolvedValue(undefined)
    useSessionStore.setState({
      token: 'tok',
      status: 'authenticated',
      profile: {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        bootstrap: true,
        createdAt: '2026-08-07T12:00:00.000+00:00',
      },
    })
  })

  it('renders Pencil home placeholder and shell brand', () => {
    renderShell('/')
    expect(screen.getByText('Hello-AgentR')).toBeInTheDocument()
    expect(screen.getByText('管理控制台')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '首页占位' })).toBeInTheDocument()
    expect(
      screen.getByText('本阶段无业务内容。后续业务模块将挂载于此。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '面包屑' })).toHaveTextContent('首页')
  })

  it('keeps sidebar order home → knowledge bases → accounts', () => {
    renderShell('/')
    const nav = screen.getByRole('navigation', { name: '主导航' })
    const labels = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent)
    expect(labels).toEqual(['首页', '知识库管理', '账号管理'])
  })

  it('navigates to knowledge bases via sidebar', async () => {
    const user = userEvent.setup()
    renderShell('/')
    await user.click(screen.getByRole('link', { name: '知识库管理' }))
    expect(screen.getByText('KB_PAGE')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '面包屑' })).toHaveTextContent('知识库管理')
    expect(screen.getByRole('link', { name: '知识库管理' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('navigates to users via sidebar', async () => {
    const user = userEvent.setup()
    renderShell('/')
    await user.click(screen.getByRole('link', { name: '账号管理' }))
    expect(screen.getByText('USERS_PAGE')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '面包屑' })).toHaveTextContent('账号管理')
  })

  it('logs out from identity menu', async () => {
    const user = userEvent.setup()
    renderShell('/')
    await user.click(screen.getByRole('button', { name: /admin/i }))
    await user.click(screen.getByRole('menuitem', { name: '登出' }))
    expect(logoutMock).toHaveBeenCalled()
    expect(await screen.findByText('LOGIN_PAGE')).toBeInTheDocument()
  })
})
