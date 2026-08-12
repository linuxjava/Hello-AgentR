export type AdminRole = 'ADMIN' | 'STAFF'

export interface AdminUserView {
  id: string
  username: string
  role: AdminRole
  bootstrap: boolean
  createdAt: string
}

export interface LoginResult {
  token: string
  profile: AdminUserView
}

export interface PageResult<T> {
  page: number
  pageSize: number
  total: number
  records: T[]
}

/** EmbeddingModel 目录项（V0.3 配置驱动目录契约）。 */
export interface EmbeddingModelCatalogItem {
  id: string
  model: string
  dimension: number
  providerId: string
  priority: number
  isDefault: boolean
}

/** KnowledgeBase 列表/写回视图；不含文档数等摄入假字段（V0.2 契约）。 */
export interface KnowledgeBaseView {
  id: string
  name: string
  description: string | null
  namespace: string
  embeddingModel: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  code: string
  message: string
  data: T
  requestId?: string
}

export class ApiError extends Error {
  readonly code: string
  readonly requestId?: string

  constructor(code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.requestId = requestId
  }
}

export const UNAUTHORIZED_CODE = 'A000001'
export const SUCCESS_CODE = '0'
