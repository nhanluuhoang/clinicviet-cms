import { Plus } from 'lucide-react'
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
  return (
    <Button
      onClick={() => {
        setCurrent(null)
        setName('')
        setItems([emptyItem()])
        setOpen('create')
      }}
    >
      <Plus /> Thêm mẫu đơn
    </Button>
  )
}
