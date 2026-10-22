import type { ColumnDef } from '@tanstack/react-table'
import i18n, { getLocale } from '@/i18n'
import { formatNumber } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { withAuditColumns } from '@/components/data-table/audit-columns'
import type { Invoice } from '../api'
import { InvoiceServiceFees } from './invoice-service-fees'

export const invoiceMobileLabels = {
  get invoiceCode() {
    return i18n.t('messages.invoiceCode')
  },
  get issuedAt() {
    return i18n.t('messages.invoiceDate')
  },
  get patientName() {
    return i18n.t('messages.patient')
  },
  get phone() {
    return i18n.t('messages.phoneNumber')
  },
  get serviceType() {
    return i18n.t('messages.serviceType')
  },
  get doctorName() {
    return i18n.t('messages.doctor')
  },
  get totalAmount() {
    return i18n.t('messages.totalAmount')
  },
  get consultationFee() {
    return i18n.t('messages.consultationFee')
  },
  get medicineRevenue() {
    return i18n.t('messages.medicineCharges')
  },
  get serviceFee() {
    return i18n.t('messages.serviceFee')
  },
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
      fallback:
        index === 0
          ? i18n.t('messages.serviceFee')
          : i18n.t('messages.additionalFee', { value0: index }),
    }))
    .filter((fee) => fee.amount !== 0 || fee.label !== '')
}

const currency = (value: number | string) => `${formatNumber(Number(value))} ₫`

export const invoiceServiceTypes = [
  {
    get label() {
      return i18n.t('messages.examination')
    },
    value: 'EXAMINATION',
  },
  {
    get label() {
      return i18n.t('messages.pharmacy')
    },
    value: 'PHARMACY',
  },
  {
    get label() {
      return i18n.t('messages.vaccinationAlt2')
    },
    value: 'VACCINATION',
  },
]

export const invoiceColumns: ColumnDef<Invoice>[] = withAuditColumns([
  {
    accessorKey: 'invoiceCode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.invoiceCode')}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'issuedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.issuedOn')}
      />
    ),
    cell: ({ row }) =>
      new Date(row.original.issuedAt).toLocaleString(getLocale(), {
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
    enableSorting: false,
  },
  {
    id: 'patientName',
    accessorFn: (invoice) => invoice.prescription.patient.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.patient')}
      />
    ),
    enableSorting: false,
  },
  {
    id: 'phone',
    accessorFn: (invoice) => invoice.prescription.patient.phone || '-',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.phoneNumber')}
      />
    ),
    enableSorting: false,
  },
  {
    id: 'serviceType',
    accessorFn: (invoice) => invoice.prescription.medicalHistory.serviceType,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.serviceType')}
      />
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
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.doctor')}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'consultationFee',
    get header() {
      return i18n.t('messages.consultationFee')
    },
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
    get header() {
      return i18n.t('messages.medicineCharges')
    },
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
    get header() {
      return i18n.t('messages.serviceFee')
    },
    cell: ({ row }) => <InvoiceServiceFees fees={serviceFees(row.original)} />,
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
      <DataTableColumnHeader
        column={column}
        title={i18n.t('messages.totalAmount')}
      />
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
