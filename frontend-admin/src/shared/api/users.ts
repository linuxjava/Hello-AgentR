import { apiRequest } from '@/shared/api/client'
import type { AdminRole, AdminUserView, PageResult } from '@/shared/api/types'

export interface ListUsersQuery {
  page?: number
  pageSize?: number
  username?: string
  role?: AdminRole
}

export interface CreateUserRequest {
  username: string
  password: string
  role: AdminRole
}

export interface UpdateUserPasswordRequest {
  newPassword: string
}

export interface UpdateUserRoleRequest {
  role: AdminRole
}

function buildUsersQuery(query: ListUsersQuery = {}): string {
  const params = new URLSearchParams()
  if (query.page !== undefined) {
    params.set('page', String(query.page))
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize))
  }
  if (query.username) {
    params.set('username', query.username)
  }
  if (query.role) {
    params.set('role', query.role)
  }
  const qs = params.toString()
  return qs ? `/admin/users?${qs}` : '/admin/users'
}

export async function listUsers(
  query: ListUsersQuery = {},
): Promise<PageResult<AdminUserView>> {
  return apiRequest<PageResult<AdminUserView>>(buildUsersQuery(query), {
    method: 'GET',
  })
}

export async function createUser(input: CreateUserRequest): Promise<AdminUserView> {
  return apiRequest<AdminUserView>('/admin/users', {
    method: 'POST',
    body: input,
  })
}

export async function updateUserPassword(
  id: string,
  input: UpdateUserPasswordRequest,
): Promise<void> {
  await apiRequest<null>(`/admin/users/${encodeURIComponent(id)}/password`, {
    method: 'PUT',
    body: input,
  })
}

export async function updateUserRole(
  id: string,
  input: UpdateUserRoleRequest,
): Promise<void> {
  await apiRequest<null>(`/admin/users/${encodeURIComponent(id)}/role`, {
    method: 'PUT',
    body: input,
  })
}

export async function removeUser(id: string): Promise<void> {
  await apiRequest<null>(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export const usersApi = {
  list: listUsers,
  create: createUser,
  updatePassword: updateUserPassword,
  updateRole: updateUserRole,
  remove: removeUser,
}
