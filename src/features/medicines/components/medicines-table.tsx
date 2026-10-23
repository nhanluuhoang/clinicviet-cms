import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import i18n, { getLocale } from '@/i18n'
import { Edit, Trash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useApiSearch } from '@/hooks/use-api-search'
import { Badge } from '@/components/ui/badge'
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
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { GetMedicines, type Medicine } from '../api'
import { medicineGroupLabel, medicineGroups, medicineUnits } from '../data/data'
import { useMedicines } from './medicines-provider'

function RowActions({ medicine }: { medicine: Medicine }) {
  const { t } = useTranslation()

  const { setOpen, setCurrentMedicine } = useMedicines()

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
            setCurrentMedicine(medicine)
            setOpen('medicine-update')
          }}
        >
          {t('messages.update')}
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentMedicine(medicine)
            setOpen('medicine-delete')
          }}
          className='!text-red-500'
        >
          {t('messages.deleteAlt2')}
          <DropdownMenuShortcut>
            <Trash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat(getLocale()).format(value)

const columns: ColumnDef<Medicine>[] = withAuditColumns([
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.medicineName')}
      />
    ),
    cell: ({ row }) => (
      <div className='min-w-48'>
        <div className='font-medium'>{row.original.name}</div>
        <div className='text-xs text-muted-foreground'>
          {row.original.activeIngredient}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'strength',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.strength')}
      />
    ),
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.unit')} />
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'group',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.group')} />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal'>
        {medicineGroupLabel(row.original.group)}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'manufacturer',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.manufacturer')}
      />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{row.original.manufacturer}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'salePrice',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.sellingPrice')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(Number(row.original.salePrice))} ₫
      </span>
    ),
  },
  {
    accessorKey: 'minStock',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.minimumStock')}
      />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground tabular-nums'>
        {formatNumber(row.original.minStock)}
      </span>
    ),
    meta: { className: 'text-end', tdClassName: 'text-end' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions medicine={row.original} />,
  },
])

export function MedicinesTable() {
  const { t } = useTranslation()

  const search = useApiSearch()
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', search],
    queryFn: () => GetMedicines(search),
  })

  return (
    <UrlDataTable
      columns={columns}
      data={medicines ?? []}
      isLoading={isLoading}
      searchPlaceholder={t('messages.searchNameCodeOrActiveIngredientAlt3')}
      emptyMessage={t('messages.noMedicinesInTheCatalogYet')}
      mobileLabels={{ name: 'mobileTable.context.medicineName' }}
      getSearchText={(m) =>
        `${m.name} ${m.code} ${m.activeIngredient} ${m.manufacturer}`
      }
      pageSize={15}
      filters={[
        {
          columnId: 'unit',
          title: t('messages.unit'),
          variant: 'checkbox',
          options: medicineUnits.map((unit) => ({ label: unit, value: unit })),
        },
        {
          columnId: 'group',
          title: t('messages.medicineGroup'),
          options: medicineGroups.map((g) => ({
            label: g.label,
            value: g.value,
          })),
        },
      ]}
    />
  )
}
