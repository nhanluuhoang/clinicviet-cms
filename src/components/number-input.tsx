import { useEffect, useRef, type ComponentProps } from 'react'
import { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { NumericFormat } from 'react-number-format'
import { Input } from '@/components/ui/input'

type NumberInputProps = Omit<
  ComponentProps<typeof Input>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value: string | number | undefined
  onValueChange: (value: string) => void
}

/** Displays localized grouping while emitting an unformatted numeric string. */
export function NumberInput({
  value,
  onValueChange,
  ref,
  min,
  max,
  step = 1,
  ...props
}: NumberInputProps) {
  useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const parts = new Intl.NumberFormat(getLocale()).formatToParts(12345.6)
  const group = parts.find((part) => part.type === 'group')!.value
  const decimal = parts.find((part) => part.type === 'decimal')!.value

  useEffect(() => {
    // Text inputs need the same min/max/step validation as native number inputs.
    const validator = document.createElement('input')
    validator.type = 'number'
    if (min !== undefined) validator.min = String(min)
    if (max !== undefined) validator.max = String(max)
    validator.step = String(step)
    validator.value = value === undefined ? '' : String(value)
    inputRef.current?.setCustomValidity(validator.validationMessage)
  }, [value, min, max, step])

  return (
    <NumericFormat
      {...props}
      customInput={Input}
      getInputRef={(element: HTMLInputElement | null) => {
        inputRef.current = element
        if (typeof ref === 'function') ref(element)
        else if (ref) ref.current = element
      }}
      type='text'
      inputMode='decimal'
      value={value ?? ''}
      valueIsNumericString
      allowNegative={min === undefined || Number(min) < 0}
      thousandSeparator={group}
      decimalSeparator={decimal}
      allowedDecimalSeparators={[decimal]}
      onChange={undefined}
      onValueChange={(values, source) => {
        if (source.source === 'event')
          onValueChange(values.value === '.' ? '0.' : values.value)
      }}
    />
  )
}
