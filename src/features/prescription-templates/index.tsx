import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PrescriptionTemplatesDeleteDialog } from './components/prescription-templates-delete-dialog'
import { PrescriptionTemplatesMutateDialog } from './components/prescription-templates-mutate-dialog'
import { PrescriptionTemplatesPrimaryButtons } from './components/prescription-templates-primary-buttons'
import { PrescriptionTemplatesTable } from './components/prescription-templates-table'
import { usePrescriptionTemplates } from './hooks/use-prescription-templates'

export function PrescriptionTemplates() {
  const state = usePrescriptionTemplates()
  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mẫu đơn thuốc</h2>
            <p className='text-muted-foreground'>
              Tạo các đơn thường dùng để chọn nhanh khi kê toa.
            </p>
          </div>
          <PrescriptionTemplatesPrimaryButtons {...state} />
        </div>
        <PrescriptionTemplatesTable {...state} />
      </Main>

      <PrescriptionTemplatesMutateDialog {...state} />

      <PrescriptionTemplatesDeleteDialog {...state} />
    </>
  )
}
