import { type ColumnDef } from '@tanstack/react-table'
import { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type SupportRequest, type SupportTenant } from '../api'
import { statusLabels, typeLabels } from '../data'

type Props = {
  data: SupportRequest[]
  total: number
  isLoading: boolean
  system: boolean
  tenants: SupportTenant[]
  onOpen: (id: string) => void
}
export function RequestsTable({
  data,
  total,
  isLoading,
  system,
  tenants,
  onOpen,
}: Props) {
  const { t } = useTranslation()

  const columns: ColumnDef<SupportRequest>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('messages.title')} />
      ),
      cell: ({ row }) => (
        <span className='block max-w-sm truncate'>{row.original.title}</span>
      ),
    },
    ...(system
      ? [
          {
            id: 'tenantId',
            accessorFn: (request: SupportRequest) => request.tenantId,
            header: t('messages.clinics'),
            enableSorting: false,
            cell: ({ row }: { row: { original: SupportRequest } }) =>
              row.original.tenant
                ? `${row.original.tenant.name} (${row.original.tenant.code})`
                : row.original.organization || t('messages.websiteVisitor'),
          },
        ]
      : []),
    {
      id: 'creator',
      header: t('messages.submittedBy'),
      accessorFn: (request) =>
        request.creator?.fullName ??
        request.contactName ??
        t('messages.deletedAccount'),
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: t('messages.type'),
      cell: ({ row }) => typeLabels[row.original.type],
    },
    {
      accessorKey: 'status',
      header: t('messages.status'),
      cell: ({ row }) => statusLabels[row.original.status],
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('messages.submittedAt')}
        />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString(getLocale()),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('messages.update')} />
      ),
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleString(getLocale()),
    },
    {
      id: 'actions',
      header: t('messages.actions'),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onOpen(row.original.id)}
        >
          {t('messages.details')}
        </Button>
      ),
    },
  ]
  return (
    <UrlDataTable
      columns={columns}
      data={data}
      total={total}
      isLoading={isLoading}
      searchPlaceholder={t('messages.searchRequestsOrClinics')}
      emptyMessage={t('messages.noMatchingRequests')}
      getSearchText={(request) =>
        `${request.title} ${request.tenant?.name ?? request.organization ?? ''} ${request.tenant?.code ?? ''} ${request.contactName ?? ''} ${request.contactEmail ?? ''}`
      }
      mobileLabels={{
        title: t('messages.title'),
        tenantId: t('messages.clinics'),
        creator: t('messages.submittedBy'),
        type: t('messages.type'),
        status: t('messages.status'),
        createdAt: t('messages.submittedAt'),
        updatedAt: t('messages.update'),
        actions: t('messages.actions'),
      }}
      filters={[
        {
          columnId: 'type',
          title: t('messages.type'),
          variant: 'radio',
          options: Object.entries(typeLabels).map(([value, label]) => ({
            value,
            label,
          })),
        },
        {
          columnId: 'status',
          title: t('messages.status'),
          variant: 'radio',
          options: Object.entries(statusLabels).map(([value, label]) => ({
            value,
            label,
          })),
        },
        ...(system
          ? [
              {
                columnId: 'tenantId',
                title: t('messages.clinics'),
                variant: 'radio' as const,
                options: tenants.map((tenant) => ({
                  value: tenant.id,
                  label: `${tenant.name} (${tenant.code})`,
                })),
              },
            ]
          : []),
      ]}
    />
  )
}
