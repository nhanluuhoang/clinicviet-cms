import {
  type User,
  type Medicine,
  type PrescriptionItemInput,
  type ServiceType,
  type VaccinationInput,
} from './api'

export type MedicineRow = Omit<
  PrescriptionItemInput,
  'medicineId' | 'quantity'
> & {
  key: number
  medicineId?: string
  quantity?: number
  selectedMedicine?: Medicine
}

export interface InitialPrescriptionData extends VaccinationInput {
  doctorName?: string
  serviceType?: ServiceType
  id: string
  symptoms: string
  diagnosis: string
  treatment: string
  advice: string
  note: string
  images: Array<{ id: string; fileName: string }>
  pdfs: Array<{ id: string; fileName: string }>
  videos: Array<{ id: string; fileName: string }>
  prescription: null | {
    id: string
    items: Array<{
      medicineId: string
      medicineName: string
      quantity: number | null
      instruction: string
      medicine: null | {
        id: string
        name: string
        strength: string
        unit: string
        totalQty: number
        isActive: boolean
        salePrice: number | string
      }
    }>
    invoice: null | {
      consultationFee?: number | string
      serviceFee: number | string
      serviceFeeLabel: string
      otherFee1: number | string
      otherFee1Label: string
      otherFee2: number | string
      otherFee2Label: string
      otherFee3: number | string
      otherFee3Label: string
    }
  }
}

export type ServicePrescriptionFormProps = {
  patient: User
  serviceType: ServiceType
  onSavingChange?: (saving: boolean) => void
  examinationQueueId?: string
  initialData?: InitialPrescriptionData | null
  formId?: string
  onSaved?: () => void
  onUploadingChange?: (uploading: boolean) => void
}
