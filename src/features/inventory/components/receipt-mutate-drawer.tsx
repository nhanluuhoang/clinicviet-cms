import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import i18n, { getLocale } from '@/i18n'
import { Check, ChevronsUpDown, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { cn, formatMoney, getExpiryStatus, toDateInput } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { GetMedicines, type Medicine } from '@/features/medicines/api'
import { CreateReceipt } from '../api'
import { expiryMeta } from '../data/data'

const lineSchema = z
  .object({
    medicineId: z
      .string()
      .min(1, { error: () => i18n.t('messages.selectMedicine') }),
    batchNo: z
      .string()
      .min(1, { error: () => i18n.t('messages.enterBatchNumber') }),
    mfgDate: z.string(),
    expiryDate: z
      .string()
      .min(1, { error: () => i18n.t('messages.enterExpiryDate') }),
    qty: z.number().positive({
      error: () => i18n.t('messages.quantityMustBeGreaterThanZero'),
    }),
    unitCost: z
      .number()
      .min(0, { error: () => i18n.t('messages.invalidUnitPrice') }),
  })
  .refine((l) => !l.mfgDate || l.mfgDate < l.expiryDate, {
    error: () => i18n.t('messages.expiryDateMustBeAfterTheManufacturingDate'),
    path: ['expiryDate'],
  })

const formSchema = z.object({
  supplierName: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterSupplier') }),
  invoiceNo: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterInvoiceNumber') }),
  receivedAt: z
    .string()
    .min(1, { error: () => i18n.t('messages.selectReceiptDate') }),
  note: z.string(),
  lines: z
    .array(lineSchema)
    .min(1, { error: () => i18n.t('messages.aReceiptMustHaveAtLeastOneLine') }),
})

type ReceiptForm = z.infer<typeof formSchema>

const emptyLine = {
  medicineId: '',
  batchNo: '',
  mfgDate: '',
  expiryDate: '',
  qty: 1,
  unitCost: 0,
}

const defaults = (): ReceiptForm => ({
  supplierName: '',
  invoiceNo: '',
  receivedAt: toDateInput(new Date()),
  note: '',
  lines: [{ ...emptyLine }],
})

function MedicinePicker({
  onChange,
}: {
  onChange: (medicineId: string) => void
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Medicine | null>(null)
  const debouncedSearch = useDebounce(search, 300)
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', 'search', debouncedSearch],
    queryFn: () => GetMedicines(debouncedSearch),
    enabled: open,
  })

  return (
    <div className='min-w-0 space-y-1.5'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full min-w-0 justify-between font-normal'
          >
            <span className='min-w-0 flex-1 truncate text-start'>
              {selected
                ? `${selected.name} · ${selected.strength}`
                : isLoading
                  ? t('messages.loadingMedicines')
                  : t('messages.findAndSelectAMedicine')}
            </span>
            <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] p-0'
          align='start'
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={t('messages.searchNameCodeOrActiveIngredient')}
            />
            <CommandList>
              <CommandEmpty>
                <div className='space-y-2 px-3'>
                  <p>
                    {isLoading
                      ? t('messages.searching')
                      : t('messages.noMedicinesFound')}
                  </p>
                  <Button asChild variant='outline' size='sm'>
                    <Link to='/medicines'>
                      {t('messages.goToCatalogToAdd')}
                      <ExternalLink className='size-3.5' />
                    </Link>
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {(medicines ?? []).map((medicine) => (
                  <CommandItem
                    key={medicine.id}
                    value={`${medicine.name} ${medicine.code} ${medicine.activeIngredient} ${medicine.strength} ${medicine.manufacturer}`}
                    onSelect={() => {
                      setSelected(medicine)
                      onChange(medicine.id)
                      setOpen(false)
                    }}
                    className='items-start'
                  >
                    <Check
                      className={cn(
                        'mt-0.5 size-4',
                        medicine.id === selected?.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className='min-w-0'>
                      <p className='truncate font-medium'>
                        {medicine.name} · {medicine.strength}
                      </p>
                      <p className='truncate text-xs text-muted-foreground'>
                        {medicine.code} · {medicine.activeIngredient} ·{' '}
                        {medicine.manufacturer} · {medicine.unit}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <p
          className='truncate text-xs text-muted-foreground'
          title={t('messages.unitAlt2', {
            value0: selected.code,
            value1: selected.activeIngredient,
            value2: selected.manufacturer,
            value3: selected.unit,
          })}
        >
          {selected.code} · {selected.activeIngredient} ·{' '}
          {selected.manufacturer} {t('messages.unitAlt3')} {selected.unit}
        </p>
      )}
    </div>
  )
}

export function ReceiptMutateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const form = useForm<ReceiptForm>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  })

  useEffect(() => {
    if (open) form.reset(defaults())
  }, [open, form])

  const lines = form.watch('lines')
  const totalAmount = lines.reduce(
    (sum, l) => sum + (l.qty || 0) * (l.unitCost || 0),
    0
  )
  const totalQty = lines.reduce((sum, l) => sum + (l.qty || 0), 0)

  const onSubmit = async (data: ReceiptForm) => {
    try {
      await CreateReceipt(data)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('messages.goodsReceived'), {
        description: t('messages.newBatchesAddedToInventory', {
          value0: data.lines.length,
        }),
      })
      onOpenChange(false)
    } catch (error) {
      showRequestError(error, t('messages.couldNotReceiveGoods'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Chỉ đóng bằng nút X hoặc Đóng — xem ghi chú ở medicine-mutate-drawer. */}
      <DialogFormContent
        className='sm:max-w-4xl lg:max-w-6xl'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogBody>
          <DialogHeader className='pe-8 text-start'>
            <DialogTitle>{t('messages.receipts')}</DialogTitle>
            <DialogDescription>
              {t('messages.eachLineCreatesASeparateInventoryBatchBatchNumb')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='receipt-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='-mx-1 space-y-6 overflow-y-auto px-1'
            >
              <div className='grid gap-4 sm:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='supplierName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.supplier')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('messages.eGDhgPharma')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='invoiceNo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('messages.invoiceNumber')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={i18n.t('messages.exampleInvoiceNumber')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='receivedAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.receivedOn')}</FormLabel>
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-base'>
                    {t('messages.receiptDetails')}
                    {fields.length} {t('messages.batches')}
                  </FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => append({ ...emptyLine })}
                  >
                    <Plus className='size-4' />
                    {t('messages.addBatch')}
                  </Button>
                </div>

                {fields.map((fieldItem, index) => {
                  const line = lines[index]
                  const status = line?.expiryDate
                    ? getExpiryStatus(line.expiryDate)
                    : null
                  const meta = status ? expiryMeta(status) : null

                  return (
                    <div
                      key={fieldItem.id}
                      className='space-y-3 rounded-md border p-3 lg:pb-8'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-medium text-muted-foreground'>
                          {t('messages.batchAlt6')}
                          {index + 1}
                        </span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium tabular-nums'>
                            {formatMoney(
                              (line?.qty || 0) * (line?.unitCost || 0)
                            )}
                          </span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='size-7 text-red-600 dark:text-red-400'
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            aria-label={t('messages.removeBatch', {
                              value0: index + 1,
                            })}
                          >
                            <Trash2 className='size-4' />
                          </Button>
                        </div>
                      </div>

                      <div className='grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-12'>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.medicineId`}
                          render={({ field }) => (
                            <FormItem className='min-w-0 lg:col-span-6'>
                              <FormLabel required className='text-xs'>
                                {t('messages.medicine')}
                              </FormLabel>
                              <MedicinePicker onChange={field.onChange} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${index}.batchNo`}
                          render={({ field }) => (
                            <FormItem className='lg:col-span-6'>
                              <FormLabel required className='text-xs'>
                                {t('messages.batchNumber')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={i18n.t(
                                    'messages.exampleBatchNumber'
                                  )}
                                  className='font-mono'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${index}.mfgDate`}
                          render={({ field }) => (
                            <FormItem className='lg:col-span-3'>
                              <FormLabel className='text-xs'>
                                {t('messages.manufacturedOn')}
                              </FormLabel>
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
                          name={`lines.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem className='lg:col-span-3'>
                              <FormLabel required className='text-xs'>
                                {t('messages.expiryAlt2')}
                              </FormLabel>
                              <DatePickerInput
                                value={field.value}
                                onChange={field.onChange}
                                inputClassName={cn(
                                  status === 'expired' &&
                                    'border-red-400 dark:border-red-700'
                                )}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${index}.qty`}
                          render={({ field }) => (
                            <FormItem className='lg:col-span-2'>
                              <FormLabel required className='text-xs'>
                                {t('messages.quantityAlt2')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type='number'
                                  min={1}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ''
                                        ? 0
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lines.${index}.unitCost`}
                          render={({ field }) => (
                            <FormItem className='lg:col-span-4'>
                              <FormLabel required className='text-xs'>
                                {t('messages.purchaseUnitPrice')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type='number'
                                  min={0}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ''
                                        ? 0
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Cảnh báo ngay tại dòng, trước khi hàng vào kho. */}
                      {meta && status !== 'ok' && (
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-xs',
                            meta.textClass
                          )}
                        >
                          <meta.icon className='size-3.5' />
                          {status === 'expired'
                            ? t(
                                'messages.thisBatchHasExpiredCheckBeforeReceivingIt'
                              )
                            : t('messages.prioritizeIssuingThisBatch', {
                                value0: meta.label,
                              })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {form.formState.errors.lines?.root && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors.lines.root.message}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('messages.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={t('messages.additionalOrderNotesOptional')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className='border-t pt-4 sm:items-center'>
          <div className='flex flex-1 basis-full flex-wrap items-center gap-x-6 gap-y-1 text-sm sm:basis-auto'>
            <span className='text-muted-foreground'>
              {t('messages.totalQuantity')}{' '}
              <span className='font-medium text-foreground tabular-nums'>
                {totalQty.toLocaleString(getLocale())}
              </span>
            </span>
            <span className='text-muted-foreground'>
              {t('messages.total')}{' '}
              <span className='font-medium text-foreground tabular-nums'>
                {formatMoney(totalAmount)}
              </span>
            </span>
          </div>
          <DialogClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </DialogClose>
          <Button
            form='receipt-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t('messages.saving')
              : t('messages.receipts')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
