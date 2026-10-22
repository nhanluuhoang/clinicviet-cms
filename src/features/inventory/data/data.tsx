import i18n from '@/i18n'
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Layers,
  PackageMinus,
  PackagePlus,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import { EXPIRY_CRITICAL_DAYS, EXPIRY_WARNING_DAYS } from '@/lib/utils'
import { type ExpiryStatus } from '../api/types'

/**
 * Các tab của page kho thuốc. Khai báo ở một chỗ để `index.tsx` dựng tab bar và
 * route dùng luôn làm schema cho search param `tab`, khỏi lệch nhau.
 */
export const INVENTORY_TAB_VALUES = [
  'stock',
  'batches',
  'receipts',
  'issues',
  'stocktakes',
] as const

export type InventoryTab = (typeof INVENTORY_TAB_VALUES)[number]

export const inventoryTabs: {
  value: InventoryTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    value: 'stock',
    get label() {
      return i18n.t('messages.inventory')
    },
    icon: Warehouse,
  },
  {
    value: 'batches',
    get label() {
      return i18n.t('messages.batchesAlt2')
    },
    icon: Layers,
  },
  {
    value: 'receipts',
    get label() {
      return i18n.t('messages.receipts')
    },
    icon: PackagePlus,
  },
  {
    value: 'issues',
    get label() {
      return i18n.t('messages.issues')
    },
    icon: PackageMinus,
  },
  {
    value: 'stocktakes',
    get label() {
      return i18n.t('messages.stocktake')
    },
    icon: ClipboardCheck,
  },
]

type ExpiryMeta = {
  label: string
  value: ExpiryStatus
  icon: React.ComponentType<{ className?: string }>
  /** Màu chữ + icon, dùng cho cell trong bảng. */
  textClass: string
  /** Màu nền badge. */
  badgeClass: string
}

export const expiryStatuses: ExpiryMeta[] = [
  {
    get label() {
      return i18n.t('subscriptionStatuses.EXPIRED')
    },
    value: 'expired',
    icon: CircleX,
    textClass: 'text-red-600 dark:text-red-400',
    badgeClass:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  },
  {
    get label() {
      return i18n.t('messages.lessThanDaysLeft', {
        value0: EXPIRY_CRITICAL_DAYS,
      })
    },
    value: 'critical',
    icon: TriangleAlert,
    textClass: 'text-orange-600 dark:text-orange-400',
    badgeClass:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
  },
  {
    get label() {
      return i18n.t('messages.lessThanDaysLeft', {
        value0: EXPIRY_WARNING_DAYS,
      })
    },
    value: 'warning',
    icon: CircleAlert,
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    get label() {
      return i18n.t('messages.longShelfLifeRemaining')
    },
    value: 'ok',
    icon: CircleCheck,
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  },
]

export const expiryMeta = (status: ExpiryStatus): ExpiryMeta =>
  expiryStatuses.find((s) => s.value === status) ?? expiryStatuses[3]
