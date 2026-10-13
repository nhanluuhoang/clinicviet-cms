import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { type TrialRequest } from '../api'
import { TrialRequestActions } from './trial-request-actions'

const statusLabels = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}

export const columns: ColumnDef<TrialRequest>[] = [
  { accessorKey: 'phone', header: 'Số điện thoại' },
  {
    accessorKey: 'createdAt',
    header: 'Ngày đăng ký',
    cell: ({ row }) =>
      new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'PENDING' ? 'default' : 'outline'}
      >
        {statusLabels[row.original.status]}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'code',
    header: 'Mã phòng khám',
    cell: ({ row }) => row.original.code ?? '—',
  },
  {
    accessorKey: 'rejectionReason',
    header: 'Lý do từ chối',
    cell: ({ row }) => row.original.rejectionReason ?? '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TrialRequestActions request={row.original} />,
  },
]
