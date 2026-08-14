import { message } from 'antd'
import { useLayoutEffect } from 'react'
import { bindMessageApi, TOAST_DURATION_MS } from '@/shared/ui/toast-store'

/**
 * 把 antd Message 接到命令式 toast* API。
 * Why useMessage：静态 message.xxx 不吃 ConfigProvider；宿主须在 Provider 内。
 */
export function ToastHost() {
  const [api, holder] = message.useMessage({
    duration: TOAST_DURATION_MS / 1000,
  })

  useLayoutEffect(() => {
    bindMessageApi(api)
    return () => {
      bindMessageApi(null)
    }
  }, [api])

  return holder
}
