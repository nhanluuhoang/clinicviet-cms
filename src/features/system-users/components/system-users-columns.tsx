import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { USER_ROLE_LABELS } from '@/config/user-role-labels'
import { type SystemUser } from '../api'
import { UpdateSystemUserDialog } from './update-system-user-dialog'

export const columns: ColumnDef<SystemUser>[] = withAuditColumns([
  { accessorKey: 'userName', header: 'Tên đăng nhập' },
  { accessorKey: 'fullName', header: 'Họ tên' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'tenantId',
    accessorFn: (user) => user.tenant.id,
    header: 'Phòng khám',
    cell: ({ row }) =>
      `${row.original.tenant.code} - ${row.original.tenant.name}`,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'role',
    header: 'Vai trò',
    cell: ({ row }) => (
      <Badge variant='outline'>{USER_ROLE_LABELS[row.original.role]}</Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => (row.original.isActive ? 'Đang hoạt động' : 'Đã khóa'),
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
    cell: ({ row }) => <UpdateSystemUserDialog user={row.original} />,
  },
])
