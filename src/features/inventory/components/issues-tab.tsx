import { useQuery } from '@tanstack/react-query'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import i18n from '@/i18n'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatNumber } from '@/lib/utils'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetGoodsIssue, GetGoodsIssues, type GoodsIssueSummary } from '../api'

function IssueLines({ row }: { row: Row<GoodsIssueSummary> }) {
  const { t } = useTranslation()

  const {
    data: issue,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['inventory', 'issue', row.original.id],
    queryFn: () => GetGoodsIssue(row.original.id),
  })

  if (isLoading) {
    return (
      <div className='px-4 py-6 text-sm'>{t('messages.loadingDetails')}</div>
    )
  }

  if (isError || !issue) {
    return (
      <div className='px-4 py-6 text-sm text-destructive'>
        {t('messages.couldNotLoadIssueDetails')}
      </div>
    )
  }

  return (
    <div className='px-4 py-3'>
      <p className='mb-2 text-xs font-medium text-muted-foreground'>
        {issue.lines.length} {t('messages.linesTotal')}{' '}
        {formatNumber(issue.totalQty)}
      </p>
      <div className='grid gap-2 sm:hidden'>
        {issue.lines.map((line) => (
          <div
            key={line.batchId}
            className='space-y-1 rounded-md border p-3 text-sm'
          >
            <p className='font-medium'>{line.medicineName}</p>
            <p>
              {t('messages.batchNumberAlt2')} {line.batchNo}
            </p>
            <p>
              {t('messages.issueQuantity')} {formatNumber(line.quantity)}{' '}
              {line.unit}
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
              <th className='py-1.5 text-end font-medium'>
                {t('messages.issueQuantityAlt2')}
              </th>
            </tr>
          </thead>
          <tbody>
            {issue.lines.map((line) => (
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
                <td className='py-1.5 text-end tabular-nums'>
                  {formatNumber(line.quantity)} {line.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const columns: ColumnDef<GoodsIssueSummary>[] = [
  {
    id: 'expander',
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
        {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
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
    cell: ({ row }) => <span className='font-mono'>{row.original.code}</span>,
  },
  {
    accessorKey: 'issuedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.issueDate')}
      />
    ),
    cell: ({ row }) => formatDate(row.original.issuedAt),
  },
  {
    accessorKey: 'recipientName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.recipient')}
      />
    ),
  },
  {
    accessorKey: 'lineCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.lineCount')}
      />
    ),
    cell: ({ row }) => formatNumber(row.original.lineCount),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
]

export function IssuesTab() {
  const { t } = useTranslation()

  const search = useApiSearch()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory', 'issues', search],
    queryFn: () => GetGoodsIssues(search),
    retry: false,
  })

  return (
    <>
      {isError && (
        <p className='rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'>
          {t('messages.couldNotLoadIssuesCheckTheBackendConnectionAnd')}
        </p>
      )}
      <UrlDataTable
        columns={withAuditColumns(columns)}
        data={data ?? []}
        isLoading={isLoading}
        searchPlaceholder={t('messages.searchDocumentCodeOrRecipient')}
        emptyMessage={t('messages.noIssuesYet')}
        getSearchText={(issue) => `${issue.code} ${issue.recipientName}`}
        initialSorting={[{ id: 'issuedAt', desc: true }]}
        renderSubRow={(row) => <IssueLines row={row} />}
      />
    </>
  )
}
