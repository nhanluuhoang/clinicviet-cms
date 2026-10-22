import { useTranslation } from 'react-i18next'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type TrialRequest } from '../api'
import { columns } from './trial-requests-columns'

export function TrialRequestsTable(
  props: Omit<
    React.ComponentProps<typeof UrlDataTable<TrialRequest>>,
    'columns'
  >
) {
  useTranslation()

  return (
    <UrlDataTable
      {...props}
      columns={columns}
      mobileLabels={{
        code: 'mobileTable.context.clinicCode',
        createdAt: 'mobileTable.context.registeredAt',
        ...props.mobileLabels,
      }}
    />
  )
}
