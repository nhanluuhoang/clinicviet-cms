import i18n from '@/i18n'

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'

export const SUBSCRIPTION_STATUS_LABELS = {
  get ACTIVE() {
    return i18n.t('subscriptionStatuses.ACTIVE')
  },
  get EXPIRED() {
    return i18n.t('subscriptionStatuses.EXPIRED')
  },
  get SUSPENDED() {
    return i18n.t('subscriptionStatuses.SUSPENDED')
  },
} satisfies Record<SubscriptionStatus, string>

export const SUBSCRIPTION_STATUS_OPTIONS = Object.keys(
  SUBSCRIPTION_STATUS_LABELS
).map((value) => ({
  value,
  get label() {
    return SUBSCRIPTION_STATUS_LABELS[value as SubscriptionStatus]
  },
}))

export const SUBSCRIPTION_STATUS_SUMMARY_LABELS = SUBSCRIPTION_STATUS_LABELS
