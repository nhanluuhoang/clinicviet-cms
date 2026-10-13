import type { TrialRequestStatus } from './api'

export const TRIAL_REQUEST_STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
} satisfies Record<TrialRequestStatus, string>

export const TRIAL_REQUEST_STATUS_OPTIONS = Object.entries(
  TRIAL_REQUEST_STATUS_LABELS
).map(([value, label]) => ({ value, label }))
