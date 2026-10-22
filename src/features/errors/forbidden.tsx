import { useTranslation } from 'react-i18next'
import { ErrorSignInButton } from './sign-in-button'

export function ForbiddenError() {
  const { t } = useTranslation()

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>{t('messages.accessDenied')}</span>
        <p className='text-center text-muted-foreground'>
          {t('messages.youDoNotHavePermission')} <br />{' '}
          {t('messages.toViewThisContent')}
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
