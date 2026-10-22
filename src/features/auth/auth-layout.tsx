import { useTranslation } from 'react-i18next'
import { Logo } from '@/assets/logo'
import { LanguageSwitcher } from '@/components/language-switcher'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className='relative container flex min-h-svh max-w-none items-center justify-center'>
      <div className='absolute top-4 right-4'>
        <LanguageSwitcher />
      </div>
      <div className='flex w-full max-w-[480px] flex-col justify-center space-y-2 py-8 sm:p-8'>
        <div className='mb-4 flex items-center justify-center gap-3'>
          <Logo className='size-10' />
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('auth.appName')}
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
