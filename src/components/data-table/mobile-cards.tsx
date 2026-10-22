import { flexRender, type Row, type Table } from '@tanstack/react-table'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { auditLabels, type AuditColumnId } from './audit-columns'

const MOBILE_LABELS: Record<string, string> = {
  get address() {
    return i18n.t('messages.address')
  },
  get batchCount() {
    return i18n.t('messages.batchNumber')
  },
  get batchNo() {
    return i18n.t('messages.batchNumber')
  },
  get code() {
    return i18n.t('messages.documentCode')
  },
  get countedAt() {
    return i18n.t('messages.stocktakeDate')
  },
  get createdAt() {
    return i18n.t('messages.examinationTime')
  },
  get dateOfBirth() {
    return i18n.t('messages.dateOfBirth')
  },
  get diagnosis() {
    return i18n.t('messages.diagnosis')
  },
  get doctorName() {
    return i18n.t('messages.doctor')
  },
  email: 'Email',
  get expiryDate() {
    return i18n.t('messages.expiryDate')
  },
  get expiryStatus() {
    return i18n.t('messages.warning')
  },
  get excerpt() {
    return i18n.t('messages.description')
  },
  get fullName() {
    return i18n.t('messages.fullName')
  },
  get gender() {
    return i18n.t('messages.gender')
  },
  get group() {
    return i18n.t('messages.group')
  },
  get isPublished() {
    return i18n.t('messages.status')
  },
  get issuedAt() {
    return i18n.t('messages.issueDate')
  },
  get itemCount() {
    return i18n.t('messages.medicineCount')
  },
  get key() {
    return i18n.t('messages.key')
  },
  get lineCount() {
    return i18n.t('messages.lineCount')
  },
  get manufacturer() {
    return i18n.t('messages.manufacturer')
  },
  get medicineCount() {
    return i18n.t('messages.medicineCount')
  },
  get medicineName() {
    return i18n.t('messages.medicine')
  },
  get medicines() {
    return i18n.t('messages.medicinesInTemplate')
  },
  get minStock() {
    return i18n.t('messages.minimumStock')
  },
  get name() {
    return i18n.t('messages.name')
  },
  get nearestExpiry() {
    return i18n.t('messages.nearestExpiryDate')
  },
  get note() {
    return i18n.t('messages.notes')
  },
  get patientName() {
    return i18n.t('messages.patient')
  },
  get phone() {
    return i18n.t('messages.phoneNumber')
  },
  get qtyReceived() {
    return i18n.t('messages.received')
  },
  get qtyRemaining() {
    return i18n.t('messages.inStock')
  },
  get receiptCode() {
    return i18n.t('messages.goodsReceipt')
  },
  get receivedAt() {
    return i18n.t('messages.receivedOn')
  },
  get recipientName() {
    return i18n.t('messages.recipient')
  },
  get salePrice() {
    return i18n.t('messages.sellingPrice')
  },
  get stockValue() {
    return i18n.t('messages.stockValue')
  },
  get strength() {
    return i18n.t('messages.strength')
  },
  get supplierName() {
    return i18n.t('messages.supplier')
  },
  get thumbnailUrl() {
    return i18n.t('messages.avatar')
  },
  get title() {
    return i18n.t('messages.title')
  },
  get totalQty() {
    return i18n.t('messages.inventory')
  },
  get unit() {
    return i18n.t('messages.unit')
  },
  get unitCost() {
    return i18n.t('messages.purchasePrice')
  },
  get value() {
    return i18n.t('messages.value')
  },
}

type MobileCardsProps<TData> = {
  table: Table<TData>
  rows?: Row<TData>[]
  isLoading?: boolean
  emptyMessage?: string
  labels?: Record<string, string>
  renderSubRow?: (row: Row<TData>) => React.ReactNode
}

export function MobileDataCards<TData>({
  table,
  rows = table.getRowModel().rows,
  isLoading,
  emptyMessage,
  labels,
  renderSubRow,
}: MobileCardsProps<TData>) {
  const { t, i18n } = useTranslation()
  const headerGroups = table.getHeaderGroups()
  const headers = headerGroups[headerGroups.length - 1]?.headers ?? []

  const labelFor = (columnId: string) => {
    if (table.getColumn(columnId)?.columnDef.meta?.audit) {
      return auditLabels[columnId as AuditColumnId]
    }
    const override = labels?.[columnId]
    if (override) return i18n.exists(override) ? t(override) : override
    const key = `mobileTable.columns.${columnId}`
    if (i18n.exists(key)) return t(key)
    if (MOBILE_LABELS[columnId]) return MOBILE_LABELS[columnId]
    const header = headers.find((item) => item.column.id === columnId)
    if (!header) return columnId
    if (typeof header.column.columnDef.header === 'string') {
      return header.column.columnDef.header
    }
    return columnId
  }

  return (
    <div className='grid min-w-0 gap-3 sm:hidden'>
      {isLoading ? (
        <p className='rounded-md border p-4 text-center'>
          {t('mobileTable.loading')}
        </p>
      ) : rows.length ? (
        rows.map((row) => {
          const cells = row.getVisibleCells()
          const detailCells = cells.filter(
            (cell) =>
              !['actions', 'expand', 'expander', 'select'].includes(
                cell.column.id
              ) && !cell.column.columnDef.meta?.hideOnMobile?.(row.original)
          )
          const actionCells = cells.filter((cell) =>
            ['actions', 'expand', 'expander', 'select'].includes(cell.column.id)
          )

          return (
            <div
              key={row.id}
              className='min-w-0 space-y-3 rounded-md border p-4'
            >
              <div className='space-y-2'>
                {detailCells.map((cell) => (
                  <div
                    key={cell.id}
                    className={cn(
                      'flex min-w-0 text-sm',
                      cell.column.columnDef.meta?.mobileStacked
                        ? 'flex-col gap-2'
                        : 'justify-between gap-3'
                    )}
                  >
                    <span className='shrink-0 text-muted-foreground'>
                      {labelFor(cell.column.id)}
                    </span>
                    <div
                      className={cn(
                        'min-w-0 break-words',
                        cell.column.columnDef.meta?.mobileStacked
                          ? 'pl-3'
                          : 'text-right'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {actionCells.length > 0 && (
                <div className='flex flex-wrap items-center justify-end gap-2 border-t pt-3'>
                  {actionCells.map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              )}
              {row.getIsExpanded() && renderSubRow && (
                <div className='min-w-0 border-t pt-3'>{renderSubRow(row)}</div>
              )}
            </div>
          )
        })
      ) : (
        <p className='rounded-md border p-4 text-center text-muted-foreground'>
          {emptyMessage ?? t('mobileTable.empty')}
        </p>
      )}
    </div>
  )
}
