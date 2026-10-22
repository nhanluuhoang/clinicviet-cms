import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MedicineInstructionInput } from '@/components/medicine-instruction-input'
import { emptyItem } from '../data/constants'
import type { PrescriptionTemplatesState } from '../hooks/use-prescription-templates'

export function PrescriptionTemplatesMutateDialog({
  open,
  current,
  name,
  setName,
  items,
  setItems,
  medicines,
  instructionOptions,
  close,
  patchItem,
  save,
}: Pick<
  PrescriptionTemplatesState,
  | 'open'
  | 'current'
  | 'name'
  | 'setName'
  | 'items'
  | 'setItems'
  | 'medicines'
  | 'instructionOptions'
  | 'close'
  | 'patchItem'
  | 'save'
>) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open === 'create' || open === 'update'}
      onOpenChange={(value) => {
        if (!value) close()
      }}
    >
      <DialogFormContent className='sm:max-w-2xl'>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>
              {current
                ? t('messages.updatePrescriptionTemplate')
                : t('messages.addPrescriptionTemplate')}
            </DialogTitle>
            <DialogDescription>
              {t('messages.setDefaultMedicinesQuantitiesAndInstructions')}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 overflow-y-auto px-1'>
            <div className='space-y-2'>
              <Label required>{t('messages.templateName')}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('messages.eGAdultColdAndFlu')}
              />
            </div>
            {items.map((item, index) => (
              <div key={index} className='grid gap-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <Label required>
                    {t('messages.medicine')} {index + 1}
                  </Label>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
                <Select
                  value={item.medicineId || undefined}
                  onValueChange={(value) => {
                    const medicine = medicines.find((m) => m.id === value)
                    patchItem(index, {
                      medicineId: value,
                      medicineName: medicine?.name ?? '',
                    })
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t('messages.selectMedicine')} />
                  </SelectTrigger>
                  <SelectContent>
                    {item.medicineId &&
                      !medicines.some((m) => m.id === item.medicineId) && (
                        <SelectItem value={item.medicineId}>
                          {item.medicineName}
                        </SelectItem>
                      )}
                    {medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        {medicine.name} · {medicine.strength}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='grid gap-3 sm:grid-cols-[8rem_1fr]'>
                  <div className='space-y-2'>
                    <Label required>{t('messages.quantityAlt2')}</Label>
                    <Input
                      type='number'
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        patchItem(index, { quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>{t('messages.userGuide')}</Label>
                    <MedicineInstructionInput
                      value={item.instruction}
                      options={instructionOptions}
                      onChange={(value) =>
                        patchItem(index, {
                          instruction: value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setItems((rows) => [...rows, emptyItem()])}
            >
              <Plus /> {t('messages.addMedicine')}
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </DialogClose>
          <Button onClick={() => void save()}>
            {t('messages.saveTemplate')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
