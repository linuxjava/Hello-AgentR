import { Database, Folder, Pencil, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import type { KnowledgeBaseView } from '@/shared/api/types'
import { formatCreatedAt, formatCreatorLabel } from '@/shared/lib/display'
import { Pagination } from '@/shared/ui/Pagination'

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'] as const

function TableEmptyHint({
  icon,
  title,
  description,
}: {
  icon: 'library' | 'filter'
  title: string
  description: string
}) {
  const Icon = icon === 'library' ? Database : Search
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] bg-[#CFFAFE] text-[#2563EB]">
        <Icon size={32} aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[22px] font-bold text-[#0F172A]">{title}</p>
        <p className="max-w-md text-sm text-[#64748B]">{description}</p>
      </div>
    </div>
  )
}

export interface KnowledgeBaseTableProps {
  records: KnowledgeBaseView[]
  loading: boolean
  showLibraryEmpty: boolean
  showFilterEmpty: boolean
  isAdmin: boolean
  page: number
  pageSize: number
  total: number
  /** embeddingModel id → 目录 providerId；缺目录时仅展示模型 id。 */
  embeddingModelProviderMap: Record<string, string>
  /** AdminUser id → username；缺映射时副行回退 id。 */
  usernameById?: Record<string, string>
  onPageChange: (page: number, pageSize: number) => void
  onEdit: (kb: KnowledgeBaseView) => void
  onDelete: (kb: KnowledgeBaseView) => void
}

export function KnowledgeBaseTable({
  records,
  loading,
  showLibraryEmpty,
  showFilterEmpty,
  isAdmin,
  page,
  pageSize,
  total,
  embeddingModelProviderMap,
  usernameById,
  onPageChange,
  onEdit,
  onDelete,
}: KnowledgeBaseTableProps) {
  const showTableBody = !showLibraryEmpty && !showFilterEmpty
  const colSpan = 7

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      {/* Table wrap must not flex-grow, or pager sticks to the panel foot like a sticky footer. */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="h-11 border-b border-[#CBD5E159] bg-[#FFFFFF66] text-xs font-semibold text-[#64748B]">
              <th className="w-[16%] px-4">名称</th>
              <th className="w-[12%] px-4">命名空间</th>
              <th className="w-[18%] px-4">向量模型</th>
              <th className="w-[8%] px-4">文档数</th>
              <th className="w-[16%] px-4">描述</th>
              <th className="w-[14%] px-4">更新时间</th>
              <th className="w-[16%] min-w-[120px] px-4">操作</th>
            </tr>
          </thead>
          {showTableBody ? (
            <tbody>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-sm text-[#64748B]">
                    加载中…
                  </td>
                </tr>
              ) : null}
              {records.map((kb, index) => {
                const provider = embeddingModelProviderMap[kb.embeddingModel]
                const modelTitle = provider
                  ? `${kb.embeddingModel} · ${provider}`
                  : kb.embeddingModel
                return (
                <tr
                  key={kb.id}
                  className={[
                    'h-[56px] text-[13px] text-[#0F172A]',
                    index % 2 === 1
                      ? 'bg-[#FFFFFF14]'
                      : index + 1 < records.length && (index + 1) % 2 === 1
                        ? ''
                        : 'border-b border-[#CBD5E140]',
                  ].join(' ')}
                >
                  <td className="px-4">
                    {/* Why Link on name：Pencil 定稿为点名称进文档列表，禁止单独「进入」按钮。 */}
                    <Link
                      to={`/knowledge-bases/${encodeURIComponent(kb.id)}/documents`}
                      state={{ kbName: kb.name }}
                      className="inline-flex max-w-full items-center gap-2 text-[#2563EB] hover:underline"
                      title={kb.name}
                    >
                      {/* Why 16 + primary：对齐 ui.pen「KB Icon」folder / $primary，非副文案灰。 */}
                      <Folder size={16} className="shrink-0 text-[#2563EB]" aria-hidden />
                      <span className="truncate">{kb.name}</span>
                    </Link>
                  </td>
                  <td className="truncate px-4 font-mono text-xs" title={kb.namespace}>
                    {kb.namespace}
                  </td>
                  <td className="px-4">
                    {/* Why 两行样式对齐更新时间列：主行 13px 正文色，副行 xs + fg-3；不再用 mono/11px。 */}
                    <div className="min-w-0" title={modelTitle}>
                      <p className="truncate text-[13px] text-[#0F172A]">
                        {kb.embeddingModel}
                      </p>
                      {provider ? (
                        <p className="truncate text-xs text-[#64748B]">{provider}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 tabular-nums">{kb.documentCount}</td>
                  <td className="truncate px-4 text-[#334155]" title={kb.description ?? undefined}>
                    {kb.description?.trim() ? kb.description : '—'}
                  </td>
                  <td className="px-4">
                    {/* Why 两行：与文档列表一致——主行更新时间，副行创建者弱化。 */}
                    <div
                      className="min-w-0"
                      title={`${formatCreatedAt(kb.updatedAt)} · ${formatCreatorLabel(kb.createdBy, usernameById)}`}
                    >
                      <p className="truncate text-[13px] text-[#0F172A]">
                        {formatCreatedAt(kb.updatedAt)}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {formatCreatorLabel(kb.createdBy, usernameById)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEdit(kb)}
                        className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155]"
                      >
                        <Pencil size={12} className="shrink-0" aria-hidden />
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(kb)}
                        className={[
                          'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium',
                          isAdmin
                            ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#334155]'
                            : 'cursor-pointer border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] opacity-70',
                        ].join(' ')}
                      >
                        <Trash2 size={12} className="shrink-0" aria-hidden />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          ) : null}
        </table>
        {showLibraryEmpty ? (
          <TableEmptyHint
            icon="library"
            title="暂无知识库"
            description="还没有任何知识库。可点击右上角「创建知识库」新建空容器。"
          />
        ) : null}
        {showFilterEmpty ? (
          <TableEmptyHint
            icon="filter"
            title="暂无匹配的知识库"
            description="没有名称包含该关键词的知识库。可修改筛选后再查询。"
          />
        ) : null}
      </div>

      {showLibraryEmpty || showFilterEmpty ? null : (
        <div className="flex w-full shrink-0">
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
