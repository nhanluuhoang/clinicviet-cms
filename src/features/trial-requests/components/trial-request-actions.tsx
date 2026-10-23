import { useState } from 'react'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  approveTrialRequest,
  rejectTrialRequest,
  type ApproveTrialInput,
  type TrialRequest,
} from '../api'

export function TrialRequestActions({ request }: { request: TrialRequest }) {
  const { t } = useTranslation()

  const [mode, setMode] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [form, setForm] = useState<ApproveTrialInput>({ code: '' })
  const queryClient = useQueryClient()
  const done = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: ['trial-requests'] })
    toast.success(message)
    setMode(null)
  }
  const approve = useMutation({
    mutationFn: () => approveTrialRequest(request.id, form),
    onSuccess: () => done(t('messages.trialRequestApproved')),
    onError: (error) =>
      showRequestError(error, t('messages.couldNotApproveRequest')),
  })
  const reject = useMutation({
    mutationFn: () => rejectTrialRequest(request.id, reason),
    onSuccess: () => done(t('messages.requestRejected')),
    onError: (error) =>
      showRequestError(error, t('messages.couldNotRejectRequest')),
  })
  if (request.status !== 'PENDING') return null
  return (
    <>
      <div className='flex justify-end gap-2'>
        <Button size='sm' onClick={() => setMode('approve')}>
          {t('messages.approve')}
        </Button>
        <Button size='sm' variant='outline' onClick={() => setMode('reject')}>
          {t('messages.reject')}
        </Button>
      </div>
      <Dialog
        open={mode === 'approve'}
        onOpenChange={(open) => !open && setMode(null)}
      >
        <DialogFormContent>
          <DialogBody>
            <DialogHeader>
              <DialogTitle>
                {t('messages.approveRequest')} {request.phone}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <Label required htmlFor='trial-clinic-code'>
                {t('messages.clinicCode')}
              </Label>
              <Input
                id='trial-clinic-code'
                inputMode='numeric'
                maxLength={9}
                value={form.code}
                onChange={(event) => setForm({ code: event.target.value })}
                placeholder={t('messages.enterA9DigitCode')}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMode(null)}>
              {t('messages.cancel')}
            </Button>
            <Button
              disabled={!/^[1-9]\d{8}$/.test(form.code) || approve.isPending}
              onClick={() => approve.mutate()}
            >
              {t('messages.confirmApproval')}
            </Button>
          </DialogFooter>
        </DialogFormContent>
      </Dialog>
      <Dialog
        open={mode === 'reject'}
        onOpenChange={(open) => !open && setMode(null)}
      >
        <DialogFormContent>
          <DialogBody>
            <DialogHeader>
              <DialogTitle>
                {t('messages.rejectRequest')} {request.phone}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <Label required>{t('messages.reason')}</Label>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMode(null)}>
              {t('messages.cancel')}
            </Button>
            <Button
              disabled={!reason.trim() || reject.isPending}
              onClick={() => reject.mutate()}
            >
              {t('messages.confirmRejection')}
            </Button>
          </DialogFooter>
        </DialogFormContent>
      </Dialog>
    </>
  )
}
