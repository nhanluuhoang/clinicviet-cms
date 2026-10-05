import { useAuthStore } from '@/stores/auth-store'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GetMasterDatas } from '@/features/master-data/api'
import { getMedicines } from '@/features/prescriptions/api'
import {
  createPrescriptionTemplate,
  deletePrescriptionTemplate,
  getPrescriptionTemplates,
  updatePrescriptionTemplate,
  type PrescriptionTemplate,
  type PrescriptionTemplateItem,
} from '../api'
import { DEFAULT_INSTRUCTIONS, emptyItem } from '../data/constants'
import type { DialogType } from '../types'

export function usePrescriptionTemplates() {
  const tenantId = useAuthStore((state) => state.auth.user?.tenantId)
  const queryClient = useQueryClient()

  const [open, setOpen] = useState<DialogType>(null)

  const [current, setCurrent] = useState<PrescriptionTemplate | null>(null)

  const [name, setName] = useState('')

  const [items, setItems] = useState<PrescriptionTemplateItem[]>([emptyItem()])

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['prescription-templates'],
    queryFn: () => getPrescriptionTemplates(),
  })

  const { data: medicines = [] } = useQuery({
    queryKey: ['prescription-template-medicines'],
    queryFn: () => getMedicines(),
  })

  const { data: masterData } = useQuery({
    queryKey: ['master-data', tenantId],
    queryFn: () => GetMasterDatas(),
    enabled: !!tenantId,
    staleTime: 0,
    gcTime: 0,
  })

  const instructionOptions = (
    masterData?.data.find((item) => item.key === 'MEDICINE_INSTRUCTION_OPTIONS')
      ?.value ?? DEFAULT_INSTRUCTIONS.join('\n')
  )
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)

  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrent(null), 300)
  }

  const patchItem = (index: number, patch: Partial<PrescriptionTemplateItem>) =>
    setItems((rows) =>
      rows.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )

  const save = async () => {
    const validItems = items.filter(
      (item) => item.medicineId && item.quantity > 0
    )
    if (!name.trim() || validItems.length !== items.length) {
      toast.error('Nhập tên mẫu và đầy đủ thông tin thuốc')
      return
    }
    if (
      new Set(validItems.map((item) => item.medicineId)).size !==
      validItems.length
    ) {
      toast.error('Mỗi thuốc chỉ được chọn một lần')
      return
    }
    try {
      const data = { name: name.trim(), items: validItems }
      if (current) await updatePrescriptionTemplate(current, data)
      else await createPrescriptionTemplate(data)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success(current ? 'Đã cập nhật mẫu đơn' : 'Đã tạo mẫu đơn')
      close()
    } catch (error) {
      toast.error('Không lưu được mẫu đơn', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const remove = async () => {
    if (!current) return
    try {
      await deletePrescriptionTemplate(current.id)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success('Đã xóa mẫu đơn')
      close()
    } catch (error) {
      toast.error('Không xóa được mẫu đơn', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }
  return {
    open,
    setOpen,
    current,
    setCurrent,
    name,
    setName,
    items,
    setItems,
    templates,
    isLoading,
    medicines,
    instructionOptions,
    close,
    patchItem,
    save,
    remove,
  }
}
export type PrescriptionTemplatesState = ReturnType<
  typeof usePrescriptionTemplates
>
