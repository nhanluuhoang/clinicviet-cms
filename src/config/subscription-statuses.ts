export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'

export const SUBSCRIPTION_STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Đã hết hạn',
  SUSPENDED: 'Tạm ngưng',
} satisfies Record<SubscriptionStatus, string>

export const SUBSCRIPTION_STATUS_OPTIONS = Object.entries(
  SUBSCRIPTION_STATUS_LABELS
).map(([value, label]) => ({ value, label }))

export const SUBSCRIPTION_STATUS_SUMMARY_LABELS = {
  ...SUBSCRIPTION_STATUS_LABELS,
  ACTIVE: 'Đang hoạt động',
} satisfies Record<SubscriptionStatus, string>
