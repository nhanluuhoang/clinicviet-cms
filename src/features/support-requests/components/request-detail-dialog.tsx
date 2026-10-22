import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import i18n, { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getSupportRequest,
  replyToSupportRequest,
  updateSupportStatus,
  type RequestStatus,
} from '../api'
import { statusLabels, typeLabels } from '../data'

export function RequestDetailDialog({
  id,
  system,
  onClose,
}: {
  id: string
  system: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [status, setStatus] = useState<RequestStatus | ''>('')
  const [reply, setReply] = useState('')
  const query = useQuery({
    queryKey: ['support-request', id],
    queryFn: () => getSupportRequest(id),
  })
  const mutation = useMutation({
    mutationFn: async ({
      content,
      nextStatus,
    }: {
      content: string
      nextStatus?: RequestStatus
    }) =>
      nextStatus
        ? updateSupportStatus(id, nextStatus, content || undefined)
        : replyToSupportRequest(id, content),
    onSuccess: async () => {
      setReply('')
      setStatus('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['support-request', id] }),
        queryClient.invalidateQueries({ queryKey: ['support-requests'] }),
      ])
      toast.success(t('messages.requestUpdated'))
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotUpdateRequest')),
  })
  const request = query.data
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = reply.trim()
    const nextStatus =
      system && status && status !== request?.status ? status : undefined
    if (!nextStatus && !content)
      return toast.error(t('messages.pleaseEnterAReply'))
    if ((nextStatus === 'DECLINED' || nextStatus === 'NEEDS_INFO') && !content)
      return toast.error(
        t('messages.pleaseEnterAReasonOrTheAdditionalInformationReq')
      )
    mutation.mutate({ content, nextStatus })
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogFormContent className='sm:max-w-2xl'>
        <DialogBody className='space-y-4'>
          <DialogHeader>
            <DialogTitle>
              {request?.title ?? t('messages.requestDetails')}
            </DialogTitle>
            <DialogDescription>
              {t('messages.trackRepliesAndRequestHistory')}
            </DialogDescription>
          </DialogHeader>
          {query.isPending ? (
            <p role='status'>{t('messages.loadingAlt2')}</p>
          ) : query.isError ? (
            <div role='alert'>
              <p>{t('messages.couldNotLoadThisRequestOrYouDoNotHaveAccess')}</p>
              <Button variant='outline' onClick={() => void query.refetch()}>
                {t('messages.tryAgain')}
              </Button>
            </div>
          ) : (
            request && (
              <>
                <div className='space-y-3 rounded-md border p-4'>
                  <p className='text-sm'>
                    {typeLabels[request.type]} ·{' '}
                    <strong>{statusLabels[request.status]}</strong>
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {request.tenant
                      ? `${request.tenant.name} (${request.tenant.code})`
                      : request.organization ||
                        t('messages.websiteVisitor')}{' '}
                    ·{' '}
                    {request.creator?.fullName ??
                      request.contactName ??
                      t('messages.deletedAccount')}{' '}
                    · {new Date(request.createdAt).toLocaleString(getLocale())}
                  </p>
                  {request.contactEmail && (
                    <p className='text-sm break-all text-muted-foreground'>
                      Email: {request.contactEmail}
                      {request.contactPhone && (
                        <>
                          {' '}
                          {t('messages.phoneAlt3')} {request.contactPhone}
                        </>
                      )}
                    </p>
                  )}
                  <p className='break-words whitespace-pre-wrap'>
                    {request.content}
                  </p>
                  {request.pagePath && (
                    <p className='text-sm break-all text-muted-foreground'>
                      {i18n.t('messages.pageLabel')}
                      {request.pagePath}
                    </p>
                  )}
                </div>
                <section
                  className='space-y-3'
                  aria-label={t('messages.discussionAndStatusHistory')}
                >
                  <h3 className='font-semibold'>
                    {t('messages.discussionProcessingHistory')}
                  </h3>
                  {!request.activities.length && (
                    <p className='text-sm text-muted-foreground'>
                      {t('messages.noRepliesYet')}
                    </p>
                  )}
                  {request.activities.map((activity) => (
                    <article
                      key={activity.id}
                      className='space-y-2 rounded-md border p-3'
                    >
                      <p className='text-sm font-medium'>
                        {activity.guestReply
                          ? request.contactName
                          : (activity.actor?.fullName ??
                            t('messages.deletedAccount'))}{' '}
                        <span className='font-normal text-muted-foreground'>
                          ·{' '}
                          {new Date(activity.createdAt).toLocaleString(
                            getLocale()
                          )}
                        </span>
                      </p>
                      {activity.toStatus && (
                        <p className='text-sm text-muted-foreground'>
                          {activity.fromStatus
                            ? statusLabels[activity.fromStatus]
                            : ''}{' '}
                          → {statusLabels[activity.toStatus]}
                        </p>
                      )}
                      {activity.content && (
                        <p className='text-sm break-words whitespace-pre-wrap'>
                          {activity.content}
                        </p>
                      )}
                    </article>
                  ))}
                </section>
                <form
                  id='support-request-reply-form'
                  onSubmit={submit}
                  className='space-y-3 border-t pt-4'
                >
                  {request.contactEmail && (
                    <p className='text-sm text-muted-foreground'>
                      {t(
                        'messages.repliesAndStatusHistoryAreVisibleToVisitorsOnT'
                      )}
                    </p>
                  )}
                  {system && (
                    <div className='space-y-2'>
                      <Label htmlFor='support-status'>
                        {t('messages.status')}
                      </Label>
                      <Select
                        disabled={mutation.isPending}
                        value={status || request.status}
                        onValueChange={(value) =>
                          setStatus(value as RequestStatus)
                        }
                      >
                        <SelectTrigger id='support-status'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='support-reply'
                      required={
                        !system ||
                        !status ||
                        status === request.status ||
                        status === 'DECLINED' ||
                        status === 'NEEDS_INFO'
                      }
                    >
                      {t('messages.reply')}
                    </Label>
                    <Textarea
                      id='support-reply'
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      maxLength={10000}
                      rows={4}
                      disabled={mutation.isPending}
                    />
                  </div>
                </form>
              </>
            )
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {t('messages.close')}
          </Button>
          {request && !query.isPending && !query.isError && (
            <Button
              disabled={mutation.isPending}
              type='submit'
              form='support-request-reply-form'
            >
              {mutation.isPending
                ? t('messages.sending')
                : system
                  ? t('messages.updateRequest')
                  : t('messages.sendReply')}
            </Button>
          )}
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
