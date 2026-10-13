import type { ServicePlan } from './access-control'

export const SERVICE_PLAN_LABELS = {
  BASIC: 'Cơ bản',
  PLUS: 'Chuyên nghiệp',
  PRO: 'Cao cấp',
} satisfies Record<ServicePlan, string>

export const SERVICE_PLAN_OPTIONS = Object.entries(SERVICE_PLAN_LABELS).map(
  ([value, label]) => ({ value, label })
)
