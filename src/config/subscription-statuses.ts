export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'

export const SUBSCRIPTION_STATUS_LABELS = {
  TRIAL: 'Đăng ký dùng thử',
  ACTIVE: 'Đăng ký chính thức',
  EXPIRED: 'Đã hết hạn',
  SUSPENDED: 'Tạm ngưng',
} satisfies Record<SubscriptionStatus, string>

export const SUBSCRIPTION_STATUS_OPTIONS = Object.entries(
  SUBSCRIPTION_STATUS_LABELS
).map(([value, label]) => ({ value, label }))

export const NEW_SUBSCRIPTION_STATUS_OPTIONS = SUBSCRIPTION_STATUS_OPTIONS.filter(
  ({ value }) => value === 'TRIAL' || value === 'ACTIVE'
)

export const SUBSCRIPTION_STATUS_SUMMARY_LABELS = {
  ...SUBSCRIPTION_STATUS_LABELS,
  TRIAL: 'Dùng thử',
  ACTIVE: 'Đang hoạt động',
} satisfies Record<SubscriptionStatus, string>
