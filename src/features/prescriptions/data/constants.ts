import i18n from '@/i18n'
import { IMAGE_UPLOAD_TYPES } from '@/lib/image-upload'
import { VIDEO_UPLOAD_TYPES } from '@/lib/video-upload'
import type { MedicineRow } from '../types'

export const emptyMedicine = (key: number): MedicineRow => ({
  key,
  medicineName: '',
  instruction: '',
})

export const MAX_MEDIA_FILES = 11

export const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024

export const MAX_PDF_SIZE = 3 * 1024 * 1024

export const MAX_VIDEO_SIZE = 100 * 1024 * 1024

export const ACCEPTED_MEDIA_TYPES = [
  ...IMAGE_UPLOAD_TYPES,
  'application/pdf',
  ...VIDEO_UPLOAD_TYPES,
]

export const SERVICE_TABS = [
  {
    value: 'EXAMINATION',
    get label() {
      return i18n.t('messages.examination')
    },
    get saveLabel() {
      return i18n.t('messages.saveExaminationRecord')
    },
  },
  {
    value: 'PHARMACY',
    get label() {
      return i18n.t('messages.pharmacySale')
    },
    get saveLabel() {
      return i18n.t('messages.savePharmacySale')
    },
  },
  {
    value: 'VACCINATION',
    get label() {
      return i18n.t('messages.vaccination')
    },
    get saveLabel() {
      return i18n.t('messages.saveVaccination')
    },
  },
] as const
