import { axios } from '@/lib/axios'

export type ClinicStatisticsRow = {
  id: string
  code: string
  name: string
  totalAmount: number
  medicineRevenue: number
  medicineCost: number
  examinationCount: number
}

export const getClinicMonthlyExaminations = (params: {
  month: string
  page: number
  limit: number
  search?: string
  sort?: string
}): Promise<{
  month: string
  total: number
  totalExaminations: number
  page: number
  limit: number
  data: ClinicStatisticsRow[]
}> => axios.get('/statistics/clinics/monthly', { params })
