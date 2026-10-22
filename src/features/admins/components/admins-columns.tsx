import { type ColumnDef } from '@tanstack/react-table'
import { USER_ROLE_LABELS } from '@/config/user-role-labels'
import i18n from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { LongText } from '@/components/long-text'
import { type Admin } from '@/features/admins/api'
import { DataTableRowActions } from './data-table-row-actions'

export const adminsColumns: ColumnDef<Admin>[] = withAuditColumns([
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.username')}
      />
    ),
    cell: ({ row }) => (
      <span className='font-mono'>{row.original.userName}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.fullName')}
      />
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
      <DataTableColumnHeader column={column} title={i18n.t('messages.phone')} />
    ),
    cell: ({ row }) => row.original.phone ?? '—',
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.role')} />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>{USER_ROLE_LABELS[row.original.role]}</Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.status')}
      />
    ),
    cell: ({ row }) =>
      row.original.isActive
        ? i18n.t('subscriptionStatuses.ACTIVE')
        : i18n.t('messages.locked'),
  },
  { id: 'actions', cell: DataTableRowActions },
])
