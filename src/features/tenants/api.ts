import type { ServicePlan } from '@/config/access-control'
import { axios } from '@/lib/axios'

export type Tenant = {
  id: string
  code: string
  name: string
  subdomain: string | null
  address: string
  note: string
  servicePlan: ServicePlan
  storageLimitGb: number
  isActive: boolean
  lastActiveAt: string | null
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  subscriptionEndsAt: string | null
  _count: { users: number }
}

export type TenantInput = {
  name: string
  subdomain?: string
  address: string
  servicePlan: ServicePlan
  isActive: boolean
  subscriptionStatus: 'ACTIVE'
  subscriptionEndsAt: string
}

export type TenantsResponse = {
  data: Tenant[]
  total: number
  page: number
  limit: number
}

export type TenantUpdate = Pick<
  Tenant,
  'code' | 'name' | 'address' | 'note' | 'servicePlan' | 'storageLimitGb' | 'isActive'
> &
  Partial<Pick<Tenant, 'subscriptionStatus'>> & {
    subdomain?: string | null
    subscriptionEndsAt?: string
  }

export const getTenants = (): Promise<TenantsResponse> =>
  axios.get('/tenants', { params: { page: 1, limit: 100 } })

export const createTenant = (data: TenantInput): Promise<Tenant> =>
  axios.post('/tenants', data)

export const searchTenants = (search: string): Promise<TenantsResponse> =>
  axios.get('/tenants', { params: { search, page: 1, limit: 100 } })

export const updateTenant = (id: string, data: TenantUpdate): Promise<Tenant> =>
  axios.patch(`/tenants/${id}`, data)

export const deleteTenant = (id: string): Promise<Tenant> =>
  axios.delete(`/tenants/${id}`)
