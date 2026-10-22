import { ClipboardCheck, PackageMinus, PackagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { type InventoryTab } from '../data/data'
import { useInventory } from './inventory-provider'

export function PrimaryButtons({ tab }: { tab: InventoryTab }) {
  const { t } = useTranslation()

  const { setOpen } = useInventory()

  if (tab === 'stocktakes') {
    return (
      <Button
        data-tour='create-stocktake'
        onClick={() => setOpen('stocktake-create')}
      >
        {t('messages.stocktake')}
        <ClipboardCheck className='size-4' />
      </Button>
    )
  }

  if (tab === 'issues') {
    return (
      <Button data-tour='create-issue' onClick={() => setOpen('issue-create')}>
        <PackageMinus className='size-4' />
        {t('messages.issues')}
      </Button>
    )
  }

  if (tab === 'receipts') {
    return (
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          data-tour='create-receipt'
          onClick={() => setOpen('receipt-create')}
        >
          <PackagePlus className='size-4' />
          {t('messages.receipts')}
        </Button>
      </div>
    )
  }

  return null
}
