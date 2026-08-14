import { describe, expect, it } from 'vitest'
import { parsePositiveInt } from '@/pages/documents/chunk-strategy'

describe('parsePositiveInt', () => {
  it('returns NaN for blank input so the field can stay empty', () => {
    expect(parsePositiveInt('')).toBeNaN()
    expect(parsePositiveInt('   ')).toBeNaN()
  })

  it('parses decimal digits including zero', () => {
    expect(parsePositiveInt('0')).toBe(0)
    expect(parsePositiveInt('0111')).toBe(111)
  })
})
