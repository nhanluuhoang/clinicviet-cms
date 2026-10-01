import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { findTrialRequests } from './api'
import { TrialRequestsTable } from './components/trial-requests-table'

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
        <TrialRequestsTable
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
              variant: 'radio',
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
