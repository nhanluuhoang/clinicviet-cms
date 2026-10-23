import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogFormContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createMedicineInstruction,
  updateMedicineInstruction,
  type MedicineInstruction,
} from '../api'

export function MedicineInstructionDialog({
  medicineInstruction,
  common,
  onClose,
}: {
  medicineInstruction: MedicineInstruction | null
  common: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(medicineInstruction?.name ?? '')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      medicineInstruction
        ? updateMedicineInstruction(medicineInstruction.id, name.trim())
        : createMedicineInstruction(name.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['medicineInstructions'],
      })
      toast.success(t('medicineInstructions.saved'))
      onClose()
    },
    onError: (error) =>
      showRequestError(error, t('medicineInstructions.saveFailed')),
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim() && !mutation.isPending) mutation.mutate()
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogFormContent>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>
              {t(
                medicineInstruction
                  ? 'medicineInstructions.edit'
                  : 'medicineInstructions.add'
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                common
                  ? 'medicineInstructions.commonHint'
                  : 'medicineInstructions.clinicHint'
              )}
            </DialogDescription>
          </DialogHeader>
          <form
            id='medicineInstruction-form'
            onSubmit={submit}
            className='space-y-2'
          >
            <Label htmlFor='medicineInstruction-name' required>
              {t('medicineInstructions.name')}
            </Label>
            <Input
              id='medicineInstruction-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={255}
              disabled={mutation.isPending}
              autoFocus
            />
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {t('messages.cancel')}
          </Button>
          <Button
            type='submit'
            form='medicineInstruction-form'
            disabled={mutation.isPending || !name.trim()}
          >
            {t(mutation.isPending ? 'messages.saving' : 'messages.save')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
