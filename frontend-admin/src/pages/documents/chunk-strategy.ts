import type { ChunkStrategy, ChunkStrategyParams } from '@/shared/api/types'

export const STRATEGY_OPTIONS = [
  { value: 'OVERLAPPING', label: '重叠分块' },
  { value: 'STRUCTURE_AWARE', label: '基于文档结构的分块' },
] as const

/** 上传默认值（O-08）；切种类时整份替换。 */
export function defaultParamsFor(strategy: ChunkStrategy): ChunkStrategyParams {
  if (strategy === 'STRUCTURE_AWARE') {
    return {
      minChunkSize: 256,
      defaultChunkSize: 512,
      maxChunkSize: 1024,
      overlap: 32,
    }
  }
  return { chunkSize: 512, overlap: 64 }
}

export function isOverlappingParams(
  params: ChunkStrategyParams,
): params is { chunkSize: number; overlap: number } {
  return 'chunkSize' in params
}

/**
 * 前端策略数字校验（与 IXD 一致）；返回用户可见红条文案，合法则 null。
 * Why 不标单位：Pencil 字段旁禁止单位，错误文案也不带「字符」等单位词。
 */
export function validateChunkParams(
  strategy: ChunkStrategy,
  params: ChunkStrategyParams,
): string | null {
  if (strategy === 'OVERLAPPING') {
    if (!isOverlappingParams(params)) {
      return '参数不完整'
    }
    const { chunkSize, overlap } = params
    if (!(chunkSize > 0) || !Number.isFinite(chunkSize)) {
      return '分块大小须大于 0'
    }
    if (!Number.isFinite(overlap) || overlap < 0) {
      return '重叠长度须大于等于 0'
    }
    if (!(overlap < chunkSize)) {
      return '重叠长度须小于分块大小'
    }
    return null
  }

  if (isOverlappingParams(params)) {
    return '参数不完整'
  }
  const { minChunkSize, defaultChunkSize, maxChunkSize, overlap } = params
  if (
    !(minChunkSize > 0) ||
    !(defaultChunkSize > 0) ||
    !(maxChunkSize > 0) ||
    !Number.isFinite(minChunkSize) ||
    !Number.isFinite(defaultChunkSize) ||
    !Number.isFinite(maxChunkSize)
  ) {
    return '分块大小须大于 0'
  }
  if (!(minChunkSize <= defaultChunkSize && defaultChunkSize <= maxChunkSize)) {
    return '须满足最小 ≤ 默认 ≤ 最大'
  }
  if (!Number.isFinite(overlap) || overlap < 0) {
    return '重叠长度须大于等于 0'
  }
  if (!(overlap < minChunkSize)) {
    return '重叠长度须小于最小分块大小'
  }
  return null
}

export function parsePositiveInt(raw: string): number {
  const n = Number(raw.trim())
  return Number.isFinite(n) ? n : Number.NaN
}
