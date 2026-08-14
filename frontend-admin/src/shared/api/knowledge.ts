import { apiRequest } from '@/shared/api/client'
import type {
  ChunkStrategy,
  ChunkStrategyParams,
  DocumentView,
  EmbeddingModelCatalogItem,
  KnowledgeBaseView,
  PageResult,
} from '@/shared/api/types'

export interface ListKnowledgeBasesQuery {
  page?: number
  pageSize?: number
  /** Name 模糊；契约没有 Namespace 筛选，故意不暴露该参数。 */
  name?: string
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string
  namespace: string
}

export interface UpdateKnowledgeBaseRequest {
  name: string
  /** 空字符串表示清空描述（与 PUT 契约一致）。 */
  description: string
}

export interface ListDocumentsQuery {
  page?: number
  pageSize?: number
  /** OriginalFilename 模糊；无 status / strategy / enabled 筛选。 */
  originalFilename?: string
}

export interface UploadDocumentInput {
  file: File
  chunkStrategy: ChunkStrategy
  /**
   * 结构化参数对象；此处序列化为 multipart 字段中的 JSON **字符串**
   *（与改策略 PUT 的 JSON 对象形态区分，对齐后端契约）。
   */
  chunkStrategyParams: ChunkStrategyParams
}

export interface UpdateChunkStrategyRequest {
  chunkStrategy: ChunkStrategy
  /** PUT 体为 JSON 对象（非整段字符串）。 */
  chunkStrategyParams: ChunkStrategyParams
  /** 可选；提交完整 OriginalFilename，后缀须与已存值一致。 */
  originalFilename?: string
}

export interface SetDocumentEnabledRequest {
  enabled: boolean
}

function buildListQuery(query: ListKnowledgeBasesQuery = {}): string {
  const params = new URLSearchParams()
  if (query.page !== undefined) {
    params.set('page', String(query.page))
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize))
  }
  if (query.name) {
    params.set('name', query.name)
  }
  const qs = params.toString()
  return qs ? `/admin/knowledge-bases?${qs}` : '/admin/knowledge-bases'
}

function buildDocumentsQuery(kbId: string, query: ListDocumentsQuery = {}): string {
  const params = new URLSearchParams()
  if (query.page !== undefined) {
    params.set('page', String(query.page))
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize))
  }
  if (query.originalFilename) {
    params.set('originalFilename', query.originalFilename)
  }
  const base = `/admin/knowledge-bases/${encodeURIComponent(kbId)}/documents`
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export async function listEmbeddingModels(): Promise<EmbeddingModelCatalogItem[]> {
  return apiRequest<EmbeddingModelCatalogItem[]>('/admin/embedding-models', { method: 'GET' })
}

export async function listKnowledgeBases(
  query: ListKnowledgeBasesQuery = {},
): Promise<PageResult<KnowledgeBaseView>> {
  return apiRequest<PageResult<KnowledgeBaseView>>(buildListQuery(query), {
    method: 'GET',
  })
}

export async function createKnowledgeBase(
  input: CreateKnowledgeBaseRequest,
): Promise<KnowledgeBaseView> {
  return apiRequest<KnowledgeBaseView>('/admin/knowledge-bases', {
    method: 'POST',
    body: input,
  })
}

export async function updateKnowledgeBase(
  id: string,
  input: UpdateKnowledgeBaseRequest,
): Promise<KnowledgeBaseView> {
  return apiRequest<KnowledgeBaseView>(
    `/admin/knowledge-bases/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: input,
    },
  )
}

export async function removeKnowledgeBase(id: string): Promise<void> {
  await apiRequest<null>(`/admin/knowledge-bases/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/** 详情：文档页面包屑 Name、刷新直达时解析库是否存在。 */
export async function getKnowledgeBase(id: string): Promise<KnowledgeBaseView> {
  return apiRequest<KnowledgeBaseView>(
    `/admin/knowledge-bases/${encodeURIComponent(id)}`,
    { method: 'GET' },
  )
}

export async function listDocuments(
  kbId: string,
  query: ListDocumentsQuery = {},
): Promise<PageResult<DocumentView>> {
  return apiRequest<PageResult<DocumentView>>(buildDocumentsQuery(kbId, query), {
    method: 'GET',
  })
}

export async function uploadDocument(
  kbId: string,
  input: UploadDocumentInput,
): Promise<DocumentView> {
  // Why FormData：上传契约是 multipart，且 chunkStrategyParams 必须是 JSON 字符串字段。
  const form = new FormData()
  form.append('file', input.file)
  form.append('chunkStrategy', input.chunkStrategy)
  form.append('chunkStrategyParams', JSON.stringify(input.chunkStrategyParams))

  return apiRequest<DocumentView>(
    `/admin/knowledge-bases/${encodeURIComponent(kbId)}/documents`,
    {
      method: 'POST',
      body: form,
    },
  )
}

export async function updateChunkStrategy(
  kbId: string,
  docId: string,
  input: UpdateChunkStrategyRequest,
): Promise<DocumentView> {
  return apiRequest<DocumentView>(
    `/admin/knowledge-bases/${encodeURIComponent(kbId)}/documents/${encodeURIComponent(docId)}/chunk-strategy`,
    {
      method: 'PUT',
      body: input,
    },
  )
}

export async function setDocumentEnabled(
  kbId: string,
  docId: string,
  input: SetDocumentEnabledRequest,
): Promise<DocumentView> {
  return apiRequest<DocumentView>(
    `/admin/knowledge-bases/${encodeURIComponent(kbId)}/documents/${encodeURIComponent(docId)}/enabled`,
    {
      method: 'PUT',
      body: input,
    },
  )
}

export async function deleteDocument(kbId: string, docId: string): Promise<void> {
  await apiRequest<null>(
    `/admin/knowledge-bases/${encodeURIComponent(kbId)}/documents/${encodeURIComponent(docId)}`,
    {
      method: 'DELETE',
    },
  )
}

export const knowledgeApi = {
  listEmbeddingModels,
  list: listKnowledgeBases,
  get: getKnowledgeBase,
  create: createKnowledgeBase,
  update: updateKnowledgeBase,
  remove: removeKnowledgeBase,
  listDocuments,
  uploadDocument,
  updateChunkStrategy,
  setDocumentEnabled,
  deleteDocument,
}
