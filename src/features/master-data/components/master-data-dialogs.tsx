import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DeleteMasterData } from '../api'
import { MasterDataMutateDrawer } from './master-data-mutate-drawer'
import { useMasterData } from './master-data-provider'

export function MasterDataDialogs() {
  const { t } = useTranslation()

  const { open, setOpen, currentRow, setCurrentRow } = useMasterData()
  const queryClient = useQueryClient()

  const onDeleteConfirm = async () => {
    if (!currentRow) return
    try {
      await DeleteMasterData(currentRow.id)
      queryClient.invalidateQueries({ queryKey: ['master-data'] })
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('messages.generalSettingDeleted'))
    } catch (error) {
      showRequestError(error, t('messages.couldNotDeleteGeneralSetting'))
    }
  }

  return (
    <>
      <MasterDataMutateDrawer
        key='master-data-mutate'
        open={open === 'create' || open === 'update'}
        onOpenChange={() => {
          setOpen(null)
          setCurrentRow(null)
        }}
        currentRow={currentRow || undefined}
      />

      <ConfirmDialog
        key='master-data-delete'
        open={open === 'delete'}
        onOpenChange={() => {
          setOpen(null)
          setCurrentRow(null)
        }}
        title={t('messages.deleteGeneralSetting')}
        desc={t('messages.areYouSureYouWantToDeleteThisSettingThisCanno')}
        confirmText={t('messages.delete')}
        destructive
        handleConfirm={onDeleteConfirm}
      />
    </>
  )
}
