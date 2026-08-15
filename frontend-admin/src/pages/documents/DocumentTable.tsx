import { FileText, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import type { DocumentView } from '@/shared/api/types'
import {
  documentStatusBadgeClass,
  documentStatusLabel,
} from '@/pages/documents/document-status'
import { formatByteSize, formatCreatedAt, formatCreatorLabel, documentFormatLabel } from '@/shared/lib/display'
import { Pagination } from '@/shared/ui/Pagination'

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'] as const

function TableEmptyHint({
  icon,
  title,
  description,
}: {
  icon: 'docs' | 'filter'
  title: string
  description: string
}) {
  const Icon = icon === 'docs' ? FileText : Search
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] bg-[#CFFAFE] text-[#2563EB]">
        <Icon size={32} aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[22px] font-bold text-[#0F172A] font-[family-name:var(--font-display)]">
          {title}
        </p>
        <p className="max-w-md text-sm text-[#64748B]">{description}</p>
      </div>
    </div>
  )
}

function EnabledSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-6 w-11 shrink-0 rounded-full transition',
        checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

export interface DocumentTableProps {
  records: DocumentView[]
  loading: boolean
  showLibraryEmpty: boolean
  showFilterEmpty: boolean
  page: number
  pageSize: number
  total: number
  pendingEnabledIds: Set<string>
  /** AdminUser id → username；缺映射时副行回退 id。 */
  usernameById?: Record<string, string>
  onPageChange: (page: number, pageSize: number) => void
  onToggleEnabled: (doc: DocumentView, enabled: boolean) => void
  onChangeStrategy: (doc: DocumentView) => void
  onDelete: (doc: DocumentView) => void
}

export function DocumentTable({
  records,
  loading,
  showLibraryEmpty,
  showFilterEmpty,
  page,
  pageSize,
  total,
  pendingEnabledIds,
  usernameById,
  onPageChange,
  onToggleEnabled,
  onChangeStrategy,
  onDelete,
}: DocumentTableProps) {
  const showTableBody = !showLibraryEmpty && !showFilterEmpty
  const showEmpty = showLibraryEmpty || showFilterEmpty
  const colSpan = 6

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      {/* Why：空态与表头同区，剩余高度 fill + 居中（对齐 ui.pen Empty State fill_container）。 */}
      <div className={showEmpty ? 'flex min-h-0 flex-1 flex-col' : 'w-full overflow-x-auto'}>
        <div className="w-full shrink-0 overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="h-11 border-b border-[#CBD5E159] bg-[#FFFFFF66] text-xs font-semibold text-[#64748B]">
                <th className="w-[28%] px-4">文件名</th>
                <th className="w-[12%] px-4">状态</th>
                <th className="w-[10%] px-4">分块数</th>
                <th className="w-[10%] px-4">启用</th>
                <th className="w-[18%] px-4">更新时间</th>
                <th className="w-[22%] min-w-[140px] px-4">操作</th>
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
                {records.map((doc, index) => {
                  const statusLabel = documentStatusLabel(doc.status)
                  const statusBadge = documentStatusBadgeClass(doc.status)
                  const typeSize = `${documentFormatLabel(doc.documentFormat)} · ${formatByteSize(doc.byteSize)}`
                  // 契约尚无 chunkCount：未分块一律「—」（本阶段创建后均为 UPLOADED）。
                  const chunkCountLabel = doc.status === 'CHUNKED' ? '—' : '—'
                  return (
                    <tr
                      key={doc.id}
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
                        {/* Why items-center：对齐 ui.pen Cell Filename（图标相对双行文字垂直居中）。 */}
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FileText size={16} className="shrink-0 text-[#334155]" aria-hidden />
                          <div className="min-w-0">
                            <p
                              className="truncate font-semibold text-[13px]"
                              title={doc.originalFilename}
                            >
                              {doc.originalFilename}
                            </p>
                            <p className="truncate text-xs text-[#64748B]" title={typeSize}>
                              {typeSize}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        {/* Why 毛玻璃：底/描边对齐行操作「删除」（$glass-fill / $edge-dim）；字色仍分状态。 */}
                        <span
                          className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 tabular-nums text-[#334155]">{chunkCountLabel}</td>
                      <td className="px-4">
                        <EnabledSwitch
                          checked={doc.enabled}
                          disabled={pendingEnabledIds.has(doc.id)}
                          label={`启用 ${doc.originalFilename}`}
                          onChange={(enabled) => onToggleEnabled(doc, enabled)}
                        />
                      </td>
                      <td className="px-4">
                        {/* Why 两行：对齐文件名列——主行更新时间，副行创建者弱化。 */}
                        <div
                          className="min-w-0"
                          title={`${formatCreatedAt(doc.updatedAt)} · ${formatCreatorLabel(doc.createdBy, usernameById)}`}
                        >
                          <p className="truncate text-[13px] text-[#334155]">
                            {formatCreatedAt(doc.updatedAt)}
                          </p>
                          <p className="truncate text-xs text-[#64748B]">
                            {formatCreatorLabel(doc.createdBy, usernameById)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onChangeStrategy(doc)}
                            className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155]"
                          >
                            {/* Why sliders-horizontal：Pencil「改策略 Icon」，非 pencil。 */}
                            <SlidersHorizontal size={12} className="shrink-0" aria-hidden />
                            改策略
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(doc)}
                            className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 text-xs font-medium text-[#334155]"
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
        </div>

        {showLibraryEmpty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <TableEmptyHint
              icon="docs"
              title="暂无文档"
              description="该知识库下还没有任何文档。可点击右上角「上传文档」添加本地文件。"
            />
          </div>
        ) : null}
        {showFilterEmpty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <TableEmptyHint
              icon="filter"
              title="暂无匹配的文档"
              description="没有符合筛选条件的文档。可修改筛选后再查询。"
            />
          </div>
        ) : null}
      </div>

      {showEmpty ? null : (
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
