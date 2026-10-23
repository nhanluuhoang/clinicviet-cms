import { axios } from '@/lib/axios'

export type Diagnosis = {
  id: string
  name: string
  tenantId: string | null
  createdAt: string
  updatedAt: string
}
export type DiagnosesPage = {
  data: Diagnosis[]
  total: number
  page: number
  limit: number
}
export const getDiagnoses = (params: {
  search?: string
  scope?: 'COMMON' | 'CLINIC'
  sort?: string
  page: number
  limit: number
}): Promise<DiagnosesPage> => axios.get('/diagnoses', { params })
export const createDiagnosis = (name: string): Promise<Diagnosis> =>
  axios.post('/diagnoses', { name })
export const updateDiagnosis = (id: string, name: string): Promise<Diagnosis> =>
  axios.patch(`/diagnoses/${id}`, { name })
export const deleteDiagnosis = (id: string): Promise<{ status: boolean }> =>
  axios.delete(`/diagnoses/${id}`)
