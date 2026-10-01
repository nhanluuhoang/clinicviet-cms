import { type ClassValue, clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import {
  deleteImage,
  deletePdf,
  deleteVideo,
  type UploadedImage,
  type UploadedPdf,
  type UploadedVideo,
} from '@/features/examination-queue/api'
import { type ExpiryStatus } from '@/features/inventory/api/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

export const EXPIRY_CRITICAL_DAYS = 30

export const EXPIRY_WARNING_DAYS = 90

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysUntil(date: string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - startOfToday().getTime()) / 86_400_000)
}

export function getExpiryStatus(date: string | null): ExpiryStatus {
  if (!date) return 'ok'
  const days = daysUntil(date)
  if (days < 0) return 'expired'
  if (days <= EXPIRY_CRITICAL_DAYS) return 'critical'
  if (days <= EXPIRY_WARNING_DAYS) return 'warning'
  return 'ok'
}

export const isExpired = (date: string) => daysUntil(date) < 0

export function worstExpiryStatus(dates: string[]): ExpiryStatus {
  const order: ExpiryStatus[] = ['expired', 'critical', 'warning', 'ok']
  const statuses = dates.map(getExpiryStatus)
  return order.find((s) => statuses.includes(s)) ?? 'ok'
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatMonthYear(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}

export function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('vi-VN')} ₫`
}

export function toDateInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export function showQueueError(error: unknown) {
  const message =
    typeof error === 'string' ? error : (error as { message?: string })?.message
  toast.error(message || 'Không thể cập nhật thứ tự khám')
}

export const formatDashboardMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value)

export const getToday = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const getCurrentMonth = () => getToday().slice(0, 7)

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label: `Tháng ${index + 1}`,
}))

const currentYear = new Date().getFullYear()

export const YEAR_OPTIONS = Array.from(
  { length: 11 },
  (_, index) => currentYear - index
)

export const getCurrentYear = () => String(currentYear)

export function deleteMediaFile(
  file: UploadedImage | UploadedPdf | UploadedVideo
): Promise<void> {
  if (file.mimeType.startsWith('image/')) return deleteImage(file.fileName)
  if (file.mimeType === 'application/pdf') return deletePdf(file.fileName)
  return deleteVideo(file.fileName)
}
