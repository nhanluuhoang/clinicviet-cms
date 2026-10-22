import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { findSupportRequests, getSupportTenants } from './api'
import { CreateRequestDialog } from './components/create-request-dialog'
import { RequestDetailDialog } from './components/request-detail-dialog'
import { RequestsTable } from './components/requests-table'
import { supportSearchSchema } from './data'

export function SupportRequests() {
  const { t } = useTranslation()

  const system = useAuthStore(
    (state) => state.auth.user?.role === 'SUPER_ADMIN'
  )
  const search = supportSearchSchema.parse(useSearch({ strict: false }))
  const [selected, setSelected] = useState<string | null>(null)
  const query = useQuery({
    queryKey: ['support-requests', system, search],
    queryFn: () =>
      findSupportRequests({
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
        search: search.filter || undefined,
        sort: search.sort || undefined,
        type: search.type?.[0],
        status: search.status?.[0],
        tenantId: system ? search.tenantId?.[0] : undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const tenants = useQuery({
    queryKey: ['support-requests', 'tenant-options'],
    queryFn: getSupportTenants,
    enabled: system,
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
            <h2 className='text-2xl font-bold tracking-tight'>
              {system
                ? t('messages.supportRequests')
                : t('messages.supportFeedback')}
            </h2>
            <p className='text-muted-foreground'>
              {system
                ? t('messages.receiveReplyToAndManageRequestsFromClinicsAndW')
                : t('messages.submitBugReportsAndFeatureRequestsAndTrackRepli')}
            </p>
          </div>
          {!system && <CreateRequestDialog onCreated={setSelected} />}
        </div>
        {query.isError ? (
          <div role='alert' className='space-y-2'>
            <p>{t('messages.couldNotLoadRequests')}</p>
            <Button variant='outline' onClick={() => void query.refetch()}>
              {t('messages.tryAgain')}
            </Button>
          </div>
        ) : (
          <RequestsTable
            data={query.data?.data ?? []}
            total={query.data?.total ?? 0}
            isLoading={query.isFetching}
            system={system}
            tenants={tenants.data ?? []}
            onOpen={setSelected}
          />
        )}
      </Main>
      {selected && (
        <RequestDetailDialog
          key={selected}
          id={selected}
          system={system}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
