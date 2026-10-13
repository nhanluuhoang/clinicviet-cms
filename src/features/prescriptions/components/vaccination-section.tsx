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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin tiêm</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 md:grid-cols-2'>
        {(
          [
            ['temperature', 'Nhiệt độ (°C)'],
            ['bloodPressure', 'Huyết áp (mmHg)'],
            ['doseNumber', 'Mũi số'],
            ['dose', 'Liều dùng'],
            ['route', 'Đường tiêm'],
            ['site', 'Vị trí tiêm'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label} htmlFor={formId + '-' + key}>
            <Input
              id={formId + '-' + key}
              maxLength={255}
              placeholder={
                key === 'temperature'
                  ? 'Ví dụ: 36,5'
                  : key === 'bloodPressure'
                    ? 'Ví dụ: 120/80'
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
        <Field label='Người tiêm' htmlFor={formId + '-administeredBy'}>
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
              <SelectValue placeholder='Chọn người tiêm' />
            </SelectTrigger>
            <SelectContent>
              {vaccination.administeredBy && !selectedStaffId && (
                <SelectItem value='__legacy__' disabled>
                  {vaccination.administeredBy} (đã lưu)
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
                  {user.id === currentUser?.id ? ' (bạn)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {vaccinationStaff.isError && (
            <p className='text-xs text-destructive'>
              Không tải được danh sách nhân sự.{' '}
              <button
                type='button'
                className='underline'
                onClick={() => void vaccinationStaff.refetch()}
              >
                Thử lại
              </button>
            </p>
          )}
        </Field>
        {(
          [
            ['expiryDate', 'Hạn dùng'],
            ['administeredDate', 'Ngày tiêm'],
            ['nextDoseDate', 'Hẹn mũi tiếp theo'],
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
