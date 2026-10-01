import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type TrialRequest } from '../api'
import { columns } from './trial-requests-columns'

export function TrialRequestsTable(
  props: Omit<
    React.ComponentProps<typeof UrlDataTable<TrialRequest>>,
    'columns'
  >
) {
  return <UrlDataTable {...props} columns={columns} />
}
