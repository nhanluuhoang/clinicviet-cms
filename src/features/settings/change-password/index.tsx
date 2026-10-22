import { useTranslation } from 'react-i18next'
import { ContentSection } from '../components/content-section'
import { ChangePasswordForm } from './change-password-form'

export function SettingsChangePassword() {
  const { t } = useTranslation()

  return (
    <ContentSection
      title={t('messages.changePassword')}
      desc={t('messages.updateThePasswordUsedToSignIn')}
    >
      <ChangePasswordForm />
    </ContentSection>
  )
}
