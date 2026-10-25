import { axios } from '@/lib/axios'

export type Reminder = {
  id: string
  serviceType: 'EXAMINATION' | 'VACCINATION'
  vaccineName: string | null
  doseNumber: string | null
  doctorName: string
  appointmentDate: string
  user: { id: string; fullName: string; phone: string | null }
}

export type ReminderQuery = {
  page: number
  limit: number
  search?: string
  dateFrom?: string
  dateTo?: string
  serviceType?: 'EXAMINATION' | 'VACCINATION'
  due?: 'OVERDUE' | 'TODAY' | 'UPCOMING'
  sort?: string
}

export const getReminders = (
  params: ReminderQuery
): Promise<{
  data: Reminder[]
  total: number
  page: number
  limit: number
  today: string
}> => axios.get('/reminders', { params })
