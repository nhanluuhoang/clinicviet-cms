import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SYSTEM_USER_ROLE_OPTIONS } from '@/config/user-role-labels'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getTenants } from '@/features/tenants/api'
import { getSystemUsers, type SystemUserRole } from './api'
import { CreateSystemUserDialog } from './components/create-system-user-dialog'
import { SystemUsersTable } from './components/system-users-table'

const route = getRouteApi('/_authenticated/system/users')

export function SystemUsers() {
  const { t } = useTranslation()

  const { tenantId, role } = route.useSearch()
  const [createOpen, setCreateOpen] = useState(false)
  const tenants = useQuery({ queryKey: ['tenants'], queryFn: getTenants })
  const users = useQuery({
    queryKey: ['system-users', tenantId?.[0], role?.[0]],
    queryFn: () =>
      getSystemUsers({
        tenantId: tenantId?.[0],
        role: role?.[0] as SystemUserRole | undefined,
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
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('messages.users')}
            </h2>
            <p className='text-muted-foreground'>
              {t('messages.accountsByClinicAndRole')}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            {t('messages.createAccount')}
          </Button>
        </div>
        <SystemUsersTable
          data={users.data?.data ?? []}
          isLoading={users.isLoading}
          searchPlaceholder={t('messages.searchUsernameFullNameOrEmail')}
          emptyMessage={t('messages.noMatchingUsers')}
          mobileLabels={{
            userName: t('messages.username'),
            fullName: t('messages.fullName'),
            email: 'Email',
            tenantId: t('messages.clinics'),
            role: t('messages.role'),
            isActive: t('messages.status'),
            lastActiveAt: t('messages.lastActive'),
            actions: t('messages.actions'),
          }}
          getSearchText={(user) =>
            `${user.userName} ${user.fullName} ${user.email ?? ''} ${user.tenant.code} ${user.tenant.name}`
          }
          filters={[
            {
              columnId: 'tenantId',
              title: t('messages.clinics'),
              variant: 'radio',
              options: (tenants.data?.data ?? []).map((tenant) => ({
                label: `${tenant.code} - ${tenant.name}`,
                value: tenant.id,
              })),
            },
            {
              columnId: 'role',
              title: t('messages.role'),
              variant: 'radio',
              options: SYSTEM_USER_ROLE_OPTIONS,
            },
          ]}
        />
      </Main>
      <CreateSystemUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenants={tenants.data?.data ?? []}
      />
    </>
  )
}
