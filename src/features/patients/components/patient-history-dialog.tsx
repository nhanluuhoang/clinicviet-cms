import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogBody,
  DialogFormContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MedicalHistoryContent } from '@/features/examination-queue/components/medical-history-content'
import { type Patient } from '../api'

export function PatientHistoryDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
}) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent className='sm:max-w-4xl'>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>{t('messages.medicalHistoryAlt2')}</DialogTitle>
            <DialogDescription>{patient.fullName}</DialogDescription>
          </DialogHeader>
          <MedicalHistoryContent patient={patient} />
        </DialogBody>
      </DialogFormContent>
    </Dialog>
  )
}
