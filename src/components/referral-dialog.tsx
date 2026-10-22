import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { SERVICE_PLAN_LABELS } from '@/config/service-plans'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { axios } from '@/lib/axios'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogFormContent,
  DialogBody,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ReferralInput = {
  phone: string
  contactName: string
}

export function ReferralDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const user = useAuthStore((state) => state.auth.user)
  const [submitted, setSubmitted] = useState(false)
  const plan = user?.tenant?.servicePlan
  const mutation = useMutation({
    mutationFn: (data: ReferralInput) =>
      axios.post('/trial-requests/referrals', data),
    onSuccess: () => {
      setSubmitted(true)
      toast.success(t('messages.referralSubmitted'))
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotSubmitReferral')),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({
      phone: String(data.get('phone') ?? '').trim(),
      contactName: String(data.get('contactName') ?? '').trim(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        if (!next) setSubmitted(false)
        onOpenChange(next)
      }}
    >
      <DialogFormContent>
        <DialogBody className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{t('messages.referAFriend')}</DialogTitle>
            <DialogDescription>
              {t('messages.introduceClinicvietToFriendsOrOrganizationsThatN')}
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6'>
            {t('messages.whenYourReferralPurchasesAServicePlanYouReceive')}{' '}
            <strong>{t('messages.monthOnYourCurrentPlan')}</strong>
            {plan ? ` (${SERVICE_PLAN_LABELS[plan]})` : ''}{' '}
            {t('messages.atTheTimeTheRewardIsRecordedTheClinicvietTeam')}
          </div>
          {submitted ? (
            <div className='space-y-4'>
              <p className='text-sm leading-6'>
                {t('messages.referralReceivedClinicvietWillContactTheReferred')}
              </p>
            </div>
          ) : (
            <form id='referral-form' onSubmit={submit} className='space-y-4'>
              <fieldset disabled={mutation.isPending} className='space-y-4'>
                <div className='space-y-2'>
                  <Label required htmlFor='referral-phone'>
                    {t('messages.referralSPhoneNumber')}
                  </Label>
                  <Input
                    id='referral-phone'
                    name='phone'
                    type='tel'
                    required
                    maxLength={20}
                    placeholder={t('messages.enterAContactPhoneNumber')}
                  />
                </div>
                <div className='space-y-2'>
                  <Label required htmlFor='referral-name'>
                    {t('messages.referralSName')}
                  </Label>
                  <Input
                    id='referral-name'
                    name='contactName'
                    required
                    maxLength={100}
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t(
                    'messages.referrerInformationIsTakenFromTheSignedInAccoun'
                  )}
                </p>
              </fieldset>
            </form>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={() => {
              setSubmitted(false)
              onOpenChange(false)
            }}
          >
            {t('messages.close')}
          </Button>
          {!submitted && (
            <Button
              type='submit'
              form='referral-form'
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? t('messages.sending')
                : t('messages.submitReferral')}
            </Button>
          )}
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
