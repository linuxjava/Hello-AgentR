import { keepPreviousData, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { KnowledgeBaseView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { usersApi } from '@/shared/api/users'
import { useSessionStore } from '@/shared/auth/session-store'
import { toastError, toastKbHasDocuments, toastKbNoDeletePermission } from '@/shared/ui/toast-store'
import { CreateKbModal } from '@/pages/knowledge-bases/CreateKbModal'
import { DeleteKbModal } from '@/pages/knowledge-bases/DeleteKbModal'
import { EditKbModal } from '@/pages/knowledge-bases/EditKbModal'
import { KnowledgeBaseTable } from '@/pages/knowledge-bases/KnowledgeBaseTable'

const DEFAULT_PAGE_SIZE = 20

function KnowledgeBasesPageInner() {
  const profile = useSessionStore((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'

  const [nameInput, setNameInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [createOpen, setCreateOpen] = useState(false)
  const [editKb, setEditKb] = useState<KnowledgeBaseView | null>(null)
  const [deleteKb, setDeleteKb] = useState<KnowledgeBaseView | null>(null)

  const query = useQuery({
    queryKey: ['admin-knowledge-bases', page, pageSize, appliedName],
    queryFn: async () =>
      knowledgeApi.list({
        page,
        pageSize,
        name: appliedName || undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const catalogQuery = useQuery({
    queryKey: ['admin-embedding-model-catalog'],
    queryFn: () => knowledgeApi.listEmbeddingModels(),
    retry: false,
  })
  // Why 拉用户目录：列表副行要展示创建者 username，契约 createdBy 仅有 AdminUser id。
  const usersDirectoryQuery = useQuery({
    queryKey: ['admin-users-directory'],
    queryFn: () => usersApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    if (!query.error) {
      return
    }
    const message =
      query.error instanceof ApiError ? query.error.message : '加载知识库列表失败'
    toastError(message)
  }, [query.error])

  const records = query.data?.records ?? []
  const total = query.data?.total ?? 0
  /** model id → providerId；列表两行展示，提供商作副行弱化。 */
  const embeddingModelProviderMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of catalogQuery.data ?? []) {
      map[item.id] = item.providerId
    }
    return map
  }, [catalogQuery.data])
  const usernameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const user of usersDirectoryQuery.data?.records ?? []) {
      map[user.id] = user.username
    }
    return map
  }, [usersDirectoryQuery.data])
  const showLibraryEmpty =
    !query.isLoading && !query.error && records.length === 0 && !appliedName
  const showFilterEmpty =
    !query.isLoading && !query.error && records.length === 0 && Boolean(appliedName)

  const onSearch = () => {
    setPage(1)
    setAppliedName(nameInput.trim())
  }

  const refresh = () => {
    void query.refetch()
  }

  const onDelete = (kb: KnowledgeBaseView) => {
    // Staff 灰显仍可点：前端拦截，避免误开 O-07；后端 DELETE 仍以 Admin 为准。
    if (!isAdmin) {
      toastKbNoDeletePermission()
      return
    }
    // Why Toast 而非灰显：Pencil 定稿有文档时删除外观与空库相同，用文案拦截。
    if (kb.documentCount > 0) {
      toastKbHasDocuments()
      return
    }
    setDeleteKb(kb)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="admin-input flex h-9 w-[220px] items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFF59] px-3">
            <Search size={14} className="text-[#64748B]" aria-hidden />
            <input
              id="filter-kb-name"
              aria-label="名称"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="模糊搜索名称"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#64748B]"
            />
          </div>
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
          onClick={() => setCreateOpen(true)}
          className="h-9 rounded-full bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66]"
        >
          创建知识库
        </button>
      </div>

      <KnowledgeBaseTable
        records={records}
        loading={query.isLoading}
        showLibraryEmpty={showLibraryEmpty}
        showFilterEmpty={showFilterEmpty}
        isAdmin={isAdmin}
        page={page}
        pageSize={pageSize}
        total={total}
        embeddingModelProviderMap={embeddingModelProviderMap}
        usernameById={usernameById}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage)
          setPageSize(nextPageSize)
        }}
        onEdit={setEditKb}
        onDelete={onDelete}
      />

      <CreateKbModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />
      {editKb ? (
        <EditKbModal
          key={editKb.id}
          open
          kb={editKb}
          onClose={() => setEditKb(null)}
          onSaved={refresh}
        />
      ) : null}
      <DeleteKbModal
        open={Boolean(deleteKb)}
        kb={deleteKb}
        onClose={() => setDeleteKb(null)}
        onDeleted={refresh}
      />
    </div>
  )
}

export function KnowledgeBasesPage() {
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
      <KnowledgeBasesPageInner />
    </QueryClientProvider>
  )
}
