import { type ColumnDef } from '@tanstack/react-table'
import { SERVICE_PLAN_LABELS } from '@/config/service-plans'
import { SUBSCRIPTION_STATUS_LABELS } from '@/config/subscription-statuses'
import { type Tenant } from '../api'
import { TenantActions } from './tenant-actions'

export const columns: ColumnDef<Tenant>[] = [
  { accessorKey: 'code', header: 'Mã' },
  { accessorKey: 'name', header: 'Phòng khám' },
  { accessorKey: 'subdomain', header: 'Tên miền phụ' },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    cell: ({ row }) => row.original.note || '—',
  },
  {
    accessorKey: 'servicePlan',
    header: 'Gói',
    cell: ({ row }) => SERVICE_PLAN_LABELS[row.original.servicePlan],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'storageLimitGb',
    header: 'Dung lượng',
    cell: ({ row }) => `${row.original.storageLimitGb} GB`,
  },
  {
    accessorKey: 'subscriptionStatus',
    header: 'Trạng thái sử dụng',
    cell: ({ row }) =>
      SUBSCRIPTION_STATUS_LABELS[row.original.subscriptionStatus],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'subscriptionEndsAt',
    header: 'Hạn sử dụng',
    cell: ({ row }) =>
      row.original.subscriptionEndsAt
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
            new Date(row.original.subscriptionEndsAt)
          )
        : '-',
  },
  {
    id: 'users',
    header: 'Tài khoản',
    cell: ({ row }) => row.original._count.users,
  },
  {
    accessorKey: 'lastActiveAt',
    header: 'Hoạt động gần nhất',
    cell: ({ row }) =>
      row.original.lastActiveAt
        ? new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(row.original.lastActiveAt))
        : 'Chưa có phiên hoạt động',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TenantActions tenant={row.original} />,
  },
]
