import { useTranslation } from 'react-i18next'
import { ErrorSignInButton } from './sign-in-button'

export function NotFoundError() {
  const { t } = useTranslation()

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>404</h1>
        <span className='font-medium'>{t('messages.pageNotFound')}</span>
        <p className='text-center text-muted-foreground'>
          {t('messages.thePageYouAreLookingForDoesNotExist')} <br />{' '}
          {t('messages.orMayHaveBeenDeleted')}
        </p>
        <div className='mt-6 flex gap-4'>
          <ErrorSignInButton />
        </div>
      </div>
    </div>
  )
}
