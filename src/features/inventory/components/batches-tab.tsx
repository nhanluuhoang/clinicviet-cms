import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatDate,
  formatMoney,
  formatNumber,
  getExpiryStatus,
} from '@/lib/utils'
import { useApiSearch } from '@/hooks/use-api-search'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetBatches, type StockBatch } from '../api'
import { expiryStatuses } from '../data/data'
import { ExpiryBadge } from './expiry-badge'
import { useInventory } from './inventory-provider'

function BatchActions({ batch }: { batch: StockBatch }) {
  const { t } = useTranslation()

  const { setOpen, setCurrentBatch } = useInventory()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>{t('messages.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentBatch(batch)
            setOpen('batch-update')
          }}
        >
          {t('messages.update')}
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='!text-red-500'
          onClick={() => {
            setCurrentBatch(batch)
            setOpen('batch-dispose')
          }}
        >
          {t('messages.discardBatch')}
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<StockBatch>[] = [
  {
    accessorKey: 'batchNo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.batchNumber')}
      />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs font-medium'>
        {row.original.batchNo}
      </span>
    ),
  },
  {
    accessorKey: 'medicineName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.medicine')}
      />
    ),
    cell: ({ row }) => (
      <div className='min-w-44'>
        <div className='font-medium'>{row.original.medicineName}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.medicineCode}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.expiryDate')}
      />
    ),
    cell: ({ row }) => <ExpiryBadge date={row.original.expiryDate} />,
    // Lọc theo mức cảnh báo suy ra từ chính ngày HSD, khỏi cần cột phụ.
    filterFn: (row, id, value) =>
      (value as string[]).includes(getExpiryStatus(row.getValue(id))),
  },
  {
    accessorKey: 'qtyRemaining',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.inStock')}
      />
    ),
    cell: ({ row }) => (
      <span className='font-medium tabular-nums'>
        {formatNumber(row.original.qtyRemaining)} {row.original.unit}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'qtyReceived',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.received')}
      />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground tabular-nums'>
        {formatNumber(row.original.qtyReceived)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'unitCost',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.purchasePrice')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{formatMoney(row.original.unitCost)}</span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    accessorKey: 'receiptCode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.goodsReceipt')}
      />
    ),
    cell: ({ row }) => (
      <div>
        <div className='font-mono text-xs'>{row.original.receiptCode}</div>
        <div className='text-xs text-muted-foreground'>
          {formatDate(row.original.receivedAt)}
        </div>
      </div>
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
      <span className='text-muted-foreground'>{row.original.supplierName}</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <BatchActions batch={row.original} />,
  },
]

export function BatchesTab() {
  const { t } = useTranslation()

  const search = useApiSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'batches', search],
    queryFn: () => GetBatches(search),
  })

  // Lô đã xuất/huỷ hết không còn ý nghĩa để theo dõi HSD.
  const batches = (data ?? []).filter((b) => b.qtyRemaining > 0)

  return (
    <UrlDataTable
      columns={columns}
      data={batches}
      isLoading={isLoading}
      searchPlaceholder={t('messages.searchBatchNumberMedicineOrSupplier')}
      emptyMessage={t('messages.noBatchesYet')}
      getSearchText={(b) =>
        `${b.batchNo} ${b.medicineName} ${b.medicineCode} ${b.supplierName} ${b.receiptCode}`
      }
      // Mặc định đưa lô sắp hết hạn lên trước, đó là việc cần xử lý sớm nhất.
      initialSorting={[{ id: 'expiryDate', desc: false }]}
      pageSize={15}
      rowClassName={(row) =>
        getExpiryStatus(row.original.expiryDate) === 'expired'
          ? 'bg-red-50/60 dark:bg-red-950/20'
          : undefined
      }
      filters={[
        {
          // Lọc trên cột `expiryDate` (nó mang filterFn quy HSD ra mức cảnh
          // báo). Trước đây trỏ 'expiryStatus' — cột đó không tồn tại nên
          // DataTableToolbar gặp `!column` và filter này âm thầm không hiện.
          columnId: 'expiryDate',
          searchKey: 'expiryStatus',
          title: t('messages.expiryDate'),
          options: expiryStatuses.map((s) => ({
            label: s.label,
            value: s.value,
            icon: s.icon,
          })),
        },
      ]}
    />
  )
}
