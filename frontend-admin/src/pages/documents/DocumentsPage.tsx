import { keepPreviousData, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { CircleAlert, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import type { DocumentView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { usersApi } from '@/shared/api/users'
import { useDocBreadcrumbStore } from '@/layout/doc-breadcrumb-store'
import { toastError, toastSuccess } from '@/shared/ui/toast-store'
import { ChangeStrategyModal } from '@/pages/documents/ChangeStrategyModal'
import { DeleteDocumentModal } from '@/pages/documents/DeleteDocumentModal'
import { DocumentTable } from '@/pages/documents/DocumentTable'
import { UploadDocumentModal } from '@/pages/documents/UploadDocumentModal'

const DEFAULT_PAGE_SIZE = 20

function DocumentsPageInner() {
  const { kbId = '' } = useParams<{ kbId: string }>()
  const location = useLocation()
  const navKbName = (location.state as { kbName?: string } | null)?.kbName
  const setKbLabel = useDocBreadcrumbStore((s) => s.setKbLabel)

  const [filenameInput, setFilenameInput] = useState('')
  const [appliedFilename, setAppliedFilename] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [strategyDoc, setStrategyDoc] = useState<DocumentView | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<DocumentView | null>(null)
  const [pendingEnabledIds, setPendingEnabledIds] = useState<Set<string>>(() => new Set())
  /** 乐观更新开关；失败时回滚到服务端值。 */
  const [enabledOverrides, setEnabledOverrides] = useState<Record<string, boolean>>({})

  const kbQuery = useQuery({
    queryKey: ['admin-knowledge-base', kbId],
    queryFn: () => knowledgeApi.get(kbId),
    enabled: Boolean(kbId),
    retry: false,
  })

  const listQuery = useQuery({
    queryKey: ['admin-documents', kbId, page, pageSize, appliedFilename],
    queryFn: async () =>
      knowledgeApi.listDocuments(kbId, {
        page,
        pageSize,
        originalFilename: appliedFilename || undefined,
      }),
    enabled: Boolean(kbId) && kbQuery.isSuccess,
    placeholderData: keepPreviousData,
  })
  const usersDirectoryQuery = useQuery({
    queryKey: ['admin-users-directory'],
    queryFn: () => usersApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    retry: false,
  })
  const usernameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const user of usersDirectoryQuery.data?.records ?? []) {
      map[user.id] = user.username
    }
    return map
  }, [usersDirectoryQuery.data])

  const kbMissing =
    kbQuery.isError &&
    kbQuery.error instanceof ApiError &&
    kbQuery.error.code === 'A002001'

  useEffect(() => {
    if (kbMissing) {
      setKbLabel('知识库不存在')
      return
    }
    if (kbQuery.data?.name) {
      setKbLabel(kbQuery.data.name)
      return
    }
    if (navKbName) {
      setKbLabel(navKbName)
      return
    }
    setKbLabel(null)
  }, [kbMissing, kbQuery.data?.name, navKbName, setKbLabel])

  useEffect(() => {
    return () => {
      setKbLabel(null)
    }
  }, [setKbLabel])

  useEffect(() => {
    if (!listQuery.error) {
      return
    }
    const message =
      listQuery.error instanceof ApiError ? listQuery.error.message : '加载文档列表失败'
    toastError(message)
  }, [listQuery.error])

  useEffect(() => {
    if (!kbQuery.error || kbMissing) {
      return
    }
    const message =
      kbQuery.error instanceof ApiError ? kbQuery.error.message : '加载知识库失败'
    toastError(message)
  }, [kbQuery.error, kbMissing])

  const rawRecords = listQuery.data?.records ?? []
  const records = rawRecords.map((doc) =>
    enabledOverrides[doc.id] === undefined
      ? doc
      : { ...doc, enabled: enabledOverrides[doc.id]! },
  )
  const total = listQuery.data?.total ?? 0
  const showLibraryEmpty =
    kbQuery.isSuccess &&
    !listQuery.isLoading &&
    !listQuery.error &&
    records.length === 0 &&
    !appliedFilename
  const showFilterEmpty =
    kbQuery.isSuccess &&
    !listQuery.isLoading &&
    !listQuery.error &&
    records.length === 0 &&
    Boolean(appliedFilename)

  const onSearch = () => {
    setPage(1)
    setAppliedFilename(filenameInput.trim())
  }

  const refresh = () => {
    void listQuery.refetch()
    void kbQuery.refetch()
  }

  const onToggleEnabled = async (doc: DocumentView, enabled: boolean) => {
    setPendingEnabledIds((prev) => new Set(prev).add(doc.id))
    setEnabledOverrides((prev) => ({ ...prev, [doc.id]: enabled }))
    try {
      await knowledgeApi.setDocumentEnabled(kbId, doc.id, { enabled })
      toastSuccess(enabled ? '已启用' : '已禁用')
      setEnabledOverrides((prev) => {
        const next = { ...prev }
        delete next[doc.id]
        return next
      })
      void listQuery.refetch()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '更新启用状态失败'
      toastError(message)
      setEnabledOverrides((prev) => {
        const next = { ...prev }
        delete next[doc.id]
        return next
      })
    } finally {
      setPendingEnabledIds((prev) => {
        const next = new Set(prev)
        next.delete(doc.id)
        return next
      })
    }
  }

  if (kbMissing) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] bg-[#FEE2E2] text-[#DC2626]">
          <CircleAlert size={32} aria-hidden />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[22px] font-bold text-[#0F172A]">知识库不存在</p>
          <p className="max-w-md text-sm text-[#64748B]">
            该知识库不存在或已被删除。请返回知识库列表后重试。
          </p>
        </div>
        <Link
          to="/knowledge-bases"
          className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66]"
        >
          返回知识库列表
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-[240px] items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFF59] px-3">
            <Search size={14} className="text-[#64748B]" aria-hidden />
            <input
              id="filter-doc-filename"
              aria-label="文件名"
              value={filenameInput}
              onChange={(e) => setFilenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch()
                }
              }}
              placeholder="模糊搜索文件名"
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
          onClick={() => setUploadOpen(true)}
          disabled={!kbQuery.isSuccess}
          className="h-9 rounded-full bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_#2563EB66] disabled:opacity-60"
        >
          上传文档
        </button>
      </div>

      <DocumentTable
        records={records}
        loading={listQuery.isLoading || kbQuery.isLoading}
        showLibraryEmpty={showLibraryEmpty}
        showFilterEmpty={showFilterEmpty}
        page={page}
        pageSize={pageSize}
        total={total}
        pendingEnabledIds={pendingEnabledIds}
        usernameById={usernameById}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage)
          setPageSize(nextPageSize)
        }}
        onToggleEnabled={(doc, enabled) => {
          void onToggleEnabled(doc, enabled)
        }}
        onChangeStrategy={setStrategyDoc}
        onDelete={setDeleteDoc}
      />

      {uploadOpen ? (
        <UploadDocumentModal
          kbId={kbId}
          onClose={() => setUploadOpen(false)}
          onUploaded={refresh}
        />
      ) : null}
      {strategyDoc ? (
        <ChangeStrategyModal
          key={strategyDoc.id}
          kbId={kbId}
          doc={strategyDoc}
          onClose={() => setStrategyDoc(null)}
          onSaved={refresh}
        />
      ) : null}
      <DeleteDocumentModal
        open={Boolean(deleteDoc)}
        kbId={kbId}
        doc={deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onDeleted={refresh}
      />
    </div>
  )
}

export function DocumentsPage() {
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
      <DocumentsPageInner />
    </QueryClientProvider>
  )
}
