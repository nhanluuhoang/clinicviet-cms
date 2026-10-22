import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteMedicine } from '../api'
import { MedicineMutateDialog } from './medicine-mutate-dialog'
import { useMedicines } from './medicines-provider'

export function MedicinesDialogs() {
  const { t } = useTranslation()

  const { open, setOpen, currentMedicine, setCurrentMedicine } = useMedicines()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const closeAndClear = () => {
    setOpen(null)
    setTimeout(() => setCurrentMedicine(null), 500)
  }

  const handleDelete = async () => {
    if (!currentMedicine || isDeleting) return
    setIsDeleting(true)
    try {
      await DeleteMedicine(currentMedicine.id)
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('messages.medicineRemovedFromCatalog'))
      closeAndClear()
    } catch (error) {
      showRequestError(error, t('messages.couldNotDeleteMedicine'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <MedicineMutateDialog
        key='medicine-create'
        open={open === 'medicine-create'}
        onOpenChange={(value) => {
          if (!value) setOpen(null)
        }}
      />

      {currentMedicine && (
        <>
          <MedicineMutateDialog
            key={`medicine-update-${currentMedicine.id}`}
            open={open === 'medicine-update'}
            onOpenChange={(value) => {
              if (!value) closeAndClear()
            }}
            currentRow={currentMedicine}
          />
          <ConfirmDialog
            destructive
            open={open === 'medicine-delete'}
            onOpenChange={(value) => {
              if (!value) closeAndClear()
            }}
            handleConfirm={handleDelete}
            isLoading={isDeleting}
            className='max-w-md'
            title={t('messages.deleteMedicine', {
              value0: currentMedicine.name,
            })}
            desc={
              <>
                {t('messages.medicine')} <strong>{currentMedicine.name}</strong>{' '}
                {t('messages.willBeRemovedFromTheCatalog')} <br />
                {t('messages.onlyMedicinesWithoutStockBatchesPrescriptionsOrT')}
              </>
            }
            confirmText={t('messages.deleteAlt2')}
            cancelBtnText={t('messages.discard')}
          />
        </>
      )}
    </>
  )
}
