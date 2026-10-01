import { axios } from '@/lib/axios'

export interface User {
  id: string
  fullName: string
  phone?: string | null
  dateOfBirth?: string | Date | null
  role: string
}

export interface Medicine {
  id: string
  name: string
  strength: string
  unit: string
  totalQty: number
  isActive: boolean
  salePrice: number
}

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface MedicalHistoryInput extends VaccinationInput {
  serviceType?: ServiceType
  examinationQueueId?: string
  userId: string
  symptoms?: string
  diagnosis: string
  treatment?: string
  advice?: string
  doctorName: string
  note?: string
  images?: string[]
  pdfs?: string[]
  videos?: string[]
}

export type ServiceType = 'EXAMINATION' | 'PHARMACY' | 'VACCINATION'
export interface VaccinationInput {
  temperature?: string | null
  bloodPressure?: string | null
  vaccineName?: string | null
  batchNumber?: string | null
  expiryDate?: string | null
  administeredDate?: string | null
  nextDoseDate?: string | null
  screening?: 'PENDING' | 'ELIGIBLE' | 'DEFERRED' | null
  administeredById?: string | null
  screeningNote?: string | null
  doseNumber?: string | null
  dose?: string | null
  route?: string | null
  site?: string | null
  administeredBy?: string | null
  observation?: string | null
}

export interface VaccinationStaff {
  id: string
  fullName: string
  role: string
}
export const getVaccinationStaff = (): Promise<VaccinationStaff[]> =>
  axios.get('/users/staff-options')

export interface PrescriptionItemInput {
  medicineId: string
  medicineName: string
  quantity: number
  instruction?: string
}

export const getMedicines = async (search = ''): Promise<Medicine[]> => {
  const response = await axios.get<unknown, Page<Medicine>>(
    '/medicines/search',
    { params: { page: 1, limit: 100, search: search || undefined } }
  )
  return response.data
    .filter((medicine) => medicine.isActive)
    .map((medicine) => ({
      ...medicine,
      salePrice: Number(medicine.salePrice ?? 0),
      totalQty: Number(medicine.totalQty ?? 0),
    }))
}

export const createPrescription = (data: {
  medicalHistory: MedicalHistoryInput
  prescriptionItems: PrescriptionItemInput[]
  consultationFee: number
  serviceFee?: number
  serviceFeeLabel?: string
  otherFee1?: number
  otherFee2?: number
  otherFee3?: number
  otherFee1Label?: string
  otherFee2Label?: string
  otherFee3Label?: string
}): Promise<void> => axios.post('/medical-histories', data)

export interface UpdatePrescriptionInput {
  medicalHistory?: Partial<Omit<MedicalHistoryInput, 'examinationQueueId'>>
  prescriptionItems?: PrescriptionItemInput[]
  consultationFee?: number
  serviceFee?: number
  serviceFeeLabel?: string
  otherFee1?: number
  otherFee2?: number
  otherFee3?: number
  otherFee1Label?: string
  otherFee2Label?: string
  otherFee3Label?: string
}

export const updatePrescription = (
  medicalHistoryId: string,
  data: UpdatePrescriptionInput
): Promise<void> => axios.patch(`/medical-histories/${medicalHistoryId}`, data)

export function getVaccinationFields(
  history: VaccinationInput
): VaccinationInput {
  return {
    temperature: history.temperature,
    bloodPressure: history.bloodPressure,
    vaccineName: history.vaccineName,
    batchNumber: history.batchNumber,
    doseNumber: history.doseNumber,
    dose: history.dose,
    route: history.route,
    site: history.site,
    administeredBy: history.administeredBy,
    screening: history.screening,
    screeningNote: history.screeningNote,
    observation: history.observation,
    expiryDate: history.expiryDate?.slice(0, 10),
    administeredDate: history.administeredDate?.slice(0, 10),
    nextDoseDate: history.nextDoseDate?.slice(0, 10),
    administeredById: history.administeredById,
  }
}
