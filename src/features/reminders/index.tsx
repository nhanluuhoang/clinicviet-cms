import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getToday } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getReminders } from './api'
import { RemindersTable } from './components/reminders-table'

const route = getRouteApi('/_authenticated/reminders/')

export function Reminders() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const dateFrom = search.dateFrom ?? getToday()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reminders', search, dateFrom],
    queryFn: () =>
      getReminders({
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
        search: search.filter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: search.dateTo || undefined,
        serviceType: search.serviceType?.[0],
        due: search.due?.[0],
        sort: search.sort,
      }),
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex min-w-0 flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('reminders.title')}
          </h2>
          <p className='text-muted-foreground'>{t('reminders.description')}</p>
        </div>
        {isError && (
          <p
            role='alert'
            className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'
          >
            {t('reminders.loadFailed')}
          </p>
        )}
        <RemindersTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          isLoading={isLoading}
          today={data?.today ?? ''}
          dateFrom={dateFrom}
        />
      </Main>
    </>
  )
}
