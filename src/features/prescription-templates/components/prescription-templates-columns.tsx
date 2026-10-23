import { type ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
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
        <DataTableColumnHeader
          column={column}
          title={i18n.t('messages.templateName')}
        />
      ),
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.name}</span>
      ),
    },
    {
      id: 'medicines',
      header: i18n.t('messages.medicinesInTemplate'),
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.items.map((item) => item.medicineName).join(', ')}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'itemCount',
      header: i18n.t('messages.medicineCount'),
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
