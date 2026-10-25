import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerInput } from '@/components/date-picker-input'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { Field } from './field'

export function VaccinationSection({
  formId,
  currentUser,
  doctorName,
  vaccination,
  setVaccination,
  vaccinationStaff,
  staffOptions,
  selectedStaffId,
}: Pick<
  ServicePrescriptionFormState,
  | 'formId'
  | 'currentUser'
  | 'doctorName'
  | 'vaccination'
  | 'setVaccination'
  | 'vaccinationStaff'
  | 'staffOptions'
  | 'selectedStaffId'
>) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('messages.vaccinationDetails')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 md:grid-cols-2'>
        {(
          [
            ['temperature', t('messages.temperatureC')],
            ['bloodPressure', t('messages.bloodPressureMmhg')],
            ['doseNumber', t('messages.doseNumber')],
            ['dose', t('messages.dose')],
            ['route', t('messages.administrationRoute')],
            ['site', t('messages.injectionSite')],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} htmlFor={formId + '-' + key}>
            <Input
              id={formId + '-' + key}
              maxLength={255}
              placeholder={
                key === 'temperature'
                  ? t('messages.eG365')
                  : key === 'bloodPressure'
                    ? t('messages.eG12080')
                    : undefined
              }
              value={vaccination[key] ?? ''}
              onChange={(event) =>
                setVaccination((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
            />
          </Field>
        ))}
        <Field
          label={t('messages.administeredBy')}
          htmlFor={formId + '-administeredBy'}
        >
          <Select
            value={
              selectedStaffId ??
              (vaccination.administeredBy ? '__legacy__' : '')
            }
            onValueChange={(id) => {
              const staff =
                staffOptions.find((user) => user.id === id) ??
                (id === currentUser?.id ? currentUser : undefined)
              setVaccination((current) => ({
                ...current,
                administeredById: staff?.id,
                administeredBy: staff?.fullName,
              }))
            }}
          >
            <SelectTrigger id={formId + '-administeredBy'}>
              <SelectValue placeholder={t('messages.selectVaccinationStaff')} />
            </SelectTrigger>
            <SelectContent>
              {vaccination.administeredBy && !selectedStaffId && (
                <SelectItem value='__legacy__' disabled>
                  {vaccination.administeredBy} {t('messages.saved')}
                </SelectItem>
              )}
              {selectedStaffId &&
                !staffOptions.some((user) => user.id === selectedStaffId) && (
                  <SelectItem value={selectedStaffId}>
                    {vaccination.administeredBy ?? doctorName}
                  </SelectItem>
                )}
              {staffOptions.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.fullName}
                  {user.id === currentUser?.id ? t('messages.you') : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {vaccinationStaff.isError && (
            <p className='text-xs text-destructive'>
              {t('messages.couldNotLoadStaffList')}{' '}
              <button
                type='button'
                className='underline'
                onClick={() => void vaccinationStaff.refetch()}
              >
                {t('messages.tryAgain')}
              </button>
            </p>
          )}
        </Field>
        {(
          [
            ['expiryDate', t('messages.expiryAlt2')],
            ['administeredDate', t('messages.vaccinationDate')],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} htmlFor={formId + '-' + key}>
            <DatePickerInput
              id={formId + '-' + key}
              value={vaccination[key] ?? ''}
              onChange={(value) =>
                setVaccination((current) => ({
                  ...current,
                  [key]: value || undefined,
                }))
              }
            />
          </Field>
        ))}
      </CardContent>
    </Card>
  )
}
