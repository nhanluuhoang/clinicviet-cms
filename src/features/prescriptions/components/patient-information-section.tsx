import { getLocale } from '@/i18n'
import { ImagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IMAGE_UPLOAD_ACCEPT } from '@/lib/image-upload'
import { VIDEO_UPLOAD_ACCEPT } from '@/lib/video-upload'
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
  save,
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
  | 'save'
  | 'addMedia'
  | 'removeMedia'
>) {
  const { t } = useTranslation()

  return (
    <Card className='relative min-w-0'>
      <CardHeader className='px-4 sm:px-6'>
        <CardTitle>
          {isPharmacy
            ? t('messages.pharmacySaleInformation')
            : isVaccination
              ? t('messages.vaccinationRecipientInformation')
              : t('messages.examinationInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 px-4 sm:px-6 md:grid-cols-2'>
        <Field
          label={
            isPharmacy
              ? t('messages.customer')
              : isVaccination
                ? t('messages.vaccinationRecipient')
                : t('messages.patientAlt2')
          }
        >
          <Input
            value={`${patient.fullName}${
              patient.dateOfBirth
                ? ` · ${new Date(patient.dateOfBirth).toLocaleDateString(getLocale())}`
                : ''
            }`}
            disabled
          />
        </Field>
        <Field
          label={
            isExamination
              ? t('messages.examiningDoctor')
              : t('messages.createdByAlt2')
          }
          htmlFor={formId + '-doctorName'}
        >
          <Input
            id={formId + '-doctorName'}
            value={doctorName}
            placeholder={t('messages.doctorSFullName')}
            maxLength={255}
            disabled
            required
          />
        </Field>
        {isExamination && (
          <>
            <Field
              className='md:col-span-2'
              label={t('messages.symptomsAlt2')}
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
              label={t('messages.diagnosisAlt3')}
              htmlFor={formId + '-diagnosis'}
            >
              <Textarea
                id={formId + '-diagnosis'}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder={t('messages.enterTheDoctorSDiagnosis')}
                required
              />
            </Field>
            <Field
              label={t('messages.treatmentPlan')}
              htmlFor={formId + '-treatment'}
            >
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
          label={t('messages.recordNotes')}
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
          label={
            isExamination
              ? t('messages.doctorSAdvice')
              : t('messages.instructionsAndFollowUp')
          }
          htmlFor={formId + '-advice'}
        >
          <Textarea
            id={formId + '-advice'}
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder={t('messages.dietLifestyleAndFollowUpAppointment')}
          />
        </Field>
        {canUseDiagnosisMedia ? (
          <div className='grid gap-3 md:col-span-2'>
            <div>
              <Label htmlFor={formId + '-diagnosis-media'}>
                {isPharmacy
                  ? t('messages.attachedPrescription')
                  : t('messages.recordFiles')}
              </Label>
              <p className='mt-1 text-xs text-muted-foreground'>
                {t('messages.upTo5Images5PdfsAnd1VideoImagesUpTo5MbPdf')}
              </p>
            </div>
            <label
              htmlFor={formId + '-diagnosis-media'}
              className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
            >
              <ImagePlus className='size-7 text-muted-foreground' />
              <span className='text-sm font-medium'>
                {t('messages.chooseImagesPdfsOrAVideo')}
              </span>
              <span className='text-xs text-muted-foreground'>
                {isUploadingMedia
                  ? t('messages.uploadingFilesAlt2')
                  : t('messages.filesUploaded', {
                      value0: media.length,
                      value1: MAX_MEDIA_FILES,
                    })}
              </span>
            </label>
            <Input
              id={formId + '-diagnosis-media'}
              className='sr-only h-px w-px p-0'
              type='file'
              accept={`${IMAGE_UPLOAD_ACCEPT},application/pdf,${VIDEO_UPLOAD_ACCEPT}`}
              multiple
              disabled={isUploadingMedia || save.isPending}
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
                    disabled={isUploadingMedia || save.isPending}
                    onRemove={() => void removeMedia(file)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:col-span-2'>
            {t('messages.imagePdfAndVideoAttachmentsRequireTheProfessiona')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
