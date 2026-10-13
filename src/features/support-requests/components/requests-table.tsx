import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type SupportRequest } from '../api'
import { statusLabels, typeLabels } from '../data'

type Props = {
  data: SupportRequest[]
  total: number
  isLoading: boolean
  system: boolean
  tenants: SupportRequest['tenant'][]
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
  const columns: ColumnDef<SupportRequest>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tiêu đề' />
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
            header: 'Phòng khám',
            enableSorting: false,
            cell: ({ row }: { row: { original: SupportRequest } }) =>
              `${row.original.tenant.name} (${row.original.tenant.code})`,
          },
        ]
      : []),
    {
      id: 'creator',
      header: 'Người gửi',
      accessorFn: (request) => request.creator?.fullName ?? 'Tài khoản đã xóa',
      enableSorting: false,
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => typeLabels[row.original.type],
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => statusLabels[row.original.status],
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày gửi' />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString('vi-VN'),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cập nhật' />
      ),
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleString('vi-VN'),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onOpen(row.original.id)}
        >
          Chi tiết
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
      searchPlaceholder='Tìm yêu cầu, phòng khám…'
      emptyMessage='Chưa có yêu cầu phù hợp.'
      getSearchText={(request) =>
        `${request.title} ${request.tenant.name} ${request.tenant.code}`
      }
      mobileLabels={{
        title: 'Tiêu đề',
        tenantId: 'Phòng khám',
        creator: 'Người gửi',
        type: 'Loại',
        status: 'Trạng thái',
        createdAt: 'Ngày gửi',
        updatedAt: 'Cập nhật',
        actions: 'Thao tác',
      }}
      filters={[
        {
          columnId: 'type',
          title: 'Loại',
          variant: 'radio',
          options: Object.entries(typeLabels).map(([value, label]) => ({
            value,
            label,
          })),
        },
        {
          columnId: 'status',
          title: 'Trạng thái',
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
                title: 'Phòng khám',
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
