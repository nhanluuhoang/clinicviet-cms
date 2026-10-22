import i18n from '@/i18n'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SelectDropdownProps = {
  onValueChange?: (value: string) => void
  defaultValue: string | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
  standalone?: boolean
}

export function SelectDropdown({
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  isControlled = false,
  standalone = false,
}: SelectDropdownProps) {
  useTranslation()

  const defaultState = isControlled
    ? { value: defaultValue, onValueChange }
    : { defaultValue, onValueChange }
  const trigger = (
    <SelectTrigger disabled={disabled} className={cn(className)}>
      <SelectValue placeholder={placeholder ?? 'Select'} />
    </SelectTrigger>
  )

  return (
    <Select {...defaultState}>
      {standalone ? trigger : <FormControl>{trigger}</FormControl>}
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <Loader className='h-5 w-5 animate-spin' />
              {'  '}
              {i18n.t('messages.loadingText')}
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
