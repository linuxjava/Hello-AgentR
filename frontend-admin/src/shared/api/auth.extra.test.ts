import { afterEach, describe, expect, it, vi } from 'vitest'
import { changePassword, logout } from '@/shared/api/auth'
import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'

describe('authApi logout / changePassword', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })

  it('logout posts to /admin/auth/logout with Authorization', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ code: '0', message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await logout()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/auth/logout')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('tok-1')
  })

  it('changePassword puts old/new password', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ code: '0', message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await changePassword({
      oldPassword: 'admin@123456',
      newPassword: 'NewPass1234',
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/auth/password')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(String(init.body))).toEqual({
      oldPassword: 'admin@123456',
      newPassword: 'NewPass1234',
    })
  })
})
