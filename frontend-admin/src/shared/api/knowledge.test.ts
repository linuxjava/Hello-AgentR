import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/types'
import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'
import {
  createKnowledgeBase,
  deleteDocument,
  listDocuments,
  listEmbeddingModels,
  listKnowledgeBases,
  removeKnowledgeBase,
  setDocumentEnabled,
  updateChunkStrategy,
  updateKnowledgeBase,
  uploadDocument,
} from '@/shared/api/knowledge'

const sampleKb = {
  id: 'kb-1',
  name: '产品手册',
  description: '面向运营的产品说明容器',
  namespace: 'productdocs',
  embeddingModel: 'qwen3.7-text-embedding',
  documentCount: 0,
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
  chunkStrategyParams: { chunkSize: 512, overlap: 64 },
  sourceType: 'LOCAL_FILE' as const,
  createdBy: '1',
  createdAt: '2026-08-13T11:20:00.000+00:00',
  updatedAt: '2026-08-13T11:20:00.000+00:00',
}

describe('knowledgeApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })

  it('listEmbeddingModels hits the catalog endpoint', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: [
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
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const models = await listEmbeddingModels()
    expect(models.map((m) => m.id)).toEqual([
      'qwen3.7-text-embedding',
      'Qwen/Qwen3-Embedding-8B',
    ])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/embedding-models')
    expect(init.method).toBe('GET')
  })

  it('listKnowledgeBases sends name fuzzy filter without namespace', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: { page: 1, pageSize: 20, total: 1, records: [sampleKb] },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const page = await listKnowledgeBases({ page: 1, pageSize: 20, name: '手册' })
    expect(page.records[0]?.namespace).toBe('productdocs')
    expect(page.records[0]?.documentCount).toBe(0)
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('/admin/knowledge-bases?')
    expect(url).toContain('page=1')
    expect(url).toContain('pageSize=20')
    expect(url).toContain('name=')
    expect(url).not.toContain('namespace=')
  })

  it('create / update / remove hit correct paths', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ code: '0', message: 'ok', data: sampleKb }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ code: '0', message: 'ok', data: sampleKb }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ code: '0', message: 'ok', data: null }),
      })
    vi.stubGlobal('fetch', fetchMock)

    await createKnowledgeBase({
      name: '产品手册',
      namespace: 'productdocs',
    })
    await updateKnowledgeBase('kb-1', { name: '产品手册', description: '' })
    await removeKnowledgeBase('kb-1')

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases',
    )
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('POST')
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1',
    )
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).method).toBe('PUT')
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1',
    )
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).method).toBe('DELETE')
  })

  it('maps business conflict code to ApiError message', async () => {
    setTokenProvider(() => 'tok-1')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          code: 'A002003',
          message: '名称已存在',
          data: null,
        }),
      }),
    )

    await expect(
      createKnowledgeBase({
        name: '产品手册',
        namespace: 'other',
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'A002003',
      message: '名称已存在',
    } satisfies Partial<ApiError>)
  })

  it('listDocuments filters by originalFilename only by default', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: { page: 1, pageSize: 20, total: 1, records: [sampleDoc] },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const page = await listDocuments('kb-1', {
      page: 1,
      pageSize: 20,
      originalFilename: 'hand',
    })
    expect(page.records[0]?.originalFilename).toBe('handbook.pdf')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('/admin/knowledge-bases/kb-1/documents?')
    expect(url).toContain('originalFilename=')
    expect(url).not.toContain('status=')
    expect(url).not.toContain('enabled=')
  })

  it('listDocuments appends status and enabled when set', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: { page: 1, pageSize: 20, total: 0, records: [] },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await listDocuments('kb-1', {
      page: 1,
      pageSize: 20,
      status: 'UPLOADED',
      enabled: false,
    })
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('status=UPLOADED')
    expect(url).toContain('enabled=false')
  })

  it('uploadDocument posts multipart without forcing JSON Content-Type', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ code: '0', message: 'ok', data: sampleDoc }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['pdf-bytes'], 'handbook.pdf', { type: 'application/pdf' })
    const doc = await uploadDocument('kb-1', {
      file,
      chunkStrategy: 'OVERLAPPING',
      chunkStrategyParams: { chunkSize: 512, overlap: 64 },
    })
    expect(doc.id).toBe('doc-1')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1/documents')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
    expect(headers.Authorization).toBe('tok-1')
    const form = init.body as FormData
    expect(form.get('chunkStrategy')).toBe('OVERLAPPING')
    expect(form.get('chunkStrategyParams')).toBe('{"chunkSize":512,"overlap":64}')
  })

  it('updateChunkStrategy / setDocumentEnabled / deleteDocument hit correct paths', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          code: '0',
          message: 'ok',
          data: {
            ...sampleDoc,
            chunkStrategy: 'STRUCTURE_AWARE',
            chunkStrategyParams: {
              minChunkSize: 256,
              defaultChunkSize: 512,
              maxChunkSize: 1024,
              overlap: 32,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          code: '0',
          message: 'ok',
          data: { ...sampleDoc, enabled: false },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ code: '0', message: 'ok', data: null }),
      })
    vi.stubGlobal('fetch', fetchMock)

    await updateChunkStrategy('kb-1', 'doc-1', {
      chunkStrategy: 'STRUCTURE_AWARE',
      chunkStrategyParams: {
        minChunkSize: 256,
        defaultChunkSize: 512,
        maxChunkSize: 1024,
        overlap: 32,
      },
      originalFilename: '手册.pdf',
    })
    await setDocumentEnabled('kb-1', 'doc-1', { enabled: false })
    await deleteDocument('kb-1', 'doc-1')

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1/documents/doc-1/chunk-strategy',
    )
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('PUT')
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1/documents/doc-1/enabled',
    )
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/knowledge-bases/kb-1/documents/doc-1',
    )
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).method).toBe('DELETE')
  })

  it('maps document upload business error message', async () => {
    setTokenProvider(() => 'tok-1')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          code: 'A002015',
          message: '对象存储不可用',
          data: null,
        }),
      }),
    )

    const file = new File(['x'], 'handbook.pdf', { type: 'application/pdf' })
    await expect(
      uploadDocument('kb-1', {
        file,
        chunkStrategy: 'OVERLAPPING',
        chunkStrategyParams: { chunkSize: 512, overlap: 64 },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      code: 'A002015',
      message: '对象存储不可用',
    } satisfies Partial<ApiError>)
  })
})
