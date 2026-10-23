import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplatesDeleteDialog({
  open,
  current,
  close,
  remove,
}: Pick<PrescriptionTemplatesState, 'open' | 'current' | 'close' | 'remove'>) {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      open={open === 'delete'}
      onOpenChange={(value) => {
        if (!value) close()
      }}
      title={t('messages.deletePrescriptionTemplate')}
      desc={
        <>
          {t('messages.template')} <strong>{current?.name}</strong>{' '}
          {t('messages.willBeDeletedThisCannotBeUndone')}
        </>
      }
      confirmText={t('messages.delete')}
      cancelBtnText={t('messages.cancel')}
      destructive
      handleConfirm={() => void remove()}
    />
  )
}
