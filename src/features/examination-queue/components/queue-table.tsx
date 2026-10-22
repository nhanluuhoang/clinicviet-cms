import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { getPageNumbers, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type QueueEntry, type QueueStatus } from '../api'
import { QueueActions } from './queue-actions'
import { QueueStatusBadge } from './queue-status-badge'

export function QueueTable({
  data,
  isLoading,
  isPending,
  onStatus,
  onCheckIn,
  page,
  total,
  limit,
  onPageChange,
  showActions = true,
  emptyMessage = i18n.t('messages.noExaminationsToday'),
}: {
  data: QueueEntry[]
  isLoading: boolean
  isPending: boolean
  onStatus: (id: string, status: QueueStatus) => void
  onCheckIn: (id: string) => void
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  showActions?: boolean
  emptyMessage?: string
}) {
  const { t } = useTranslation()

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <>
      <div className='grid gap-3 sm:hidden'>
        {isLoading ? (
          <p className='rounded-md border p-4 text-center'>
            {t('messages.loading')}
          </p>
        ) : data.length ? (
          data.map((item) => (
            <div
              key={item.id}
              className='min-w-0 space-y-3 rounded-md border p-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='font-medium break-words'>
                    {item.patient.fullName}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {t('messages.queueNumber')} {item.queueNumber ?? '—'} ·{' '}
                    {item.patient.phone || t('messages.noPhoneNumber')}
                    {item.isLate ? t('messages.late') : ''}
                  </p>
                </div>
                <QueueStatusBadge status={item.status} />
              </div>
              <div className='space-y-1 text-sm'>
                <p>
                  {item.appointmentAt
                    ? t('messages.appointment', {
                        value0: formatTime(item.appointmentAt),
                      })
                    : t('messages.arrived', {
                        value0: formatTime(item.checkInAt),
                      })}
                </p>
                <p className='break-words text-muted-foreground'>
                  {item.reason || t('messages.noReasonForVisit')}
                </p>
              </div>
              {showActions && (
                <QueueActions
                  item={item}
                  pending={isPending}
                  align='start'
                  onStatus={(status) => onStatus(item.id, status)}
                  onCheckIn={() => onCheckIn(item.id)}
                />
              )}
            </div>
          ))
        ) : (
          <p className='rounded-md border p-4 text-center text-muted-foreground'>
            {emptyMessage}
          </p>
        )}
      </div>
      <div className='hidden min-w-0 overflow-x-auto rounded-md border sm:block'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20 whitespace-nowrap'>
                {t('messages.queueNumberAlt2')}
              </TableHead>
              <TableHead>{t('messages.patient')}</TableHead>
              <TableHead>{t('messages.time')}</TableHead>
              <TableHead>{t('messages.reasonForVisit')}</TableHead>
              <TableHead>{t('messages.status')}</TableHead>
              {showActions && (
                <TableHead className='text-right'>
                  {t('messages.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className='h-24 text-center'
                >
                  {t('messages.loading')}
                </TableCell>
              </TableRow>
            ) : data.length ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='text-center text-lg font-bold'>
                    {item.queueNumber ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{item.patient.fullName}</div>
                    <div className='text-xs text-muted-foreground'>
                      {item.patient.phone || t('messages.noPhoneNumber')}
                      {item.isLate ? t('messages.late') : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.appointmentAt
                      ? t('messages.appointment', {
                          value0: formatTime(item.appointmentAt),
                        })
                      : t('messages.arrived', {
                          value0: formatTime(item.checkInAt),
                        })}
                  </TableCell>
                  <TableCell className='max-w-56 truncate'>
                    {item.reason || '—'}
                  </TableCell>
                  <TableCell>
                    <QueueStatusBadge status={item.status} />
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <QueueActions
                        item={item}
                        pending={isPending}
                        onStatus={(status) => onStatus(item.id, status)}
                        onCheckIn={() => onCheckIn(item.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className='h-24 text-center text-muted-foreground'
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {total > 0 && (
        <div className='flex items-center justify-between gap-2 px-2'>
          <p className='text-sm text-muted-foreground'>
            {total} {t('messages.examinationsAlt3')}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              className='hidden size-8 p-0 sm:inline-flex'
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              <span className='sr-only'>{t('messages.firstPage')}</span>
              <DoubleArrowLeftIcon />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <span className='sr-only'>{t('messages.previousPage')}</span>
              <ChevronLeftIcon />
            </Button>
            <span className='text-sm whitespace-nowrap sm:hidden'>
              {page}/{totalPages}
            </span>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className='hidden px-1 text-sm text-muted-foreground sm:inline'
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? 'default' : 'outline'}
                  className='hidden h-8 min-w-8 px-2 sm:inline-flex'
                  onClick={() => onPageChange(pageNumber as number)}
                >
                  {pageNumber}
                </Button>
              )
            )}
            <Button
              variant='outline'
              className='size-8 p-0'
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <span className='sr-only'>{i18n.t('messages.nextPage')}</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant='outline'
              className='hidden size-8 p-0 sm:inline-flex'
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <span className='sr-only'>{t('messages.lastPage')}</span>
              <DoubleArrowRightIcon />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
