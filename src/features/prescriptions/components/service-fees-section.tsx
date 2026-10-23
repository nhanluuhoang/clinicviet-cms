import { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { AutomaticFee } from './automatic-fee'
import { OtherFeeField } from './other-fee-field'

export function ServiceFeesSection({
  formId,
  isExamination,
  isVaccination,
  items,
  serviceFee,
  setServiceFee,
  serviceFeeLabel,
  setServiceFeeLabel,
  otherFee1,
  setOtherFee1,
  otherFee2,
  setOtherFee2,
  otherFee3,
  setOtherFee3,
  otherFee1Label,
  setOtherFee1Label,
  otherFee2Label,
  setOtherFee2Label,
  otherFee3Label,
  setOtherFee3Label,
  consultationFee,
  medicineFee,
  invoiceTotal,
}: Pick<
  ServicePrescriptionFormState,
  | 'formId'
  | 'isExamination'
  | 'isVaccination'
  | 'items'
  | 'serviceFee'
  | 'setServiceFee'
  | 'serviceFeeLabel'
  | 'setServiceFeeLabel'
  | 'otherFee1'
  | 'setOtherFee1'
  | 'otherFee2'
  | 'setOtherFee2'
  | 'otherFee3'
  | 'setOtherFee3'
  | 'otherFee1Label'
  | 'setOtherFee1Label'
  | 'otherFee2Label'
  | 'setOtherFee2Label'
  | 'otherFee3Label'
  | 'setOtherFee3Label'
  | 'consultationFee'
  | 'medicineFee'
  | 'invoiceTotal'
>) {
  const { t } = useTranslation()

  return (
    <Card className='min-w-0'>
      <CardHeader className='border-b px-4 sm:px-6'>
        <CardTitle>{t('messages.serviceCharges')}</CardTitle>
        <CardDescription>
          {t('messages.reviewTheChargesBeforeSavingTheServiceRecord')}
        </CardDescription>
      </CardHeader>
      <CardContent className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 px-3 pt-4 sm:gap-6 sm:px-6 sm:pt-6'>
        <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3'>
          <AutomaticFee
            label={t('messages.consultationFee')}
            value={consultationFee}
            note={
              isExamination
                ? t('messages.basedOnClinicSettings')
                : t('messages.notApplicableToThisRecordType')
            }
          />
          <AutomaticFee
            label={
              isVaccination
                ? t('messages.vaccinesMedicines')
                : t('messages.medicineChargesAlt2')
            }
            value={medicineFee}
            note={t('messages.medicines', {
              value0: items.filter((item) => item.medicineId).length,
            })}
          />
        </div>

        <div className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3'>
          <div>
            <p className='text-sm font-medium'>
              {t('messages.additionalCharges')}
            </p>
            <p className='text-xs text-muted-foreground'>
              {t('messages.enterADescriptionAndAmountIfApplicable')}
            </p>
          </div>
          <OtherFeeField
            index={formId + '-service'}
            title={t('messages.additionalService')}
            label={serviceFeeLabel}
            amount={serviceFee}
            onLabelChange={setServiceFeeLabel}
            onAmountChange={setServiceFee}
          />
          <OtherFeeField
            index={formId + '-1'}
            title={t('messages.otherCharge1')}
            label={otherFee1Label}
            amount={otherFee1}
            onLabelChange={setOtherFee1Label}
            onAmountChange={setOtherFee1}
          />
          <OtherFeeField
            index={formId + '-2'}
            title={t('messages.otherCharge2')}
            label={otherFee2Label}
            amount={otherFee2}
            onLabelChange={setOtherFee2Label}
            onAmountChange={setOtherFee2}
          />
          <OtherFeeField
            index={formId + '-3'}
            title={t('messages.otherCharge3')}
            label={otherFee3Label}
            amount={otherFee3}
            onLabelChange={setOtherFee3Label}
            onAmountChange={setOtherFee3}
          />
        </div>

        <div className='flex flex-col gap-1 rounded-lg bg-primary px-5 py-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-medium'>{t('messages.totalPayment')}</p>
            <p className='text-xs opacity-80'>
              {t('messages.includesAllFees')}
            </p>
          </div>
          <p className='text-2xl font-bold tabular-nums'>
            {invoiceTotal.toLocaleString(getLocale())} ₫
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
