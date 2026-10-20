import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function OtherFeeField({
  index,
  title,
  label,
  amount,
  onLabelChange,
  onAmountChange,
}: {
  index: number | string
  title: string
  label: string
  amount: number
  onLabelChange: (value: string) => void
  onAmountChange: (value: number) => void
}) {
  return (
    <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border p-3'>
      <Label htmlFor={`other-fee-label-${index}`}>{title}</Label>
      <Input
        id={`other-fee-label-${index}`}
        value={label}
        maxLength={255}
        className='w-full min-w-0'
        placeholder='Nội dung khoản thu'
        onChange={(event) => onLabelChange(event.target.value)}
      />
      <div className='relative min-w-0'>
        <Input
          type='text'
          inputMode='numeric'
          aria-label={`${title} - Số tiền`}
          value={amount.toLocaleString('vi-VN')}
          className='w-full min-w-0 pe-10 text-end tabular-nums'
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '')
            onAmountChange(digits ? Number(digits) : 0)
          }}
        />
        <span className='pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground'>
          ₫
        </span>
      </div>
    </div>
  )
}
