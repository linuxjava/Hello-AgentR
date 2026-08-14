import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordModal } from '@/layout/ChangePasswordModal'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import { ToastHost } from '@/shared/ui/ToastHost'
import { clearToasts } from '@/shared/ui/toast-store'

const changePasswordMock = vi.fn()

vi.mock('@/shared/api/auth', () => ({
  authApi: {
    changePassword: (...args: unknown[]) => changePasswordMock(...args),
    logout: vi.fn(),
    me: vi.fn(),
    login: vi.fn(),
  },
}))

describe('ChangePasswordModal', () => {
  beforeEach(() => {
    changePasswordMock.mockReset()
    clearToasts()
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

  it('shows Pencil copy and clears session on success', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    changePasswordMock.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <ToastHost />
        <ChangePasswordModal open onClose={onClose} />
      </MemoryRouter>,
    )

    expect(screen.getByText('成功后需重新登录')).toBeInTheDocument()
    await user.type(screen.getByLabelText('当前密码'), 'admin@123456')
    await user.type(screen.getByLabelText('新密码'), 'NewPass1234')
    await user.type(screen.getByLabelText('确认新密码'), 'NewPass1234')
    await user.click(screen.getByRole('button', { name: '确认修改' }))

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalled()
    })
    expect(useSessionStore.getState().token).toBeNull()
  })

  it('shows business error in modal', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockRejectedValue(new ApiError('A001008', '旧密码错误'))

    render(
      <MemoryRouter>
        <ChangePasswordModal open onClose={() => undefined} />
      </MemoryRouter>,
    )
    await user.type(screen.getByLabelText('当前密码'), 'bad')
    await user.type(screen.getByLabelText('新密码'), 'NewPass1234')
    await user.type(screen.getByLabelText('确认新密码'), 'NewPass1234')
    await user.click(screen.getByRole('button', { name: '确认修改' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('旧密码错误')
    expect(useSessionStore.getState().token).toBe('tok')
  })
})
