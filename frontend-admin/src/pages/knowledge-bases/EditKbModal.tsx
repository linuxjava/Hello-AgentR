import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { KnowledgeBaseView } from '@/shared/api/types'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import { knowledgeDescriptionSchema, knowledgeNameSchema } from '@/shared/lib/validation'
import { toastSuccess } from '@/shared/ui/toast-store'
import {
  ErrorBanner,
  LabeledInput,
  LabeledTextarea,
  ModalActions,
  ModalShell,
} from '@/pages/knowledge-bases/kb-modal-chrome'

const schema = z.object({
  name: knowledgeNameSchema,
  description: knowledgeDescriptionSchema,
})

type FormValues = z.infer<typeof schema>

export interface EditKbModalProps {
  open: boolean
  kb: KnowledgeBaseView | null
  onClose: () => void
  onSaved: () => void
}

export function EditKbModal({ open, kb, onClose, onSaved }: EditKbModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: kb?.name ?? '',
      description: kb?.description ?? '',
    },
  })

  if (!open || !kb) {
    return null
  }

  const close = () => {
    setBusinessError(null)
    onClose()
  }

  const onSubmit = handleSubmit(async (raw) => {
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'name' || field === 'description') {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    try {
      // PUT 只允许改 name/description；空描述按契约清空。命名空间/模型不进表单也不进 body。
      await knowledgeApi.update(kb.id, {
        name: parsed.data.name,
        description: parsed.data.description.trim(),
      })
      toastSuccess('保存成功')
      close()
      onSaved()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '保存失败，请稍后重试'
      setBusinessError(message)
    }
  })

  return (
    <ModalShell title="编辑知识库" onClose={close}>
      {businessError ? <ErrorBanner message={businessError} /> : null}
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <LabeledInput
          id="edit-kb-name"
          label="名称"
          placeholder="1–64 字，支持中文与常见标点"
          error={errors.name?.message}
          {...register('name')}
        />
        <LabeledTextarea
          id="edit-kb-description"
          label="描述"
          placeholder="选填，最长 200 字"
          error={errors.description?.message}
          {...register('description')}
        />
        <ModalActions
          cancelLabel="取消"
          submitLabel={isSubmitting ? '保存中…' : '保存'}
          disabled={isSubmitting}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}
