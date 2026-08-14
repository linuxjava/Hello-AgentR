import { useState } from 'react'
import type { ChunkStrategy, ChunkStrategyParams, DocumentView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { toastSuccess } from '@/shared/ui/toast-store'
import { ErrorBanner, ModalActions, ModalShell } from '@/pages/knowledge-bases/kb-modal-chrome'
import { ChunkStrategyForm } from '@/pages/documents/ChunkStrategyForm'
import { validateChunkParams } from '@/pages/documents/chunk-strategy'
import {
  composeOriginalFilename,
  splitOriginalFilename,
  validateFilenameStem,
} from '@/pages/documents/document-filename'

export interface ChangeStrategyModalProps {
  kbId: string
  doc: DocumentView
  onClose: () => void
  onSaved: () => void
}

/** 父级以 key=doc.id 挂载；初始 state 直接回填已存策略，无 effect 重置。 */
export function ChangeStrategyModal({
  kbId,
  doc,
  onClose,
  onSaved,
}: ChangeStrategyModalProps) {
  const parts = splitOriginalFilename(doc.originalFilename)
  const suffix = parts.suffix
  const [stem, setStem] = useState(parts.stem)
  const [strategy, setStrategy] = useState<ChunkStrategy>(doc.chunkStrategy)
  const [params, setParams] = useState<ChunkStrategyParams>(doc.chunkStrategyParams)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    if (submitting) {
      return
    }
    onClose()
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    const filenameError = validateFilenameStem(stem, suffix)
    if (filenameError) {
      setValidationError(filenameError)
      setBusinessError(null)
      return
    }
    const invalid = validateChunkParams(strategy, params)
    if (invalid) {
      setValidationError(invalid)
      setBusinessError(null)
      return
    }
    setValidationError(null)
    setBusinessError(null)
    setSubmitting(true)
    try {
      await knowledgeApi.updateChunkStrategy(kbId, doc.id, {
        chunkStrategy: strategy,
        chunkStrategyParams: params,
        originalFilename: composeOriginalFilename(stem, suffix),
      })
      toastSuccess('保存成功')
      onClose()
      onSaved()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '保存失败，请稍后重试'
      setBusinessError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="改策略" onClose={close}>
      <form className="flex flex-col gap-5" onSubmit={(e) => void onSubmit(e)}>
        {validationError || businessError ? (
          <ErrorBanner message={validationError ?? businessError ?? ''} />
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="doc-filename-stem" className="text-[13px] font-medium text-[#334155]">
            文件名
          </label>
          {/* Why 后缀只读：改名只动主名；扩展名与内容类型对齐，且 objectKey 不依赖文件名。 */}
          <div className="admin-input flex h-11 items-center rounded-[10px] border border-[#FFFFFF66] bg-[#FFFFFFD9] px-3.5">
            <input
              id="doc-filename-stem"
              value={stem}
              disabled={submitting}
              autoComplete="off"
              aria-describedby={suffix ? 'doc-filename-suffix' : undefined}
              onChange={(event) => {
                setStem(event.target.value)
                setValidationError(null)
              }}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
            />
            {suffix ? (
              <span id="doc-filename-suffix" className="shrink-0 pl-1 text-sm text-[#64748B]">
                {suffix}
              </span>
            ) : null}
          </div>
        </div>

        <ChunkStrategyForm
          strategy={strategy}
          params={params}
          disabled={submitting}
          onStrategyChange={(next, nextParams) => {
            setStrategy(next)
            setParams(nextParams)
            setValidationError(null)
          }}
          onParamsChange={(next) => {
            setParams(next)
            setValidationError(null)
          }}
        />

        <ModalActions
          cancelLabel="取消"
          submitLabel={submitting ? '保存中…' : '保存'}
          disabled={submitting}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}
