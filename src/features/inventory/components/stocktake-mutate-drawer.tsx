import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { cn, formatNumber, toDateInput } from '@/lib/utils'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerInput } from '@/components/date-picker-input'
import { NumberInput } from '@/components/number-input'
import { GetMedicines, type Medicine } from '@/features/medicines/api'
import { CreateStockTake, GetBatches } from '../api'
import { ExpiryBadge } from './expiry-badge'

function MedicinePicker({
  selected,
  onChange,
}: {
  selected: Medicine | null
  onChange: (medicine: Medicine) => void
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', 'search', debouncedSearch],
    queryFn: () => GetMedicines(debouncedSearch),
    enabled: open,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id='stocktake-medicine'
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          <span className='truncate'>
            {selected
              ? `${selected.name} · ${selected.strength}`
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
            placeholder={t('messages.searchNameCodeOrActiveIngredientAlt2')}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t('messages.searching')
                : t('messages.noMedicinesFound')}
            </CommandEmpty>
            <CommandGroup>
              {(medicines ?? []).map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={medicine.id}
                  onSelect={() => {
                    onChange(medicine)
                    setOpen(false)
                  }}
                  className='items-start'
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4',
                      medicine.id === selected?.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='min-w-0'>
                    <p className='truncate font-medium'>
                      {medicine.name} · {medicine.strength}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {medicine.code} · {medicine.activeIngredient} ·{' '}
                      {medicine.unit}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function StockTakeMutateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [medicineId, setMedicineId] = useState('')
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  )
  const [countedAt, setCountedAt] = useState(toDateInput(new Date()))
  const [note, setNote] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: allBatches } = useQuery({
    queryKey: ['inventory', 'batches'],
    queryFn: () => GetBatches(),
    enabled: open,
  })

  const batches = useMemo(
    () =>
      (allBatches ?? []).filter(
        (b) => b.medicineId === medicineId && b.qtyRemaining > 0
      ),
    [allBatches, medicineId]
  )

  useEffect(() => {
    if (open) {
      setMedicineId('')
      setSelectedMedicine(null)
      setCountedAt(toDateInput(new Date()))
      setNote('')
      setCounts({})
    }
  }, [open])

  useEffect(() => {
    setCounts({})
  }, [medicineId])

  const changedLines = batches
    .filter(
      (b) => counts[b.id] !== undefined && counts[b.id] !== b.qtyRemaining
    )
    .map((b) => ({ batchId: b.id, countedQty: counts[b.id] }))

  const onSubmit = async () => {
    if (changedLines.length === 0) return
    setIsSubmitting(true)
    try {
      await CreateStockTake({ countedAt, note, lines: changedLines })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('messages.stocktakeSaved'), {
        description: t('messages.stockAdjustedForBatches', {
          value0: changedLines.length,
        }),
      })
      onOpenChange(false)
    } catch (error) {
      showRequestError(error, t('messages.couldNotSaveStocktake'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent
        className='sm:max-w-2xl'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogBody>
          <DialogHeader className='pe-8 text-start'>
            <DialogTitle>{t('messages.inventoryStocktake')}</DialogTitle>
            <DialogDescription>
              {t('messages.chooseAMedicineAndEnterThePhysicalCountForEach')}
            </DialogDescription>
          </DialogHeader>
          <div className='-mx-1 space-y-6 overflow-y-auto px-1'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label required htmlFor='stocktake-medicine'>
                  {t('messages.medicine')}
                </Label>
                <MedicinePicker
                  selected={selectedMedicine}
                  onChange={(medicine) => {
                    setSelectedMedicine(medicine)
                    setMedicineId(medicine.id)
                  }}
                />
              </div>
              <div className='space-y-2'>
                <Label required htmlFor='stocktake-date'>
                  {t('messages.stocktakeDate')}
                </Label>
                <DatePickerInput
                  id='stocktake-date'
                  value={countedAt}
                  onChange={setCountedAt}
                />
              </div>
            </div>

            {medicineId && (
              <div className='space-y-2'>
                <Label>
                  {t('messages.batchesWithRemainingStock')}
                  {batches.length})
                </Label>
                {batches.length === 0 ? (
                  <p className='rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground'>
                    {t('messages.thisMedicineHasNoBatchesWithRemainingStock')}
                  </p>
                ) : (
                  <>
                    <div className='grid gap-2 sm:hidden'>
                      {batches.map((batch) => {
                        const counted = counts[batch.id]
                        const diff =
                          counted === undefined
                            ? null
                            : counted - batch.qtyRemaining
                        return (
                          <div
                            key={batch.id}
                            className='space-y-2 rounded-md border p-3 text-sm'
                          >
                            <p className='font-medium'>
                              {t('messages.batchAlt2')} {batch.batchNo}
                            </p>
                            <p>
                              {t('messages.expiryDateAlt2')}{' '}
                              <ExpiryBadge date={batch.expiryDate} />
                            </p>
                            <p>
                              {t('messages.systemStock')}{' '}
                              {formatNumber(batch.qtyRemaining)}
                            </p>
                            <label className='block space-y-1'>
                              <span>{t('messages.physicalCount')}</span>
                              <NumberInput
                                min={0}
                                className='h-8 w-full'
                                placeholder={String(batch.qtyRemaining)}
                                value={counted ?? ''}
                                onValueChange={(value) =>
                                  setCounts((previous) => {
                                    const next = { ...previous }
                                    if (value === '') delete next[batch.id]
                                    else next[batch.id] = Number(value)
                                    return next
                                  })
                                }
                              />
                            </label>
                            <p>
                              {t('messages.difference')}{' '}
                              {diff === null
                                ? '—'
                                : diff > 0
                                  ? `+${formatNumber(diff)}`
                                  : formatNumber(diff)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                    <div className='hidden overflow-x-auto rounded-md border sm:block'>
                      <table className='w-full text-sm'>
                        <thead className='bg-muted/50 text-xs text-muted-foreground'>
                          <tr>
                            <th className='px-3 py-2 text-start font-medium'>
                              {t('messages.batchNumber')}
                            </th>
                            <th className='px-3 py-2 text-start font-medium'>
                              {t('messages.expiryDate')}
                            </th>
                            <th className='px-3 py-2 text-end font-medium'>
                              {t('messages.systemStockAlt2')}
                            </th>
                            <th className='px-3 py-2 text-end font-medium'>
                              {t('messages.physicalCount')}
                            </th>
                            <th className='px-3 py-2 text-end font-medium'>
                              {t('messages.differenceAlt2')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {batches.map((batch) => {
                            const counted = counts[batch.id]
                            const diff =
                              counted === undefined
                                ? null
                                : counted - batch.qtyRemaining

                            return (
                              <tr key={batch.id} className='border-t'>
                                <td className='px-3 py-2 font-mono text-xs'>
                                  {batch.batchNo}
                                </td>
                                <td className='px-3 py-2'>
                                  <ExpiryBadge date={batch.expiryDate} />
                                </td>
                                <td className='px-3 py-2 text-end tabular-nums'>
                                  {formatNumber(batch.qtyRemaining)}
                                </td>
                                <td className='px-3 py-2 text-end'>
                                  <NumberInput
                                    min={0}
                                    className='ms-auto h-8 w-24 text-end'
                                    placeholder={String(batch.qtyRemaining)}
                                    value={counted ?? ''}
                                    onValueChange={(value) =>
                                      setCounts((prev) => {
                                        const next = { ...prev }
                                        if (value === '') {
                                          delete next[batch.id]
                                        } else {
                                          next[batch.id] = Number(value)
                                        }
                                        return next
                                      })
                                    }
                                  />
                                </td>
                                <td
                                  className={cn(
                                    'px-3 py-2 text-end font-medium tabular-nums',
                                    diff === null || diff === 0
                                      ? 'text-muted-foreground'
                                      : diff > 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                  )}
                                >
                                  {diff === null
                                    ? '—'
                                    : diff > 0
                                      ? `+${formatNumber(diff)}`
                                      : formatNumber(diff)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='stocktake-note'>{t('messages.notes')}</Label>
              <Textarea
                id='stocktake-note'
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(
                  'messages.reasonForDiscrepancyStocktakerOptional'
                )}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className='border-t pt-4 sm:items-center'>
          <span className='flex-1 basis-full text-sm text-muted-foreground sm:basis-auto'>
            {changedLines.length} {t('messages.batchesWithDiscrepancies')}
          </span>
          <DialogClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || changedLines.length === 0}
          >
            {isSubmitting ? t('messages.saving') : t('messages.saveStocktake')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
