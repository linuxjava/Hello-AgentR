import { GitCompare, Hash, Layers } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ChunkStrategy, ChunkStrategyParams } from '@/shared/api/types'
import { SelectMenu } from '@/shared/ui/SelectMenu'
import {
  defaultParamsFor,
  isOverlappingParams,
  parsePositiveInt,
  STRATEGY_OPTIONS,
} from '@/pages/documents/chunk-strategy'

export interface ChunkStrategyFormProps {
  strategy: ChunkStrategy
  params: ChunkStrategyParams
  disabled?: boolean
  onStrategyChange: (strategy: ChunkStrategy, params: ChunkStrategyParams) => void
  onParamsChange: (params: ChunkStrategyParams) => void
}

const fieldIconClass = 'shrink-0 text-[#64748B]'

function NumberField({
  id,
  label,
  value,
  disabled,
  icon,
  onChange,
}: {
  id: string
  label: string
  value: number
  disabled?: boolean
  icon: ReactNode
  onChange: (n: number) => void
}) {
  const onInputChange = (raw: string) => {
    if (raw === '') {
      onChange(Number.NaN)
      return
    }
    if (!/^\d+$/.test(raw)) {
      return
    }
    onChange(parsePositiveInt(raw))
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <div
        className={[
          'flex h-11 items-center gap-2.5 rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        {icon}
        <input
          id={id}
          // Why type=text：type=number 下 0111 与 111 数值相等，React 不回写 DOM，前导 0 残留。
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={Number.isFinite(value) ? String(value) : ''}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none"
        />
      </div>
    </div>
  )
}

/** 上传 / 改策略共用：结构化字段，禁止 JSON 文本框，字段旁不标单位。 */
export function ChunkStrategyForm({
  strategy,
  params,
  disabled,
  onStrategyChange,
  onParamsChange,
}: ChunkStrategyFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <SelectMenu
        id="chunk-strategy"
        label="分块策略"
        icon={<Layers size={16} className={fieldIconClass} aria-hidden />}
        value={strategy}
        options={[...STRATEGY_OPTIONS]}
        disabled={disabled}
        onChange={(value) => {
          const next = value as ChunkStrategy
          // Why 整份替换：切种类不得混入旧种类字段（IXD O-08a / O-09）。
          onStrategyChange(next, defaultParamsFor(next))
        }}
      />

      {strategy === 'OVERLAPPING' && isOverlappingParams(params) ? (
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="chunk-size"
            label="分块大小"
            icon={<Hash size={16} className={fieldIconClass} aria-hidden />}
            value={params.chunkSize}
            disabled={disabled}
            onChange={(chunkSize) => onParamsChange({ ...params, chunkSize })}
          />
          <NumberField
            id="chunk-overlap"
            label="重叠长度"
            icon={<GitCompare size={16} className={fieldIconClass} aria-hidden />}
            value={params.overlap}
            disabled={disabled}
            onChange={(overlap) => onParamsChange({ ...params, overlap })}
          />
        </div>
      ) : null}

      {strategy === 'STRUCTURE_AWARE' && !isOverlappingParams(params) ? (
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="min-chunk-size"
            label="最小分块大小"
            icon={<Hash size={16} className={fieldIconClass} aria-hidden />}
            value={params.minChunkSize}
            disabled={disabled}
            onChange={(minChunkSize) => onParamsChange({ ...params, minChunkSize })}
          />
          <NumberField
            id="default-chunk-size"
            label="默认分块大小"
            icon={<Hash size={16} className={fieldIconClass} aria-hidden />}
            value={params.defaultChunkSize}
            disabled={disabled}
            onChange={(defaultChunkSize) => onParamsChange({ ...params, defaultChunkSize })}
          />
          <NumberField
            id="max-chunk-size"
            label="最大分块大小"
            icon={<Hash size={16} className={fieldIconClass} aria-hidden />}
            value={params.maxChunkSize}
            disabled={disabled}
            onChange={(maxChunkSize) => onParamsChange({ ...params, maxChunkSize })}
          />
          <NumberField
            id="structure-overlap"
            label="重叠长度"
            icon={<GitCompare size={16} className={fieldIconClass} aria-hidden />}
            value={params.overlap}
            disabled={disabled}
            onChange={(overlap) => onParamsChange({ ...params, overlap })}
          />
        </div>
      ) : null}
    </div>
  )
}
