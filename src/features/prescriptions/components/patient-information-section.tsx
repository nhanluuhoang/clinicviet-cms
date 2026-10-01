import { ImagePlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_MEDIA_FILES } from '../data/constants'
import type { ServicePrescriptionFormState } from '../hooks/use-service-prescription-form'
import { Field } from './field'
import { MediaPreview } from './media-preview'

export function PatientInformationSection({
  patient,
  formId,
  doctorName,
  canUseDiagnosisMedia,
  isExamination,
  isPharmacy,
  isVaccination,
  symptoms,
  setSymptoms,
  diagnosis,
  setDiagnosis,
  treatment,
  setTreatment,
  note,
  setNote,
  advice,
  setAdvice,
  media,
  isUploadingMedia,
  addMedia,
  removeMedia,
}: Pick<
  ServicePrescriptionFormState,
  | 'patient'
  | 'formId'
  | 'doctorName'
  | 'canUseDiagnosisMedia'
  | 'isExamination'
  | 'isPharmacy'
  | 'isVaccination'
  | 'symptoms'
  | 'setSymptoms'
  | 'diagnosis'
  | 'setDiagnosis'
  | 'treatment'
  | 'setTreatment'
  | 'note'
  | 'setNote'
  | 'advice'
  | 'setAdvice'
  | 'media'
  | 'isUploadingMedia'
  | 'addMedia'
  | 'removeMedia'
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isPharmacy
            ? 'Thông tin bán thuốc'
            : isVaccination
              ? 'Thông tin người được tiêm'
              : 'Thông tin lượt khám'}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid gap-5 md:grid-cols-2'>
        <Field
          label={
            isPharmacy
              ? 'Khách hàng *'
              : isVaccination
                ? 'Người được tiêm *'
                : 'Bệnh nhân *'
          }
        >
          <Input
            value={`${patient.fullName}${
              patient.dateOfBirth
                ? ` · ${new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}`
                : ''
            }`}
            disabled
          />
        </Field>
        <Field
          label={isExamination ? 'Bác sĩ khám *' : 'Người lập phiếu *'}
          htmlFor={formId + '-doctorName'}
        >
          <Input
            id={formId + '-doctorName'}
            value={doctorName}
            placeholder='Họ và tên bác sĩ'
            maxLength={255}
            disabled
            required
          />
        </Field>
        {isExamination && (
          <>
            <Field
              className='md:col-span-2'
              label='Triệu chứng'
              htmlFor={formId + '-symptoms'}
            >
              <Textarea
                id={formId + '-symptoms'}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </Field>
            <Field
              className='md:col-span-2'
              label='Chẩn đoán *'
              htmlFor={formId + '-diagnosis'}
            >
              <Textarea
                id={formId + '-diagnosis'}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder='Nhập kết luận chẩn đoán của bác sĩ'
                required
              />
            </Field>
            <Field label='Hướng điều trị' htmlFor={formId + '-treatment'}>
              <Textarea
                id={formId + '-treatment'}
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
              />
            </Field>
          </>
        )}
        <Field
          className='md:col-span-2'
          label='Ghi chú hồ sơ'
          htmlFor={formId + '-note'}
        >
          <Textarea
            id={formId + '-note'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <Field
          className='md:col-span-2'
          label={isExamination ? 'Lời dặn của bác sĩ' : 'Hướng dẫn và lịch hẹn'}
          htmlFor={formId + '-advice'}
        >
          <Textarea
            id={formId + '-advice'}
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder='Chế độ ăn uống, sinh hoạt và lịch tái khám...'
          />
        </Field>
        {canUseDiagnosisMedia ? (
          <div className='grid gap-3 md:col-span-2'>
            <div>
              <Label htmlFor={formId + '-diagnosis-media'}>
                {isPharmacy ? 'Đơn thuốc đính kèm' : 'Tệp hồ sơ'}
              </Label>
              <p className='mt-1 text-xs text-muted-foreground'>
                Tối đa {MAX_MEDIA_FILES} tệp. Ảnh/PDF không quá 5 MB; video MP4,
                WebM hoặc MOV không quá 100 MB.
              </p>
            </div>
            <label
              htmlFor={formId + '-diagnosis-media'}
              className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
            >
              <ImagePlus className='size-7 text-muted-foreground' />
              <span className='text-sm font-medium'>
                Chọn ảnh, PDF hoặc video
              </span>
              <span className='text-xs text-muted-foreground'>
                {isUploadingMedia
                  ? 'Đang tải tệp...'
                  : `Đã tải ${media.length}/${MAX_MEDIA_FILES} tệp`}
              </span>
            </label>
            <Input
              id={formId + '-diagnosis-media'}
              className='sr-only'
              type='file'
              accept='image/jpeg,image/png,application/pdf,video/mp4,video/webm,video/quicktime'
              multiple
              disabled={isUploadingMedia}
              onChange={(event) => {
                event.currentTarget.blur()
                void addMedia(event.target.files)
                event.target.value = ''
              }}
            />
            {media.length > 0 && (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {media.map((file, index) => (
                  <MediaPreview
                    key={`${file.url}-${index}`}
                    media={file}
                    onRemove={() => void removeMedia(file)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:col-span-2'>
            Đính kèm hình ảnh, PDF và video thuộc gói Plus hoặc Pro.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
