import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/number-input'

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
  const { t } = useTranslation()

  return (
    <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border p-3'>
      <Label htmlFor={`other-fee-label-${index}`}>{title}</Label>
      <Input
        id={`other-fee-label-${index}`}
        value={label}
        maxLength={255}
        className='w-full min-w-0'
        placeholder={t('messages.feeDescription')}
        onChange={(event) => onLabelChange(event.target.value)}
      />
      <div className='relative min-w-0'>
        <NumberInput
          min={0}
          aria-label={t('messages.amountAlt4', { value0: title })}
          value={amount}
          className='w-full min-w-0 pe-10 text-end tabular-nums'
          onValueChange={(value) => onAmountChange(Number(value))}
        />
        <span className='pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground'>
          ₫
        </span>
      </div>
    </div>
  )
}
