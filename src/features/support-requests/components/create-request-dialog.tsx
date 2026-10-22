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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  createSupportRequest,
  type CreateSupportInput,
  type RequestType,
} from '../api'

export function CreateRequestDialog({
  onCreated,
}: {
  onCreated: (id: string) => void
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RequestType>('BUG')
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createSupportRequest,
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: ['support-requests'] })
      toast.success(t('messages.requestSubmitted'))
      setOpen(false)
      onCreated(request.id)
    },
    onError: (error) =>
      showRequestError(error, t('messages.couldNotSubmitRequest')),
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: CreateSupportInput = {
      type,
      title: String(form.get('title')).trim(),
      content: String(form.get('content')).trim(),
    }
    const pagePath = String(form.get('pagePath')).trim()
    if (!input.title || !input.content)
      return toast.error(t('messages.pleaseEnterATitleAndDescription'))
    if (pagePath && !/^\/(?!\/)[^?#\s]*$/.test(pagePath))
      return toast.error(
        t('messages.enterOnlyThePagePathWithoutAQueryStringOrDoma')
      )
    mutation.mutate({ ...input, ...(pagePath ? { pagePath } : {}) })
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setOpen(next)
          if (next) setType('BUG')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>{t('messages.submitRequest')}</Button>
      </DialogTrigger>
      <DialogFormContent>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>{t('messages.submitSupportRequest')}</DialogTitle>
            <DialogDescription>
              {t('messages.reportAnIssueOrSuggestImprovementsForYourClinic')}
            </DialogDescription>
          </DialogHeader>
          <form
            id='create-support-request-form'
            onSubmit={submit}
            className='space-y-4'
          >
            <fieldset disabled={mutation.isPending} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='request-type' required>
                  {t('messages.requestType')}
                </Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as RequestType)}
                >
                  <SelectTrigger id='request-type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='GENERAL'>
                      {t('messages.generalSupport')}
                    </SelectItem>
                    <SelectItem value='BUG'>
                      {t('messages.bugReport')}
                    </SelectItem>
                    <SelectItem value='FEATURE'>
                      {t('messages.featureRequest')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='request-title' required>
                  {t('messages.title')}
                </Label>
                <Input
                  id='request-title'
                  name='title'
                  required
                  maxLength={200}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='request-content' required>
                  {t('messages.content')}
                </Label>
                <Textarea
                  id='request-content'
                  name='content'
                  required
                  maxLength={10000}
                  rows={7}
                  placeholder={
                    type === 'BUG'
                      ? t('messages.actionsTakenExpectedResultAndActualIssue')
                      : t('messages.whatFeatureWouldYouLikeHowWouldItHelp')
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='request-path'>
                  {t('messages.affectedPage')}
                </Label>
                <Input
                  id='request-path'
                  name='pagePath'
                  maxLength={500}
                  placeholder='/medical-histories'
                />
                <p className='text-xs text-muted-foreground'>
                  {t('messages.enterThePagePathIfApplicable')}
                </p>
              </div>
            </fieldset>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={() => setOpen(false)}
          >
            {t('messages.cancel')}
          </Button>
          <Button
            type='submit'
            form='create-support-request-form'
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t('messages.sending')
              : t('messages.submitRequest')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
