import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { KnowledgeBasesPage } from '@/pages/knowledge-bases/KnowledgeBasesPage'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import {
  KB_HAS_DOCUMENTS_MESSAGE,
  KB_NO_DELETE_PERMISSION_MESSAGE,
  clearToasts,
} from '@/shared/ui/toast-store'
import { ToastHost } from '@/shared/ui/ToastHost'

const listMock = vi.fn()
const createMock = vi.fn()
const updateMock = vi.fn()
const removeMock = vi.fn()
const listEmbeddingModelsMock = vi.fn()
const listUsersMock = vi.fn()

vi.mock('@/shared/api/knowledge', () => ({
  knowledgeApi: {
    list: (...args: unknown[]) => listMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    remove: (...args: unknown[]) => removeMock(...args),
    listEmbeddingModels: (...args: unknown[]) => listEmbeddingModelsMock(...args),
  },
}))

vi.mock('@/shared/api/users', () => ({
  usersApi: {
    list: (...args: unknown[]) => listUsersMock(...args),
  },
}))

const sampleKb = {
  id: 'kb-1',
  name: '产品手册',
  description: '面向运营的产品说明容器',
  namespace: 'productdocs',
  embeddingModel: 'qwen3.7-text-embedding',
  documentCount: 3,
  createdBy: '1',
  createdAt: '2026-08-01T09:12:00.000+00:00',
  updatedAt: '2026-08-01T09:12:00.000+00:00',
}

const emptyDescKb = {
  ...sampleKb,
  id: 'kb-2',
  name: '空描述库',
  description: null,
  namespace: 'emptydesc',
  documentCount: 0,
}

function renderPage() {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter>
        <ToastHost />
        <KnowledgeBasesPage />
      </MemoryRouter>
    </ConfigProvider>,
  )
}

function setAdminSession() {
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
}

function setStaffSession() {
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
}

describe('KnowledgeBasesPage', () => {
  beforeEach(() => {
    listMock.mockReset()
    createMock.mockReset()
    updateMock.mockReset()
    removeMock.mockReset()
    listEmbeddingModelsMock.mockReset()
    listUsersMock.mockReset()
    clearToasts()
    listMock.mockResolvedValue({
      page: 1,
      pageSize: 20,
      total: 2,
      records: [sampleKb, emptyDescKb],
    })
    listEmbeddingModelsMock.mockResolvedValue([
      {
        id: 'qwen3.7-text-embedding',
        model: 'qwen3.7-text-embedding',
        dimension: 1024,
        providerId: 'alibailian',
        priority: 10,
        isDefault: true,
      },
      {
        id: 'Qwen/Qwen3-Embedding-8B',
        model: 'Qwen/Qwen3-Embedding-8B',
        dimension: 1024,
        providerId: 'siliconflow',
        priority: 20,
        isDefault: false,
      },
    ])
    listUsersMock.mockResolvedValue({
      page: 1,
      pageSize: 100,
      total: 1,
      records: [
        {
          id: '1',
          username: 'admin',
          role: 'ADMIN',
          bootstrap: true,
          createdAt: '2026-07-01T10:00:00.000+00:00',
        },
      ],
    })
    setAdminSession()
  })

  it('shows Pencil columns with documentCount and without ingest fake fields', async () => {
    renderPage()
    expect(await screen.findByText('产品手册')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('名称')).toBeInTheDocument()
    expect(within(table).getByText('命名空间')).toBeInTheDocument()
    expect(within(table).getByText('向量模型')).toBeInTheDocument()
    expect(within(table).getByText('文档数')).toBeInTheDocument()
    expect(within(table).getByText('描述')).toBeInTheDocument()
    expect(within(table).getByText('更新时间')).toBeInTheDocument()
    expect(within(table).getByText('操作')).toBeInTheDocument()
    expect(within(table).getByText('3')).toBeInTheDocument()
    expect(within(table).getByText('0')).toBeInTheDocument()
    expect(within(table).getAllByText('qwen3.7-text-embedding').length).toBeGreaterThan(0)
    expect(within(table).getAllByText('alibailian').length).toBeGreaterThan(0)
    expect(screen.queryByText(/alibailian\s*\/\s*qwen/)).not.toBeInTheDocument()
    expect(screen.queryByText('切片数')).not.toBeInTheDocument()
    expect(screen.queryByText('索引状态')).not.toBeInTheDocument()
    // 副行创建者：id→username 映射后展示 admin，不展示契约字段名
    expect(await within(table).findAllByText('admin')).toHaveLength(2)
    expect(screen.queryByText('createdBy')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('命名空间')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '进入' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('模糊搜索名称')).toBeInTheDocument()
    expect(screen.getByText('共 2 条')).toBeInTheDocument()
    expect(screen.getByText('20 条/页')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('links name to documents route', async () => {
    renderPage()
    const nameLink = await screen.findByRole('link', { name: /产品手册/ })
    expect(nameLink).toHaveAttribute('href', '/knowledge-bases/kb-1/documents')
  })

  it('toasts when Admin deletes a non-empty knowledge base', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('产品手册')

    await user.click(screen.getAllByRole('button', { name: '删除' })[0]!)
    expect(await screen.findByText(KB_HAS_DOCUMENTS_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '删除知识库' })).not.toBeInTheDocument()
  })

  it('opens delete confirm when Admin deletes an empty knowledge base', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('空描述库')

    await user.click(screen.getAllByRole('button', { name: '删除' })[1]!)
    expect(await screen.findByRole('dialog', { name: '删除知识库' })).toBeInTheDocument()
  })

  it('applies name fuzzy filter without namespace', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('产品手册')

    await user.type(screen.getByPlaceholderText('模糊搜索名称'), '手册')
    await user.click(screen.getByRole('button', { name: '查询' }))

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        name: '手册',
      })
    })
  })

  it('shows H-03 empty copy and keeps create available', async () => {
    listMock.mockResolvedValue({ page: 1, pageSize: 20, total: 0, records: [] })
    renderPage()
    expect(await screen.findByText('暂无知识库')).toBeInTheDocument()
    expect(
      screen.getByText('还没有任何知识库。可点击右上角「创建知识库」新建空容器。'),
    ).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('名称')).toBeInTheDocument()
    expect(within(table).getByText('命名空间')).toBeInTheDocument()
    expect(within(table).getByText('向量模型')).toBeInTheDocument()
    expect(within(table).getByText('描述')).toBeInTheDocument()
    expect(within(table).getByText('更新时间')).toBeInTheDocument()
    expect(within(table).getByText('操作')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '创建知识库' })).toBeEnabled()
    expect(screen.queryByText('20 条/页')).not.toBeInTheDocument()
  })

  it('shows H-04 filter-empty hint under headers', async () => {
    const user = userEvent.setup()
    listMock.mockResolvedValue({ page: 1, pageSize: 20, total: 0, records: [] })
    renderPage()
    await screen.findByText('暂无知识库')

    await user.type(screen.getByPlaceholderText('模糊搜索名称'), '123')
    await user.click(screen.getByRole('button', { name: '查询' }))

    expect(await screen.findByText('暂无匹配的知识库')).toBeInTheDocument()
    expect(
      screen.getByText('没有名称包含该关键词的知识库。可修改筛选后再查询。'),
    ).toBeInTheDocument()
    expect(screen.queryByText('暂无知识库')).not.toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('名称')).toBeInTheDocument()
    expect(within(table).getByText('操作')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '创建知识库' })).toBeEnabled()
    expect(screen.queryByText('20 条/页')).not.toBeInTheDocument()
  })

  it('toasts list errors without fabricating rows', async () => {
    listMock.mockRejectedValue(new ApiError('NETWORK', '加载知识库列表失败'))
    renderPage()
    expect(await screen.findByText('加载知识库列表失败')).toBeInTheDocument()
    expect(screen.queryByText('产品手册')).not.toBeInTheDocument()
  })

  it('lets Staff open create/edit but toasts on delete without DELETE', async () => {
    const user = userEvent.setup()
    setStaffSession()
    renderPage()
    await screen.findByText('产品手册')

    await user.click(screen.getByRole('button', { name: '创建知识库' }))
    expect(await screen.findByRole('dialog', { name: '创建知识库' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '取消' }))

    await user.click(screen.getAllByRole('button', { name: '编辑' })[0]!)
    expect(await screen.findByRole('dialog', { name: '编辑知识库' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '取消' }))

    await user.click(screen.getAllByRole('button', { name: '删除' })[0]!)
    expect(await screen.findByText(KB_NO_DELETE_PERMISSION_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '删除知识库' })).not.toBeInTheDocument()
    expect(removeMock).not.toHaveBeenCalled()
  })

  it('creates a knowledge base without showing embedding model field', async () => {
    const user = userEvent.setup()
    createMock.mockResolvedValue(sampleKb)
    renderPage()
    await screen.findByText('产品手册')

    await user.click(screen.getByRole('button', { name: '创建知识库' }))
    const dialog = await screen.findByRole('dialog', { name: '创建知识库' })
    expect(screen.queryByText('模拟目录，非生产模型')).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText('向量模型')).not.toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('名称'), '新品手册')
    await user.type(within(dialog).getByLabelText('命名空间'), 'newdocs')
    await user.click(within(dialog).getByRole('button', { name: '创建' }))

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        name: '新品手册',
        namespace: 'newdocs',
      })
    })
    expect(await screen.findByText('创建成功')).toBeInTheDocument()
  })

  it('keeps create dialog open on name conflict', async () => {
    const user = userEvent.setup()
    createMock.mockRejectedValue(new ApiError('A002003', '名称已存在'))
    renderPage()
    await screen.findByText('产品手册')

    await user.click(screen.getByRole('button', { name: '创建知识库' }))
    const dialog = await screen.findByRole('dialog', { name: '创建知识库' })
    await user.type(within(dialog).getByLabelText('名称'), '产品手册')
    await user.type(within(dialog).getByLabelText('命名空间'), 'otherns')
    await user.click(within(dialog).getByRole('button', { name: '创建' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('名称已存在')
    expect(screen.getByRole('dialog', { name: '创建知识库' })).toBeInTheDocument()
  })

  it('edits name/description without showing isolation keys', async () => {
    const user = userEvent.setup()
    updateMock.mockResolvedValue({ ...sampleKb, name: '修订手册', description: '' })
    renderPage()
    await screen.findByText('产品手册')

    await user.click(screen.getAllByRole('button', { name: '编辑' })[0]!)
    const dialog = await screen.findByRole('dialog', { name: '编辑知识库' })
    expect(within(dialog).queryByText('productdocs')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('qwen3.7-text-embedding')).not.toBeInTheDocument()
    expect(
      within(dialog).queryByText('命名空间与向量模型创建后不可修改，选错只能删库重建。'),
    ).not.toBeInTheDocument()
    expect(within(dialog).queryByText('命名空间')).not.toBeInTheDocument()
    expect(within(dialog).queryByText('向量模型')).not.toBeInTheDocument()
    await user.clear(within(dialog).getByLabelText('名称'))
    await user.type(within(dialog).getByLabelText('名称'), '修订手册')
    await user.clear(within(dialog).getByLabelText('描述'))
    await user.click(within(dialog).getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith('kb-1', {
        name: '修订手册',
        description: '',
      })
    })
  })

  it('shows hard-delete copy and keeps dialog on A002008', async () => {
    const user = userEvent.setup()
    removeMock.mockRejectedValue(new ApiError('A002008', '知识库下仍有文档，不能删除'))
    renderPage()
    await screen.findByText('空描述库')

    // 空库可打开 O-07；列表未刷新时后端仍可能返回 A002008（O-07a 兜底）。
    await user.click(screen.getAllByRole('button', { name: '删除' })[1]!)
    const dialog = await screen.findByRole('dialog', { name: '删除知识库' })
    expect(within(dialog).getByText('将执行彻底删除，且无法恢复。')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: '确认删除' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '知识库下仍有文档，不能删除',
    )
    expect(screen.getByRole('dialog', { name: '删除知识库' })).toBeInTheDocument()
  })
})
