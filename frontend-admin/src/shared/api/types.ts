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
