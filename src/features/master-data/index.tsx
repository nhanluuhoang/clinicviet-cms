import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { MasterDataForm } from './components/master-data-form'
import {
  CONSULTATION_FEE_KEY,
  SHOW_MEDICINES_TO_PATIENT_KEY,
  MEDICINE_INSTRUCTION_OPTIONS_KEY,
} from './data/constants'
import { GetMasterDatas } from '@/features/master-data/api'

export function MasterData() {
  const tenantId = useAuthStore((state) => state.auth.user?.tenantId)
  const { data, isLoading } = useQuery({
    queryKey: ['master-data', tenantId],
    queryFn: () => GetMasterDatas(),
    enabled: !!tenantId,
    staleTime: 0,
    gcTime: 0,
  })
  const consultationFeeItem = data?.data.find(
    (row) => row.key === CONSULTATION_FEE_KEY
  )
  const showMedicinesItem = data?.data.find(
    (row) => row.key === SHOW_MEDICINES_TO_PATIENT_KEY
  )
  const defaultAdviceItem = data?.data.find(
    (row) => row.key === MEDICINE_INSTRUCTION_OPTIONS_KEY
  )

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Cấu hình</h2>
          <p className='text-muted-foreground'>
            Thiết lập các giá trị mặc định của phòng khám.
          </p>
        </div>
        <div className='w-full'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>
              Đang tải cấu hình...
            </p>
          ) : (
            <MasterDataForm
              key={`${consultationFeeItem?.value ?? '0'}:${showMedicinesItem?.value ?? 'true'}:${defaultAdviceItem?.value ?? ''}`}
              consultationFeeItem={consultationFeeItem}
              showMedicinesItem={showMedicinesItem}
              defaultAdviceItem={defaultAdviceItem}
            />
          )}
        </div>
      </Main>
    </>
  )
}
