import { axios } from '@/lib/axios'
import type { ApiTableParams } from '@/hooks/use-api-table-params'
import { type Medicine, type MedicineGroup } from './types'

interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

interface ApiMedicine extends Omit<Medicine, 'group'> {
  medicineGroup: MedicineGroup
}

const CreateMedicine = (data: Omit<Medicine, 'id' | 'code'>): Promise<void> =>
  axios.post('/medicines', {
    ...data,
    medicineGroup: data.group,
    group: undefined,
  })

const UpdateMedicine = (
  id: string,
  data: Omit<Medicine, 'id' | 'code'>
): Promise<void> =>
  axios.patch(`/medicines/${id}`, {
    ...data,
    medicineGroup: data.group,
    group: undefined,
  })

const DeleteMedicine = (id: string): Promise<void> =>
  axios.delete(`/medicines/${id}`)

export { CreateMedicine, DeleteMedicine, UpdateMedicine }
export * from './types'

export const GetMedicinesPage = async (params: ApiTableParams) => {
  const response = await axios.get<unknown, Page<ApiMedicine>>('/medicines', {
    params,
  })
  return {
    ...response,
    data: response.data.map((medicine) => ({
      ...medicine,
      salePrice: Number(medicine.salePrice),
      group: medicine.medicineGroup,
    })),
  }
}
