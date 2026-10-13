import { Label } from '@/components/ui/label'

export function Field({
  label,
  className,
  htmlFor,
  children,
}: {
  label: string
  className?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  const required = label.endsWith(' *')

  return (
    <div className={`grid gap-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor} required={required}>
        {required ? label.slice(0, -2) : label}
      </Label>
      {children}
    </div>
  )
}
