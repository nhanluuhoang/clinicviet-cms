import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  CreateMasterData,
  UpdateMasterData,
  type MasterData,
  type MasterDataDtoRequest,
} from '../api'

type MasterDataMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: MasterData
}

const formSchema = z.object({
  key: z
    .string()
    .min(1, { error: () => i18n.t('messages.keyRequired') })
    .max(100),
  value: z
    .string()
    .min(1, { error: () => i18n.t('messages.valueRequired') })
    .max(100),
  searchKey: z.string().max(100).optional().or(z.literal('')),
})
type MasterDataForm = z.infer<typeof formSchema>

export function MasterDataMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: MasterDataMutateDrawerProps) {
  const { t } = useTranslation()

  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<MasterDataForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: '',
      value: '',
      searchKey: '',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        key: currentRow.key,
        value: currentRow.value,
      })
    } else {
      form.reset({
        key: '',
        value: '',
        searchKey: '',
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: MasterDataForm) => {
    try {
      const requestData: MasterDataDtoRequest = {
        key: data.key,
        value: data.value,
      }

      if (isUpdate && currentRow) {
        await UpdateMasterData(currentRow.id, requestData)
        toast.success(i18n.t('messages.masterDataUpdated'))
      } else {
        await CreateMasterData(requestData)
        toast.success(i18n.t('messages.masterDataCreated'))
      }
      queryClient.invalidateQueries({ queryKey: ['master-data'] })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      showRequestError(error, t('messages.couldNotSaveGeneralSettings'))
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='block h-dvh w-screen max-w-none overflow-x-hidden overflow-y-auto overscroll-contain border-0 sm:flex sm:w-3/4 sm:max-w-sm sm:flex-col sm:overflow-hidden sm:border-s'>
        <div className='min-w-0 sm:min-h-0 sm:flex-1 sm:overflow-x-hidden sm:overflow-y-auto sm:overscroll-contain'>
          <SheetHeader className='text-start'>
            <SheetTitle>
              {isUpdate ? t('messages.update') : t('messages.create')}{' '}
              {t('messages.generalSetting')}
            </SheetTitle>
            <SheetDescription>
              {isUpdate
                ? t('messages.updateTheRequiredConfigurationDetails')
                : t('messages.enterDetailsToCreateANewSetting')}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              id='master-data-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 px-4'
            >
              <FormField
                control={form.control}
                name='key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.key')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('messages.enterKey')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.value')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('messages.enterValue')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='searchKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('messages.searchKey')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('messages.enterSearchKey')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter className='mt-4 flex-row justify-end gap-2 border-t pb-[max(1rem,env(safe-area-inset-bottom))]'>
          <SheetClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </SheetClose>
          <Button
            form='master-data-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t('messages.saving')
              : t('messages.saveChanges')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
