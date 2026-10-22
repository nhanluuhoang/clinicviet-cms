import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useMasterData } from './master-data-provider'

export function MasterDataPrimaryButtons() {
  const { t } = useTranslation()

  const { setOpen } = useMasterData()
  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('create')}>
        <Plus size={18} />
        <span>{t('messages.createNew')}</span>
      </Button>
    </div>
  )
}
