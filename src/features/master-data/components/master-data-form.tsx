import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Save, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/number-input'
import {
  CreateMasterData,
  UpdateMasterData,
  type MasterData as MasterDataItem,
} from '../api'
import {
  CONSULTATION_FEE_KEY,
  SHOW_MEDICINES_TO_PATIENT_KEY,
} from '../data/constants'
import { SettingHeading } from './setting-heading'

export function MasterDataForm({
  consultationFeeItem,
  showMedicinesItem,
}: {
  consultationFeeItem?: MasterDataItem
  showMedicinesItem?: MasterDataItem
}) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [value, setValue] = useState(consultationFeeItem?.value ?? '0')
  const [showMedicines, setShowMedicines] = useState(
    showMedicinesItem?.value !== 'false'
  )

  const [savingKeys, setSavingKeys] = useState<string[]>([])

  const saveSetting = async (
    item: MasterDataItem | undefined,
    key: string,
    settingValue: string
  ) => {
    setSavingKeys((current) => [...current, key])
    try {
      const data = { key, value: settingValue }
      await (item ? UpdateMasterData(item.id, data) : CreateMasterData(data))
      await queryClient.invalidateQueries({ queryKey: ['master-data'] })
      toast.success(t('messages.settingsSaved'))
    } catch (error) {
      showRequestError(error, t('messages.couldNotSaveSettings'))
    } finally {
      setSavingKeys((current) => current.filter((item) => item !== key))
    }
  }

  const saveConsultationFee = () => {
    const fee = Number(value)
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error(t('messages.invalidConsultationFee'))
      return
    }
    void saveSetting(consultationFeeItem, CONSULTATION_FEE_KEY, String(fee))
  }

  return (
    <div className='space-y-5'>
      <Card className='overflow-hidden'>
        <SettingHeading
          icon={Stethoscope}
          title={t('messages.consultationFeeAlt2')}
          description={t(
            'messages.theDefaultFeeUsedWhenCreatingAnExaminationRecor'
          )}
        />
        <CardContent className='space-y-5 pt-6'>
          <div className='max-w-md space-y-2'>
            <Label htmlFor='consultation-fee'>{t('messages.amountAlt3')}</Label>
            <div className='relative'>
              <NumberInput
                id='consultation-fee'
                className='pr-16'
                min={0}
                step={1000}
                value={value}
                onValueChange={(value) => setValue(value)}
                placeholder={t('messages.enterConsultationFee')}
              />
              <span className='absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground'>
                {t('messages.vnd')}
              </span>
            </div>
          </div>
          <div className='flex justify-end border-t pt-4'>
            <Button
              type='button'
              disabled={savingKeys.includes(CONSULTATION_FEE_KEY)}
              onClick={saveConsultationFee}
            >
              <Save />{' '}
              {savingKeys.includes(CONSULTATION_FEE_KEY)
                ? t('messages.saving')
                : t('messages.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='overflow-hidden'>
        <SettingHeading
          icon={Eye}
          title={t('messages.patientOnlineRecords')}
          description={t(
            'messages.controlTheMedicineInformationPatientsCanView'
          )}
        />
        <CardContent className='space-y-5 pt-6'>
          <label
            htmlFor='show-medicines-to-patient'
            className='flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30'
          >
            <Checkbox
              id='show-medicines-to-patient'
              className='mt-0.5'
              checked={showMedicines}
              onCheckedChange={(checked) => setShowMedicines(checked === true)}
            />
            <span className='grid gap-1'>
              <span className='text-sm font-medium'>
                {t('messages.showMedicineList')}
              </span>
              <span className='text-sm text-muted-foreground'>
                {t('messages.whenDisabledMedicinesAreHiddenInExaminationRecor')}
              </span>
            </span>
          </label>
          <div className='flex justify-end border-t pt-4'>
            <Button
              type='button'
              disabled={savingKeys.includes(SHOW_MEDICINES_TO_PATIENT_KEY)}
              onClick={() =>
                void saveSetting(
                  showMedicinesItem,
                  SHOW_MEDICINES_TO_PATIENT_KEY,
                  String(showMedicines)
                )
              }
            >
              <Save />{' '}
              {savingKeys.includes(SHOW_MEDICINES_TO_PATIENT_KEY)
                ? t('messages.saving')
                : t('messages.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
