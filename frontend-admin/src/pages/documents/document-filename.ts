/** OriginalFilename 主名 / 后缀拆分；改策略只允许改主名。 */

export const ORIGINAL_FILENAME_MAX_LENGTH = 512

export function splitOriginalFilename(filename: string): { stem: string; suffix: string } {
  const trimmed = filename.trim()
  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot <= 0) {
    return { stem: trimmed, suffix: '' }
  }
  return {
    stem: trimmed.slice(0, lastDot),
    suffix: trimmed.slice(lastDot),
  }
}

export function composeOriginalFilename(stem: string, suffix: string): string {
  return `${stem.trim()}${suffix}`
}

function hasIllegalFilenameChar(value: string): boolean {
  for (const ch of value) {
    const code = ch.charCodeAt(0)
    if (ch === '/' || ch === '\\' || ch === ':' || code < 32 || code === 127) {
      return true
    }
  }
  return false
}

/**
 * 主名校验。后缀由调用方锁定，不在此重写。
 * 返回红条文案，合法则 null。
 */
export function validateFilenameStem(stem: string, suffix: string): string | null {
  const trimmed = stem.trim()
  if (!trimmed) {
    return '请输入文件名'
  }
  if (hasIllegalFilenameChar(trimmed)) {
    return '文件名不能包含 / \\ :'
  }
  if (composeOriginalFilename(trimmed, suffix).length > ORIGINAL_FILENAME_MAX_LENGTH) {
    return '文件名不符合规则'
  }
  return null
}
