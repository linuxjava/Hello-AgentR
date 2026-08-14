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

/** KnowledgeBase 列表/写回视图；V0.4 起含真实 documentCount（含已禁用 Document）。 */
export interface KnowledgeBaseView {
  id: string
  name: string
  description: string | null
  namespace: string
  embeddingModel: string
  /** 库下 Document 条数（含已禁用）；非切片数 / 索引状态。 */
  documentCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

/** Document 摄入状态；本阶段创建后为 UPLOADED，其余为后续预留。 */
export type DocumentStatus = 'UPLOADED' | 'CHUNKING' | 'CHUNKED' | 'FAILED'

export type ChunkStrategy = 'OVERLAPPING' | 'STRUCTURE_AWARE'

export type DocumentSourceType = 'LOCAL_FILE' | 'URL'

/** OVERLAPPING 参数（Unicode 字符计数；由前端组装后提交）。 */
export interface OverlappingChunkParams {
  chunkSize: number
  overlap: number
}

/** STRUCTURE_AWARE 参数。 */
export interface StructureAwareChunkParams {
  minChunkSize: number
  defaultChunkSize: number
  maxChunkSize: number
  overlap: number
}

export type ChunkStrategyParams = OverlappingChunkParams | StructureAwareChunkParams

/** Document 列表/写回视图；永不含 objectKey。 */
export interface DocumentView {
  id: string
  knowledgeBaseId: string
  originalFilename: string
  mediaType: string
  byteSize: number
  status: DocumentStatus
  enabled: boolean
  chunkStrategy: ChunkStrategy
  chunkStrategyParams: ChunkStrategyParams
  sourceType: DocumentSourceType
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
