import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ToastHost } from '@/shared/ui/ToastHost'
import {
  NO_PERMISSION_MESSAGE,
  clearToasts,
  toastError,
  toastNoPermission,
  toastSuccess,
} from '@/shared/ui/toast-store'

function renderHost() {
  return render(
    <ConfigProvider locale={zhCN}>
      <ToastHost />
    </ConfigProvider>,
  )
}

describe('antd Message via toast helpers', () => {
  beforeEach(() => {
    clearToasts()
  })

  afterEach(() => {
    clearToasts()
  })

  it('shows success', async () => {
    renderHost()
    act(() => {
      toastSuccess('创建成功')
    })
    expect(await screen.findByText('创建成功')).toBeInTheDocument()
  })

  it('shows no-permission message via helper', async () => {
    renderHost()
    act(() => {
      toastNoPermission()
    })
    expect(await screen.findByText(NO_PERMISSION_MESSAGE)).toBeInTheDocument()
  })

  it('shows error toast', async () => {
    renderHost()
    act(() => {
      toastError('网络异常')
    })
    expect(await screen.findByText('网络异常')).toBeInTheDocument()
  })
})
