import type { MedicineRow } from '../types'

export const emptyMedicine = (key: number): MedicineRow => ({
  key,
  medicineName: '',
  instruction: '',
})

export const MAX_MEDIA_FILES = 11

export const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024

export const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export const ACCEPTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

export const INSTRUCTION_OPTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]

export const SERVICE_TABS = [
  { value: 'EXAMINATION', label: 'Khám bệnh', saveLabel: 'Lưu phiếu khám' },
  { value: 'PHARMACY', label: 'Bán thuốc', saveLabel: 'Lưu phiếu bán thuốc' },
  { value: 'VACCINATION', label: 'Tiêm vắc xin', saveLabel: 'Lưu phiếu tiêm' },
] as const
