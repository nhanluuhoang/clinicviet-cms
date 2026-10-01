import { type Stethoscope } from 'lucide-react'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Stethoscope
  title: string
  description: string
}) {
  return (
    <CardHeader className='flex flex-row items-start gap-3 space-y-0 border-b bg-muted/20'>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <Icon className='size-5' />
      </div>
      <div className='space-y-1'>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
  )
}
