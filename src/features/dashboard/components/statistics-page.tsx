import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import {
  formatDashboardMoney as formatMoney,
  getCurrentMonth,
  getToday,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePickerInput } from '@/components/date-picker-input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  getQueueDashboard,
  getMonthlyQueueDashboard,
  type DashboardStatistics,
  type QueueDashboard,
} from '@/features/examination-queue/api'
import { OperationalStatistics } from '../operational-statistics'
import { DailyRevenueChart } from './daily-revenue-chart'
import { SummaryCards } from './summary-cards'

export function StatisticsPage({ period }: { period: 'day' | 'month' }) {
  const isMonthly = period === 'month'
  const [selectedPeriod, setSelectedPeriod] = useState(
    isMonthly ? getCurrentMonth : getToday
  )
  const { data, isLoading, isError } = useQuery<
    QueueDashboard | DashboardStatistics
  >({
    queryKey: ['dashboard', period, selectedPeriod, isMonthly],
    queryFn: async () =>
      isMonthly
        ? await getMonthlyQueueDashboard(selectedPeriod)
        : await getQueueDashboard(selectedPeriod),
    enabled: isMonthly
      ? /^\d{4}-\d{2}$/.test(selectedPeriod)
      : /^\d{4}-\d{2}-\d{2}$/.test(selectedPeriod),
  })
  const periodLabel = isMonthly ? 'trong tháng' : 'trong ngày'
  const totalMedicineQuantity =
    data?.medicineUsage.reduce(
      (total, medicine) => total + medicine.quantity,
      0
    ) ?? 0

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Thống kê</h1>
            <p className='text-muted-foreground'>
              Tổng quan hoạt động khám bệnh {periodLabel}.
            </p>
          </div>
          <div className='w-full space-y-1.5 sm:w-auto'>
            <label className='flex items-center gap-1.5 text-sm font-medium'>
              <CalendarDays className='size-4' />{' '}
              {isMonthly ? 'Tháng thống kê' : 'Ngày thống kê'}
            </label>
            {isMonthly ? (
              <div className='grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm sm:flex'>
                <Select
                  value={selectedPeriod.slice(5, 7)}
                  onValueChange={(month) =>
                    setSelectedPeriod(`${selectedPeriod.slice(0, 4)}-${month}`)
                  }
                >
                  <SelectTrigger className='w-full min-w-0 border-0 shadow-none sm:w-36'>
                    <SelectValue placeholder='Chọn tháng' />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='my-1 w-px bg-border' />
                <Select
                  value={selectedPeriod.slice(0, 4)}
                  onValueChange={(year) =>
                    setSelectedPeriod(`${year}-${selectedPeriod.slice(5, 7)}`)
                  }
                >
                  <SelectTrigger className='w-full min-w-0 border-0 shadow-none sm:w-36'>
                    <SelectValue placeholder='Chọn năm' />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        Năm {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <DatePickerInput
                value={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            )}
          </div>
        </div>

        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            Không thể tải dữ liệu thống kê. Vui lòng thử lại.
          </p>
        )}

        <div className={isLoading ? 'animate-pulse opacity-60' : undefined}>
          <SummaryCards dashboard={data} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-6 lg:grid-cols-2 lg:divide-x'>
            <div>
              <h3 className='mb-2 text-sm font-medium'>Cơ cấu doanh thu</h3>
              <DailyRevenueChart dashboard={data} periodLabel={periodLabel} />
            </div>
            <div className='min-w-0 lg:pl-6'>
              <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                <h3 className='text-sm font-medium'>
                  Thuốc sử dụng {periodLabel}
                </h3>
                <div className='rounded-md bg-primary/10 px-3 py-1.5 text-sm text-primary'>
                  Tổng số lượng:{' '}
                  <strong className='tabular-nums'>
                    {formatMoney(totalMedicineQuantity)}
                  </strong>
                </div>
              </div>
              <div className='grid max-h-[340px] gap-2 overflow-auto sm:hidden'>
                {data?.medicineUsage.length ? (
                  data.medicineUsage.map((medicine) => (
                    <div
                      key={medicine.medicineId ?? medicine.medicineName}
                      className='rounded-md border p-3 text-sm'
                    >
                      <p className='font-medium'>{medicine.medicineName}</p>
                      <p className='text-muted-foreground'>
                        Số lượng: {formatMoney(medicine.quantity)}{' '}
                        {medicine.unit || ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className='rounded-md border p-4 text-center text-sm text-muted-foreground'>
                    Chưa có thuốc được sử dụng {periodLabel} này.
                  </p>
                )}
              </div>
              <div className='hidden max-h-[340px] overflow-auto rounded-md border sm:block'>
                <Table>
                  <TableHeader className='sticky top-0 bg-card'>
                    <TableRow>
                      <TableHead>Thuốc</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className='text-right'>Số lượng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.medicineUsage.length ? (
                      data.medicineUsage.map((medicine) => (
                        <TableRow
                          key={medicine.medicineId ?? medicine.medicineName}
                        >
                          <TableCell className='max-w-64 truncate font-medium'>
                            {medicine.medicineName}
                          </TableCell>
                          <TableCell>{medicine.unit || '-'}</TableCell>
                          <TableCell className='text-right font-semibold tabular-nums'>
                            {formatMoney(medicine.quantity)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='h-24 text-center text-muted-foreground'
                        >
                          Chưa có thuốc được sử dụng {periodLabel} này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {isMonthly && (
          <OperationalStatistics
            data={data as DashboardStatistics | undefined}
          />
        )}
      </Main>
    </>
  )
}
