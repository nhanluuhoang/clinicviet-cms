import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import i18n from '@/i18n'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { showRequestError } from '@/lib/handle-server-error'
import { getMedicines } from '@/features/prescriptions/api'
import {
  createPrescriptionTemplate,
  deletePrescriptionTemplate,
  getPrescriptionTemplates,
  updatePrescriptionTemplate,
  type PrescriptionTemplate,
  type PrescriptionTemplateItem,
} from '../api'
import { emptyItem } from '../data/constants'
import type { DialogType } from '../types'

export function usePrescriptionTemplates() {
  const user = useAuthStore((state) => state.auth.user)
  const queryClient = useQueryClient()

  const [open, setOpen] = useState<DialogType>(null)
  const isMutating = open === 'create' || open === 'update'

  const [current, setCurrent] = useState<PrescriptionTemplate | null>(null)

  const [name, setName] = useState('')

  const [items, setItems] = useState<PrescriptionTemplateItem[]>([emptyItem()])

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['prescription-templates', 'list', user?.tenantId, user?.role],
    queryFn: () => getPrescriptionTemplates(),
  })

  const { data: medicines = [] } = useQuery({
    queryKey: ['prescription-template-medicines'],
    queryFn: () => getMedicines(),
    enabled: isMutating,
  })

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
      toast.error(
        i18n.t('messages.enterATemplateNameAndCompleteMedicineDetails')
      )
      return
    }
    if (
      new Set(validItems.map((item) => item.medicineId)).size !==
      validItems.length
    ) {
      toast.error(i18n.t('messages.eachMedicineCanOnlyBeSelectedOnce'))
      return
    }
    try {
      const data = { name: name.trim(), items: validItems }
      if (current) await updatePrescriptionTemplate(current, data)
      else await createPrescriptionTemplate(data)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success(
        current
          ? i18n.t('messages.templateUpdated')
          : i18n.t('messages.templateCreated')
      )
      close()
    } catch (error) {
      showRequestError(error, i18n.t('messages.couldNotSaveTemplate'))
    }
  }

  const remove = async () => {
    if (!current) return
    try {
      await deletePrescriptionTemplate(current.id)
      await queryClient.invalidateQueries({
        queryKey: ['prescription-templates'],
      })
      toast.success(i18n.t('messages.templateDeleted'))
      close()
    } catch (error) {
      showRequestError(error, i18n.t('messages.couldNotDeleteTemplate'))
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
    close,
    patchItem,
    save,
    remove,
  }
}
export type PrescriptionTemplatesState = ReturnType<
  typeof usePrescriptionTemplates
>
