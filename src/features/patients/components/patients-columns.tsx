import { type ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import { LongText } from '@/components/long-text'
import { type Patient } from '../api'
import { formatDate, genderLabel } from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'

/**
 * `address` và `note` cố ý không lên bảng — hai cột nữa sẽ làm bảng phải scroll
 * ngang liên tục. Xem/sửa chúng trong form.
 *
 * Sắp xếp và lọc là manual (server-side), nên cột nào backend chưa hỗ trợ sort
 * thì đặt `enableSorting: false` để không hiện mũi tên gây hiểu nhầm.
 */
export const patientsColumns: ColumnDef<Patient>[] = withAuditColumns([
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.fullName')}
      />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44'>{row.original.fullName}</LongText>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.phoneNumber')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {row.original.phone || <span className='text-muted-foreground'>—</span>}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.gender')}
      />
    ),
    cell: ({ row }) => <span>{genderLabel(row.original.gender)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.dateOfBirth')}
      />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatDate(row.original.dateOfBirth)}
      </span>
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.address')}
      />
    ),
    cell: ({ row }) =>
      row.original.address ? (
        <LongText className='max-w-44'>{row.original.address}</LongText>
      ) : (
        <span className='text-muted-foreground'>—</span>
      ),
    enableSorting: false,
  },
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('messages.notes')} />
    ),
    cell: ({ row }) =>
      row.original.note ? (
        <LongText className='max-w-44'>{row.original.note}</LongText>
      ) : (
        <span className='text-muted-foreground'>—</span>
      ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
])
