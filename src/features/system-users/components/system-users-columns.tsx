import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { type SystemUser } from '../api'
import { UpdateSystemUserDialog } from './update-system-user-dialog'

const roleLabels = {
  TENANT_ADMIN: 'Quản trị phòng khám',
  DOCTOR: 'Bác sĩ',
  ASSISTANT: 'Trợ lý',
  PATIENT: 'Bệnh nhân',
  USER: 'Người dùng',
}

export const columns: ColumnDef<SystemUser>[] = [
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
      <Badge variant='outline'>{roleLabels[row.original.role]}</Badge>
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
]
