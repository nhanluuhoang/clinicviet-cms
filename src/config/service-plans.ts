import i18n from '@/i18n'
import type { ServicePlan } from './access-control'

export const SERVICE_PLAN_LABELS = {
  get BASIC() {
    return i18n.t('servicePlans.BASIC')
  },
  get PLUS() {
    return i18n.t('servicePlans.PLUS')
  },
  get PRO() {
    return i18n.t('servicePlans.PRO')
  },
} satisfies Record<ServicePlan, string>

export const SERVICE_PLAN_OPTIONS = Object.keys(SERVICE_PLAN_LABELS).map(
  (value) => ({
    value,
    get label() {
      return SERVICE_PLAN_LABELS[value as ServicePlan]
    },
  })
)
