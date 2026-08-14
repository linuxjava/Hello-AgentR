import { describe, expect, it } from 'vitest'
import {
  documentStatusBadgeClass,
  documentStatusLabel,
} from '@/pages/documents/document-status'

describe('document-status', () => {
  it('maps backend status to operator labels', () => {
    expect(documentStatusLabel('UPLOADED')).toBe('待分块')
    expect(documentStatusLabel('CHUNKING')).toBe('处理中')
    expect(documentStatusLabel('CHUNKED')).toBe('已就绪')
    expect(documentStatusLabel('FAILED')).toBe('异常')
  })

  it('uses glass chrome with status-colored text', () => {
    expect(documentStatusBadgeClass('CHUNKED')).toContain('bg-[#FFFFFF59]')
    expect(documentStatusBadgeClass('CHUNKED')).toContain('border-[#FFFFFF66]')
    expect(documentStatusBadgeClass('CHUNKED')).toContain('text-[#33A985]')
    expect(documentStatusBadgeClass('CHUNKING')).toContain('text-[#4379ED]')
    expect(documentStatusBadgeClass('FAILED')).toContain('text-[#E04D4D]')
    expect(documentStatusBadgeClass('UPLOADED')).toContain('text-[#DE9139]')
  })
})
