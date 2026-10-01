import { type ColumnDef } from '@tanstack/react-table'
import { type Tenant } from '../api'
import { TenantActions } from './tenant-actions'

const planLabels = { BASIC: 'Cơ bản', PLUS: 'Nâng cao', PRO: 'Chuyên nghiệp' }

export const columns: ColumnDef<Tenant>[] = [
  { accessorKey: 'code', header: 'Mã' },
  { accessorKey: 'name', header: 'Phòng khám' },
  { accessorKey: 'subdomain', header: 'Subdomain' },
  {
    accessorKey: 'servicePlan',
    header: 'Gói',
    cell: ({ row }) => planLabels[row.original.servicePlan],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'subscriptionStatus',
    header: 'Trạng thái đăng ký',
    cell: ({ row }) =>
      ({
        TRIAL: 'Đăng ký dùng thử',
        ACTIVE: 'Đăng ký chính thức',
        EXPIRED: 'Hết hạn',
        SUSPENDED: 'Tạm ngưng',
      })[row.original.subscriptionStatus],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'trialStartedAt',
    header: 'Bắt đầu dùng thử',
    cell: ({ row }) =>
      row.original.trialStartedAt
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
            new Date(row.original.trialStartedAt)
          )
        : '—',
  },
  {
    accessorKey: 'trialEndsAt',
    header: 'Hạn dùng thử',
    cell: ({ row }) =>
      row.original.trialEndsAt
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
            new Date(row.original.trialEndsAt)
          )
        : '—',
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
