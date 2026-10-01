import { ClipboardCheck, PackageMinus, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type InventoryTab } from '../data/data'
import { useInventory } from './inventory-provider'
import { ReceiptsExcelActions } from './receipts-excel-actions'

export function PrimaryButtons({ tab }: { tab: InventoryTab }) {
  const { setOpen } = useInventory()

  if (tab === 'stocktakes') {
    return (
      <Button
        data-tour='create-stocktake'
        onClick={() => setOpen('stocktake-create')}
      >
        Kiểm kê
        <ClipboardCheck className='size-4' />
      </Button>
    )
  }

  if (tab === 'issues') {
    return (
      <Button data-tour='create-issue' onClick={() => setOpen('issue-create')}>
        <PackageMinus className='size-4' />
        Xuất hàng
      </Button>
    )
  }

  if (tab === 'receipts') {
    return (
      <div className='flex flex-wrap items-center gap-2'>
        <ReceiptsExcelActions />
        <Button
          data-tour='create-receipt'
          onClick={() => setOpen('receipt-create')}
        >
          <PackagePlus className='size-4' />
          Nhập hàng
        </Button>
      </div>
    )
  }

  return null
}
