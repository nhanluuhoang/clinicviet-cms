import type { VisibilityState } from '@tanstack/react-table'
import { API_URL } from '@/config'
import i18n, { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AuditDetails } from '@/components/data-table/audit-details'
import { VideoPlayer } from '@/components/video-player'
import { type MedicalHistoryListItem } from '../api'

const money = (value: number | string) =>
  i18n.t('messages.vndAlt2', {
    value0: Number(value).toLocaleString(getLocale()),
  })

export function MedicalHistoryDetails({
  history,
  auditVisibility = {},
}: {
  auditVisibility?: VisibilityState
  history: MedicalHistoryListItem
}) {
  const { t } = useTranslation()

  const prescription = history.prescription
  const invoice = prescription?.invoice
  const hasMedia =
    history.images.length > 0 ||
    history.pdfs.length > 0 ||
    history.videos.length > 0

  if (!prescription && !hasMedia) {
    return (
      <p className='py-6 text-center text-sm text-muted-foreground'>
        {t('messages.thisRecordHasNoPrescriptionOrAttachments')}
      </p>
    )
  }
  return (
    <div className='space-y-6 bg-muted/20 p-5'>
      {prescription && (
        <section>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            {t('messages.prescribedMedicines')}
          </h4>
          <AuditDetails record={prescription} visibility={auditVisibility} />
          <div className='mt-3 grid gap-2 sm:hidden'>
            {prescription.items.map((item) => {
              const quantity = Number(item.quantity ?? 0)
              const price = Number(item.medicine?.salePrice ?? 0)
              return (
                <div
                  key={item.id}
                  className='space-y-1 rounded-md border p-3 text-sm'
                >
                  <p className='font-medium'>{item.medicineName}</p>
                  <p className='text-muted-foreground'>
                    {item.instruction || t('messages.noInstructions')}
                  </p>
                  <p>
                    {quantity.toLocaleString(getLocale())}{' '}
                    {item.medicine?.unit || ''} {t('messages.Alt2')}{' '}
                    {price.toLocaleString(getLocale())} {t('messages.vnd')}
                  </p>
                  <p className='font-medium'>
                    {t('messages.amount')}{' '}
                    {(price * quantity).toLocaleString(getLocale())}{' '}
                    {t('messages.vnd')}
                  </p>
                </div>
              )
            })}
          </div>
          <div className='hidden overflow-x-auto sm:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('messages.medicineName')}</TableHead>
                  <TableHead>{t('messages.userGuide')}</TableHead>
                  <TableHead>{t('messages.unit')}</TableHead>
                  <TableHead className='text-right'>
                    {t('messages.quantityAlt2')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {t('messages.sellingPrice')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {t('messages.amountAlt2')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((item) => {
                  const quantity = Number(item.quantity ?? 0)
                  const price = Number(item.medicine?.salePrice ?? 0)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>
                        {item.medicineName}
                      </TableCell>
                      <TableCell>{item.instruction || '-'}</TableCell>
                      <TableCell>{item.medicine?.unit || '-'}</TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {quantity.toLocaleString(getLocale())}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {price.toLocaleString(getLocale())} {t('messages.vnd')}
                      </TableCell>
                      <TableCell className='text-right font-medium tabular-nums'>
                        {(price * quantity).toLocaleString(getLocale())}{' '}
                        {t('messages.vnd')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {invoice && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            {t('messages.invoiceAlt2')}{' '}
            {invoice.invoiceCode && `#${invoice.invoiceCode}`}
          </h4>
          <AuditDetails record={invoice} visibility={auditVisibility} />
          <div className='mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              [t('messages.totalAmount'), invoice.totalAmount],
              [t('messages.medicineCharges'), invoice.medicineRevenue],
              [t('messages.consultationFeeAlt3'), invoice.consultationFee],
              [
                invoice.serviceFeeLabel || t('messages.serviceFee'),
                invoice.serviceFee,
              ],
              [
                invoice.otherFee1Label || t('messages.additionalFee1'),
                invoice.otherFee1,
              ],
              [
                invoice.otherFee2Label || t('messages.additionalFee2'),
                invoice.otherFee2,
              ],
              [
                invoice.otherFee3Label || t('messages.additionalFee3'),
                invoice.otherFee3,
              ],
            ].map(([label, value], index) => (
              <div key={index} className='min-w-0 space-y-1'>
                <p className='truncate text-sm text-muted-foreground'>
                  {label}
                </p>
                <p className='font-medium tabular-nums'>{money(value)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {history.images.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            {t('messages.images')}
          </h4>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
            {history.images.map((file) => (
              <a
                key={file.id}
                href={`${API_URL}/images/${encodeURIComponent(file.fileName)}`}
                target='_blank'
                rel='noreferrer'
                className='group overflow-hidden rounded-md border bg-background'
              >
                <img
                  src={`${API_URL}/images/${encodeURIComponent(file.fileName)}`}
                  alt={file.fileName}
                  className='aspect-square w-full object-cover transition-transform group-hover:scale-105'
                  loading='lazy'
                />
                <p className='truncate p-2 text-xs'>{file.fileName}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {history.pdfs.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            PDF
          </h4>
          <div className='flex flex-wrap gap-2'>
            {history.pdfs.map((file) => (
              <a
                key={file.id}
                href={`${API_URL}/pdfs/${encodeURIComponent(file.fileName)}`}
                target='_blank'
                rel='noreferrer'
                className='rounded-md border bg-background px-3 py-2 text-sm hover:underline'
              >
                {file.fileName}
              </a>
            ))}
          </div>
        </section>
      )}

      {history.videos.length > 0 && (
        <section className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-semibold underline underline-offset-4'>
            Video
          </h4>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {history.videos.map((file) => (
              <div key={file.id} className='overflow-hidden rounded-md border'>
                <VideoPlayer
                  src={`${API_URL}/videos/${encodeURIComponent(file.fileName)}/master.m3u8`}
                  className='aspect-video w-full bg-black object-contain'
                />
                <p className='truncate bg-background p-2 text-xs'>
                  {file.fileName}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
