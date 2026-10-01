import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetMasterDatas } from '@/features/master-data/api'
import { DaysOffForm } from './components/days-off-form'
import { DAYS_OFF_KEY } from './data/constants'

export function ClinicDaysOff() {
  const { data, isLoading } = useQuery({
    queryKey: ['master-data', DAYS_OFF_KEY],
    queryFn: () => GetMasterDatas({ page: 1, key: DAYS_OFF_KEY }),
  })
  const item = data?.data.find((row) => row.key === DAYS_OFF_KEY)

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Ngày nghỉ phòng khám
          </h2>
          <p className='text-muted-foreground'>
            Cấu hình các ngày phòng khám không tiếp nhận lịch khám.
          </p>
        </div>
        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Đang tải ngày nghỉ...</p>
        ) : (
          <DaysOffForm key={item?.value ?? 'empty'} item={item} />
        )}
      </Main>
    </>
  )
}
