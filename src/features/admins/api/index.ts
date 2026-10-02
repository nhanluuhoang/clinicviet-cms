import { axios } from '@/lib/axios'
import type { AuditFields } from '@/components/data-table/audit-columns'

export type StaffRole = 'DOCTOR' | 'ASSISTANT'

export interface Params {
  fullName: string
  page: number
  pageSize: number
}

export interface StaffInput {
  email?: string
  fullName: string
  phone?: string
  role: StaffRole
  password?: string
  passwordConfirmation?: string
  isActive?: boolean
}

export interface Admin extends AuditFields {
  id: string
  userName: string
  email: string | null
  fullName: string
  phone: string | null
  role: 'TENANT_ADMIN' | StaffRole
  isActive: boolean
}

export interface AdminsResponse {
  data: Admin[]
  total: number
  page: number
  limit: number
}

const CreateStaff = (data: StaffInput): Promise<Admin> =>
  axios.post('/users', data)

const FindStaff = ({
  fullName,
  page,
  pageSize,
}: Params): Promise<AdminsResponse> =>
  axios.get('/users', {
    params: { search: fullName || undefined, page, limit: pageSize },
  })

const UpdateStaff = (id: string, data: StaffInput): Promise<Admin> =>
  axios.patch(`/users/${id}`, data)

const DeactivateStaff = (id: string): Promise<Admin> =>
  axios.delete(`/users/${id}`)

export { CreateStaff, FindStaff, UpdateStaff, DeactivateStaff }
