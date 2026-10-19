import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { findTrialRequests } from './api'
import { TrialRequestsTable } from './components/trial-requests-table'
import { TRIAL_REQUEST_STATUS_OPTIONS } from './data'

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
            Tiếp nhận yêu cầu từ website và khách hàng giới thiệu bạn bè.
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
            source: 'Nguồn',
            contactName: 'Người được giới thiệu',
            referrerName: 'Người giới thiệu',
          }}
          getSearchText={(request) =>
            [
              request.phone,
              request.code,
              request.contactName,
              request.referrerName,
              request.referrerClinicName,
            ]
              .filter(Boolean)
              .join(' ')
          }
          filters={[
            {
              columnId: 'source',
              title: 'Nguồn',
              variant: 'radio',
              options: [
                { label: 'Website', value: 'WEBSITE' },
                { label: 'Bạn bè giới thiệu', value: 'REFERRAL' },
              ],
            },
            {
              columnId: 'status',
              title: 'Trạng thái',
              variant: 'radio',
              options: TRIAL_REQUEST_STATUS_OPTIONS,
            },
          ]}
        />
      </Main>
    </>
  )
}
