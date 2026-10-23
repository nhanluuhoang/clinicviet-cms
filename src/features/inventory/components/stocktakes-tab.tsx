import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import i18n from '@/i18n'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetStockTake, GetStockTakes, type StockTakeSummary } from '../api'
import { useDocumentDates } from '../hooks/use-document-dates'
import { DocumentDateToolbar } from './document-date-toolbar'
import { ExpiryBadge } from './expiry-badge'

const diffClass = (diff: number) =>
  diff === 0
    ? 'text-muted-foreground'
    : diff > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'

const withSign = (diff: number) =>
  diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)

function StockTakeLines({ row }: { row: Row<StockTakeSummary> }) {
  const { t } = useTranslation()

  const {
    data: stockTake,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['inventory', 'stocktake', row.original.id],
    queryFn: () => GetStockTake(row.original.id),
  })

  if (isLoading) {
    return (
      <div className='px-4 py-6 text-sm'>{t('messages.loadingDetails')}</div>
    )
  }

  if (isError || !stockTake) {
    return (
      <div className='px-4 py-6 text-sm text-destructive'>
        {t('messages.couldNotLoadStocktakeDetails')}
      </div>
    )
  }

  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {t('messages.adjustmentsByBatchTotalDifference')}{' '}
        <span className={diffClass(stockTake.totalDiff)}>
          {withSign(stockTake.totalDiff)}
        </span>
      </p>
      <div className='grid gap-2 sm:hidden'>
        {stockTake.lines.map((line) => (
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
              {t('messages.systemStock')} {formatNumber(line.systemQty)}
            </p>
            <p>
              {t('messages.physicalCountAlt2')} {formatNumber(line.countedQty)}
            </p>
            <p className={diffClass(line.diff)}>
              {t('messages.difference')} {withSign(line.diff)}
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
                {t('messages.systemStockAlt2')}
              </th>
              <th className='py-1.5 pe-4 text-end font-medium'>
                {t('messages.physicalCount')}
              </th>
              <th className='py-1.5 text-end font-medium'>
                {t('messages.differenceAlt2')}
              </th>
            </tr>
          </thead>
          <tbody>
            {stockTake.lines.map((line) => (
              <tr key={line.batchId} className='border-b last:border-0'>
                <td className='py-1.5 pe-4 font-medium'>{line.medicineName}</td>
                <td className='py-1.5 pe-4 font-mono text-xs'>
                  {line.batchNo}
                </td>
                <td className='py-1.5 pe-4'>
                  <ExpiryBadge date={line.expiryDate} />
                </td>
                <td className='py-1.5 pe-4 text-end text-muted-foreground tabular-nums'>
                  {formatNumber(line.systemQty)}
                </td>
                <td className='py-1.5 pe-4 text-end tabular-nums'>
                  {formatNumber(line.countedQty)}
                </td>
                <td
                  className={cn(
                    'py-1.5 text-end font-medium tabular-nums',
                    diffClass(line.diff)
                  )}
                >
                  {withSign(line.diff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<StockTakeSummary>[] = [
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
            : i18n.t('messages.viewDetails')
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
    accessorKey: 'countedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.stocktakeDate')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{formatDate(row.original.countedAt)}</span>
    ),
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
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.notes')} />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.note || '—'}</span>
    ),
  },
]

export function StockTakesTab() {
  const { t } = useTranslation()

  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stocktakes', search],
    queryFn: () => GetStockTakes(search),
  })

  const filteredData = useDocumentDates(data ?? [], (item) => item.countedAt)

  return (
    <UrlDataTable
      columns={withAuditColumns(columns)}
      data={filteredData}
      isLoading={isLoading}
      searchPlaceholder={t('messages.searchDocumentCodeMedicineOrBatchNumber')}
      emptyMessage={t(
        'messages.noStocktakesYetClickStocktakeToCreateTheFirstO'
      )}
      getSearchText={(s) => `${s.code} ${s.note}`}
      initialSorting={[{ id: 'countedAt', desc: true }]}
      renderToolbar={(table) => (
        <DocumentDateToolbar
          table={table}
          placeholder={t('messages.searchDocumentCodeMedicineOrBatchNumber')}
        />
      )}
      renderSubRow={(row) => <StockTakeLines row={row} />}
    />
  )
}
