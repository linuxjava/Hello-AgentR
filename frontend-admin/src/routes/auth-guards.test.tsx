import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GuestOnly } from '@/routes/GuestOnly'
import { RequireAuth } from '@/routes/RequireAuth'
import * as authApi from '@/shared/api/auth'
import { sessionStorageKeys } from '@/shared/auth/storage'
import { useSessionStore } from '@/shared/auth/session-store'

vi.mock('@/shared/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
  },
}))

describe('auth route guards', () => {
  beforeEach(() => {
    localStorage.clear()
    useSessionStore.setState({
      token: null,
      profile: null,
      status: 'idle',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('RequireAuth redirects to login when no token', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<div>PROTECTED</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('LOGIN')).toBeTruthy()
    expect(screen.queryByText('PROTECTED')).toBeNull()
  })

  it('RequireAuth redirects knowledge-bases to login when no token', async () => {
    render(
      <MemoryRouter initialEntries={['/knowledge-bases']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/knowledge-bases" element={<div>KB_PROTECTED</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('LOGIN')).toBeTruthy()
    expect(screen.queryByText('KB_PROTECTED')).toBeNull()
  })

  it('RequireAuth redirects to login when me fails', async () => {
    localStorage.setItem(sessionStorageKeys.TOKEN_KEY, 'bad')
    vi.mocked(authApi.authApi.me).mockRejectedValue(new Error('unauthorized'))

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<div>PROTECTED</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('LOGIN')).toBeTruthy()
    await waitFor(() => {
      expect(localStorage.getItem(sessionStorageKeys.TOKEN_KEY)).toBeNull()
    })
  })

  it('RequireAuth renders children when me succeeds', async () => {
    localStorage.setItem(sessionStorageKeys.TOKEN_KEY, 'good')
    vi.mocked(authApi.authApi.me).mockResolvedValue({
      id: '1',
      username: 'admin',
      role: 'ADMIN',
      bootstrap: true,
      createdAt: '2026-08-07T12:00:00.000+00:00',
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<div>PROTECTED</div>} />
          </Route>
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('PROTECTED')).toBeTruthy()
  })

  it('GuestOnly redirects authenticated users to home', async () => {
    localStorage.setItem(sessionStorageKeys.TOKEN_KEY, 'good')
    vi.mocked(authApi.authApi.me).mockResolvedValue({
      id: '1',
      username: 'admin',
      role: 'ADMIN',
      bootstrap: true,
      createdAt: '2026-08-07T12:00:00.000+00:00',
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<div>LOGIN</div>} />
          </Route>
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('HOME')).toBeTruthy()
  })
})
