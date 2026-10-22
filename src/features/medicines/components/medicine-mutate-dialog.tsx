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
import { Checkbox } from '@/components/ui/checkbox'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { CreateMedicine, UpdateMedicine, type Medicine } from '../api'
import { medicineGroups, medicineUnits, medicineUnitLabel } from '../data/data'
import { InfoHint } from './info-hint'

const formSchema = z.object({
  name: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterMedicineName') }),
  activeIngredient: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterActiveIngredient') }),
  strength: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterStrength') }),
  unit: z.string().min(1, { error: () => i18n.t('messages.selectUnit') }),
  group: z.enum([
    'antibiotic',
    'analgesic',
    'vitamin',
    'cardio',
    'digestive',
    'respiratory',
    'allergy',
    'endocrine',
    'dermatology',
    'ophthalmology',
    'ent',
    'musculoskeletal',
    'neurology',
    'vaccine',
    'other',
  ]),
  manufacturer: z
    .string()
    .min(1, { error: () => i18n.t('messages.enterManufacturer') }),
  minStock: z
    .number()
    .min(0, { error: () => i18n.t('messages.invalidMinimumStock') }),
  salePrice: z
    .number()
    .min(0, { error: () => i18n.t('messages.invalidSellingPrice') }),
  isActive: z.boolean(),
})

type MedicineForm = z.infer<typeof formSchema>

const defaults: MedicineForm = {
  name: '',
  activeIngredient: '',
  strength: '',
  unit: 'viên',
  group: 'other',
  manufacturer: '',
  minStock: 0,
  salePrice: 0,
  isActive: true,
}

export function MedicineMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Medicine
}) {
  const { t } = useTranslation()

  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<MedicineForm>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      currentRow
        ? {
            name: currentRow.name,
            activeIngredient: currentRow.activeIngredient,
            strength: currentRow.strength,
            unit: currentRow.unit,
            group: currentRow.group,
            manufacturer: currentRow.manufacturer,
            minStock: currentRow.minStock,
            salePrice: Number(currentRow.salePrice),
            isActive: currentRow.isActive,
          }
        : defaults
    )
  }, [currentRow, form, open])

  const onSubmit = async (data: MedicineForm) => {
    try {
      if (isUpdate && currentRow) {
        await UpdateMedicine(currentRow.id, data)
        toast.success(t('messages.medicineUpdated'))
      } else {
        await CreateMedicine(data)
        toast.success(t('messages.medicineAddedToCatalog'))
      }
      queryClient.invalidateQueries({ queryKey: ['medicines'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onOpenChange(false)
    } catch (error) {
      showRequestError(error, t('messages.couldNotSaveMedicine'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogBody>
          <DialogHeader className='pe-8 text-start'>
            <DialogTitle>
              {isUpdate
                ? t('messages.updateMedicine')
                : t('messages.addMedicineToCatalog')}
            </DialogTitle>
            <DialogDescription>
              {t('messages.theCatalogStoresMedicineInformationOnlyQuantities')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='medicine-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='-mx-1 space-y-4 overflow-y-auto px-1'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.medicineName')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={i18n.t('messages.exampleMedicine')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='activeIngredient'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('messages.activeIngredient')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={i18n.t('messages.exampleIngredient')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='strength'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.strength')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={i18n.t('messages.exampleStrength')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.unit')}</FormLabel>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('messages.selectUnit')}
                        items={medicineUnits.map((u) => ({
                          label: medicineUnitLabel(u),
                          value: u,
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='group'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('messages.medicineGroup')}
                    </FormLabel>
                    <SelectDropdown
                      isControlled
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('messages.selectGroup')}
                      items={medicineGroups.map((g) => ({
                        label: g.label,
                        value: g.value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='manufacturer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.manufacturer')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={i18n.t('messages.exampleManufacturer')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='salePrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.sellingPrice')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min={0}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value || 0))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='minStock'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-1'>
                      <FormLabel required>
                        {t('messages.minimumStockLevel')}
                      </FormLabel>
                      <InfoHint label={t('messages.aboutMinimumStockLevels')}>
                        {t(
                          'messages.theLowestStockLevelToMaintainForThisMedicineTh'
                        )}
                      </InfoHint>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min={0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? 0 : Number(e.target.value)
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
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-md border p-3'>
                    <FormLabel>{t('messages.activateMedicine')}</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
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
            form='medicine-form'
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? t('messages.saving')
              : t('messages.save')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
