import { useTranslation } from 'react-i18next'
import { ErrorSignInButton } from './sign-in-button'

export function MaintenanceError() {
  const { t } = useTranslation()

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>503</h1>
        <span className='font-medium'>{t('messages.systemMaintenance')}</span>
        <p className='text-center text-muted-foreground'>
          {t('messages.theSystemIsCurrentlyUnavailable')} <br />{' '}
          {t('messages.weWillBeBackShortly')}
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
