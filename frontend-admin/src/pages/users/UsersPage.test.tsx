import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UsersPage } from '@/pages/users/UsersPage'
import { useSessionStore } from '@/shared/auth/session-store'
import { NO_PERMISSION_MESSAGE, clearToasts } from '@/shared/ui/toast-store'
import { ToastHost } from '@/shared/ui/ToastHost'

const listMock = vi.fn()
const createMock = vi.fn()
const updateRoleMock = vi.fn()
const updatePasswordMock = vi.fn()
const removeMock = vi.fn()

vi.mock('@/shared/api/users', () => ({
  usersApi: {
    list: (...args: unknown[]) => listMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    updateRole: (...args: unknown[]) => updateRoleMock(...args),
    updatePassword: (...args: unknown[]) => updatePasswordMock(...args),
    remove: (...args: unknown[]) => removeMock(...args),
  },
}))

const sampleUsers = [
  {
    id: '1',
    username: 'admin',
    role: 'ADMIN' as const,
    bootstrap: true,
    createdAt: '2026-07-01T10:00:00.000+00:00',
  },
  {
    id: '2',
    username: 'alice',
    role: 'STAFF' as const,
    bootstrap: false,
    createdAt: '2026-07-12T14:22:00.000+00:00',
  },
]

function renderUsers() {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter>
        <ToastHost />
        <UsersPage />
      </MemoryRouter>
    </ConfigProvider>,
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    listMock.mockReset()
    createMock.mockReset()
    updateRoleMock.mockReset()
    updatePasswordMock.mockReset()
    removeMock.mockReset()
    clearToasts()
    listMock.mockResolvedValue({
      page: 1,
      pageSize: 10,
      total: 2,
      records: sampleUsers,
    })
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

  it('loads list and shows Pencil columns without bootstrap', async () => {
    renderUsers()
    expect(await screen.findByText('alice')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('ID')).toBeInTheDocument()
    expect(within(table).getByText('用户名')).toBeInTheDocument()
    expect(within(table).getByText('角色')).toBeInTheDocument()
    expect(within(table).getByText('创建时间')).toBeInTheDocument()
    expect(within(table).getByText('操作')).toBeInTheDocument()
    expect(screen.queryByText('Bootstrap')).not.toBeInTheDocument()
    expect(screen.getByText('共 2 条')).toBeInTheDocument()
    expect(screen.getByText('10 条/页')).toBeInTheDocument()
  })

  it('navigates by clicking a page number', async () => {
    const user = userEvent.setup()
    listMock.mockResolvedValue({
      page: 1,
      pageSize: 10,
      total: 12,
      records: sampleUsers,
    })
    renderUsers()
    await screen.findByText('alice')

    const pagination = screen.getByRole('list')
    await user.click(within(pagination).getByText('2'))

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 10,
        username: undefined,
        role: undefined,
      })
    })
  })

  it('applies username and role filters on query', async () => {
    const user = userEvent.setup()
    renderUsers()
    await screen.findByText('alice')

    await user.type(screen.getByPlaceholderText('模糊搜索用户名'), 'ali')
    await user.click(screen.getByRole('button', { name: '角色' }))
    await user.click(screen.getByRole('option', { name: '运营人员' }))
    await user.click(screen.getByRole('button', { name: '查询' }))

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        username: 'ali',
        role: 'STAFF',
      })
    })
  })

  it('shows no-permission toast for Staff write actions', async () => {
    const user = userEvent.setup()
    useSessionStore.setState({
      token: 'tok',
      status: 'authenticated',
      profile: {
        id: '2',
        username: 'alice',
        role: 'STAFF',
        bootstrap: false,
        createdAt: '2026-07-12T14:22:00.000+00:00',
      },
    })
    renderUsers()
    await screen.findByText('alice')

    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(await screen.findByText(NO_PERMISSION_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '创建账号' })).not.toBeInTheDocument()
  })

  it('disables delete for bootstrap target as Admin', async () => {
    renderUsers()
    await screen.findByText('admin')
    const deleteButtons = screen.getAllByRole('button', { name: '删除' })
    expect(deleteButtons[0]).toBeDisabled()
  })

  it('opens create modal for Admin and submits', async () => {
    const user = userEvent.setup()
    createMock.mockResolvedValue({
      id: '9',
      username: 'ops_1',
      role: 'STAFF',
      bootstrap: false,
      createdAt: '2026-08-07T12:00:00.000+00:00',
    })
    renderUsers()
    await screen.findByText('alice')

    await user.click(screen.getByRole('button', { name: '创建账号' }))
    const dialog = await screen.findByRole('dialog', { name: '创建账号' })
    await user.type(within(dialog).getByLabelText('用户名'), 'ops_1')
    await user.type(within(dialog).getByLabelText('密码'), 'Staff1234')
    await user.click(within(dialog).getByRole('button', { name: '创建' }))

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        username: 'ops_1',
        password: 'Staff1234',
        role: 'STAFF',
      })
    })
  })
})
