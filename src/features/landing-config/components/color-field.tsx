import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2'>
      <Label required>{label}</Label>
      <div className='flex gap-2'>
        <Input
          type='color'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className='h-9 w-12 cursor-pointer p-1'
          aria-label={t('messages.select', { value0: label.toLowerCase() })}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder='#176B5B'
          maxLength={7}
          className='font-mono uppercase'
        />
      </div>
    </div>
  )
}
