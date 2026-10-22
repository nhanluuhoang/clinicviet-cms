import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { usePatients } from './patients-provider'

export function PatientsPrimaryButtons() {
  const { t } = useTranslation()

  const { setOpen } = usePatients()
  return (
    <Button data-tour='create-patient' onClick={() => setOpen('create')}>
      {t('messages.addPatient')}
      <Plus size={18} />
    </Button>
  )
}
