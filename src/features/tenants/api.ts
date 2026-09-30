import type { ServicePlan } from '@/config/access-control'
import { axios } from '@/lib/axios'

export type Tenant = {
  id: string
  code: string
  name: string
  subdomain: string
  address: string
  servicePlan: ServicePlan
  isActive: boolean
  lastActiveAt: string | null
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  _count: { users: number }
}

export type TenantInput = {
  name: string
  subdomain: string
  address: string
  servicePlan: ServicePlan
  isActive: boolean
  adminFullName: string
  adminEmail: string
  adminPhone?: string
  adminUserName: string
  password: string
  passwordConfirmation: string
}

export type TenantsResponse = {
  data: Tenant[]
  total: number
  page: number
  limit: number
}

export type ProvisionTenantResponse = {
  tenant: Tenant
  admin: { id: string; userName: string; fullName: string; email: string }
}

export type TenantUpdate = Pick<
  Tenant,
  'code' | 'name' | 'subdomain' | 'address' | 'servicePlan' | 'isActive'
>

export const getTenants = (): Promise<TenantsResponse> =>
  axios.get('/tenants', { params: { page: 1, limit: 100 } })

export const provisionTenant = (
  data: TenantInput
): Promise<ProvisionTenantResponse> => axios.post('/tenants', data)

export const updateTenant = (id: string, data: TenantUpdate): Promise<Tenant> =>
  axios.patch(`/tenants/${id}`, data)

export const deleteTenant = (id: string): Promise<Tenant> =>
  axios.delete(`/tenants/${id}`)
