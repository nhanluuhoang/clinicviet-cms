import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PrescriptionDialog } from '@/features/examination-queue/components/prescription-dialog'
import { DeletePatient } from '../api'
import { PatientHistoryDialog } from './patient-history-dialog'
import { PatientsMutateDialog } from './patients-mutate-dialog'
import { usePatients } from './patients-provider'

export function PatientsDialogs() {
  const { t } = useTranslation()

  const { open, setOpen, currentRow, setCurrentRow } = usePatients()
  const queryClient = useQueryClient()

  /** Đóng dialog trước, xoá dòng đang chọn sau, để nội dung không nhảy khi animate. */
  const closeAndClear = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  const handleDelete = async () => {
    if (!currentRow) return
    try {
      await DeletePatient(currentRow.id)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success(t('messages.patientDeleted'))
      closeAndClear()
    } catch (error) {
      showRequestError(error, t('messages.couldNotDeletePatient'))
    }
  }

  return (
    <>
      <PatientsMutateDialog
        key='patient-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          <PatientsMutateDialog
            key={`patient-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            currentRow={currentRow}
          />

          <PatientHistoryDialog
            open={open === 'history'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            patient={currentRow}
          />

          <PrescriptionDialog
            open={open === 'prescription'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            patient={{ ...currentRow, role: 'PATIENT' }}
            initialData={null}
          />

          <ConfirmDialog
            key='patient-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v) => {
              if (!v) closeAndClear()
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={t('messages.deletePatient', { value0: currentRow.fullName })}
            desc={
              <>
                {t('messages.patient')} <strong>{currentRow.fullName}</strong>{' '}
                {t('messages.usernameAlt2')}{' '}
                <strong>{currentRow.userName}</strong>
                {t('messages.willBeDeleted')} <br />
                {t('messages.onlyPatientsWithoutAppointmentsMedicalRecordsOrG')}
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
