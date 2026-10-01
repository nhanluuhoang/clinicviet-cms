import { type PrescriptionTemplateItem } from '../api'

export const DEFAULT_INSTRUCTIONS = [
  'Uống trước ăn',
  'Uống sau ăn',
  'Uống trong bữa ăn',
  'Uống vào buổi sáng',
  'Uống vào buổi tối',
  'Uống khi cần',
  'Ngậm dưới lưỡi',
  'Bôi ngoài da',
]

export const emptyItem = (): PrescriptionTemplateItem => ({
  medicineId: '',
  medicineName: '',
  quantity: 1,
  instruction: '',
})
