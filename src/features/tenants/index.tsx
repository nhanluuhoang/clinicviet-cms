import { useQuery } from '@tanstack/react-query'
import { SERVICE_PLAN_OPTIONS } from '@/config/service-plans'
import { SUBSCRIPTION_STATUS_OPTIONS } from '@/config/subscription-statuses'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { useApiTableParams } from '@/hooks/use-api-table-params'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants } from './api'
import { CreateTenantDialog } from './components/create-tenant-dialog'
import { TenantsTable } from './components/tenants-table'

export function Tenants() {
  const { t } = useTranslation()
  const params = useApiTableParams()

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', params],
    queryFn: () => getTenants(params),
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
              {t('messages.clinics')}
            </h2>
            <p className='text-muted-foreground'>
              {t('messages.manageClinicsServicePlansAndAccounts')}
            </p>
          </div>
          <CreateTenantDialog />
        </div>
        <TenantsTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          isLoading={isLoading}
          searchPlaceholder={t('messages.searchByCodeNameOrSubdomain')}
          emptyMessage={t('messages.noClinicsYet')}
          mobileLabels={{
            code: t('messages.code'),
            name: t('messages.clinics'),
            get subdomain() {
              return i18n.t('messages.subdomain')
            },
            note: t('messages.notes'),
            servicePlan: t('messages.plan'),
            storageLimitGb: t('messages.capacity'),
            subscriptionEndsAt: t('messages.expiryDate'),
            subscriptionStatus: t('messages.usageStatus'),
            users: t('messages.account'),
            lastActiveAt: t('messages.lastActive'),
            actions: t('messages.actions'),
          }}
          getSearchText={(tenant) =>
            `${tenant.code} ${tenant.name} ${tenant.subdomain ?? ''} ${tenant.note}`
          }
          filters={[
            {
              columnId: 'servicePlan',
              title: t('messages.servicePlanAlt2'),
              variant: 'radio',
              options: SERVICE_PLAN_OPTIONS,
            },
            {
              columnId: 'subscriptionStatus',
              title: t('messages.usageStatus'),
              variant: 'radio',
              options: SUBSCRIPTION_STATUS_OPTIONS,
            },
          ]}
        />
      </Main>
    </>
  )
}
