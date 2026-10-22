import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { findTrialRequests } from './api'
import { TrialRequestsTable } from './components/trial-requests-table'
import { TRIAL_REQUEST_STATUS_OPTIONS } from './data'

export function TrialRequests() {
  const { t } = useTranslation()

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
            {t('messages.trialRequests')}
          </h2>
          <p className='text-muted-foreground'>
            {t('messages.receiveRequestsFromTheWebsiteAndCustomerReferral')}
          </p>
        </div>
        <TrialRequestsTable
          data={query.data?.data ?? []}
          isLoading={query.isLoading}
          searchPlaceholder={t('messages.searchPhoneNumberOrClinicCode')}
          emptyMessage={t('messages.noTrialRequestsYet')}
          mobileLabels={{
            phone: t('messages.phoneNumber'),
            createdAt: t('messages.registrationDate'),
            status: t('messages.status'),
            code: t('messages.clinicCode'),
            rejectionReason: t('messages.rejectionReason'),
            actions: t('messages.actions'),
            source: t('messages.source'),
            contactName: t('messages.referredPerson'),
            referrerName: t('messages.referrer'),
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
              title: t('messages.source'),
              variant: 'radio',
              options: [
                { label: 'Website', value: 'WEBSITE' },
                { label: t('messages.friendReferral'), value: 'REFERRAL' },
              ],
            },
            {
              columnId: 'status',
              title: t('messages.status'),
              variant: 'radio',
              options: TRIAL_REQUEST_STATUS_OPTIONS,
            },
          ]}
        />
      </Main>
    </>
  )
}
