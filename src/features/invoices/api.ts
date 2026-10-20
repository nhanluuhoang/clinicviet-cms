import { axios } from '@/lib/axios'
import type { AuditFields } from '@/components/data-table/audit-columns'

export type InvoiceServiceType = 'EXAMINATION' | 'PHARMACY' | 'VACCINATION'

export type Invoice = AuditFields & {
  id: string
  invoiceCode: string
  issuedAt: string
  totalAmount: number | string
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
