import { axios } from '@/lib/axios'
import type { AuditFields } from '@/components/data-table/audit-columns'

export type InvoiceServiceType = 'EXAMINATION' | 'PHARMACY' | 'VACCINATION'

export type Invoice = AuditFields & {
  id: string
  invoiceCode: string
  issuedAt: string
  totalAmount: number | string
  consultationFee: number | string
  medicineRevenue: number | string
  serviceFee: number | string
  serviceFeeLabel: string
  otherFee1: number | string
  otherFee1Label: string
  otherFee2: number | string
  otherFee2Label: string
  otherFee3: number | string
  otherFee3Label: string
  prescription: {
    patient: { fullName: string; phone: string | null }
    medicalHistory: { serviceType: string; doctorName: string }
  }
}

export const getInvoices = (params: {
  date?: string
  search?: string
  serviceType?: InvoiceServiceType
  page: number
  limit: number
}): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> =>
  axios.get('/invoices', { params })
