import { apiRequest } from '@/shared/api/client'
import type { AdminUserView, LoginResult } from '@/shared/api/types'

export interface LoginRequest {
  username: string
  password: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export async function login(input: LoginRequest): Promise<LoginResult> {
  return apiRequest<LoginResult>('/admin/auth/login', {
    method: 'POST',
    body: input,
    anonymous: true,
  })
}

export async function me(): Promise<AdminUserView> {
  return apiRequest<AdminUserView>('/admin/auth/me', {
    method: 'GET',
  })
}

export async function logout(): Promise<void> {
  await apiRequest<null>('/admin/auth/logout', {
    method: 'POST',
  })
}

export async function changePassword(input: ChangePasswordRequest): Promise<void> {
  await apiRequest<null>('/admin/auth/password', {
    method: 'PUT',
    body: input,
  })
}

export const authApi = {
  login,
  me,
  logout,
  changePassword,
}
