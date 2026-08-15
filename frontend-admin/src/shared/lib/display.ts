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

/** documentFormat → 可读标签（副行「类型 · 大小」）；展示具体格式，勿再解析 mediaType。 */
export function documentFormatLabel(documentFormat: string): string {
  switch (documentFormat) {
    case 'PDF':
      return 'PDF'
    case 'MARKDOWN':
      return 'Markdown'
    case 'DOC':
      return 'DOC'
    case 'DOCX':
      return 'DOCX'
    case 'XLS':
      return 'XLS'
    case 'XLSX':
      return 'XLSX'
    case 'PPT':
      return 'PPT'
    case 'PPTX':
      return 'PPTX'
    case 'PNG':
      return 'PNG'
    case 'JPEG':
      return 'JPEG'
    case 'SVG':
      return 'SVG'
    case 'TXT':
      return 'TXT'
    default:
      return documentFormat || '文件'
  }
}

/**
 * 上传弹窗本地预览：后端尚未返回 documentFormat 时，用扩展名猜测（仅 UI，不以之为权威）。
 */
export function guessDocumentFormat(file: File): string {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) {
    return 'PDF'
  }
  if (name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'MARKDOWN'
  }
  if (name.endsWith('.txt')) {
    return 'TXT'
  }
  if (name.endsWith('.doc')) {
    return 'DOC'
  }
  if (name.endsWith('.docx')) {
    return 'DOCX'
  }
  if (name.endsWith('.ppt')) {
    return 'PPT'
  }
  if (name.endsWith('.pptx')) {
    return 'PPTX'
  }
  if (name.endsWith('.xls')) {
    return 'XLS'
  }
  if (name.endsWith('.xlsx')) {
    return 'XLSX'
  }
  if (name.endsWith('.png')) {
    return 'PNG'
  }
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return 'JPEG'
  }
  if (name.endsWith('.svg')) {
    return 'SVG'
  }
  return ''
}
