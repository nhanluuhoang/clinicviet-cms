import { type ColumnDef } from '@tanstack/react-table'
import { USER_ROLE_LABELS } from '@/config/user-role-labels'
import i18n, { getLocale } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { type SystemUser } from '../api'
import { UpdateSystemUserDialog } from './update-system-user-dialog'

export const columns: ColumnDef<SystemUser>[] = withAuditColumns([
  {
    accessorKey: 'userName',
    get header() {
      return i18n.t('messages.username')
    },
  },
  {
    accessorKey: 'fullName',
    get header() {
      return i18n.t('messages.fullName')
    },
  },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'tenantId',
    accessorFn: (user) => user.tenant.id,
    get header() {
      return i18n.t('messages.clinics')
    },
    cell: ({ row }) =>
      `${row.original.tenant.code} - ${row.original.tenant.name}`,
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'role',
    get header() {
      return i18n.t('messages.role')
    },
    cell: ({ row }) => (
      <Badge variant='outline'>{USER_ROLE_LABELS[row.original.role]}</Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'isActive',
    get header() {
      return i18n.t('messages.status')
    },
    cell: ({ row }) =>
      row.original.isActive
        ? i18n.t('subscriptionStatuses.ACTIVE')
        : i18n.t('messages.locked'),
  },
  {
    accessorKey: 'lastActiveAt',
    get header() {
      return i18n.t('messages.lastActive')
    },
    cell: ({ row }) =>
      row.original.lastActiveAt
        ? new Intl.DateTimeFormat(getLocale(), {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(row.original.lastActiveAt))
        : i18n.t('messages.noActiveSessionsYet'),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <UpdateSystemUserDialog user={row.original} />,
  },
])
