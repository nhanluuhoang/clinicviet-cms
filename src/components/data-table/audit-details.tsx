import type { VisibilityState } from '@tanstack/react-table'
import {
  auditLabels,
  formatAuditValue,
  type AuditColumnId,
  type AuditFields,
} from './audit-columns'

export function AuditDetails({
  record,
  visibility,
}: {
  record: AuditFields
  visibility: VisibilityState
}) {
  const keys = (Object.keys(auditLabels) as AuditColumnId[]).filter(
    (key) => visibility[key] !== false
  )
  if (!keys.length) return null
  return (
    <dl className='mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4'>
      {keys.map((key) => (
        <div key={key} className='min-w-0'>
          <dt className='text-muted-foreground'>{auditLabels[key]}</dt>
          <dd className='break-words' title={record[key] ?? undefined}>
            {formatAuditValue(record, key)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
