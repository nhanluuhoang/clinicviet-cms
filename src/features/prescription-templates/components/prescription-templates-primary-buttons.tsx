import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { emptyItem } from '../data/constants'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplatesPrimaryButtons({
  setOpen,
  setCurrent,
  setName,
  setItems,
}: Pick<
  PrescriptionTemplatesState,
  'setOpen' | 'setCurrent' | 'setName' | 'setItems'
>) {
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => {
        setCurrent(null)
        setName('')
        setItems([emptyItem()])
        setOpen('create')
      }}
    >
      <Plus /> {t('messages.addPrescriptionTemplateAlt2')}
    </Button>
  )
}
