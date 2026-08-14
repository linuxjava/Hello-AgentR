import { keepPreviousData, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AdminRole, AdminUserView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { usersApi } from '@/shared/api/users'
import { useSessionStore } from '@/shared/auth/session-store'
import { avatarLetter, formatCreatedAt, roleLabel } from '@/shared/lib/display'
import { Pagination } from '@/shared/ui/Pagination'
import { SelectMenu } from '@/shared/ui/SelectMenu'
import { toastNoPermission } from '@/shared/ui/toast-store'
import { CreateAccountModal } from '@/pages/users/CreateAccountModal'
import { DeleteAccountModal } from '@/pages/users/DeleteAccountModal'
import { EditAccountModal } from '@/pages/users/EditAccountModal'

const DEFAULT_PAGE_SIZE = 10

type RoleFilter = '' | AdminRole

function UsersPageInner() {
  const profile = useSessionStore((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'

  const [usernameInput, setUsernameInput] = useState('')
  const [roleInput, setRoleInput] = useState<RoleFilter>('')
  const [appliedUsername, setAppliedUsername] = useState('')
  const [appliedRole, setAppliedRole] = useState<RoleFilter>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUserView | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUserView | null>(null)

  const query = useQuery({
    queryKey: ['admin-users', page, pageSize, appliedUsername, appliedRole],
    queryFn: async () =>
      usersApi.list({
        page,
        pageSize,
        username: appliedUsername || undefined,
        role: appliedRole || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const records = query.data?.records ?? []
  const total = query.data?.total ?? 0
  const listError =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? '加载账号列表失败'
        : null

  const onSearch = () => {
    setPage(1)
    setAppliedUsername(usernameInput.trim())
    setAppliedRole(roleInput)
  }

  const onPaginationChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage)
    setPageSize(nextPageSize)
  }

  const refresh = () => {
    void query.refetch()
  }

  const guardWrite = (action: () => void) => {
    if (!isAdmin) {
      toastNoPermission()
      return
    }
    action()
  }

  const canDeleteTarget = (user: AdminUserView): boolean => {
    if (!profile) {
      return false
    }
    if (user.bootstrap) {
      return false
    }
    if (user.id === profile.id) {
      return false
    }
    return true
  }

  const deleteDisabledReason = (user: AdminUserView): string | null => {
    if (user.bootstrap) {
      return 'Bootstrap 账号不可删除'
    }
    if (profile && user.id === profile.id) {
      return '不能删除当前登录账号'
    }
    return null
  }

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="admin-input flex h-9 w-[220px] items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFF59] px-3">
            <Search size={14} className="text-[#64748B]" aria-hidden />
            <input
              id="filter-username"
              aria-label="用户名"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="模糊搜索用户名"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
            />
          </div>

          <SelectMenu
            id="filter-role"
            aria-label="角色"
            value={roleInput}
            onChange={(next) => setRoleInput(next as RoleFilter)}
            className="w-[160px]"
            triggerClassName="h-9 bg-[#FFFFFF59] px-3"
            options={[
              { value: '', label: '全部' },
              { value: 'ADMIN', label: '管理员' },
              { value: 'STAFF', label: '运营人员' },
            ]}
          />

          <button
            type="button"
            onClick={onSearch}
            className="h-9 rounded-full border border-[#FFFFFFCC] bg-[#FFFFFF59] px-4 text-sm font-medium text-[#0F172A]"
          >
            查询
          </button>
        </div>

        <button
          type="button"
          onClick={() => guardWrite(() => setCreateOpen(true))}
          className={[
            'h-9 rounded-full px-4 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66]',
            isAdmin ? 'bg-[#2563EB]' : 'bg-[#2563EB]/70',
          ].join(' ')}
        >
          创建账号
        </button>
      </div>

      {listError ? (
        <p role="alert" className="text-sm text-[#DC2626]">
          {listError}
        </p>
      ) : null}

      {/* Table + pager share one scroll flow so pager sits under the table, not page foot */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="h-11 border-b border-[#CBD5E159] bg-[#FFFFFF66] text-xs font-semibold text-[#64748B]">
              <th className="w-[18%] px-4">ID</th>
              <th className="w-[22%] px-4">用户名</th>
              <th className="w-[12%] px-4">角色</th>
              <th className="w-[22%] px-4">创建时间</th>
              <th className="w-[26%] px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading && records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-sm text-[#64748B]">
                  加载中…
                </td>
              </tr>
            ) : null}
            {!query.isLoading && records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-sm text-[#64748B]">
                  暂无账号
                </td>
              </tr>
            ) : null}
            {records.map((user, index) => {
              const deleteBlocked = !canDeleteTarget(user)
              const deleteReason = deleteDisabledReason(user)
              return (
                <tr
                  key={user.id}
                  className={[
                    'h-[52px] text-[13px] text-[#0F172A]',
                    // Zebra rows stay borderless; skip the previous row's bottom border too
                    // so even bands have no top/bottom hairlines.
                    index % 2 === 1
                      ? 'bg-[#FFFFFF14]'
                      : index + 1 < records.length && (index + 1) % 2 === 1
                        ? ''
                        : 'border-b border-[#CBD5E140]',
                  ].join(' ')}
                >
                  <td className="truncate px-4 font-mono text-xs" title={user.id}>
                    {user.id}
                  </td>
                  <td className="px-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white">
                        {avatarLetter(user.username)}
                      </span>
                      <span className="truncate">{user.username}</span>
                    </div>
                  </td>
                  <td className="truncate px-4">{roleLabel(user.role)}</td>
                  <td className="truncate px-4">{formatCreatedAt(user.createdAt)}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => guardWrite(() => setEditUser(user))}
                        className={[
                          'inline-flex h-7 items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155]',
                          isAdmin ? '' : 'opacity-50',
                        ].join(' ')}
                      >
                        <Pencil size={12} aria-hidden />
                        编辑
                      </button>
                      <button
                        type="button"
                        title={deleteReason ?? undefined}
                        disabled={isAdmin && deleteBlocked}
                        onClick={() => {
                          if (!isAdmin) {
                            toastNoPermission()
                            return
                          }
                          if (deleteBlocked) {
                            return
                          }
                          setDeleteUser(user)
                        }}
                        className={[
                          'inline-flex h-7 items-center gap-1.5 rounded-full border border-[#CBD5E1] px-2.5 text-xs font-medium',
                          isAdmin && !deleteBlocked
                            ? 'bg-[#F1F5F9] text-[#334155]'
                            : 'cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] opacity-70',
                          !isAdmin ? 'cursor-pointer bg-[#F1F5F9] opacity-50' : '',
                        ].join(' ')}
                      >
                        <Trash2 size={12} aria-hidden />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          </table>
        </div>

        <div className="flex w-full shrink-0">
          <Pagination page={page} total={total} pageSize={pageSize} onChange={onPaginationChange} />
        </div>
      </div>

      <CreateAccountModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />
      {editUser ? (
        <EditAccountModal
          key={editUser.id}
          open
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={refresh}
        />
      ) : null}
      <DeleteAccountModal
        open={Boolean(deleteUser)}
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onDeleted={refresh}
      />
    </div>
  )
}

export function UsersPage() {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  )

  return (
    <QueryClientProvider client={client}>
      <UsersPageInner />
    </QueryClientProvider>
  )
}
