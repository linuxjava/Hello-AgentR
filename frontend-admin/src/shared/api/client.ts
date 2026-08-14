import {
  ApiError,
  SUCCESS_CODE,
  UNAUTHORIZED_CODE,
  type ApiResponse,
} from '@/shared/api/types'

export type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }
  return base.replace(/\/$/, '')
}

export type TokenProvider = () => string | null

let tokenProvider: TokenProvider = () => null

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** When true, skip Authorization header (e.g. login). */
  anonymous?: boolean
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, signal } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  // FormData 必须让浏览器自带 multipart boundary；勿手动设 Content-Type。
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (!anonymous) {
    const token = tokenProvider()
    if (token) {
      headers.Authorization = token
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    signal,
    credentials: 'include',
  })

  let payload: ApiResponse<T>
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('NETWORK', `HTTP ${response.status}: invalid JSON response`)
  }

  if (payload.code === UNAUTHORIZED_CODE) {
    unauthorizedHandler?.()
    throw new ApiError(payload.code, payload.message, payload.requestId)
  }

  if (payload.code !== SUCCESS_CODE) {
    throw new ApiError(payload.code, payload.message, payload.requestId)
  }

  return payload.data
}
