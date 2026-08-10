import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  apiRequest,
  setTokenProvider,
  setUnauthorizedHandler,
} from '@/shared/api/client'
import { login, me } from '@/shared/api/auth'
import { ApiError, UNAUTHORIZED_CODE } from '@/shared/api/types'

describe('apiClient + authApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })

  it('login posts to /admin/auth/login without Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: {
          token: 'tok-1',
          profile: {
            id: '1',
            username: 'admin',
            role: 'ADMIN',
            bootstrap: true,
            createdAt: '2026-08-07T12:00:00.000+00:00',
          },
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await login({ username: 'admin', password: 'admin@123456' })

    expect(result.token).toBe('tok-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/auth/login')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    })
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    expect(JSON.parse(String(init.body))).toEqual({
      username: 'admin',
      password: 'admin@123456',
    })
  })

  it('me calls /admin/auth/me with Authorization token', async () => {
    setTokenProvider(() => 'session-token')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: {
          id: '1',
          username: 'admin',
          role: 'ADMIN',
          bootstrap: true,
          createdAt: '2026-08-07T12:00:00.000+00:00',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const profile = await me()

    expect(profile.username).toBe('admin')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/auth/me')
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>).Authorization).toBe('session-token')
  })

  it('invokes unauthorized handler on A000001', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setTokenProvider(() => 'expired')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          code: UNAUTHORIZED_CODE,
          message: '未登录或登录已过期',
          data: null,
        }),
      }),
    )

    await expect(apiRequest('/admin/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('throws ApiError with backend message on business failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          code: 'A001001',
          message: '用户名或密码错误',
          data: null,
        }),
      }),
    )

    await expect(login({ username: 'x', password: 'y' })).rejects.toMatchObject({
      code: 'A001001',
      message: '用户名或密码错误',
    })
  })
})
