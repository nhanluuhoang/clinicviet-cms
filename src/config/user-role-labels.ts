import i18n from '@/i18n'
import type { UserRole } from './access-control'

export const USER_ROLE_LABELS = {
  get TENANT_ADMIN() {
    return i18n.t('messages.clinicAdministrator')
  },
  get DOCTOR() {
    return i18n.t('messages.doctor')
  },
  get ASSISTANT() {
    return i18n.t('messages.assistant')
  },
  get PATIENT() {
    return i18n.t('messages.patient')
  },
  get USER() {
    return i18n.t('messages.users')
  },
} satisfies Record<Exclude<UserRole, 'SUPER_ADMIN'>, string>

export const MANAGED_USER_ROLE_OPTIONS = (
  ['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT'] as const
).map((value) => ({
  value,
  get label() {
    return USER_ROLE_LABELS[value]
  },
}))

export const SYSTEM_USER_ROLE_OPTIONS = (
  ['TENANT_ADMIN', 'DOCTOR', 'ASSISTANT', 'PATIENT', 'USER'] as const
).map((value) => ({
  value,
  get label() {
    return USER_ROLE_LABELS[value]
  },
}))
