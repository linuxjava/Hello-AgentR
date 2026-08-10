import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastHost } from '@/shared/ui/ToastHost'
import {
  NO_PERMISSION_MESSAGE,
  toastError,
  toastNoPermission,
  toastSuccess,
  useToastStore,
} from '@/shared/ui/toast-store'

describe('toast store + ToastHost', () => {
  beforeEach(() => {
    useToastStore.setState({ items: [] })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows success and auto-dismisses', () => {
    render(<ToastHost />)

    act(() => {
      toastSuccess('创建成功')
    })

    expect(screen.getByRole('status')).toHaveTextContent('创建成功')

    act(() => {
      vi.advanceTimersByTime(3200)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows no-permission message via helper', () => {
    render(<ToastHost />)

    act(() => {
      toastNoPermission()
    })

    const toast = screen.getByRole('status')
    expect(toast).toHaveTextContent(NO_PERMISSION_MESSAGE)
    expect(toast.className).toContain('bg-[#FFFFFFD9]')
  })

  it('shows error toast', () => {
    render(<ToastHost />)

    act(() => {
      toastError('网络异常')
    })

    expect(screen.getByRole('alert')).toHaveTextContent('网络异常')
  })
})
