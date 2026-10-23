import { axios } from '@/lib/axios'

export type MedicineInstruction = {
  id: string
  name: string
  tenantId: string | null
  createdAt: string
  updatedAt: string
}
export type MedicineInstructionsPage = {
  data: MedicineInstruction[]
  total: number
  page: number
  limit: number
}
export const getMedicineInstructions = (params: {
  search?: string
  scope?: 'COMMON' | 'CLINIC'
  sort?: string
  page: number
  limit: number
}): Promise<MedicineInstructionsPage> =>
  axios.get('/medicine-instructions', { params })
export const createMedicineInstruction = (
  name: string
): Promise<MedicineInstruction> =>
  axios.post('/medicine-instructions', { name })
export const updateMedicineInstruction = (
  id: string,
  name: string
): Promise<MedicineInstruction> =>
  axios.patch(`/medicine-instructions/${id}`, { name })
export const deleteMedicineInstruction = (
  id: string
): Promise<{ status: boolean }> => axios.delete(`/medicine-instructions/${id}`)
