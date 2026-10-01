import { toast } from 'sonner'
import { useServicePrescriptionForm } from '../hooks/use-service-prescription-form'
import type { ServicePrescriptionFormProps } from '../types'
import { PatientInformationSection } from './patient-information-section'
import { PrescriptionItemsSection } from './prescription-items-section'
import { ServiceFeesSection } from './service-fees-section'
import { VaccinationSection } from './vaccination-section'

export function ServicePrescriptionForm(props: ServicePrescriptionFormProps) {
  const state = useServicePrescriptionForm(props)
  const { formId, canEditPrescription, showVaccination, save, isValid } = state
  return (
    <div className='grid gap-6'>
      <form
        id={formId}
        className='grid gap-6'
        onSubmit={(event) => {
          event.preventDefault()
          if (isValid) {
            save.mutate()
          } else {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
          }
        }}
      >
        <div className='grid gap-6'>
          <PatientInformationSection {...state} />

          {showVaccination && <VaccinationSection {...state} />}
          {canEditPrescription ? (
            <>
              <PrescriptionItemsSection {...state} />
              <ServiceFeesSection {...state} />
            </>
          ) : (
            <p className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground'>
              Hồ sơ này chưa có phiếu thuốc hoặc hóa đơn. Bạn có thể cập nhật
              thông tin hồ sơ; phần thuốc và chi phí không áp dụng.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
