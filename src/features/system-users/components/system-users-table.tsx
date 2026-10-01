import { UrlDataTable } from '@/components/data-table/url-data-table'
import { type SystemUser } from '../api'
import { columns } from './system-users-columns'

export function SystemUsersTable(
  props: Omit<React.ComponentProps<typeof UrlDataTable<SystemUser>>, 'columns'>
) {
  return <UrlDataTable {...props} columns={columns} />
}
