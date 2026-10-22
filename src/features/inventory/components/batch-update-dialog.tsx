import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { toDateInput } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogBody,
  DialogFormContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { type StockBatch, UpdateBatch } from '../api'

const formSchema = z
  .object({
    batchNo: z
      .string()
      .min(1, { error: () => i18n.t('messages.enterBatchNumber') }),
    mfgDate: z.string(),
    expiryDate: z
      .string()
      .min(1, { error: () => i18n.t('messages.selectExpiryDate') }),
    note: z.string(),
  })
  .refine((value) => !value.mfgDate || value.mfgDate < value.expiryDate, {
    error: () => i18n.t('messages.expiryDateMustBeAfterTheManufacturingDate'),
    path: ['expiryDate'],
  })

type BatchForm = z.infer<typeof formSchema>

export function BatchUpdateDialog({
  batch,
  open,
  onOpenChange,
}: {
  batch: StockBatch
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const form = useForm<BatchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchNo: batch.batchNo,
      mfgDate: batch.mfgDate ? toDateInput(batch.mfgDate) : '',
      expiryDate: toDateInput(batch.expiryDate),
      note: batch.note,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        batchNo: batch.batchNo,
        mfgDate: batch.mfgDate ? toDateInput(batch.mfgDate) : '',
        expiryDate: toDateInput(batch.expiryDate),
        note: batch.note,
      })
    }
  }, [batch, form, open])

  const onSubmit = async (data: BatchForm) => {
    try {
      await UpdateBatch(batch.id, data)
      await queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('messages.batchUpdated'))
      onOpenChange(false)
    } catch (error) {
      showRequestError(error, t('messages.couldNotUpdateBatch'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent className='sm:max-w-lg'>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>{t('messages.updateBatch')}</DialogTitle>
            <DialogDescription>
              {batch.medicineName} {t('messages.stock')} {batch.qtyRemaining}{' '}
              {batch.unit}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='batch-update-form'
              className='space-y-4'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name='batchNo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.batchNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='mfgDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('messages.manufacturingDate')}</FormLabel>
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='expiryDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.expiryDate')}</FormLabel>
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('messages.notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </DialogClose>
          <Button
            form='batch-update-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t('messages.saving')
              : t('messages.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
