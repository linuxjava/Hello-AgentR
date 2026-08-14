import type { AdminRole } from '@/shared/api/types'

export function roleLabel(role: AdminRole): string {
  return role === 'ADMIN' ? '管理员' : '运营人员'
}

export function avatarLetter(username: string): string {
  const trimmed = username.trim()
  if (!trimmed) {
    return '?'
  }
  return trimmed.charAt(0).toUpperCase()
}

export function formatCreatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

/**
 * createdBy 契约为 AdminUser id；有目录映射时展示 username，否则回退 id。
 * 副行弱化样式由调用方控制（对齐文件名副行）。
 */
export function formatCreatorLabel(
  createdBy: string,
  usernameById?: Record<string, string>,
): string {
  const trimmed = createdBy.trim()
  if (!trimmed) {
    return '—'
  }
  return usernameById?.[trimmed] ?? trimmed
}

/** 文档列表副行大小：人类可读字节。 */
export function formatByteSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  const mb = kb / 1024
  if (mb < 1024) {
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
  }
  const gb = mb / 1024
  return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)} GB`
}

/** mediaType → 可读标签（副行「类型 · 大小」）。 */
export function mediaTypeLabel(mediaType: string): string {
  const mt = mediaType.toLowerCase()
  if (mt.includes('pdf')) {
    return 'PDF'
  }
  if (mt.includes('markdown') || mt === 'text/x-markdown') {
    return 'Markdown'
  }
  if (mt.includes('word') || mt.includes('msword') || mt.includes('wordprocessingml')) {
    return 'Word'
  }
  if (mt.includes('excel') || mt.includes('spreadsheetml')) {
    return 'Excel'
  }
  if (mt.includes('powerpoint') || mt.includes('presentationml')) {
    return 'PPT'
  }
  if (mt.startsWith('image/')) {
    return '图片'
  }
  if (mt === 'text/plain') {
    return 'TXT'
  }
  if (mt.startsWith('text/')) {
    return '文本'
  }
  return mediaType || '文件'
}
