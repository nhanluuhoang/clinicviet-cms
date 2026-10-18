import { axios } from '@/lib/axios'

export interface TenantData {
  id: string
  code: string
  name: string
  address: string
  subdomain: string | null
  servicePlan: 'BASIC' | 'PLUS' | 'PRO'
  storageLimitGb: number
  storage: {
    limitBytes: number
    usedBytes: number
    imagesBytes: number
    pdfsBytes: number
    videosBytes: number
    unmeasuredFiles: number
  }
  isActive: boolean
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  trialEndsAt?: string | null
  subscriptionEndsAt?: string | null
}

export interface UpdateTenantRequest {
  name?: string
  address?: string
}

export const getOwnTenant = (): Promise<TenantData> => axios.get('/tenants/me')

export const updateOwnTenant = (
  data: UpdateTenantRequest
): Promise<TenantData> => axios.patch('/tenants/me', data)
