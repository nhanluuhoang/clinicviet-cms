import { axios } from '@/lib/axios'
import type { Tenant } from '@/features/tenants/api'

export type ManagedRole = 'TENANT_ADMIN' | 'DOCTOR' | 'ASSISTANT'

export type SystemUser = {
  id: string
  userName: string
  email: string | null
  fullName: string
  phone: string | null
  role: ManagedRole
  isActive: boolean
  tenant: Pick<Tenant, 'id' | 'code' | 'name'>
}

export type SystemUserInput = {
  tenantId: string
  userName: string
  email?: string
  fullName: string
  phone?: string
  role: ManagedRole
  isActive: boolean
  password: string
  passwordConfirmation: string
}

export const getSystemUsers = (params?: {
  tenantId?: string
  role?: ManagedRole
}): Promise<{ data: SystemUser[]; total: number }> =>
  axios.get('/system/users', { params: { ...params, page: 1, limit: 100 } })

export const createSystemUser = (data: SystemUserInput): Promise<SystemUser> =>
  axios.post('/system/users', data)
