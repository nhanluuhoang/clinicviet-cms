import type { ServicePlan } from '@/config/access-control'
import { axios } from '@/lib/axios'

export type TrialRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TrialRequest = {
  id: string
  phone: string
  status: TrialRequestStatus
  rejectionReason: string | null
  createdAt: string
  reviewedAt: string | null
  tenant: { id: string; code: string; name: string } | null
}

export type ApproveTrialInput = {
  code: string
  clinicName: string
  subdomain: string
  address: string
  adminEmail: string
  adminFullName: string
  password: string
  servicePlan: ServicePlan
}

export const findTrialRequests = (): Promise<{
  data: TrialRequest[]
  total: number
}> => axios.get('/trial-requests', { params: { page: 1, limit: 100 } })

export const approveTrialRequest = (id: string, data: ApproveTrialInput) =>
  axios.patch(`/trial-requests/${id}/approve`, data)

export const rejectTrialRequest = (id: string, reason: string) =>
  axios.patch(`/trial-requests/${id}/reject`, { reason })
