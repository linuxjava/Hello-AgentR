import { Database, Pencil, Search, Trash2 } from 'lucide-react'
import type { KnowledgeBaseView } from '@/shared/api/types'
import { formatCreatedAt } from '@/shared/lib/display'
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
  embeddingModelDisplayMap: Record<string, string>
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
  embeddingModelDisplayMap,
  onPageChange,
  onEdit,
  onDelete,
}: KnowledgeBaseTableProps) {
  const showTableBody = !showLibraryEmpty && !showFilterEmpty

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      {/* Table wrap must not flex-grow, or pager sticks to the panel foot like a sticky footer. */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="h-11 border-b border-[#CBD5E159] bg-[#FFFFFF66] text-xs font-semibold text-[#64748B]">
              <th className="w-[15%] px-4">名称</th>
              <th className="w-[14%] px-4">命名空间</th>
              <th className="w-[24%] px-4">向量模型</th>
              <th className="w-[18%] px-4">描述</th>
              <th className="w-[15%] px-4">创建时间</th>
              <th className="w-[14%] min-w-[120px] px-4">操作</th>
            </tr>
          </thead>
          {showTableBody ? (
          <tbody>
            {loading && records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-[#64748B]">
                  加载中…
                </td>
              </tr>
            ) : null}
            {records.map((kb, index) => (
              <tr
                key={kb.id}
                className={[
                  'h-[52px] text-[13px] text-[#0F172A]',
                  index % 2 === 1
                    ? 'bg-[#FFFFFF14]'
                    : index + 1 < records.length && (index + 1) % 2 === 1
                      ? ''
                      : 'border-b border-[#CBD5E140]',
                ].join(' ')}
              >
                <td className="truncate px-4" title={kb.name}>
                  {kb.name}
                </td>
                <td className="truncate px-4 font-mono text-xs" title={kb.namespace}>
                  {kb.namespace}
                </td>
                <td
                  className="truncate px-4 font-mono text-xs"
                  title={embeddingModelDisplayMap[kb.embeddingModel] ?? kb.embeddingModel}
                >
                  {embeddingModelDisplayMap[kb.embeddingModel] ?? kb.embeddingModel}
                </td>
                <td className="truncate px-4 text-[#334155]" title={kb.description ?? undefined}>
                  {kb.description?.trim() ? kb.description : '—'}
                </td>
                <td className="truncate px-4">{formatCreatedAt(kb.createdAt)}</td>
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
            ))}
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
