import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { formatNumber } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DisposeBatch } from '../api'
import { BatchUpdateDialog } from './batch-update-dialog'
import { useInventory } from './inventory-provider'
import { IssueMutateDialog } from './issue-mutate-dialog'
import { ReceiptMutateDrawer } from './receipt-mutate-drawer'
import { StockTakeMutateDrawer } from './stocktake-mutate-drawer'

export function InventoryDialogs() {
  const { t } = useTranslation()

  const { open, setOpen, currentBatch, setCurrentBatch } = useInventory()
  const queryClient = useQueryClient()

  const closeAndClear = (clear: () => void) => {
    setOpen(null)
    setTimeout(clear, 500)
  }

  const handleDisposeBatch = async () => {
    if (!currentBatch) return
    try {
      await DisposeBatch(currentBatch.id)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('messages.batchDiscardedFromInventory'))
      closeAndClear(() => setCurrentBatch(null))
    } catch (error) {
      showRequestError(error, t('messages.couldNotDiscardBatch'))
    }
  }

  return (
    <>
      <ReceiptMutateDrawer
        key='receipt-create'
        open={open === 'receipt-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      <StockTakeMutateDrawer
        key='stocktake-create'
        open={open === 'stocktake-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      <IssueMutateDialog
        key='issue-create'
        open={open === 'issue-create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentBatch && (
        <BatchUpdateDialog
          key={`batch-update-${currentBatch.id}`}
          batch={currentBatch}
          open={open === 'batch-update'}
          onOpenChange={(v) => {
            if (!v) closeAndClear(() => setCurrentBatch(null))
          }}
        />
      )}

      {currentBatch && (
        <ConfirmDialog
          key='batch-dispose'
          destructive
          open={open === 'batch-dispose'}
          onOpenChange={(v) => {
            if (!v) closeAndClear(() => setCurrentBatch(null))
          }}
          handleConfirm={handleDisposeBatch}
          className='max-w-md'
          title={t('messages.discardBatchAlt2', {
            value0: currentBatch.batchNo,
          })}
          desc={
            <>
              {t('messages.all')}{' '}
              <strong>
                {formatNumber(currentBatch.qtyRemaining)} {currentBatch.unit}
              </strong>{' '}
              {t('messages.remainingStockOf')}{' '}
              <strong>{currentBatch.medicineName}</strong>{' '}
              {t('messages.batchAlt3')} {currentBatch.batchNo}
              {t('messages.willBeSetToZero')} <br />
              {t('messages.useThisForExpiredOrDamagedBatchesThisCannotBe')}
            </>
          }
          confirmText={t('messages.discardBatchAlt3')}
          cancelBtnText={t('messages.discard')}
        />
      )}
    </>
  )
}
