import { Cross2Icon } from '@radix-ui/react-icons'
import { getRouteApi } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { DataTableToolbar } from '@/components/data-table'
import { UrlDataTable } from '@/components/data-table/url-data-table'
import { DataTableViewOptions } from '@/components/data-table/view-options'
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
        <div className='flex flex-wrap items-center gap-2'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Mã HĐ, tên hoặc SĐT bệnh nhân...'
            filters={filters}
            showReset={false}
            showViewOptions={false}
          />
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
            className='w-[150px]'
            inputClassName='h-8 w-full'
          />
          <Button
            type='button'
            variant='ghost'
            className='h-8 gap-2 px-2'
            onClick={() => {
              table.resetColumnFilters(true)
              table.setGlobalFilter('')
              navigate({
                search: {
                  date: '',
                  pageSize: table.getState().pagination.pageSize,
                },
              })
            }}
          >
            Đặt lại <Cross2Icon className='size-4' />
          </Button>
          <div className='ms-auto'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      )}
    />
  )
}
