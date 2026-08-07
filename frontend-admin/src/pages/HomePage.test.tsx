import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/HomePage'

describe('HomePage', () => {
  it('renders placeholder title', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: 'Hello-AgentR Admin' })).toBeTruthy()
  })
})
