import type { ColumnDef } from '@tanstack/react-table'
import { formatNumber } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import type { Invoice } from '../api'

export const invoiceServiceTypes = [
  { label: 'Khám bệnh', value: 'EXAMINATION' },
  { label: 'Nhà thuốc', value: 'PHARMACY' },
  { label: 'Tiêm chủng', value: 'VACCINATION' },
]

export const invoiceColumns: ColumnDef<Invoice>[] = withAuditColumns([
  {
    accessorKey: 'invoiceCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã hóa đơn' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'issuedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày lập' />
    ),
    cell: ({ row }) =>
      new Date(row.original.issuedAt).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
    enableSorting: false,
  },
  {
    id: 'patientName',
    accessorFn: (invoice) => invoice.prescription.patient.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bệnh nhân' />
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    accessorFn: (invoice) => invoice.prescription.patient.phone || '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số điện thoại' />
    ),
    enableSorting: false,
  },
  {
    id: 'serviceType',
    accessorFn: (invoice) => invoice.prescription.medicalHistory.serviceType,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loại dịch vụ' />
    ),
    cell: ({ getValue }) =>
      invoiceServiceTypes.find((type) => type.value === getValue())?.label ??
      '-',
    enableSorting: false,
  },
  {
    id: 'doctorName',
    accessorFn: (invoice) =>
      invoice.prescription.medicalHistory.doctorName || '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bác sĩ' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tổng tiền' />
    ),
    cell: ({ row }) => (
      <span className='font-medium whitespace-nowrap tabular-nums'>
        {formatNumber(Number(row.original.totalAmount))} ₫
      </span>
    ),
    meta: { thClassName: 'text-right', tdClassName: 'text-right' },
    enableSorting: false,
  },
])
