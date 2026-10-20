import { getRouteApi } from '@tanstack/react-router'
import { DataTableToolbar } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { DatePickerInput } from '@/components/date-picker-input'
import type { Invoice } from '../api'
import { invoiceColumns, invoiceServiceTypes } from './invoice-columns'

const route = getRouteApi('/_authenticated/invoices/')
const filters = [
  {
    columnId: 'serviceType',
    title: 'Loại dịch vụ',
    options: invoiceServiceTypes,
    variant: 'radio' as const,
  },
]

export function InvoicesTable({
  data,
  total,
  isLoading,
  date,
}: {
  data: Invoice[]
  total: number
  isLoading: boolean
  date: string
}) {
  const navigate = route.useNavigate()
  return (
    <UrlDataTable
      columns={invoiceColumns}
      data={data}
      total={total}
      isLoading={isLoading}
      filters={filters}
      emptyMessage='Không có hóa đơn phù hợp.'
      renderToolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchPlaceholder='Mã HĐ, tên hoặc SĐT bệnh nhân...'
          filters={filters}
          hasExtraFilters={Boolean(date)}
          onReset={() =>
            navigate({
              search: {
                date: '',
                pageSize: table.getState().pagination.pageSize,
              },
            })
          }
        >
          <label htmlFor='invoice-date' className='sr-only'>
            Ngày lập hóa đơn
          </label>
          <DatePickerInput
            id='invoice-date'
            value={date}
            onChange={(value) =>
              navigate({
                search: (previous) => ({
                  ...previous,
                  page: undefined,
                  date: value,
                }),
              })
            }
            className='min-w-[150px] flex-1 sm:w-[150px] sm:flex-none'
            inputClassName='h-8 w-full'
          />
        </DataTableToolbar>
      )}
    />
  )
}
