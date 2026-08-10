import { Pagination as AntPagination } from 'antd'

const DEFAULT_PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'] as const

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number, pageSize: number) => void
  pageSizeOptions?: readonly string[]
  className?: string
}

/** Ant Design Pagination aligned with admin list screens (size changer + page jump). */
export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: PaginationProps) {
  return (
    <AntPagination
      className={className}
      current={page}
      pageSize={pageSize}
      total={total}
      showSizeChanger
      pageSizeOptions={[...pageSizeOptions]}
      onChange={onChange}
    />
  )
}
