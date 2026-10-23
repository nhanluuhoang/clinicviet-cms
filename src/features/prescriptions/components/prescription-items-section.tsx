import { getLocale } from '@/i18n'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { MedicineInstructionInput } from '@/components/medicine-instruction-input'
import { NumberInput } from '@/components/number-input'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { Field } from './field'
import { MedicinePicker } from './medicine-picker'
import { PrescriptionTemplatePicker } from './prescription-template-picker'

export function PrescriptionItemsSection({
  formId,
  isPharmacy,
  isVaccination,
  items,
  setItems,
  applyTemplate,
  instructionOptions,
  updateItem,
  addItem,
  getQuantityError,
}: Pick<
  ServicePrescriptionFormState,
  | 'formId'
  | 'isPharmacy'
  | 'isVaccination'
  | 'items'
  | 'setItems'
  | 'applyTemplate'
  | 'instructionOptions'
  | 'updateItem'
  | 'addItem'
  | 'getQuantityError'
>) {
  const { t } = useTranslation()

  return (
    <Card className='min-w-0'>
      <CardHeader className='gap-3 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6'>
        <div className='min-w-0'>
          <CardTitle>
            {isVaccination
              ? t('messages.vaccinesMedicines')
              : isPharmacy
                ? t('messages.medicinesProducts')
                : t('messages.prescriptionAlt2')}
          </CardTitle>
          <CardDescription>
            {t('messages.findAndSelectMedicinesFromTheCatalog')}
          </CardDescription>
        </div>
        <div className='grid min-w-0 gap-1.5 sm:min-w-56'>
          <Label htmlFor={formId + '-prescription-template'}>
            {t('messages.prescriptionTemplates')}
          </Label>
          <PrescriptionTemplatePicker onSelect={applyTemplate} />
        </div>
      </CardHeader>
      <CardContent className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 px-3 sm:px-6'>
        {items.map((item, index) => (
          <div
            key={item.key}
            className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border p-3 sm:p-4'
          >
            <div className='flex items-center justify-between'>
              <p className='font-medium'>
                {t('messages.medicine')} {index + 1}
              </p>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() =>
                  setItems((rows) => rows.filter((row) => row.key !== item.key))
                }
              >
                <Trash2 />
                <span className='sr-only'>{t('messages.removeMedicine')}</span>
              </Button>
            </div>
            {item.selectedMedicine && (
              <p className='text-sm text-muted-foreground'>
                {t('messages.unitPrice')}{' '}
                {Number(item.selectedMedicine.salePrice).toLocaleString(
                  getLocale()
                )}{' '}
                {t('messages.Alt3')}
                {' · '}
                {t('messages.amount')}{' '}
                {(
                  Number(item.selectedMedicine.salePrice) * (item.quantity ?? 0)
                ).toLocaleString(getLocale())}{' '}
                {t('messages.Alt3')}
              </p>
            )}
            <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(8rem,0.6fr)_minmax(0,1.4fr)]'>
              <div className='grid min-w-0 grid-rows-[auto_2.25rem_1rem] content-start gap-2 md:col-span-2 lg:col-span-1'>
                <Label required>{t('messages.medicine')}</Label>
                <MedicinePicker
                  selected={item.selectedMedicine}
                  onChange={(medicine) =>
                    updateItem(item.key, {
                      medicineId: medicine.id,
                      medicineName: medicine.name,
                      selectedMedicine: medicine,
                    })
                  }
                />
                <span aria-hidden='true' />
              </div>
              <Field
                label={t('messages.quantityAlt3')}
                className='grid-rows-[auto_2.25rem_1rem] content-start'
              >
                <NumberInput
                  min={1}
                  step={1}
                  required={Boolean(item.medicineId)}
                  aria-invalid={Boolean(getQuantityError(item))}
                  value={item.quantity ?? ''}
                  onValueChange={(value) =>
                    updateItem(item.key, {
                      quantity: value ? Number(value) : undefined,
                    })
                  }
                />
                {getQuantityError(item) && (
                  <p className='text-xs leading-4 text-destructive'>
                    {getQuantityError(item)}
                  </p>
                )}
                {!getQuantityError(item) && <span aria-hidden='true' />}
              </Field>
              <Field
                className='content-start md:col-span-2 lg:col-span-1'
                label={t('messages.userGuide')}
              >
                <MedicineInstructionInput
                  value={item.instruction ?? ''}
                  options={instructionOptions}
                  onChange={(value) =>
                    updateItem(item.key, {
                      instruction: value,
                    })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
        <Button
          type='button'
          variant='outline'
          className='w-fit justify-self-center'
          onClick={addItem}
        >
          <Plus />{' '}
          {isVaccination
            ? t('messages.addVaccineMedicine')
            : t('messages.addMedicine')}
        </Button>
      </CardContent>
    </Card>
  )
}
