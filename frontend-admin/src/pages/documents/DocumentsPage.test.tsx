import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DocumentsPage } from '@/pages/documents/DocumentsPage'
import { ApiError } from '@/shared/api/types'
import { useSessionStore } from '@/shared/auth/session-store'
import { clearToasts } from '@/shared/ui/toast-store'
import { ToastHost } from '@/shared/ui/ToastHost'

const getMock = vi.fn()
const listDocumentsMock = vi.fn()
const uploadDocumentMock = vi.fn()
const updateChunkStrategyMock = vi.fn()
const setDocumentEnabledMock = vi.fn()
const deleteDocumentMock = vi.fn()
const listUsersMock = vi.fn()

vi.mock('@/shared/api/knowledge', () => ({
  knowledgeApi: {
    get: (...args: unknown[]) => getMock(...args),
    listDocuments: (...args: unknown[]) => listDocumentsMock(...args),
    uploadDocument: (...args: unknown[]) => uploadDocumentMock(...args),
    updateChunkStrategy: (...args: unknown[]) => updateChunkStrategyMock(...args),
    setDocumentEnabled: (...args: unknown[]) => setDocumentEnabledMock(...args),
    deleteDocument: (...args: unknown[]) => deleteDocumentMock(...args),
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
  description: null,
  namespace: 'productdocs',
  embeddingModel: 'qwen3.7-text-embedding',
  documentCount: 1,
  createdBy: '1',
  createdAt: '2026-08-01T09:12:00.000+00:00',
  updatedAt: '2026-08-01T09:12:00.000+00:00',
}

const sampleDoc = {
  id: 'doc-1',
  knowledgeBaseId: 'kb-1',
  originalFilename: 'handbook.pdf',
  mediaType: 'application/pdf',
  byteSize: 1_258_291,
  status: 'UPLOADED' as const,
  enabled: true,
  chunkStrategy: 'OVERLAPPING' as const,
  chunkStrategyParams: { chunkSize: 400, overlap: 80 },
  sourceType: 'LOCAL_FILE' as const,
  createdBy: '1',
  createdAt: '2026-08-10T10:00:00.000+00:00',
  updatedAt: '2026-08-10T10:00:00.000+00:00',
}

function renderPage(path = '/knowledge-bases/kb-1/documents') {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={[path]}>
        <ToastHost />
        <Routes>
          <Route path="/knowledge-bases/:kbId/documents" element={<DocumentsPage />} />
          <Route path="/knowledge-bases" element={<div>KB_LIST</div>} />
        </Routes>
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

describe('DocumentsPage', () => {
  beforeEach(() => {
    getMock.mockReset()
    listDocumentsMock.mockReset()
    uploadDocumentMock.mockReset()
    updateChunkStrategyMock.mockReset()
    setDocumentEnabledMock.mockReset()
    deleteDocumentMock.mockReset()
    listUsersMock.mockReset()
    clearToasts()
    getMock.mockResolvedValue(sampleKb)
    listDocumentsMock.mockResolvedValue({
      page: 1,
      pageSize: 20,
      total: 1,
      records: [sampleDoc],
    })
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

  it('renders document columns with status and chunk placeholder', async () => {
    renderPage()
    expect(await screen.findByText('handbook.pdf')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('文件名')).toBeInTheDocument()
    expect(within(table).getByText('状态')).toBeInTheDocument()
    expect(within(table).getByText('分块数')).toBeInTheDocument()
    expect(within(table).getByText('启用')).toBeInTheDocument()
    expect(within(table).getByText('更新时间')).toBeInTheDocument()
    expect(within(table).getByText('操作')).toBeInTheDocument()
    expect(screen.getByText('待分块')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText(/PDF ·/)).toBeInTheDocument()
    expect(await within(table).findByText('admin')).toBeInTheDocument()
    expect(screen.queryByText('约 50MB')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上传文档' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '改策略' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('shows V-02 empty copy and keeps upload available', async () => {
    listDocumentsMock.mockResolvedValue({ page: 1, pageSize: 20, total: 0, records: [] })
    renderPage()
    expect(await screen.findByText('暂无文档')).toBeInTheDocument()
    expect(
      screen.getByText('该知识库下还没有任何文档。可点击右上角「上传文档」添加本地文件。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上传文档' })).toBeEnabled()
  })

  it('shows V-03 filter-empty hint', async () => {
    const user = userEvent.setup()
    listDocumentsMock.mockResolvedValue({ page: 1, pageSize: 20, total: 0, records: [] })
    renderPage()
    await screen.findByText('暂无文档')

    await user.type(screen.getByPlaceholderText('模糊搜索文件名'), 'xyz')
    await user.click(screen.getByRole('button', { name: '查询' }))

    expect(await screen.findByText('暂无匹配的文档')).toBeInTheDocument()
    expect(screen.queryByText('暂无文档')).not.toBeInTheDocument()
  })

  it('shows V-04 when knowledge base is missing', async () => {
    getMock.mockRejectedValue(new ApiError('A002001', '知识库不存在'))
    renderPage()
    expect(await screen.findByText('知识库不存在')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回知识库列表' })).toHaveAttribute(
      'href',
      '/knowledge-bases',
    )
    expect(screen.queryByRole('button', { name: '上传文档' })).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('uploads with default overlapping params and toasts success', async () => {
    const user = userEvent.setup()
    uploadDocumentMock.mockResolvedValue(sampleDoc)
    renderPage()
    await screen.findByText('handbook.pdf')

    await user.click(screen.getByRole('button', { name: '上传文档' }))
    const dialog = await screen.findByRole('dialog', { name: '上传文档' })
    expect(within(dialog).getByLabelText('分块大小')).toHaveValue('512')
    expect(within(dialog).getByLabelText('重叠长度')).toHaveValue('64')
    expect(within(dialog).getByRole('button', { name: '分块策略' }).querySelectorAll('svg')).toHaveLength(
      2,
    )
    expect(within(dialog).getByLabelText('分块大小').previousElementSibling?.tagName).toBe('svg')
    expect(within(dialog).getByLabelText('重叠长度').previousElementSibling?.tagName).toBe('svg')
    expect(within(dialog).queryByText(/50MB/)).not.toBeInTheDocument()
    expect(within(dialog).queryByText(/同名/)).not.toBeInTheDocument()

    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)
    expect(within(dialog).getByText('note.txt')).toBeInTheDocument()
    expect(within(dialog).getByText(/TXT ·/)).toBeInTheDocument()
    expect(within(dialog).getByText('拖拽替换，或点击重新选择')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: '上传' }))

    await waitFor(() => {
      expect(uploadDocumentMock).toHaveBeenCalledWith('kb-1', {
        file,
        chunkStrategy: 'OVERLAPPING',
        chunkStrategyParams: { chunkSize: 512, overlap: 64 },
      })
    })
    expect(await screen.findByText('上传成功')).toBeInTheDocument()
  })

  it('switches upload form to structure-aware defaults', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('handbook.pdf')
    await user.click(screen.getByRole('button', { name: '上传文档' }))
    const dialog = await screen.findByRole('dialog', { name: '上传文档' })

    await user.click(within(dialog).getByRole('button', { name: '分块策略' }))
    await user.click(await screen.findByRole('option', { name: '文档结构分块(建议MD文档使用)' }))

    expect(within(dialog).getByLabelText('最小分块大小')).toHaveValue('256')
    expect(within(dialog).getByLabelText('默认分块大小')).toHaveValue('512')
    expect(within(dialog).getByLabelText('最大分块大小')).toHaveValue('1024')
    expect(within(dialog).getByLabelText('重叠长度')).toHaveValue('32')
  })

  it('keeps upload open on validation and business errors', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('handbook.pdf')
    await user.click(screen.getByRole('button', { name: '上传文档' }))
    const dialog = await screen.findByRole('dialog', { name: '上传文档' })

    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    await user.upload(dialog.querySelector('input[type="file"]') as HTMLInputElement, file)
    await user.clear(within(dialog).getByLabelText('重叠长度'))
    await user.type(within(dialog).getByLabelText('重叠长度'), '512')
    await user.click(within(dialog).getByRole('button', { name: '上传' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('重叠长度须小于分块大小')
    expect(uploadDocumentMock).not.toHaveBeenCalled()

    await user.clear(within(dialog).getByLabelText('重叠长度'))
    await user.type(within(dialog).getByLabelText('重叠长度'), '64')
    uploadDocumentMock.mockRejectedValue(new ApiError('A002015', '对象存储不可用，请稍后重试。'))
    await user.click(within(dialog).getByRole('button', { name: '上传' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '对象存储不可用，请稍后重试。',
    )
    expect(screen.getByRole('dialog', { name: '上传文档' })).toBeInTheDocument()
  })

  it('does not prefix a leading zero when typing chunk numbers', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('handbook.pdf')
    await user.click(screen.getByRole('button', { name: '上传文档' }))
    const dialog = await screen.findByRole('dialog', { name: '上传文档' })
    const size = within(dialog).getByLabelText('分块大小')
    const overlap = within(dialog).getByLabelText('重叠长度')

    await user.clear(size)
    expect(size).toHaveValue('')
    await user.type(size, '111')
    expect(size).toHaveValue('111')

    await user.clear(overlap)
    expect(overlap).toHaveValue('')
    await user.type(overlap, '10')
    expect(overlap).toHaveValue('10')
  })

  it('prefills change-strategy from stored values', async () => {
    const user = userEvent.setup()
    updateChunkStrategyMock.mockResolvedValue({
      ...sampleDoc,
      chunkStrategyParams: { chunkSize: 400, overlap: 80 },
    })
    renderPage()
    await screen.findByText('handbook.pdf')
    await user.click(screen.getByRole('button', { name: '改策略' }))
    const dialog = await screen.findByRole('dialog', { name: '改策略' })
    expect(within(dialog).getByLabelText('文件名')).toHaveValue('handbook')
    expect(within(dialog).getByText('.pdf')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('分块大小')).toHaveValue('400')
    expect(within(dialog).getByLabelText('重叠长度')).toHaveValue('80')
    await user.clear(within(dialog).getByLabelText('文件名'))
    await user.type(within(dialog).getByLabelText('文件名'), '手册')
    await user.click(within(dialog).getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(updateChunkStrategyMock).toHaveBeenCalledWith('kb-1', 'doc-1', {
        chunkStrategy: 'OVERLAPPING',
        chunkStrategyParams: { chunkSize: 400, overlap: 80 },
        originalFilename: '手册.pdf',
      })
    })
    expect(await screen.findByText('保存成功')).toBeInTheDocument()
  })

  it('rejects empty filename stem without calling API', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('handbook.pdf')
    await user.click(screen.getByRole('button', { name: '改策略' }))
    const dialog = await screen.findByRole('dialog', { name: '改策略' })
    await user.clear(within(dialog).getByLabelText('文件名'))
    await user.click(within(dialog).getByRole('button', { name: '保存' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('请输入文件名')
    expect(updateChunkStrategyMock).not.toHaveBeenCalled()
  })

  it('toggles enabled immediately and rolls back on failure', async () => {
    const user = userEvent.setup()
    setDocumentEnabledMock.mockRejectedValue(new ApiError('A002009', '文档不存在'))
    renderPage()
    await screen.findByText('handbook.pdf')
    const toggle = screen.getByRole('switch', { name: '启用 handbook.pdf' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await user.click(toggle)
    expect(await screen.findByText('文档不存在')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: '启用 handbook.pdf' })).toHaveAttribute(
        'aria-checked',
        'true',
      )
    })
  })

  it('lets Staff delete documents without grey-out', async () => {
    const user = userEvent.setup()
    setStaffSession()
    deleteDocumentMock.mockResolvedValue(undefined)
    renderPage()
    await screen.findByText('handbook.pdf')
    const deleteBtn = screen.getByRole('button', { name: '删除' })
    expect(deleteBtn.className).not.toMatch(/opacity-70/)
    await user.click(deleteBtn)
    const dialog = await screen.findByRole('dialog', { name: '删除文档' })
    expect(within(dialog).getByText('确定删除该文档？')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: '确认删除' }))
    await waitFor(() => {
      expect(deleteDocumentMock).toHaveBeenCalledWith('kb-1', 'doc-1')
    })
    expect(await screen.findByText('删除成功')).toBeInTheDocument()
  })
})
