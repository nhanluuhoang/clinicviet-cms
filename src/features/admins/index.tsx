import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
// import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { FindStaff } from './api'
import { AdminsDialogs } from './components/admins-dialogs'
import { AdminsPrimaryButtons } from './components/admins-primary-buttons'
import { AdminsProvider } from './components/admins-provider'
import { AdminsTable } from './components/admins-table'

const route = getRouteApi('/_authenticated/admins/')

type AdminsSearch = {
  page: number
  pageSize: number
  fullName: string
  phone: string
  gender: string
  role?: ('TENANT_ADMIN' | 'DOCTOR' | 'ASSISTANT')[]
  isActive?: ('true' | 'false')[]
  sort: string
}

export function Admins() {
  const { t } = useTranslation()

  const search = route.useSearch() as unknown as AdminsSearch
  const navigate = route.useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      FindStaff({
        fullName: search.fullName || '',
        role: search.role?.[0],
        isActive: search.isActive?.[0],
        page: search.page || 1,
        pageSize: search.pageSize || 10,
      }),
  })

  return (
    <AdminsProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('messages.staff')}
            </h2>
            <p className='text-muted-foreground'>
              {t('messages.manageDoctorAndAssistantAccountsForTheClinic')}
            </p>
          </div>
          <AdminsPrimaryButtons />
        </div>
        <AdminsTable
          data={data?.data || []}
          total={data?.total || 0}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>

      <AdminsDialogs />
    </AdminsProvider>
  )
}
