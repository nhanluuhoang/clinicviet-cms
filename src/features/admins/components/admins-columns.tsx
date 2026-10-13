import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { LongText } from '@/components/long-text'
import { USER_ROLE_LABELS } from '@/config/user-role-labels'
import { type Admin } from '@/features/admins/api'
import { DataTableRowActions } from './data-table-row-actions'

export const adminsColumns: ColumnDef<Admin>[] = withAuditColumns([
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên đăng nhập' />
    ),
    cell: ({ row }) => (
      <span className='font-mono'>{row.original.userName}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Họ tên' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-52'>{row.original.fullName}</LongText>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => row.original.email ?? '—',
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SĐT' />
    ),
    cell: ({ row }) => row.original.phone ?? '—',
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vai trò' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>{USER_ROLE_LABELS[row.original.role]}</Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => (row.original.isActive ? 'Đang hoạt động' : 'Đã khóa'),
  },
  { id: 'actions', cell: DataTableRowActions },
])
