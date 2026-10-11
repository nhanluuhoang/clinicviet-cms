import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteMedicine } from '../api'
import { MedicineMutateDialog } from './medicine-mutate-dialog'
import { useMedicines } from './medicines-provider'

export function MedicinesDialogs() {
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
      toast.success('Đã xoá thuốc khỏi danh mục')
      closeAndClear()
    } catch (error) {
      showRequestError(error, 'Không xoá được thuốc')
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
            title={`Xoá thuốc "${currentMedicine.name}"?`}
            desc={
              <>
                Thuốc <strong>{currentMedicine.name}</strong> sẽ bị xoá khỏi
                danh mục. <br />
                Chỉ có thể xoá thuốc chưa có lô kho, đơn thuốc hoặc mẫu đơn.
                Thuốc đã được sử dụng có thể chuyển sang trạng thái ngừng sử
                dụng trong phần Cập nhật.
              </>
            }
            confirmText='Xoá'
            cancelBtnText='Huỷ bỏ'
          />
        </>
      )}
    </>
  )
}
