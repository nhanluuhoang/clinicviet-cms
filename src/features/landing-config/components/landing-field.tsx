import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Field({
  label,
  value,
  onChange,
  placeholder,
  wide,
  readOnly,
  hint,
  required = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  wide?: boolean
  readOnly?: boolean
  hint?: string
  required?: boolean
}) {
  return (
    <div className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
      <Label required={required}>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={readOnly}
      />
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  )
}
