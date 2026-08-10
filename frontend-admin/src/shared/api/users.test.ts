import { afterEach, describe, expect, it, vi } from 'vitest'
import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'
import {
  createUser,
  listUsers,
  removeUser,
  updateUserPassword,
  updateUserRole,
} from '@/shared/api/users'

describe('usersApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })

  it('listUsers sends page filters as query string', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: {
          page: 1,
          pageSize: 20,
          total: 1,
          records: [
            {
              id: '1',
              username: 'alice',
              role: 'STAFF',
              bootstrap: false,
              createdAt: '2026-07-12T14:22:00.000+00:00',
            },
          ],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const page = await listUsers({
      page: 1,
      pageSize: 20,
      username: 'ali',
      role: 'STAFF',
    })

    expect(page.total).toBe(1)
    expect(page.records[0]?.username).toBe('alice')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/admin/users?')
    expect(url).toContain('page=1')
    expect(url).toContain('pageSize=20')
    expect(url).toContain('username=ali')
    expect(url).toContain('role=STAFF')
    expect(init.method).toBe('GET')
  })

  it('createUser posts body to /admin/users', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        code: '0',
        message: 'ok',
        data: {
          id: '9',
          username: 'ops_1',
          role: 'STAFF',
          bootstrap: false,
          createdAt: '2026-08-07T12:00:00.000+00:00',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const created = await createUser({
      username: 'ops_1',
      password: 'Staff1234',
      role: 'STAFF',
    })

    expect(created.id).toBe('9')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:9898/hello-agent/admin/users')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      username: 'ops_1',
      password: 'Staff1234',
      role: 'STAFF',
    })
  })

  it('updateUserPassword / updateUserRole / removeUser hit correct paths', async () => {
    setTokenProvider(() => 'tok-1')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ code: '0', message: 'ok', data: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await updateUserPassword('u1', { newPassword: 'Reset1234' })
    await updateUserRole('u1', { role: 'ADMIN' })
    await removeUser('u1')

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/users/u1/password',
    )
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('PUT')
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/users/u1/role',
    )
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      'http://localhost:9898/hello-agent/admin/users/u1',
    )
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).method).toBe('DELETE')
  })
})
