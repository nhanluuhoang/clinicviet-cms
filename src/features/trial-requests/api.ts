import { axios } from '@/lib/axios'
import type { ApiTableParams } from '@/hooks/use-api-table-params'

export type TrialRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TrialRequest = {
  source: 'WEBSITE' | 'REFERRAL'
  contactName: string | null
  referrerUserId: string | null
  referrerTenantId: string | null
  referrerName: string | null
  referrerClinicName: string | null
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

export const findTrialRequests = (
  params: ApiTableParams
): Promise<{
  data: TrialRequest[]
  total: number
}> => axios.get('/trial-requests', { params })

export const approveTrialRequest = (id: string, data: ApproveTrialInput) =>
  axios.patch(`/trial-requests/${id}/approve`, data)

export const rejectTrialRequest = (id: string, reason: string) =>
  axios.patch(`/trial-requests/${id}/reject`, { reason })
