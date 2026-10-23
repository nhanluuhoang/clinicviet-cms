import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import type { Diagnosis } from '../api'

export function DiagnosesTable({
  data,
  total,
  isLoading,
  common,
  tenantId,
  onEdit,
  onDelete,
}: {
  data: Diagnosis[]
  total: number
  isLoading: boolean
  common: boolean
  tenantId?: string | null
  onEdit: (diagnosis: Diagnosis) => void
  onDelete: (diagnosis: Diagnosis) => void
}) {
  const { t } = useTranslation()
  const columns: ColumnDef<Diagnosis>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('diagnoses.name')} />
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
      header: t('diagnoses.scope'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.tenantId ? 'outline' : 'secondary'}>
          {t(row.original.tenantId ? 'diagnoses.CLINIC' : 'diagnoses.COMMON')}
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
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={t('diagnoses.editName', { name: row.original.name })}
              onClick={() => onEdit(row.original)}
            >
              <Edit className='size-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-destructive'
              aria-label={t('diagnoses.deleteName', {
                name: row.original.name,
              })}
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
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
      searchPlaceholder={t('diagnosisSuggestions.search')}
      emptyMessage={t('diagnoses.empty')}
      mobileLabels={{ name: 'diagnoses.name', scope: 'diagnoses.scope' }}
      filters={
        common
          ? []
          : [
              {
                columnId: 'scope',
                title: t('diagnoses.scope'),
                variant: 'radio',
                options: ['COMMON', 'CLINIC'].map((value) => ({
                  value,
                  label: t(`diagnoses.${value}`),
                })),
              },
            ]
      }
    />
  )
}
