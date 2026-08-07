import {
  clearRememberedUsername,
  readRememberedUsername,
  writeRememberedUsername,
} from '@/shared/auth/storage'

export function getRememberedUsername(): string {
  return readRememberedUsername() ?? ''
}

export function persistRememberUsername(remember: boolean, username: string): void {
  if (remember) {
    writeRememberedUsername(username)
    return
  }
  clearRememberedUsername()
}
