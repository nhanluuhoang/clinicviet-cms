import { type PrescriptionTemplateItem } from '../api'

export const emptyItem = (): PrescriptionTemplateItem => ({
  medicineId: '',
  medicineName: '',
  quantity: 1,
  instruction: '',
})
