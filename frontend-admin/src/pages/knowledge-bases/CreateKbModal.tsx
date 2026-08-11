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
import { SelectMenu } from '@/shared/ui/SelectMenu'
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
  embeddingModel: z.string().min(1, '请选择向量模型'),
  description: knowledgeDescriptionSchema,
})

type FormValues = z.infer<typeof schema>

const CATALOG_UNAVAILABLE = '向量模型目录暂不可用，无法提交创建。'

type CatalogState = 'loading' | 'ready' | 'failed'

export interface CreateKbModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateKbModal({ open, onClose, onCreated }: CreateKbModalProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [catalogState, setCatalogState] = useState<CatalogState>('loading')
  const [models, setModels] = useState<string[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', namespace: '', embeddingModel: '', description: '' },
  })

  const embeddingModel = watch('embeddingModel')

  // 打开时拉目录：失败立刻切 O-05b，避免用户填完才发现不能提交。
  useEffect(() => {
    if (!open) {
      return
    }
    reset({ name: '', namespace: '', embeddingModel: '', description: '' })
    setBusinessError(null)
    setCatalogState('loading')
    setModels([])
    let cancelled = false
    void knowledgeApi
      .listEmbeddingModels()
      .then((next) => {
        if (cancelled) {
          return
        }
        if (next.length === 0) {
          setCatalogState('failed')
          setBusinessError(CATALOG_UNAVAILABLE)
          return
        }
        setModels(next)
        setValue('embeddingModel', next[0] ?? '')
        setCatalogState('ready')
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        setCatalogState('failed')
        setBusinessError(CATALOG_UNAVAILABLE)
      })
    return () => {
      cancelled = true
    }
  }, [open, reset, setValue])

  if (!open) {
    return null
  }

  const catalogFailed = catalogState === 'failed'
  const catalogOptions =
    catalogState === 'ready'
      ? models.map((id) => ({ value: id, label: id }))
      : [{ value: '', label: catalogFailed ? '目录不可用' : '加载中…' }]

  const close = () => {
    setBusinessError(null)
    onClose()
  }

  const onSubmit = handleSubmit(async (raw) => {
    if (catalogFailed) {
      setBusinessError(CATALOG_UNAVAILABLE)
      return
    }
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          field === 'name' ||
          field === 'namespace' ||
          field === 'embeddingModel' ||
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
        embeddingModel: parsed.data.embeddingModel,
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
        <SelectMenu
          id="create-kb-model"
          label="向量模型"
          value={embeddingModel}
          disabled={catalogState !== 'ready'}
          onChange={(next) => setValue('embeddingModel', next, { shouldDirty: true })}
          options={catalogOptions}
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
          disabled={isSubmitting || catalogFailed || catalogState === 'loading'}
          onCancel={close}
        />
      </form>
    </ModalShell>
  )
}
