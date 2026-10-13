import { ConfirmDialog } from '@/components/confirm-dialog'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplatesDeleteDialog({
  open,
  current,
  close,
  remove,
}: Pick<PrescriptionTemplatesState, 'open' | 'current' | 'close' | 'remove'>) {
  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={(value) => {
        if (!value) close()
      }}
      title='Xóa mẫu đơn thuốc?'
      desc={
        <>
          Mẫu <strong>{current?.name}</strong> sẽ bị xóa và không thể hoàn tác.
        </>
      }
      confirmText='Xóa'
      cancelBtnText='Hủy'
      destructive
      handleConfirm={() => void remove()}
    />
  )
}
