import { useTranslation } from 'react-i18next'
import { type QueueEntry } from '../api'
import { QueueStatusBadge } from './queue-status-badge'

export function QueueHighlight({ item }: { item: QueueEntry }) {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div>
        <p className='font-medium'>{item.patient.fullName}</p>
        <p className='text-xs text-muted-foreground'>
          {item.reason || t('messages.noReasonSpecified')}
        </p>
      </div>
      <div className='text-right'>
        <p className='text-xl font-bold'>#{item.queueNumber ?? '—'}</p>
        <QueueStatusBadge status={item.status} />
      </div>
    </div>
  )
}
