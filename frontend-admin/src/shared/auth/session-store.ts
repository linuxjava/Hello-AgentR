import { create } from 'zustand'
import { authApi } from '@/shared/api/auth'
import { setTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'
import type { AdminUserView } from '@/shared/api/types'
import {
  clearToken,
  readToken,
  writeToken,
} from '@/shared/auth/storage'

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

interface SessionState {
  token: string | null
  profile: AdminUserView | null
  status: SessionStatus
  hydrate: () => Promise<void>
  setSession: (token: string, profile: AdminUserView) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  profile: null,
  status: 'idle',

  setSession: (token, profile) => {
    writeToken(token)
    set({ token, profile, status: 'authenticated' })
  },

  clearSession: () => {
    clearToken()
    set({ token: null, profile: null, status: 'anonymous' })
  },

  hydrate: async () => {
    const existing = readToken()
    if (!existing) {
      set({ token: null, profile: null, status: 'anonymous' })
      return
    }

    set({ token: existing, status: 'loading' })
    try {
      const profile = await authApi.me()
      if (get().token !== existing) {
        return
      }
      set({ profile, status: 'authenticated' })
    } catch {
      get().clearSession()
    }
  },
}))

let wired = false

/** Wire apiClient to session store once at app boot. */
export function wireSessionToApiClient(): void {
  if (wired) {
    return
  }
  wired = true
  setTokenProvider(() => useSessionStore.getState().token ?? readToken())
  setUnauthorizedHandler(() => {
    useSessionStore.getState().clearSession()
  })
}
