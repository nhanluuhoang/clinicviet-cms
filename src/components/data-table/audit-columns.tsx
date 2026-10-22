import type { ColumnDef } from '@tanstack/react-table'
import i18n, { getLocale } from '@/i18n'
import { DataTableColumnHeader } from './column-header'

export type AuditFields = {
  createdAt?: string | null
  createdBy?: string | null
  creator?: { fullName: string } | null
  updatedAt?: string | null
  updatedBy?: string | null
  updater?: { fullName: string } | null
}

export const auditLabels = {
  get createdAt() {
    return i18n.t('messages.createdAt')
  },
  get createdBy() {
    return i18n.t('messages.createdBy')
  },
  get updatedAt() {
    return i18n.t('messages.updatedAt')
  },
  get updatedBy() {
    return i18n.t('messages.updatedBy')
  },
} as const

export type AuditColumnId = keyof typeof auditLabels

export const defaultAuditVisibility = {
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
}

export function formatAuditValue(record: AuditFields, key: AuditColumnId) {
  const value = record[key]
  if (key === 'createdAt' || key === 'updatedAt') {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(getLocale())
  }
  return (
    record[key === 'createdBy' ? 'creator' : 'updater']?.fullName ||
    value ||
    '—'
  )
}

export function withAuditColumns<T extends AuditFields>(
  columns: ColumnDef<T>[],
  enableSorting = false
): ColumnDef<T>[] {
  const otherColumns = columns.filter((column) => {
    const id =
      column.id ?? ('accessorKey' in column ? column.accessorKey : undefined)
    return !Object.keys(auditLabels).includes(String(id))
  })
  const auditColumns: ColumnDef<T>[] = (
    Object.keys(auditLabels) as AuditColumnId[]
  ).map((key) => ({
    id: key,
    accessorFn: (row) =>
      key.endsWith('At') ? row[key] : formatAuditValue(row, key),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={auditLabels[key]} />
    ),
    cell: ({ row }) => (
      <span
        className='whitespace-nowrap'
        title={row.original[key] ?? undefined}
      >
        {formatAuditValue(row.original, key)}
      </span>
    ),
    enableHiding: true,
    meta: { audit: true },
    enableSorting,
  }))
  const actionIndex = otherColumns.findIndex(
    (column) => column.id === 'actions'
  )
  otherColumns.splice(
    actionIndex < 0 ? otherColumns.length : actionIndex,
    0,
    ...auditColumns
  )
  return otherColumns
}
