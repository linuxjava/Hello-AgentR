import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '@/shared/api/types'
import { knowledgeApi } from '@/shared/api/knowledge'
import {
  knowledgeDescriptionSchema,
  knowledgeNameSchema,
  knowledgeNamespaceSchema,
} from '@/shared/lib/validation'
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
  namespace: knowledgeNamespaceSchema,
  description: knowledgeDescriptionSchema,
})

type FormValues = z.infer<typeof schema>

export interface CreateKbModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateKbModal({ open, onClose, onCreated }: CreateKbModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', namespace: '', description: '' },
  })

  useEffect(() => {
    if (!open) {
      return
    }
    reset({ name: '', namespace: '', description: '' })
    setBusinessError(null)
  }, [open, reset])

  if (!open) {
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
        if (
          field === 'name' ||
          field === 'namespace' ||
          field === 'description'
        ) {
          setError(field, { message: issue.message })
        }
      }
      return
    }

    setBusinessError(null)
    const description = parsed.data.description.trim()
    try {
      await knowledgeApi.create({
        name: parsed.data.name,
        namespace: parsed.data.namespace,
        ...(description ? { description } : {}),
      })
      toastSuccess('创建成功')
      close()
      onCreated()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '创建失败，请稍后重试'
      setBusinessError(message)
    }
  })

  return (
    <ModalShell title="创建知识库" onClose={close}>
      {businessError ? <ErrorBanner message={businessError} /> : null}
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <LabeledInput
          id="create-kb-name"
          label="名称"
          placeholder="1–64 字，支持中文与常见标点"
          error={errors.name?.message}
          {...register('name')}
        />
        <LabeledInput
          id="create-kb-namespace"
          label="命名空间"
          placeholder="2–32 位，仅小写字母与数字"
          error={errors.namespace?.message}
          {...register('namespace')}
        />
        <LabeledTextarea
          id="create-kb-description"
          label="描述"
          placeholder="选填，最长 200 字"
          error={errors.description?.message}
          {...register('description')}
        />
        <ModalActions
          cancelLabel="取消"
          submitLabel={isSubmitting ? '创建中…' : '创建'}
          disabled={isSubmitting}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}
