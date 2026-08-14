import { describe, expect, it } from 'vitest'
import {
  composeOriginalFilename,
  splitOriginalFilename,
  validateFilenameStem,
} from '@/pages/documents/document-filename'

describe('document-filename', () => {
  it('splits last extension and treats leading-dot names as stem-only', () => {
    expect(splitOriginalFilename('handbook.pdf')).toEqual({ stem: 'handbook', suffix: '.pdf' })
    expect(splitOriginalFilename('foo.bar.pdf')).toEqual({ stem: 'foo.bar', suffix: '.pdf' })
    expect(splitOriginalFilename('README')).toEqual({ stem: 'README', suffix: '' })
    expect(splitOriginalFilename('.gitignore')).toEqual({ stem: '.gitignore', suffix: '' })
  })

  it('rejects blank stem and path characters', () => {
    expect(validateFilenameStem('  ', '.pdf')).toBe('请输入文件名')
    expect(validateFilenameStem('../x', '.pdf')).toBe('文件名不能包含 / \\ :')
    expect(validateFilenameStem('a:b', '.pdf')).toBe('文件名不能包含 / \\ :')
    expect(validateFilenameStem('ok', '.pdf')).toBeNull()
    expect(composeOriginalFilename(' 手册 ', '.pdf')).toBe('手册.pdf')
  })
})
