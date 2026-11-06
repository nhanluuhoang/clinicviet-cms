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

export const getClinicMonthlyExaminations = (
  month: string
): Promise<{ month: string; total: number; data: ClinicStatisticsRow[] }> =>
  axios.get('/statistics/clinics/monthly', { params: { month } })
