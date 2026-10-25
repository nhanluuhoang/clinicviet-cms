import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { CatalogRowActions } from '@/components/catalog-row-actions'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import type { MedicineInstruction } from '../api'

export function MedicineInstructionsTable({
  data,
  total,
  isLoading,
  common,
  tenantId,
  onEdit,
  onDelete,
}: {
  data: MedicineInstruction[]
  total: number
  isLoading: boolean
  common: boolean
  tenantId?: string | null
  onEdit: (medicineInstruction: MedicineInstruction) => void
  onDelete: (medicineInstruction: MedicineInstruction) => void
}) {
  const { t } = useTranslation()
  const columns: ColumnDef<MedicineInstruction>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('medicineInstructions.name')}
        />
      ),
      cell: ({ row }) => (
        <p className='max-w-lg font-medium break-words whitespace-pre-wrap'>
          {row.original.name}
        </p>
      ),
    },
    {
      id: 'scope',
      accessorFn: (row) => (row.tenantId ? 'CLINIC' : 'COMMON'),
      header: t('medicineInstructions.scope'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.tenantId ? 'outline' : 'secondary'}>
          {t(
            row.original.tenantId
              ? 'medicineInstructions.CLINIC'
              : 'medicineInstructions.COMMON'
          )}
        </Badge>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const editable = common
          ? row.original.tenantId === null
          : Boolean(tenantId && row.original.tenantId === tenantId)
        return editable ? (
          <CatalogRowActions
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ) : null
      },
    },
  ]
  return (
    <UrlDataTable
      columns={columns}
      data={data}
      total={total}
      isLoading={isLoading}
      initialSorting={[{ id: 'name', desc: false }]}
      searchPlaceholder={t('messages.searchInstructions')}
      emptyMessage={t('medicineInstructions.empty')}
      mobileLabels={{
        name: 'medicineInstructions.name',
        scope: 'medicineInstructions.scope',
      }}
      filters={
        common
          ? []
          : [
              {
                columnId: 'scope',
                title: t('medicineInstructions.scope'),
                variant: 'radio',
                options: ['COMMON', 'CLINIC'].map((value) => ({
                  value,
                  label: t(`medicineInstructions.${value}`),
                })),
              },
            ]
      }
    />
  )
}
