import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants, type Tenant } from './api'
import { CreateTenantDialog } from './create-tenant-dialog'
import { TenantActions } from './tenant-actions'

const planLabels = { BASIC: 'Cơ bản', PLUS: 'Nâng cao', PRO: 'Chuyên nghiệp' }

const columns: ColumnDef<Tenant>[] = [
  { accessorKey: 'code', header: 'Mã' },
  { accessorKey: 'name', header: 'Phòng khám' },
  { accessorKey: 'subdomain', header: 'Subdomain' },
  {
    accessorKey: 'servicePlan',
    header: 'Gói',
    cell: ({ row }) => planLabels[row.original.servicePlan],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'subscriptionStatus',
    header: 'Trạng thái đăng ký',
    cell: ({ row }) =>
      ({
        TRIAL: 'Đăng ký dùng thử',
        ACTIVE: 'Đăng ký chính thức',
        EXPIRED: 'Hết hạn',
        SUSPENDED: 'Tạm ngưng',
      })[row.original.subscriptionStatus],
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'trialStartedAt',
    header: 'Bắt đầu dùng thử',
    cell: ({ row }) =>
      row.original.trialStartedAt
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
            new Date(row.original.trialStartedAt)
          )
        : '—',
  },
  {
    accessorKey: 'trialEndsAt',
    header: 'Hạn dùng thử',
    cell: ({ row }) =>
      row.original.trialEndsAt
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(
            new Date(row.original.trialEndsAt)
          )
        : '—',
  },
  {
    id: 'users',
    header: 'Tài khoản',
    cell: ({ row }) => row.original._count.users,
  },
  {
    accessorKey: 'lastActiveAt',
    header: 'Hoạt động gần nhất',
    cell: ({ row }) =>
      row.original.lastActiveAt
        ? new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(row.original.lastActiveAt))
        : 'Chưa có phiên hoạt động',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <TenantActions tenant={row.original} />,
  },
]

export function Tenants() {
  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Phòng khám</h2>
            <p className='text-muted-foreground'>
              Quản lý phòng khám, gói dùng thử và tài khoản.
            </p>
          </div>
          <CreateTenantDialog />
        </div>
        <UrlDataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          searchPlaceholder='Tìm theo mã, tên hoặc subdomain...'
          emptyMessage='Chưa có phòng khám.'
          mobileLabels={{
            code: 'Mã',
            name: 'Phòng khám',
            subdomain: 'Subdomain',
            servicePlan: 'Gói',
            subscriptionStatus: 'Trạng thái đăng ký',
            trialStartedAt: 'Bắt đầu dùng thử',
            trialEndsAt: 'Hạn dùng thử',
            users: 'Tài khoản',
            lastActiveAt: 'Hoạt động gần nhất',
            actions: 'Thao tác',
          }}
          getSearchText={(tenant) =>
            `${tenant.code} ${tenant.name} ${tenant.subdomain}`
          }
          filters={[
            {
              columnId: 'servicePlan',
              title: 'Gói dịch vụ',
              variant: 'radio',
              options: [
                { label: 'Cơ bản', value: 'BASIC' },
                { label: 'Nâng cao', value: 'PLUS' },
                { label: 'Chuyên nghiệp', value: 'PRO' },
              ],
            },
            {
              columnId: 'subscriptionStatus',
              title: 'Trạng thái đăng ký',
              variant: 'radio',
              options: [
                { label: 'Đăng ký dùng thử', value: 'TRIAL' },
                { label: 'Đăng ký chính thức', value: 'ACTIVE' },
                { label: 'Hết hạn', value: 'EXPIRED' },
                { label: 'Tạm ngưng', value: 'SUSPENDED' },
              ],
            },
          ]}
        />
      </Main>
    </>
  )
}
