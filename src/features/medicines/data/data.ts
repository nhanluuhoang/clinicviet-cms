import { type MedicineGroup } from '../api/types'

export const medicineGroups: { label: string; value: MedicineGroup }[] = [
  { label: 'Kháng sinh', value: 'antibiotic' },
  { label: 'Giảm đau / hạ sốt', value: 'analgesic' },
  { label: 'Vitamin / khoáng chất', value: 'vitamin' },
  { label: 'Tim mạch', value: 'cardio' },
  { label: 'Tiêu hoá', value: 'digestive' },
  { label: 'Hô hấp', value: 'respiratory' },
  { label: 'Dị ứng', value: 'allergy' },
  { label: 'Nội tiết / đái tháo đường', value: 'endocrine' },
  { label: 'Da liễu', value: 'dermatology' },
  { label: 'Mắt', value: 'ophthalmology' },
  { label: 'Tai mũi họng', value: 'ent' },
  { label: 'Cơ xương khớp', value: 'musculoskeletal' },
  { label: 'Thần kinh / tâm thần', value: 'neurology' },
  { label: 'Vaccine', value: 'vaccine' },
  { label: 'Khác', value: 'other' },
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
