import { useQuery } from '@tanstack/react-query'
import { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { getVaccinationFields } from '@/features/prescriptions/api'
import { getMedicalHistories, type QueueUser } from '../api'

export function MedicalHistoryContent({
  patient,
}: {
  patient: Pick<QueueUser, 'id' | 'fullName'>
}) {
  const { t } = useTranslation()

  const histories = useQuery({
    queryKey: ['medical-histories', patient.id],
    queryFn: () => getMedicalHistories(patient.id),
  })

  if (histories.isLoading) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        {t('messages.loading')}
      </p>
    )
  }

  if (!histories.data?.data.length) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        {t('messages.noMedicalHistoryYet')}
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {histories.data.data.map((history) => (
        <div key={history.id} className='space-y-2 rounded-lg border p-4'>
          <p className='text-sm font-medium'>
            {history.serviceType === 'PHARMACY'
              ? t('messages.pharmacySale')
              : history.serviceType === 'VACCINATION'
                ? t('messages.vaccination')
                : t('messages.examination')}
          </p>
          {history.serviceType === 'VACCINATION' && (
            <div className='grid gap-2 rounded-md bg-muted/40 p-3 text-sm sm:grid-cols-2'>
              {Object.entries(getVaccinationFields(history)).map(
                ([key, value]) => {
                  const labels: Record<string, string> = {
                    temperature: t('messages.temperatureC'),
                    bloodPressure: t('messages.bloodPressureMmhg'),
                    vaccineName: t('messages.vaccine'),
                    batchNumber: t('messages.batchNumber'),
                    expiryDate: t('messages.expiryAlt2'),
                    administeredDate: t('messages.vaccinationDate'),
                    nextDoseDate: t('messages.nextDoseDate'),
                    doseNumber: t('messages.doseNumber'),
                    dose: t('messages.dose'),
                    route: t('messages.administrationRoute'),
                    site: t('messages.injectionSite'),
                    administeredBy: t('messages.administeredBy'),
                    screening: t('messages.screening'),
                    screeningNote: t('messages.screeningNotes'),
                    observation: t('messages.postVaccinationMonitoring'),
                  }
                  if (!value || !labels[key]) return null
                  const displayed =
                    key === 'screening'
                      ? ({
                          PENDING: t('messages.notScreened'),
                          ELIGIBLE: t('messages.eligibleForVaccination'),
                          DEFERRED: t('messages.vaccinationDeferred'),
                        }[value as 'PENDING' | 'ELIGIBLE' | 'DEFERRED'] ??
                        value)
                      : value
                  return (
                    <p key={key}>
                      <span className='text-muted-foreground'>
                        {labels[key]}:
                      </span>{' '}
                      {displayed}
                    </p>
                  )
                }
              )}
            </div>
          )}
          <div className='flex flex-wrap justify-between gap-2'>
            <strong>
              {new Date(history.createdAt).toLocaleString(getLocale())}
            </strong>
            <span className='text-sm text-muted-foreground'>
              {history.doctorName}
            </span>
          </div>
          <p>
            <span className='text-muted-foreground'>
              {t('messages.diagnosisAlt2')}
            </span>{' '}
            {history.diagnosis || '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>
              {t('messages.symptoms')}
            </span>{' '}
            {history.symptoms || '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>
              {t('messages.treatment')}
            </span>{' '}
            {history.treatment || '—'}
          </p>
          {history.note && (
            <p>
              <span className='text-muted-foreground'>
                {t('messages.notesAlt2')}
              </span>{' '}
              {history.note}
            </p>
          )}
          {history.advice && (
            <p>
              <span className='text-muted-foreground'>
                {t('messages.advice')}
              </span>{' '}
              {history.advice}
            </p>
          )}
          <div className='mt-3 border-t pt-3'>
            <p className='mb-2 font-medium'>{t('messages.prescription')}</p>
            {history.prescription?.items.length ? (
              <>
                <div className='grid gap-2 sm:hidden'>
                  {history.prescription.items.map((item) => (
                    <div
                      key={item.id}
                      className='space-y-1 rounded-md border p-3 text-sm'
                    >
                      <p className='font-medium'>{item.medicineName}</p>
                      {item.medicine && (
                        <p className='text-xs text-muted-foreground'>
                          {item.medicine.strength} · {item.medicine.unit}
                        </p>
                      )}
                      <p>
                        {t('messages.quantity')} {item.quantity ?? '—'}
                      </p>
                      <p>
                        {t('messages.instructions')} {item.instruction || '—'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className='hidden overflow-x-auto rounded-md border sm:block'>
                  <table className='w-full text-sm'>
                    <thead className='bg-muted/50 text-left'>
                      <tr>
                        <th className='px-3 py-2 font-medium'>
                          {t('messages.medicine')}
                        </th>
                        <th className='px-3 py-2 font-medium'>
                          {t('messages.quantityAlt2')}
                        </th>
                        <th className='px-3 py-2 font-medium'>
                          {t('messages.instructionsAlt2')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.prescription.items.map((item) => (
                        <tr key={item.id} className='border-t align-top'>
                          <td className='px-3 py-2'>
                            <div className='font-medium'>
                              {item.medicineName}
                            </div>
                            {item.medicine && (
                              <div className='text-xs text-muted-foreground'>
                                {item.medicine.strength} · {item.medicine.unit}
                              </div>
                            )}
                          </td>
                          <td className='px-3 py-2'>{item.quantity ?? '—'}</td>
                          <td className='px-3 py-2'>
                            {item.instruction || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className='text-sm text-muted-foreground'>
                {t('messages.noPrescription')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
