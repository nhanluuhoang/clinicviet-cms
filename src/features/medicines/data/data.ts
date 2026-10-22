import i18n from '@/i18n'
import { type MedicineGroup } from '../api/types'

export const medicineGroups: { label: string; value: MedicineGroup }[] = [
  {
    get label() {
      return i18n.t('messages.antibiotics')
    },
    value: 'antibiotic',
  },
  {
    get label() {
      return i18n.t('messages.painReliefFeverReducers')
    },
    value: 'analgesic',
  },
  {
    get label() {
      return i18n.t('messages.vitaminsMinerals')
    },
    value: 'vitamin',
  },
  {
    get label() {
      return i18n.t('messages.cardiovascular')
    },
    value: 'cardio',
  },
  {
    get label() {
      return i18n.t('messages.digestive')
    },
    value: 'digestive',
  },
  {
    get label() {
      return i18n.t('messages.respiratory')
    },
    value: 'respiratory',
  },
  {
    get label() {
      return i18n.t('messages.allergy')
    },
    value: 'allergy',
  },
  {
    get label() {
      return i18n.t('messages.endocrineDiabetes')
    },
    value: 'endocrine',
  },
  {
    get label() {
      return i18n.t('messages.dermatology')
    },
    value: 'dermatology',
  },
  {
    get label() {
      return i18n.t('messages.ophthalmology')
    },
    value: 'ophthalmology',
  },
  {
    get label() {
      return i18n.t('messages.earNoseAndThroat')
    },
    value: 'ent',
  },
  {
    get label() {
      return i18n.t('messages.musculoskeletal')
    },
    value: 'musculoskeletal',
  },
  {
    get label() {
      return i18n.t('messages.neurologyPsychiatry')
    },
    value: 'neurology',
  },
  { label: 'Vaccine', value: 'vaccine' },
  {
    get label() {
      return i18n.t('messages.other')
    },
    value: 'other',
  },
]

export const medicineGroupLabel = (value: MedicineGroup) =>
  medicineGroups.find((group) => group.value === value)?.label ?? value

export const medicineUnits = [
  'viên',
  'vỉ',
  'hộp',
  'lọ',
  'ống',
  'tuýp',
  'gói',
  'chai',
  'túi',
  'miếng',
]

const medicineUnitKeys: Record<string, string> = {
  viên: 'tablet',
  vỉ: 'blister',
  hộp: 'box',
  lọ: 'vial',
  ống: 'ampoule',
  tuýp: 'tube',
  gói: 'sachet',
  chai: 'bottle',
  túi: 'bag',
  miếng: 'patch',
}
export const medicineUnitLabel = (value: string) =>
  medicineUnitKeys[value]
    ? i18n.t('medicineUnits.' + medicineUnitKeys[value])
    : value
