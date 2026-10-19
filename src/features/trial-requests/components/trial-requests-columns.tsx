import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { type TrialRequest } from '../api'
import { TRIAL_REQUEST_STATUS_LABELS } from '../data'
import { TrialRequestActions } from './trial-request-actions'

export const columns: ColumnDef<TrialRequest>[] = [
  { accessorKey: 'phone', header: 'Số điện thoại' },
  {
    accessorKey: 'source',
    header: 'Nguồn',
    cell: ({ row }) =>
      row.original.source === 'REFERRAL' ? 'Bạn bè giới thiệu' : 'Website',
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'contactName',
    header: 'Người được giới thiệu',
    cell: ({ row }) => (
      <div className='max-w-64 whitespace-normal'>
        <p>{row.original.contactName || '—'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'referrerName',
    header: 'Người giới thiệu',
    cell: ({ row }) => (
      <div className='max-w-64 whitespace-normal'>
        <p>{row.original.referrerName || '—'}</p>
        <p className='text-xs text-muted-foreground'>
          {row.original.referrerClinicName}
        </p>
      </div>
    ),
  },
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
        {TRIAL_REQUEST_STATUS_LABELS[row.original.status]}
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
