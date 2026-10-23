import { type ColumnDef } from '@tanstack/react-table'
import i18n, { getLocale } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { type TrialRequest } from '../api'
import { TRIAL_REQUEST_STATUS_LABELS } from '../data'
import { TrialRequestActions } from './trial-request-actions'

export const columns: ColumnDef<TrialRequest>[] = [
  {
    accessorKey: 'phone',
    get header() {
      return i18n.t('messages.phoneNumber')
    },
  },
  {
    accessorKey: 'source',
    get header() {
      return i18n.t('messages.source')
    },
    cell: ({ row }) =>
      row.original.source === 'REFERRAL'
        ? i18n.t('messages.friendReferral')
        : 'Website',
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'contactName',
    get header() {
      return i18n.t('messages.referredPerson')
    },
    cell: ({ row }) => (
      <div className='max-w-64 whitespace-normal'>
        <p>{row.original.contactName || '—'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'referrerName',
    get header() {
      return i18n.t('messages.referrer')
    },
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
    get header() {
      return i18n.t('messages.registrationDate')
    },
    cell: ({ row }) =>
      new Intl.DateTimeFormat(getLocale(), {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: 'status',
    get header() {
      return i18n.t('messages.status')
    },
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
    get header() {
      return i18n.t('messages.clinicCode')
    },
    cell: ({ row }) => row.original.code ?? '—',
  },
  {
    accessorKey: 'rejectionReason',
    get header() {
      return i18n.t('messages.rejectionReason')
    },
    cell: ({ row }) => row.original.rejectionReason ?? '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TrialRequestActions request={row.original} />,
  },
]
