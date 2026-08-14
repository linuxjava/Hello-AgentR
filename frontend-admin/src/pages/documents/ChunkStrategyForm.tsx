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

function NumberField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: number
  disabled?: boolean
  onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#334155]">
        {label}
      </label>
      <div
        className={[
          'flex h-11 items-center rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <input
          id={id}
          type="number"
          inputMode="numeric"
          disabled={disabled}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(parsePositiveInt(e.target.value))}
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
            value={params.chunkSize}
            disabled={disabled}
            onChange={(chunkSize) => onParamsChange({ ...params, chunkSize })}
          />
          <NumberField
            id="chunk-overlap"
            label="重叠长度"
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
            value={params.minChunkSize}
            disabled={disabled}
            onChange={(minChunkSize) => onParamsChange({ ...params, minChunkSize })}
          />
          <NumberField
            id="default-chunk-size"
            label="默认分块大小"
            value={params.defaultChunkSize}
            disabled={disabled}
            onChange={(defaultChunkSize) => onParamsChange({ ...params, defaultChunkSize })}
          />
          <NumberField
            id="max-chunk-size"
            label="最大分块大小"
            value={params.maxChunkSize}
            disabled={disabled}
            onChange={(maxChunkSize) => onParamsChange({ ...params, maxChunkSize })}
          />
          <NumberField
            id="structure-overlap"
            label="重叠长度"
            value={params.overlap}
            disabled={disabled}
            onChange={(overlap) => onParamsChange({ ...params, overlap })}
          />
        </div>
      ) : null}
    </div>
  )
}
