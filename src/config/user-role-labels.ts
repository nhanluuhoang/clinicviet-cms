import type { UserRole } from './access-control'

export const USER_ROLE_LABELS = {
  TENANT_ADMIN: 'Quản trị phòng khám',
  DOCTOR: 'Bác sĩ',
  ASSISTANT: 'Trợ lý',
  PATIENT: 'Bệnh nhân',
  USER: 'Người dùng',
} satisfies Record<Exclude<UserRole, 'SUPER_ADMIN'>, string>

export const MANAGED_USER_ROLE_OPTIONS = (
  ['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT'] as const
).map((value) => ({ value, label: USER_ROLE_LABELS[value] }))

export const SYSTEM_USER_ROLE_OPTIONS = (
  ['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT', 'PATIENT', 'USER'] as const
).map((value) => ({ value, label: USER_ROLE_LABELS[value] }))
