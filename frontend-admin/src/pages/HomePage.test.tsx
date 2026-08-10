import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/HomePage'

describe('HomePage', () => {
  it('renders Pencil placeholder title and description', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: '首页占位' })).toBeTruthy()
    expect(
      screen.getByText('本阶段无业务内容。后续业务模块将挂载于此。'),
    ).toBeTruthy()
  })
})
