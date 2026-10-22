import i18n from '@/i18n'
import type { TrialRequestStatus } from './api'

export const TRIAL_REQUEST_STATUS_LABELS = {
  get PENDING() {
    return i18n.t('messages.pendingApproval')
  },
  get APPROVED() {
    return i18n.t('messages.approved')
  },
  get REJECTED() {
    return i18n.t('messages.rejected')
  },
} satisfies Record<TrialRequestStatus, string>

export const TRIAL_REQUEST_STATUS_OPTIONS = Object.keys(
  TRIAL_REQUEST_STATUS_LABELS
).map((value) => ({
  value,
  get label() {
    return TRIAL_REQUEST_STATUS_LABELS[value as TrialRequestStatus]
  },
}))
