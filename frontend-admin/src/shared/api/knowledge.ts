import { apiRequest } from '@/shared/api/client'
import type {
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

export const knowledgeApi = {
  listEmbeddingModels,
  list: listKnowledgeBases,
  create: createKnowledgeBase,
  update: updateKnowledgeBase,
  remove: removeKnowledgeBase,
}
