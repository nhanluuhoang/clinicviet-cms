import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { findTrialRequests, type TrialRequest } from './api'
import { TrialRequestActions } from './trial-request-actions'

const statusLabels = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
}
const columns: ColumnDef<TrialRequest>[] = [
  { accessorKey: 'phone', header: 'Số điện thoại' },
  {
    accessorKey: 'createdAt',
    header: 'Ngày đăng ký',
    cell: ({ row }) =>
      new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'PENDING' ? 'default' : 'outline'}
      >
        {statusLabels[row.original.status]}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'code',
    header: 'Mã phòng khám',
    cell: ({ row }) => row.original.code ?? '—',
  },
  {
    accessorKey: 'rejectionReason',
    header: 'Lý do từ chối',
    cell: ({ row }) => row.original.rejectionReason ?? '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TrialRequestActions request={row.original} />,
  },
]

export function TrialRequests() {
  const query = useQuery({
    queryKey: ['trial-requests'],
    queryFn: findTrialRequests,
  })
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Yêu cầu dùng thử
          </h2>
          <p className='text-muted-foreground'>
            Duyệt hoặc từ chối đăng ký dùng thử từ khách hàng.
          </p>
        </div>
        <UrlDataTable
          columns={columns}
          data={query.data?.data ?? []}
          isLoading={query.isLoading}
          searchPlaceholder='Tìm theo số điện thoại hoặc mã phòng khám...'
          emptyMessage='Chưa có yêu cầu dùng thử.'
          mobileLabels={{
            phone: 'Số điện thoại',
            createdAt: 'Ngày đăng ký',
            status: 'Trạng thái',
            code: 'Mã phòng khám',
            rejectionReason: 'Lý do từ chối',
            actions: 'Thao tác',
          }}
          getSearchText={(request) => `${request.phone} ${request.code ?? ''}`}
          filters={[
            {
              columnId: 'status',
              title: 'Trạng thái',
              options: [
                { label: 'Chờ duyệt', value: 'PENDING' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Đã từ chối', value: 'REJECTED' },
              ],
            },
          ]}
        />
      </Main>
    </>
  )
}
