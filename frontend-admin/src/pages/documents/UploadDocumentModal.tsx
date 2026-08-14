import { useRef, useState } from 'react'
import { CloudUpload } from 'lucide-react'
import type { ChunkStrategy, ChunkStrategyParams } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { formatByteSize, mediaTypeLabel } from '@/shared/lib/display'
import { toastSuccess } from '@/shared/ui/toast-store'
import { ErrorBanner, ModalActions, ModalShell } from '@/pages/knowledge-bases/kb-modal-chrome'
import { ChunkStrategyForm } from '@/pages/documents/ChunkStrategyForm'
import { defaultParamsFor, validateChunkParams } from '@/pages/documents/chunk-strategy'

export interface UploadDocumentModalProps {
  kbId: string
  onClose: () => void
  onUploaded: () => void
}

/** 浏览器 File.type 可能为空；用扩展名兜底，便于副行「类型 · 大小」。 */
function fileTypeHint(file: File): string {
  if (file.type) {
    return file.type
  }
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) {
    return 'application/pdf'
  }
  if (name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'text/markdown'
  }
  if (name.endsWith('.txt')) {
    return 'text/plain'
  }
  if (name.endsWith('.doc') || name.endsWith('.docx')) {
    return 'application/msword'
  }
  if (/\.(png|jpe?g|gif|webp|bmp)$/.test(name)) {
    return 'image/png'
  }
  return ''
}

function fileMetaLine(file: File): string {
  return `${mediaTypeLabel(fileTypeHint(file))} · ${formatByteSize(file.size)}`
}

/** 由父级条件挂载；卸载即复位，避免 open 切换时在 effect 里 setState。 */
export function UploadDocumentModal({ kbId, onClose, onUploaded }: UploadDocumentModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [strategy, setStrategy] = useState<ChunkStrategy>('OVERLAPPING')
  const [params, setParams] = useState<ChunkStrategyParams>(() => defaultParamsFor('OVERLAPPING'))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const close = () => {
    if (submitting) {
      return
    }
    onClose()
  }

  const pickFile = (next: File | null) => {
    if (submitting) {
      return
    }
    setFile(next)
    setBusinessError(null)
    setValidationError(null)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    if (!file) {
      setValidationError('请选择要上传的文件')
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
      await knowledgeApi.uploadDocument(kbId, {
        file,
        chunkStrategy: strategy,
        chunkStrategyParams: params,
      })
      toastSuccess('上传成功')
      onClose()
      onUploaded()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '上传失败，请稍后重试'
      setBusinessError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const formError = validationError ?? businessError

  return (
    <ModalShell title="上传文档" onClose={close}>
      {/* Why 置顶：对齐 O-05b — Form Error 在标题下、字段上（非对话框外、非字段底部）。 */}
      {formError ? <ErrorBanner message={formError} /> : null}
      <form className="flex flex-col gap-5" onSubmit={(e) => void onSubmit(e)}>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#334155]">本地文件</span>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              if (!submitting) {
                inputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (!submitting) {
                setDragOver(true)
              }
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (submitting) {
                return
              }
              const dropped = e.dataTransfer.files?.[0]
              if (dropped) {
                pickFile(dropped)
              }
            }}
            className={[
              // Why 主色描边+淡底：对齐 ui.pen Dropzone（空态/已选同一套 chrome，非灰虚线）。
              'flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border-[1.5px] px-4 py-5 text-center transition',
              'border-[#2563EB] bg-[#2563EB0A]',
              dragOver ? 'bg-[#2563EB1A]' : '',
              submitting ? 'cursor-default opacity-55' : '',
            ].join(' ')}
          >
            <CloudUpload size={28} className="shrink-0 text-[#2563EB]" aria-hidden />
            {submitting && file ? (
              <>
                <p className="max-w-full truncate text-sm font-semibold text-[#0F172A]">{file.name}</p>
                <p className="text-xs text-[#64748B]">{fileMetaLine(file)}</p>
                <p className="text-xs font-medium text-[#64748B]">上传中，不可更换文件</p>
              </>
            ) : file ? (
              <>
                <p className="max-w-full truncate text-sm font-semibold text-[#0F172A]">{file.name}</p>
                <p className="text-xs text-[#64748B]">{fileMetaLine(file)}</p>
                <p className="text-xs font-medium text-[#2563EB]">拖拽替换，或点击重新选择</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#0F172A]">拖拽文件到此处，或点击选择</p>
                <p className="text-xs text-[#64748B]">单文件 · txt / md / pdf / Office / 常见图片</p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            disabled={submitting}
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
        </div>

        <div className={submitting ? 'pointer-events-none opacity-60' : ''}>
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
        </div>

        <ModalActions
          cancelLabel="取消"
          submitLabel={submitting ? '上传中…' : '上传'}
          disabled={submitting}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}
