import type { MessageInstance } from 'antd/es/message/interface'

export type ToastKind = 'success' | 'error' | 'info'

export const NO_PERMISSION_MESSAGE = '无权限执行此操作'
export const TOAST_DURATION_MS = 3000

const DURATION_SEC = TOAST_DURATION_MS / 1000

let messageApi: MessageInstance | null = null

/** ToastHost 挂载后注入，保证走 ConfigProvider 上下文而不是静态 message。 */
export function bindMessageApi(api: MessageInstance | null): void {
  messageApi = api
}

export function clearToasts(): void {
  messageApi?.destroy()
}

function open(kind: ToastKind, content: string): void {
  if (!messageApi) {
    return
  }
  messageApi[kind](content, DURATION_SEC)
}

export function toastSuccess(content: string): void {
  open('success', content)
}

export function toastError(content: string): void {
  open('error', content)
}

export function toastInfo(content: string): void {
  open('info', content)
}

export function toastNoPermission(): void {
  toastInfo(NO_PERMISSION_MESSAGE)
}

/** Staff 点删除时的专用文案（Pencil H-02），与账号页通用无权限句区分。 */
export const KB_NO_DELETE_PERMISSION_MESSAGE = '无权限删除知识库'

export function toastKbNoDeletePermission(): void {
  toastInfo(KB_NO_DELETE_PERMISSION_MESSAGE)
}

/** Admin 有文档时删库拦截（Pencil H-01）；外观不灰显，与 Staff 无权限文案区分。 */
export const KB_HAS_DOCUMENTS_MESSAGE = '库下仍有文档，不能删除'

export function toastKbHasDocuments(): void {
  toastInfo(KB_HAS_DOCUMENTS_MESSAGE)
}
