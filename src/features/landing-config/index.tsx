import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LandingConfigForm } from './components/landing-config-form'
import { useLandingConfigForm } from './hooks/use-landing-config-form'

export function LandingConfigPage() {
  const { t } = useTranslation()

  const state = useLandingConfigForm()
  const { isLoading } = state
  if (isLoading) {
    return (
      <Main className='mx-auto w-full max-w-4xl'>
        <p className='text-sm text-muted-foreground'>
          {t('messages.loadingConfiguration')}
        </p>
      </Main>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-3'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='mx-auto w-full max-w-4xl space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('messages.clinicWebsiteAlt2')}
          </h2>
          <p className='text-muted-foreground'>
            {t('messages.customizeContentAndAppearanceForTheCurrentClinic')}
          </p>
        </div>

        <LandingConfigForm {...state} />
      </Main>
    </>
  )
}
