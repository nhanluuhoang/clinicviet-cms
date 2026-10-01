import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className='border-b bg-muted/20'>
        <div className='flex gap-3'>
          <span className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Icon className='size-5' />
          </span>
          <div>
            <CardTitle className='text-base'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid gap-5 pt-6 md:grid-cols-2'>
        {children}
      </CardContent>
    </Card>
  )
}
