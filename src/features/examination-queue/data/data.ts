import i18n from '@/i18n'
import { type QueueStatus } from '../api'

export const activeQueueStatuses: QueueStatus[] = [
  'BOOKED',
  'WAITING',
  'CALLED',
  'IN_EXAMINATION',
  'SKIPPED',
]

export const processedQueueStatuses: QueueStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

export const statusMeta: Record<
  QueueStatus,
  { label: string; className: string }
> = {
  BOOKED: {
    get label() {
      return i18n.t('messages.scheduled')
    },
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  WAITING: {
    get label() {
      return i18n.t('messages.waiting')
    },
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  CALLED: {
    get label() {
      return i18n.t('messages.called')
    },
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  IN_EXAMINATION: {
    get label() {
      return i18n.t('messages.inExamination')
    },
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  COMPLETED: {
    get label() {
      return i18n.t('messages.finish')
    },
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  CANCELLED: {
    get label() {
      return i18n.t('messages.cancelled')
    },
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  SKIPPED: {
    get label() {
      return i18n.t('messages.skipped')
    },
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  NO_SHOW: {
    get label() {
      return i18n.t('messages.noShow')
    },
    className: 'border-red-200 bg-red-50 text-red-700',
  },
}

export const transitions: Partial<
  Record<QueueStatus, Array<{ label: string; status: QueueStatus }>>
> = {
  WAITING: [
    {
      get label() {
        return i18n.t('messages.callPatient')
      },
      status: 'IN_EXAMINATION',
    },
    {
      get label() {
        return i18n.t('messages.skip')
      },
      status: 'SKIPPED',
    },
    {
      get label() {
        return i18n.t('messages.cancel')
      },
      status: 'CANCELLED',
    },
  ],
  CALLED: [
    {
      get label() {
        return i18n.t('messages.resumeExamination')
      },
      status: 'IN_EXAMINATION',
    },
    {
      get label() {
        return i18n.t('messages.skip')
      },
      status: 'SKIPPED',
    },
    {
      get label() {
        return i18n.t('messages.returnToWaiting')
      },
      status: 'WAITING',
    },
  ],
  IN_EXAMINATION: [
    {
      get label() {
        return i18n.t('messages.finish')
      },
      status: 'COMPLETED',
    },
    {
      get label() {
        return i18n.t('messages.back')
      },
      status: 'WAITING',
    },
    {
      get label() {
        return i18n.t('messages.cancel')
      },
      status: 'CANCELLED',
    },
  ],
  SKIPPED: [
    {
      get label() {
        return i18n.t('messages.returnToWaiting')
      },
      status: 'WAITING',
    },
  ],
  BOOKED: [
    {
      get label() {
        return i18n.t('messages.cancel')
      },
      status: 'CANCELLED',
    },
    {
      get label() {
        return i18n.t('messages.noShow')
      },
      status: 'NO_SHOW',
    },
  ],
}
