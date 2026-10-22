import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getToday } from '@/lib/utils'
// import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getMedicalHistoryList } from './api'
import { MedicalHistoriesTable } from './components/medical-histories-table'

const route = getRouteApi('/_authenticated/medical-histories/')

export function MedicalHistories() {
  const { t } = useTranslation()

  const search = route.useSearch()
  const navigate = route.useNavigate()
  const date = search.date ?? getToday()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['medical-histories', search, date],
    queryFn: () =>
      getMedicalHistoryList({
        patientName: search.patientName || undefined,
        doctorName: search.doctorName || undefined,
        date: date || undefined,
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
      }),
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex min-w-0 flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('messages.medicalHistory')}
          </h2>
          <p className='text-muted-foreground'>
            {t('messages.manageMedicalHistoryForAllPatients')}
          </p>
        </div>

        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            {t('messages.couldNotLoadMedicalHistoryPleaseTryAgain')}
          </p>
        )}

        <MedicalHistoriesTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          date={date}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>
    </>
  )
}
