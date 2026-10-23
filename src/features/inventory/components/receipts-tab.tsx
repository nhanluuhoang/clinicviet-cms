import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import i18n from '@/i18n'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatMoney, formatNumber } from '@/lib/utils'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetReceipt, GetReceipts, type GoodsReceiptSummary } from '../api'
import { useDocumentDates } from '../hooks/use-document-dates'
import { DocumentDateToolbar } from './document-date-toolbar'
import { ExpiryBadge } from './expiry-badge'

function ReceiptLines({ row }: { row: Row<GoodsReceiptSummary> }) {
  const { t } = useTranslation()

  const {
    data: receipt,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['inventory', 'receipt', row.original.id],
    queryFn: () => GetReceipt(row.original.id),
  })

  if (isLoading) {
    return (
      <div className='px-4 py-6 text-sm'>{t('messages.loadingDetails')}</div>
    )
  }

  if (isError || !receipt) {
    return (
      <div className='px-4 py-6 text-sm text-destructive'>
        {t('messages.couldNotLoadReceiptDetails')}
      </div>
    )
  }

  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {receipt.lines.length} {t('messages.linesTotal')}{' '}
        {formatNumber(receipt.totalQty)} · {formatMoney(receipt.totalAmount)}
      </p>
      <div className='grid gap-2 sm:hidden'>
        {receipt.lines.map((line) => (
          <div
            key={line.batchId}
            className='space-y-1 rounded-md border p-3 text-sm'
          >
            <p className='font-medium'>{line.medicineName}</p>
            <p>
              {t('messages.batchNumberAlt2')} {line.batchNo}
            </p>
            <p>
              {t('messages.expiry')} <ExpiryBadge date={line.expiryDate} />
            </p>
            <p>
              {t('messages.quantity')} {formatNumber(line.qty)} {line.unit}
            </p>
            <p>
              {t('messages.unitPrice')} {formatMoney(line.unitCost)}
            </p>
            <p>
              {t('messages.amount')} {formatMoney(line.amount)}
            </p>
          </div>
        ))}
      </div>
      <div className='hidden overflow-x-auto sm:block'>
        <table className='w-full text-sm'>
          <thead className='text-xs text-muted-foreground'>
            <tr className='border-b'>
              <th className='py-1.5 pe-4 text-start font-medium'>
                {t('messages.medicine')}
              </th>
              <th className='py-1.5 pe-4 text-start font-medium'>
                {t('messages.batchNumber')}
              </th>
              <th className='py-1.5 pe-4 text-start font-medium'>
                {t('messages.expiryAlt2')}
              </th>
              <th className='py-1.5 pe-4 text-end font-medium'>
                {t('messages.quantityAlt2')}
              </th>
              <th className='py-1.5 pe-4 text-end font-medium'>
                {t('messages.unitPriceAlt2')}
              </th>
              <th className='py-1.5 text-end font-medium'>
                {t('messages.amountAlt2')}
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={line.batchId} className='border-b last:border-0'>
                <td className='py-1.5 pe-4'>
                  <span className='font-medium'>{line.medicineName}</span>
                  <span className='ms-2 text-xs text-muted-foreground'>
                    {line.medicineCode}
                  </span>
                </td>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {line.batchNo}
                </td>
                <td className='py-1.5 pe-4'>
                  <ExpiryBadge date={line.expiryDate} />
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatNumber(line.qty)} {line.unit}
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatMoney(line.unitCost)}
                </td>
                <td className='py-1.5 text-end font-medium tabular-nums'>
                  {formatMoney(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<GoodsReceiptSummary>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        className='size-7'
        onClick={row.getToggleExpandedHandler()}
        aria-label={
          row.getIsExpanded()
            ? i18n.t('messages.collapse')
            : i18n.t('messages.viewLines')
        }
      >
        {row.getIsExpanded() ? (
          <ChevronDown className='size-4' />
        ) : (
          <ChevronRight className='size-4' />
        )}
      </Button>
    ),
    meta: { className: 'w-10' },
    enableSorting: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.documentCode')}
      />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-medium'>{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'receivedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.receivedOn')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatDate(row.original.receivedAt)}
      </span>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.supplier')}
      />
    ),
    cell: ({ row }) => (
      <div className='min-w-44'>
        <div>{row.original.supplierName}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.invoiceNo}
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'lineCount',
    accessorKey: 'lineCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.batchNumber')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.lineCount}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function ReceiptsTab() {
  const { t } = useTranslation()

  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'receipts', search],
    queryFn: () => GetReceipts(search),
  })

  const filteredData = useDocumentDates(data ?? [], (item) => item.receivedAt)

  return (
    <UrlDataTable
      columns={withAuditColumns(columns)}
      data={filteredData}
      isLoading={isLoading}
      searchPlaceholder={t(
        'messages.searchDocumentCodeSupplierOrInvoiceNumber'
      )}
      emptyMessage={t('messages.noReceiptsYet')}
      getSearchText={(r) => `${r.code} ${r.supplierName} ${r.invoiceNo}`}
      initialSorting={[{ id: 'receivedAt', desc: true }]}
      renderToolbar={(table) => (
        <DocumentDateToolbar
          table={table}
          placeholder={t('messages.searchDocumentCodeSupplierOrInvoiceNumber')}
        />
      )}
      renderSubRow={(row) => <ReceiptLines row={row} />}
    />
  )
}
