import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants } from './api'
import { CreateTenantDialog } from './components/create-tenant-dialog'
import { TenantsTable } from './components/tenants-table'

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
        <TenantsTable
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
