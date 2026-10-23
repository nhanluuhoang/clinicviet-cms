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
import { createDiagnosis, updateDiagnosis, type Diagnosis } from '../api'

export function DiagnosisDialog({
  diagnosis,
  common,
  onClose,
}: {
  diagnosis: Diagnosis | null
  common: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(diagnosis?.name ?? '')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      diagnosis
        ? updateDiagnosis(diagnosis.id, name.trim())
        : createDiagnosis(name.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      toast.success(t('diagnoses.saved'))
      onClose()
    },
    onError: (error) => showRequestError(error, t('diagnoses.saveFailed')),
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
              {t(diagnosis ? 'diagnoses.edit' : 'diagnoses.add')}
            </DialogTitle>
            <DialogDescription>
              {t(common ? 'diagnoses.commonHint' : 'diagnoses.clinicHint')}
            </DialogDescription>
          </DialogHeader>
          <form id='diagnosis-form' onSubmit={submit} className='space-y-2'>
            <Label htmlFor='diagnosis-name' required>
              {t('diagnoses.name')}
            </Label>
            <Input
              id='diagnosis-name'
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
            form='diagnosis-form'
            disabled={mutation.isPending || !name.trim()}
          >
            {t(mutation.isPending ? 'messages.saving' : 'messages.save')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
