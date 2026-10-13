import type { AuditFields } from '@/components/data-table/audit-columns'

export type MedicineGroup =
  | 'antibiotic'
  | 'analgesic'
  | 'vitamin'
  | 'cardio'
  | 'digestive'
  | 'respiratory'
  | 'allergy'
  | 'endocrine'
  | 'dermatology'
  | 'ophthalmology'
  | 'ent'
  | 'musculoskeletal'
  | 'neurology'
  | 'vaccine'
  | 'other'

export interface Medicine extends AuditFields {
  id: string
  code: string
  name: string
  activeIngredient: string
  strength: string
  unit: string
  group: MedicineGroup
  manufacturer: string
  minStock: number
  salePrice: number
  isActive: boolean
}
