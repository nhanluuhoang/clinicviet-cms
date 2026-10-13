import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LandingConfigForm } from './components/landing-config-form'
import { useLandingConfigForm } from './hooks/use-landing-config-form'

export function LandingConfigPage() {
  const state = useLandingConfigForm()
  const { isLoading } = state
  if (isLoading) {
    return (
      <Main className='mx-auto w-full max-w-4xl'>
        <p className='text-sm text-muted-foreground'>Đang tải cấu hình...</p>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-3'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='mx-auto w-full max-w-4xl space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Trang giới thiệu phòng khám
          </h2>
          <p className='text-muted-foreground'>
            Tùy chỉnh nội dung và giao diện hiển thị cho tenant hiện tại.
          </p>
        </div>

        <LandingConfigForm {...state} />
      </Main>
    </>
  )
}
