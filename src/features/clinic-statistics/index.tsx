import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { getLocale } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MonthPickerInput } from '@/components/month-picker-input'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getClinicMonthlyExaminations, type ClinicStatisticsRow } from './api'

export function ClinicStatistics() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/system/clinic-statistics' })
  const navigate = useNavigate({ from: '/system/clinic-statistics' })
  const [currentMonth] = useState(() =>
    new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 7)
  )
  const month = search.month || currentMonth
  const { data, isPending, isError } = useQuery({
    queryKey: ['clinic-monthly-examinations', month],
    queryFn: () => getClinicMonthlyExaminations(month),
  })
  const columns: ColumnDef<ClinicStatisticsRow>[] = [
    { accessorKey: 'code', header: t('messages.clinicCode') },
    { accessorKey: 'name', header: t('messages.clinics') },
    {
      accessorKey: 'examinationCount',
      header: t('clinicStatistics.completedVisits'),
      cell: ({ row }) =>
        row.original.examinationCount.toLocaleString(getLocale()),
    },
    ...(['totalAmount', 'medicineRevenue', 'medicineCost'] as const).map(
      (key) => ({
        accessorKey: key,
        header: t('clinicStatistics.' + key),
        cell: ({ row }: { row: { original: ClinicStatisticsRow } }) => (
          <span className='whitespace-nowrap tabular-nums'>
            {t('messages.vndAlt2', {
              value0: row.original[key].toLocaleString(getLocale()),
            })}
          </span>
        ),
      })
    ),
  ]

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('clinicStatistics.title')}
          </h2>
          <p className='text-muted-foreground'>
            {t('clinicStatistics.description')}
          </p>
        </div>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='w-full space-y-1 sm:w-auto'>
            <Label htmlFor='statistics-month'>
              {t('clinicStatistics.month')}
            </Label>
            <MonthPickerInput
              id='statistics-month'
              value={month}
              onChange={(value) => {
                if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value))
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      month: value,
                      page: 1,
                    }),
                    replace: true,
                  })
              }}
            />
          </div>
          {data && (
            <p className='text-sm font-medium'>
              {t('clinicStatistics.summary', {
                count: data.total,
                clinics: data.data.length,
              })}
            </p>
          )}
        </div>
        {isError ? (
          <p role='alert'>{t('clinicStatistics.error')}</p>
        ) : (
          <UrlDataTable
            data={data?.data ?? []}
            columns={columns}
            isLoading={isPending}
            searchPlaceholder={t('clinicStatistics.search')}
            getSearchText={(clinic) => `${clinic.code} ${clinic.name}`}
            mobileLabels={{
              code: t('messages.clinicCode'),
              name: t('messages.clinics'),
              examinationCount: t('clinicStatistics.completedVisits'),
              totalAmount: t('clinicStatistics.totalAmount'),
              medicineRevenue: t('clinicStatistics.medicineRevenue'),
              medicineCost: t('clinicStatistics.medicineCost'),
              actions: t('messages.actions'),
            }}
          />
        )}
      </Main>
    </>
  )
}
