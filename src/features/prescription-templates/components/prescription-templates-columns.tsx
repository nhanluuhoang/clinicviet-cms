import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PrescriptionTemplate } from '../api'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'
import { PrescriptionTemplateRowActions } from './prescription-template-row-actions'

export function getPrescriptionTemplatesColumns(
  actions: Pick<
    PrescriptionTemplatesState,
    'setCurrent' | 'setName' | 'setItems' | 'setOpen'
  >
) {
  const { setCurrent, setName, setItems, setOpen } = actions
  const columns: ColumnDef<PrescriptionTemplate>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tên mẫu' />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      ),
    },
    {
      id: 'medicines',
      header: 'Thuốc trong mẫu',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.items.map((item) => item.medicineName).join(', ')}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'itemCount',
      header: 'Số thuốc',
      cell: ({ row }) => row.original.items.length,
      meta: { className: 'text-end', tdClassName: 'text-end' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <PrescriptionTemplateRowActions
          template={row.original}
          {...{ setCurrent, setName, setItems, setOpen }}
        />
      ),
    },
  ]
  return columns
}
