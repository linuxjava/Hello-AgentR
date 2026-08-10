const TOKEN_KEY = 'admin.token'
const REMEMBERED_USERNAME_KEY = 'admin.rememberedUsername'

export function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function writeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function readRememberedUsername(): string | null {
  return localStorage.getItem(REMEMBERED_USERNAME_KEY)
}

export function writeRememberedUsername(username: string): void {
  localStorage.setItem(REMEMBERED_USERNAME_KEY, username)
}

export function clearRememberedUsername(): void {
  localStorage.removeItem(REMEMBERED_USERNAME_KEY)
}

export const sessionStorageKeys = {
  TOKEN_KEY,
  REMEMBERED_USERNAME_KEY,
} as const
