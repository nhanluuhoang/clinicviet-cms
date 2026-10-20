import { ChevronDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const currency = (value: number) => `${formatNumber(value)} ₫`

export function InvoiceServiceFees({
  fees,
}: {
  fees: Array<{ amount: number; label: string; fallback: string }>
}) {
  const total = fees.reduce((sum, fee) => sum + fee.amount, 0)

  if (fees.length === 0) return <span className='text-muted-foreground'>—</span>

  const breakdown = (
    <dl className='min-w-0 space-y-2'>
      {fees.map((fee) => (
        <div
          key={fee.fallback}
          className='flex items-baseline justify-between gap-4'
        >
          <dt className='min-w-0 text-left break-words text-muted-foreground'>
            {fee.label || fee.fallback}
          </dt>
          <dd className='shrink-0 whitespace-nowrap tabular-nums'>
            {currency(fee.amount)}
          </dd>
        </div>
      ))}
    </dl>
  )

  return (
    <>
      <div className='sm:hidden'>{breakdown}</div>
      <div className='hidden sm:flex sm:justify-end'>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              className='h-auto gap-2 px-2 py-1.5 text-right font-normal'
              aria-label={`Xem chi tiết ${fees.length} khoản phí dịch vụ`}
            >
              <span className='flex flex-col items-end gap-0.5'>
                <span className='whitespace-nowrap tabular-nums'>
                  {currency(total)}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {fees.length} khoản phí
                </span>
              </span>
              <ChevronDown className='size-3.5 text-muted-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='w-80 max-w-[calc(100vw-2rem)] text-sm'
          >
            <p className='mb-3 font-medium'>Chi tiết phí dịch vụ</p>
            {breakdown}
            <div className='mt-3 flex items-baseline justify-between gap-4 border-t pt-3 font-medium'>
              <span>Tổng phí dịch vụ</span>
              <span className='whitespace-nowrap tabular-nums'>
                {currency(total)}
              </span>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
