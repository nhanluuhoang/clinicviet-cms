import type { ColumnDef } from '@tanstack/react-table'
import { formatNumber } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import type { Invoice } from '../api'

export const invoiceMobileLabels = {
  invoiceCode: 'Mã hóa đơn',
  issuedAt: 'Ngày lập hóa đơn',
  patientName: 'Bệnh nhân',
  phone: 'Số điện thoại',
  serviceType: 'Loại dịch vụ',
  doctorName: 'Bác sĩ',
  totalAmount: 'Tổng tiền',
  consultationFee: 'Phí khám',
  medicineRevenue: 'Tiền thuốc',
  serviceFee: 'Phí dịch vụ',
}

const feeKeys = [
  ['serviceFee', 'serviceFeeLabel'],
  ['otherFee1', 'otherFee1Label'],
  ['otherFee2', 'otherFee2Label'],
  ['otherFee3', 'otherFee3Label'],
] as const

function serviceFees(invoice: Invoice) {
  return feeKeys
    .map(([amountKey, labelKey], index) => ({
      amount: Number(invoice[amountKey]),
      label: invoice[labelKey].trim(),
      fallback: index === 0 ? 'Phí dịch vụ' : `Phí khác ${index}`,
    }))
    .filter((fee) => fee.amount !== 0 || fee.label !== '')
}

const currency = (value: number | string) => `${formatNumber(Number(value))} ₫`

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
    accessorKey: 'consultationFee',
    header: 'Phí khám',
    cell: ({ row }) => (
      <span className='whitespace-nowrap tabular-nums'>
        {currency(row.original.consultationFee)}
      </span>
    ),
    meta: { thClassName: 'text-right', tdClassName: 'text-right' },
    enableSorting: false,
  },
  {
    accessorKey: 'medicineRevenue',
    header: 'Tiền thuốc',
    cell: ({ row }) => (
      <span className='whitespace-nowrap tabular-nums'>
        {currency(row.original.medicineRevenue)}
      </span>
    ),
    meta: { thClassName: 'text-right', tdClassName: 'text-right' },
    enableSorting: false,
  },
  {
    accessorKey: 'serviceFee',
    header: 'Phí dịch vụ',
    cell: ({ row }) => (
      <div className='min-w-0 space-y-2 sm:min-w-[220px]'>
        {serviceFees(row.original).map((fee) => (
          <div
            key={fee.fallback}
            className='flex items-baseline justify-between gap-4'
          >
            <div className='min-w-0 text-left break-words text-muted-foreground'>
              {fee.label || fee.fallback}
            </div>
            <span className='shrink-0 whitespace-nowrap tabular-nums'>
              {currency(fee.amount)}
            </span>
          </div>
        ))}
      </div>
    ),
    meta: {
      thClassName: 'text-right',
      tdClassName: 'text-right',
      hideOnMobile: (invoice) => serviceFees(invoice).length === 0,
      mobileStacked: true,
    },
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
