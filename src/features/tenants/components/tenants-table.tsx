import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type Tenant } from '../api'
import { columns } from './tenants-columns'

export function TenantsTable(
  props: Omit<React.ComponentProps<typeof UrlDataTable<Tenant>>, 'columns'>
) {
  return <UrlDataTable {...props} columns={columns} />
}
