import { axios } from '@/lib/axios'

export type TrialRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TrialRequest = {
  id: string
  code: string | null
  phone: string
  status: TrialRequestStatus
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export type ApproveTrialInput = {
  code: string
}

export const findTrialRequests = (): Promise<{
  data: TrialRequest[]
  total: number
}> => axios.get('/trial-requests', { params: { page: 1, limit: 100 } })

export const approveTrialRequest = (id: string, data: ApproveTrialInput) =>
  axios.patch(`/trial-requests/${id}/approve`, data)

export const rejectTrialRequest = (id: string, reason: string) =>
  axios.patch(`/trial-requests/${id}/reject`, { reason })
