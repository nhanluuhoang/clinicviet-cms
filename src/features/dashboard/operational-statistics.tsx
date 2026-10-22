import { getLocale } from '@/i18n'
import {
  AlarmClock,
  CalendarX,
  Clock3,
  PackageX,
  RotateCcw,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type DashboardStatistics } from '@/features/examination-queue/api'

export function OperationalStatistics({
  data,
}: {
  data?: DashboardStatistics
}) {
  const { t } = useTranslation()

  const queue = data?.queueMetrics
  const patients = data?.patientMetrics
  const inventory = data?.inventoryAlerts
  const cards = [
    {
      label: t('messages.examinationsAlt2'),
      value: queue?.totalVisits ?? 0,
      detail: t('messages.completed', { value0: queue?.completionRate ?? 0 }),
      icon: Users,
    },
    {
      label: t('messages.cancelledNoShow'),
      value: `${queue?.cancelled ?? 0} / ${queue?.noShow ?? 0}`,
      detail: `${queue?.cancellationRate ?? 0}% / ${queue?.noShowRate ?? 0}%`,
      icon: CalendarX,
    },
    {
      label: t('messages.averageWaitingTime'),
      value: t('messages.minutes', { value0: queue?.averageWaitMinutes ?? 0 }),
      detail: t('messages.fromCheckInToExaminationStart'),
      icon: AlarmClock,
    },
    {
      label: t('messages.averageExaminationTime'),
      value: t('messages.minutes', {
        value0: queue?.averageExaminationMinutes ?? 0,
      }),
      detail: t('messages.fromExaminationStartToCompletion'),
      icon: Clock3,
    },
    {
      label: t('messages.newPatients'),
      value: patients?.newPatients ?? 0,
      detail: t('messages.uniquePatients', {
        value0: patients?.uniquePatients ?? 0,
      }),
      icon: UserPlus,
    },
    {
      label: t('messages.returningPatients'),
      value: patients?.returningPatients ?? 0,
      detail: t('messages.rate', { value0: patients?.returningRate ?? 0 }),
      icon: RotateCcw,
    },
    {
      label: t('messages.outOfStockLowStock'),
      value: `${inventory?.outOfStockCount ?? 0} / ${inventory?.lowStockCount ?? 0}`,
      detail: t('messages.basedOnMinimumStockLevels'),
      icon: PackageX,
    },
    {
      label: t('messages.expiringBatches'),
      value: inventory?.expiringBatchCount ?? 0,
      detail: t('messages.vndAlt2', {
        value0: formatNumber(inventory?.expiringStockValue ?? 0),
      }),
      icon: Stethoscope,
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.label}
              </CardTitle>
              <card.icon className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold tabular-nums'>{card.value}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {card.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('messages.batchesExpiringWithin90Days')}</CardTitle>
        </CardHeader>
        <CardContent className='max-h-[360px] overflow-auto'>
          <div className='grid gap-2 sm:hidden'>
            {inventory?.expiringBatches?.length ? (
              inventory.expiringBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  className='space-y-1 rounded-md border p-3 text-sm'
                >
                  <p className='font-medium'>{batch.medicineName}</p>
                  <p>
                    {t('messages.batch')} {batch.batchNo}
                  </p>
                  <p>
                    {t('messages.expiry')}{' '}
                    {new Date(
                      `${batch.expiryDate}T00:00:00`
                    ).toLocaleDateString(getLocale())}
                  </p>
                  <p>
                    {t('messages.quantity')} {batch.quantity} {batch.unit}
                  </p>
                  <p>
                    {t('messages.stockValueAlt2')}{' '}
                    {formatNumber(batch.stockValue)} {t('messages.vnd')}
                  </p>
                </div>
              ))
            ) : (
              <p className='rounded-md border p-4 text-center text-sm text-muted-foreground'>
                {t('messages.noBatchesNearingExpiry')}
              </p>
            )}
          </div>
          <div className='hidden sm:block'>
            <Table>
              <TableHeader className='sticky top-0 bg-card'>
                <TableRow>
                  <TableHead>{t('messages.medicine')}</TableHead>
                  <TableHead>{t('messages.batchAlt2')}</TableHead>
                  <TableHead>{t('messages.expiryAlt2')}</TableHead>
                  <TableHead className='text-right'>
                    {t('messages.quantityAlt2')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {t('messages.stockValue')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.expiringBatches?.length ? (
                  inventory.expiringBatches.map((batch) => (
                    <TableRow key={batch.batchId}>
                      <TableCell className='font-medium'>
                        {batch.medicineName}
                      </TableCell>
                      <TableCell>{batch.batchNo}</TableCell>
                      <TableCell>
                        {new Date(
                          `${batch.expiryDate}T00:00:00`
                        ).toLocaleDateString(getLocale())}
                      </TableCell>
                      <TableCell className='text-right'>
                        {batch.quantity} {batch.unit}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatNumber(batch.stockValue)} {t('messages.vnd')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='h-24 text-center text-muted-foreground'
                    >
                      {t('messages.noBatchesNearingExpiry')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('messages.outOfStockAndLowStockMedicines')}</CardTitle>
        </CardHeader>
        <CardContent className='max-h-[360px] overflow-auto'>
          <div className='grid gap-2 sm:hidden'>
            {[
              ...(inventory?.outOfStock ?? []).map((item) => ({
                ...item,
                label: t('messages.outOfStock'),
              })),
              ...(inventory?.lowStock ?? []).map((item) => ({
                ...item,
                label: t('messages.lowStock'),
              })),
            ].length ? (
              [
                ...(inventory?.outOfStock ?? []).map((item) => ({
                  ...item,
                  label: t('messages.outOfStock'),
                })),
                ...(inventory?.lowStock ?? []).map((item) => ({
                  ...item,
                  label: t('messages.lowStock'),
                })),
              ].map((item) => (
                <div
                  key={item.medicineId}
                  className='space-y-1 rounded-md border p-3 text-sm'
                >
                  <p className='font-medium'>{item.medicineName}</p>
                  <p>
                    {t('messages.statusAlt2')} {item.label}
                  </p>
                  <p>
                    {t('messages.currentStock')} {item.quantity} {item.unit}
                  </p>
                  <p>
                    {t('messages.minimumStockAlt2')} {item.minStock} {item.unit}
                  </p>
                </div>
              ))
            ) : (
              <p className='rounded-md border p-4 text-center text-sm text-muted-foreground'>
                {t('messages.noMedicinesOutOfStockOrBelowTheMinimumLevel')}
              </p>
            )}
          </div>
          <div className='hidden sm:block'>
            <Table>
              <TableHeader className='sticky top-0 bg-card'>
                <TableRow>
                  <TableHead>{t('messages.medicine')}</TableHead>
                  <TableHead>{t('messages.status')}</TableHead>
                  <TableHead className='text-right'>
                    {t('messages.currentStockAlt2')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {t('messages.minimumStockAlt3')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...(inventory?.outOfStock ?? []),
                  ...(inventory?.lowStock ?? []),
                ].length ? (
                  [
                    ...(inventory?.outOfStock ?? []).map((item) => ({
                      ...item,
                      label: t('messages.outOfStock'),
                    })),
                    ...(inventory?.lowStock ?? []).map((item) => ({
                      ...item,
                      label: t('messages.lowStock'),
                    })),
                  ].map((item) => (
                    <TableRow key={item.medicineId}>
                      <TableCell className='font-medium'>
                        {item.medicineName}
                      </TableCell>
                      <TableCell>{item.label}</TableCell>
                      <TableCell className='text-right'>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className='text-right'>
                        {item.minStock} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-24 text-center text-muted-foreground'
                    >
                      {t(
                        'messages.noMedicinesOutOfStockOrBelowTheMinimumLevel'
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
