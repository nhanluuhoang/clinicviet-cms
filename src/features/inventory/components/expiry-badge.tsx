import { useTranslation } from 'react-i18next'
import { cn, daysUntil, formatDate, getExpiryStatus } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { expiryMeta } from '../data/data'

export function ExpiryBadge({
  date,
  showDate = true,
  className,
}: {
  date: string | null
  showDate?: boolean
  className?: string
}) {
  const { t } = useTranslation()

  if (!date) {
    return <span className='text-muted-foreground'>—</span>
  }

  const status = getExpiryStatus(date)
  const meta = expiryMeta(status)
  const days = daysUntil(date)

  const remark =
    status === 'expired'
      ? t('messages.daysOverdue', { value0: Math.abs(days) })
      : days === 0
        ? t('messages.expiresToday')
        : t('messages.daysLeft', { value0: days })

  return (
    <div className={cn('flex items-center gap-2 whitespace-nowrap', className)}>
      {showDate && <span className='tabular-nums'>{formatDate(date)}</span>}
      <Badge
        variant='outline'
        className={cn('gap-1 font-normal', meta.badgeClass)}
      >
        <meta.icon className='size-3' />
        {remark}
      </Badge>
    </div>
  )
}
