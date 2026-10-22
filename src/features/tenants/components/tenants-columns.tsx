import { type ColumnDef } from '@tanstack/react-table'
import { SERVICE_PLAN_LABELS } from '@/config/service-plans'
import { SUBSCRIPTION_STATUS_LABELS } from '@/config/subscription-statuses'
import i18n, { getLocale } from '@/i18n'
import { type Tenant } from '../api'
import { TenantActions } from './tenant-actions'

export const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: 'code',
    get header() {
      return i18n.t('messages.code')
    },
  },
  {
    accessorKey: 'name',
    get header() {
      return i18n.t('messages.clinics')
    },
  },
  {
    accessorKey: 'subdomain',
    get header() {
      return i18n.t('messages.subdomain')
    },
  },
  {
    accessorKey: 'note',
    get header() {
      return i18n.t('messages.notes')
    },
    cell: ({ row }) => row.original.note || '—',
  },
  {
    accessorKey: 'servicePlan',
    get header() {
      return i18n.t('messages.plan')
    },
    cell: ({ row }) => SERVICE_PLAN_LABELS[row.original.servicePlan],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'storageLimitGb',
    get header() {
      return i18n.t('messages.capacity')
    },
    cell: ({ row }) => `${row.original.storageLimitGb} GB`,
  },
  {
    accessorKey: 'subscriptionStatus',
    get header() {
      return i18n.t('messages.usageStatus')
    },
    cell: ({ row }) =>
      SUBSCRIPTION_STATUS_LABELS[row.original.subscriptionStatus],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'subscriptionEndsAt',
    get header() {
      return i18n.t('messages.expiryDate')
    },
    cell: ({ row }) =>
      row.original.subscriptionEndsAt
        ? new Intl.DateTimeFormat(getLocale(), { dateStyle: 'short' }).format(
            new Date(row.original.subscriptionEndsAt)
          )
        : '-',
  },
  {
    id: 'users',
    get header() {
      return i18n.t('messages.account')
    },
    cell: ({ row }) => row.original._count.users,
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
    cell: ({ row }) => <TenantActions tenant={row.original} />,
  },
]
