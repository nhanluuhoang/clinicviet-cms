import { useTranslation } from 'react-i18next'
import { MONTH_OPTIONS, YEAR_OPTIONS } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function MonthPickerInput({
  id,
  value,
  onChange,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm sm:flex'>
      <Select
        value={value.slice(5, 7)}
        onValueChange={(month) => onChange(`${value.slice(0, 4)}-${month}`)}
      >
        <SelectTrigger
          id={id}
          aria-label={t('messages.selectMonth')}
          className='w-full min-w-0 border-0 shadow-none sm:w-36'
        >
          <SelectValue placeholder={t('messages.selectMonth')} />
        </SelectTrigger>
        <SelectContent>
          {MONTH_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t('messages.monthAlt2', { value0: Number(option.value) })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='my-1 w-px bg-border' />
      <Select
        value={value.slice(0, 4)}
        onValueChange={(year) => onChange(`${year}-${value.slice(5, 7)}`)}
      >
        <SelectTrigger
          aria-label={t('messages.selectYear')}
          className='w-full min-w-0 border-0 shadow-none sm:w-36'
        >
          <SelectValue placeholder={t('messages.selectYear')} />
        </SelectTrigger>
        <SelectContent>
          {YEAR_OPTIONS.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {t('messages.year')} {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
