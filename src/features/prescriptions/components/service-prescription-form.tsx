import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useServicePrescriptionForm } from '../hooks/use-service-prescription-form'
import type { ServicePrescriptionFormProps } from '../types'
import { PatientInformationSection } from './patient-information-section'
import { PrescriptionItemsSection } from './prescription-items-section'
import { ServiceFeesSection } from './service-fees-section'
import { VaccinationSection } from './vaccination-section'

export function ServicePrescriptionForm(props: ServicePrescriptionFormProps) {
  const { t } = useTranslation()

  const state = useServicePrescriptionForm(props)
  const { formId, canEditPrescription, showVaccination, save, isValid } = state
  return (
    <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6'>
      <form
        id={formId}
        className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6'
        onSubmit={(event) => {
          event.preventDefault()
          if (isValid) {
            save.mutate()
          } else {
            toast.error(t('messages.pleaseCompleteAllRequiredInformation'))
          }
        }}
      >
        <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6'>
          <PatientInformationSection {...state} />

          {showVaccination && <VaccinationSection {...state} />}
          {canEditPrescription ? (
            <>
              <PrescriptionItemsSection {...state} />
              <ServiceFeesSection {...state} />
            </>
          ) : (
            <p className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground'>
              {t('messages.thisRecordHasNoPrescriptionOrInvoiceYouCanUpda')}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
