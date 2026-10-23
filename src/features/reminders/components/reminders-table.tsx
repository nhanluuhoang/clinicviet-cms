import { getRouteApi } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DataTableColumnHeader,
  DataTableToolbar,
} from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { DatePickerInput } from '@/components/date-picker-input'
import type { Reminder } from '../api'

const route = getRouteApi('/_authenticated/reminders/')

export function RemindersTable({
  data,
  total,
  isLoading,
  today,
  dateFrom,
}: {
  data: Reminder[]
  total: number
  isLoading: boolean
  today: string
  dateFrom: string
}) {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const timing = (reminder: Reminder) => {
    const date = reminder.appointmentDate.slice(0, 10)
    return date < today ? 'OVERDUE' : date === today ? 'TODAY' : 'UPCOMING'
  }
  const filters = [
    {
      columnId: 'serviceType',
      title: t('reminders.serviceType'),
      options: ['EXAMINATION', 'VACCINATION'],
    },
    {
      columnId: 'due',
      title: t('reminders.timing'),
      options: ['OVERDUE', 'TODAY', 'UPCOMING'],
    },
  ].map((filter) => ({
    ...filter,
    variant: 'radio' as const,
    options: filter.options.map((value) => ({
      value,
      label: t(`reminders.${value}`),
    })),
  }))
  const columns: ColumnDef<Reminder>[] = [
    {
      id: 'patient',
      accessorFn: (row) => row.user.fullName,
      header: t('reminders.patient'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='min-w-40'>
          <p className='font-medium'>{row.original.user.fullName}</p>
          {row.original.user.phone && (
            <a
              className='text-sm text-primary underline'
              href={'tel:' + row.original.user.phone.replace(/[^\d+]/g, '')}
            >
              {row.original.user.phone}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'serviceType',
      header: t('reminders.serviceType'),
      enableSorting: false,
      cell: ({ row }) => t('reminders.' + row.original.serviceType),
    },
    {
      accessorKey: 'appointmentDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('reminders.appointmentDate')}
        />
      ),
      cell: ({ row }) => formatDate(row.original.appointmentDate),
    },
    {
      id: 'details',
      header: t('reminders.details'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='max-w-64 whitespace-normal'>
          <p>
            {row.original.serviceType === 'VACCINATION'
              ? row.original.vaccineName
              : row.original.doctorName}
          </p>
          {row.original.serviceType === 'VACCINATION' &&
            row.original.doseNumber && (
              <p className='text-xs text-muted-foreground'>
                {t('reminders.dose', { number: row.original.doseNumber })}
              </p>
            )}
        </div>
      ),
    },
    {
      id: 'due',
      accessorFn: timing,
      header: t('reminders.timing'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          variant={
            timing(row.original) === 'OVERDUE' ? 'destructive' : 'secondary'
          }
        >
          {t('reminders.' + timing(row.original))}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <UrlDataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        filters={filters}
        mobileLabels={{
          appointmentDate: 'reminders.appointmentDate',
          patient: 'reminders.patient',
          due: 'reminders.timing',
          details: 'reminders.details',
          serviceType: 'reminders.serviceType',
        }}
        initialSorting={[{ id: 'appointmentDate', desc: false }]}
        emptyMessage={t('reminders.empty')}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder={t('reminders.search')}
            filters={filters}
            hasExtraFilters={Boolean(dateFrom || search.dateTo)}
            onReset={() =>
              navigate({
                search: {
                  dateFrom: '',
                  pageSize: table.getState().pagination.pageSize,
                },
              })
            }
          >
            {(['dateFrom', 'dateTo'] as const).map((key) => (
              <div key={key} className='flex items-center gap-2'>
                <label
                  htmlFor={`reminders-${key}`}
                  className='text-sm whitespace-nowrap'
                >
                  {t(`reminders.${key}`)}
                </label>
                <DatePickerInput
                  id={`reminders-${key}`}
                  value={key === 'dateFrom' ? dateFrom : (search.dateTo ?? '')}
                  minDate={key === 'dateTo' ? dateFrom : undefined}
                  onChange={(value) =>
                    navigate({
                      search: (previous) => ({
                        ...previous,
                        [key]: value,
                        page: undefined,
                        ...(key === 'dateFrom' &&
                        previous.dateTo &&
                        value > previous.dateTo
                          ? { dateTo: value }
                          : {}),
                      }),
                    })
                  }
                  className='w-[150px]'
                  inputClassName='h-8 w-full'
                />
              </div>
            ))}
          </DataTableToolbar>
        )}
      />
    </>
  )
}
