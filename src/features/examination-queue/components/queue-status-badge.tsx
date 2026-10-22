import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { type QueueStatus } from '../api'
import { statusMeta } from '../data/data'

export function QueueStatusBadge({ status }: { status: QueueStatus }) {
  useTranslation()

  const meta = statusMeta[status]
  return (
    <Badge variant='outline' className={meta.className}>
      {meta.label}
    </Badge>
  )
}
