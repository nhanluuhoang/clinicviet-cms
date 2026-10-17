import { axios } from '@/lib/axios'

export type RequestType = 'BUG' | 'FEATURE' | 'GENERAL'
export type SupportTenant = { id: string; code: string; name: string }
export type RequestStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'NEEDS_INFO'
  | 'COMPLETED'
  | 'DECLINED'
export type SupportRequest = {
  id: string
  tenantId: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  organization: string | null
  type: RequestType
  title: string
  content: string
  pagePath: string | null
  status: RequestStatus
  createdAt: string
  updatedAt: string
  tenant: SupportTenant | null
  creator: { id: string; fullName: string } | null
}
export type SupportActivity = {
  guestReply: boolean
  id: string
  content: string | null
  fromStatus: RequestStatus | null
  toStatus: RequestStatus | null
  createdAt: string
  actor: { id: string; fullName: string } | null
}
export type SupportDetail = SupportRequest & { activities: SupportActivity[] }
export type CreateSupportInput = {
  type: RequestType
  title: string
  content: string
  pagePath?: string
}

export const findSupportRequests = (params: {
  page: number
  limit: number
  search?: string
  type?: RequestType
  status?: RequestStatus
  tenantId?: string
  sort?: string
}): Promise<{ data: SupportRequest[]; total: number }> =>
  axios.get('/support-requests', { params })
export const getSupportRequest = (id: string): Promise<SupportDetail> =>
  axios.get(`/support-requests/${id}`)
export const createSupportRequest = (
  data: CreateSupportInput
): Promise<SupportRequest> => axios.post('/support-requests', data)
export const replyToSupportRequest = (id: string, content: string) =>
  axios.post(`/support-requests/${id}/replies`, { content })
export const updateSupportStatus = (
  id: string,
  status: RequestStatus,
  content?: string
) => axios.patch(`/support-requests/${id}/status`, { status, content })
export const getSupportTenants = (): Promise<SupportTenant[]> =>
  axios.get('/support-requests/tenant-options')
