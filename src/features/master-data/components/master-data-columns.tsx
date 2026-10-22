import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import { DataTableColumnHeader } from '@/components/data-table'
import type { MasterData } from '../api'
import { DataTableRowActions } from './master-data-row-actions'

export const columns: ColumnDef<MasterData>[] = [
  {
    accessorKey: 'key',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.key')} />
    ),
    cell: ({ row }) => <div>{row.getValue('key')}</div>,
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.value')} />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('value')}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
