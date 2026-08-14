import { useState } from 'react'
import type { ChunkStrategy, ChunkStrategyParams, DocumentView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { toastSuccess } from '@/shared/ui/toast-store'
import { ErrorBanner, ModalActions, ModalShell } from '@/pages/knowledge-bases/kb-modal-chrome'
import { ChunkStrategyForm } from '@/pages/documents/ChunkStrategyForm'
import { validateChunkParams } from '@/pages/documents/chunk-strategy'

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

        <div className="flex flex-col gap-1.5 rounded-[12px] border border-[#FFFFFF66] bg-[#FFFFFF59] px-3.5 py-3">
          <span className="text-xs font-medium text-[#64748B]">文件</span>
          <span className="truncate text-sm font-semibold text-[#0F172A]">{doc.originalFilename}</span>
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
