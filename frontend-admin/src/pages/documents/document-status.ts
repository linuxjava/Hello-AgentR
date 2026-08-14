import type { DocumentStatus } from '@/shared/api/types'

/**
 * 运营文案与后端枚举解耦：枚举值不变，列表/筛选用中文标签。
 * 待分块保持原词；处理中 / 已就绪 / 异常对齐运营参考图，不使用「排队中」。
 */
export const DOCUMENT_STATUS_LABEL = {
  UPLOADED: '待分块',
  CHUNKING: '处理中',
  CHUNKED: '已就绪',
  FAILED: '异常',
} as const satisfies Record<DocumentStatus, string>

/**
 * 毛玻璃胶囊：底/描边对齐行操作「删除」（`$glass-fill` / `$edge-dim`）；字色仍分状态。
 * 字色采样自运营参考图：已就绪青绿 / 处理中蓝 / 异常红 / 待分块橙。
 */
const DOCUMENT_STATUS_BADGE_CHROME = 'border border-[#FFFFFF66] bg-[#FFFFFF59]'

export const DOCUMENT_STATUS_BADGE_CLASS = {
  UPLOADED: `${DOCUMENT_STATUS_BADGE_CHROME} text-[#DE9139]`,
  CHUNKING: `${DOCUMENT_STATUS_BADGE_CHROME} text-[#4379ED]`,
  CHUNKED: `${DOCUMENT_STATUS_BADGE_CHROME} text-[#33A985]`,
  FAILED: `${DOCUMENT_STATUS_BADGE_CHROME} text-[#E04D4D]`,
} as const satisfies Record<DocumentStatus, string>

export function documentStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABEL[status]
}

export function documentStatusBadgeClass(status: DocumentStatus): string {
  return DOCUMENT_STATUS_BADGE_CLASS[status]
}
